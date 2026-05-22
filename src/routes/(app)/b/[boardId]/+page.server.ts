import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { board, status, task } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import {
	ensureBoardOwned,
	getBoard,
	getBoardStatuses,
	getBoardTasks,
	listBoards,
	newId,
	PRIORITIES,
	STATUS_COLORS,
	type Priority,
	type StatusColor
} from '$lib/server/todo';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(303, '/sign-in');
	const current = await getBoard(locals.user.id, params.boardId);
	const [statuses, tasks] = await Promise.all([
		getBoardStatuses(current.id),
		getBoardTasks(current.id)
	]);
	return { board: current, statuses, tasks };
};

function parseDueDate(raw: FormDataEntryValue | null): Date | null | undefined {
	if (raw === null) return undefined;
	const s = String(raw).trim();
	if (!s) return null;
	const d = new Date(s);
	if (Number.isNaN(d.getTime())) return undefined;
	return d;
}

function parsePriority(raw: FormDataEntryValue | null): Priority | undefined {
	if (raw === null) return undefined;
	const s = String(raw);
	return (PRIORITIES as readonly string[]).includes(s) ? (s as Priority) : undefined;
}

function parseColor(raw: FormDataEntryValue | null): StatusColor | undefined {
	if (raw === null) return undefined;
	const s = String(raw);
	return (STATUS_COLORS as readonly string[]).includes(s) ? (s as StatusColor) : undefined;
}

function parseTags(raw: FormDataEntryValue | null): string[] | undefined {
	if (raw === null) return undefined;
	const s = String(raw).trim();
	if (!s) return [];
	return s
		.split(',')
		.map((t) => t.trim())
		.filter(Boolean)
		.slice(0, 10);
}

export const actions: Actions = {
	createBoard: async ({ request, locals }) => {
		if (!locals.user) return fail(401);
		const data = await request.formData();
		const name = String(data.get('name') ?? '').trim() || 'Untitled';
		const icon = String(data.get('icon') ?? '').slice(0, 64) || 'list-todo';
		const { createBoard } = await import('$lib/server/todo');
		const created = await createBoard(locals.user.id, name, icon);
		redirect(303, `/b/${created.id}`);
	},

	updateBoard: async ({ request, locals, params }) => {
		if (!locals.user) return fail(401);
		await ensureBoardOwned(locals.user.id, params.boardId);
		const data = await request.formData();
		const updates: Partial<{ name: string; icon: string; description: string | null }> = {};
		if (data.has('name')) {
			const n = String(data.get('name')).trim();
			if (!n) return fail(400, { message: 'Name required' });
			updates.name = n;
		}
		if (data.has('icon')) updates.icon = String(data.get('icon')).slice(0, 64) || 'list-todo';
		if (data.has('description')) {
			const d = String(data.get('description')).trim();
			updates.description = d || null;
		}
		if (Object.keys(updates).length === 0) return { success: true };
		await db.update(board).set(updates).where(eq(board.id, params.boardId));
		return { success: true };
	},

	deleteBoard: async ({ locals, params }) => {
		if (!locals.user) return fail(401);
		await ensureBoardOwned(locals.user.id, params.boardId);
		await db.delete(board).where(eq(board.id, params.boardId));
		const remaining = await listBoards(locals.user.id);
		if (remaining.length) redirect(303, `/b/${remaining[0].id}`);
		redirect(303, '/');
	},

	createStatus: async ({ request, locals, params }) => {
		if (!locals.user) return fail(401);
		await ensureBoardOwned(locals.user.id, params.boardId);
		const data = await request.formData();
		const name = String(data.get('name') ?? '').trim() || 'New status';
		const color = parseColor(data.get('color')) ?? 'slate';
		const existing = await getBoardStatuses(params.boardId);
		const position = existing.length ? existing[existing.length - 1].position + 1024 : 1024;
		await db.insert(status).values({ id: newId(), boardId: params.boardId, name, color, position });
		return { success: true };
	},

	updateStatus: async ({ request, locals, params }) => {
		if (!locals.user) return fail(401);
		await ensureBoardOwned(locals.user.id, params.boardId);
		const data = await request.formData();
		const id = String(data.get('id') ?? '');
		if (!id) return fail(400);
		const updates: Partial<{ name: string; color: string }> = {};
		if (data.has('name')) {
			const n = String(data.get('name')).trim();
			if (!n) return fail(400, { message: 'Name required' });
			updates.name = n;
		}
		const color = parseColor(data.get('color'));
		if (color) updates.color = color;
		if (Object.keys(updates).length === 0) return { success: true };
		await db
			.update(status)
			.set(updates)
			.where(and(eq(status.id, id), eq(status.boardId, params.boardId)));
		return { success: true };
	},

	deleteStatus: async ({ request, locals, params }) => {
		if (!locals.user) return fail(401);
		await ensureBoardOwned(locals.user.id, params.boardId);
		const data = await request.formData();
		const id = String(data.get('id') ?? '');
		if (!id) return fail(400);
		const remaining = await getBoardStatuses(params.boardId);
		if (remaining.length <= 1) {
			return fail(400, { message: 'A board needs at least one status' });
		}
		await db.delete(status).where(and(eq(status.id, id), eq(status.boardId, params.boardId)));
		return { success: true };
	},

	reorderStatus: async ({ request, locals, params }) => {
		if (!locals.user) return fail(401);
		await ensureBoardOwned(locals.user.id, params.boardId);
		const data = await request.formData();
		const id = String(data.get('id') ?? '');
		const position = Number(data.get('position'));
		if (!id || Number.isNaN(position)) return fail(400);
		await db
			.update(status)
			.set({ position })
			.where(and(eq(status.id, id), eq(status.boardId, params.boardId)));
		return { success: true };
	},

	createTask: async ({ request, locals, params }) => {
		if (!locals.user) return fail(401);
		await ensureBoardOwned(locals.user.id, params.boardId);
		const data = await request.formData();
		const statusId = String(data.get('statusId') ?? '');
		const title = String(data.get('title') ?? '').trim();
		if (!statusId || !title) return fail(400, { message: 'Title and status required' });
		const [statusRow] = await db
			.select()
			.from(status)
			.where(and(eq(status.id, statusId), eq(status.boardId, params.boardId)))
			.limit(1);
		if (!statusRow) return fail(400, { message: 'Invalid status' });

		const peers = await db
			.select({ position: task.position })
			.from(task)
			.where(eq(task.statusId, statusId));
		const maxPos = peers.reduce((m, p) => (p.position > m ? p.position : m), 0);
		const position = maxPos + 1024;

		await db.insert(task).values({
			id: newId(),
			boardId: params.boardId,
			statusId,
			title,
			description: (() => {
				const d = String(data.get('description') ?? '').trim();
				return d || null;
			})(),
			priority: parsePriority(data.get('priority')) ?? 'none',
			dueDate: parseDueDate(data.get('dueDate')) ?? null,
			tags: parseTags(data.get('tags')) ?? [],
			position
		});
		return { success: true };
	},

	updateTask: async ({ request, locals, params }) => {
		if (!locals.user) return fail(401);
		await ensureBoardOwned(locals.user.id, params.boardId);
		const data = await request.formData();
		const id = String(data.get('id') ?? '');
		if (!id) return fail(400);

		const updates: Record<string, unknown> = {};
		if (data.has('title')) {
			const t = String(data.get('title')).trim();
			if (!t) return fail(400, { message: 'Title required' });
			updates.title = t;
		}
		if (data.has('description')) {
			const d = String(data.get('description')).trim();
			updates.description = d || null;
		}
		const priority = parsePriority(data.get('priority'));
		if (priority) updates.priority = priority;
		const due = parseDueDate(data.get('dueDate'));
		if (due !== undefined) updates.dueDate = due;
		const tags = parseTags(data.get('tags'));
		if (tags) updates.tags = tags;
		if (data.has('completed')) {
			updates.completedAt = data.get('completed') === 'true' ? new Date() : null;
		}

		if (Object.keys(updates).length === 0) return { success: true };
		await db
			.update(task)
			.set(updates)
			.where(and(eq(task.id, id), eq(task.boardId, params.boardId)));
		return { success: true };
	},

	deleteTask: async ({ request, locals, params }) => {
		if (!locals.user) return fail(401);
		await ensureBoardOwned(locals.user.id, params.boardId);
		const data = await request.formData();
		const id = String(data.get('id') ?? '');
		if (!id) return fail(400);
		await db.delete(task).where(and(eq(task.id, id), eq(task.boardId, params.boardId)));
		return { success: true };
	},

	moveTask: async ({ request, locals, params }) => {
		if (!locals.user) return fail(401);
		await ensureBoardOwned(locals.user.id, params.boardId);
		const data = await request.formData();
		const id = String(data.get('id') ?? '');
		const statusId = String(data.get('statusId') ?? '');
		const position = Number(data.get('position'));
		if (!id || !statusId || Number.isNaN(position)) return fail(400);
		const [statusRow] = await db
			.select()
			.from(status)
			.where(and(eq(status.id, statusId), eq(status.boardId, params.boardId)))
			.limit(1);
		if (!statusRow) return fail(400, { message: 'Invalid status' });
		await db
			.update(task)
			.set({ statusId, position })
			.where(and(eq(task.id, id), eq(task.boardId, params.boardId)));
		return { success: true };
	}
};
