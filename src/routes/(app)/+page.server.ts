import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { board } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { createBoard, ensureBoardOwned, listBoards } from '$lib/server/todo';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) return;
	const boards = await listBoards(locals.user.id);
	if (boards.length > 0) {
		redirect(303, `/b/${boards[0].id}`);
	}
};

export const actions: Actions = {
	createBoard: async ({ request, locals }) => {
		if (!locals.user) return fail(401);
		const data = await request.formData();
		const name = String(data.get('name') ?? '').trim() || 'Untitled';
		const icon = String(data.get('icon') ?? '').slice(0, 64) || 'list-todo';
		const created = await createBoard(locals.user.id, name, icon);
		redirect(303, `/b/${created.id}`);
	},

	renameBoard: async ({ request, locals }) => {
		if (!locals.user) return fail(401);
		const data = await request.formData();
		const id = String(data.get('id') ?? '');
		const name = String(data.get('name') ?? '').trim();
		const icon = data.get('icon') ? String(data.get('icon')).slice(0, 64) : undefined;
		if (!id || !name) return fail(400, { message: 'Missing fields' });
		await ensureBoardOwned(locals.user.id, id);
		await db
			.update(board)
			.set({ name, ...(icon ? { icon } : {}) })
			.where(and(eq(board.id, id), eq(board.userId, locals.user.id)));
		return { success: true };
	},

	deleteBoard: async ({ request, locals }) => {
		if (!locals.user) return fail(401);
		const data = await request.formData();
		const id = String(data.get('id') ?? '');
		if (!id) return fail(400);
		await ensureBoardOwned(locals.user.id, id);
		await db.delete(board).where(and(eq(board.id, id), eq(board.userId, locals.user.id)));
		const remaining = await listBoards(locals.user.id);
		if (remaining.length) redirect(303, `/b/${remaining[0].id}`);
		redirect(303, '/');
	}
};
