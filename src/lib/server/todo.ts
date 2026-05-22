import { db } from '$lib/server/db';
import { board, status, task, type Board, type Status, type Task } from '$lib/server/db/schema';
import { and, asc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const DEFAULT_STATUSES = [
	{ name: 'Backlog', color: 'slate' },
	{ name: 'In Progress', color: 'blue' },
	{ name: 'Done', color: 'green' }
] as const;

export const STATUS_COLORS = [
	'slate',
	'gray',
	'red',
	'orange',
	'amber',
	'yellow',
	'lime',
	'green',
	'emerald',
	'teal',
	'cyan',
	'sky',
	'blue',
	'indigo',
	'violet',
	'purple',
	'fuchsia',
	'pink',
	'rose'
] as const;

export type StatusColor = (typeof STATUS_COLORS)[number];

export const PRIORITIES = ['none', 'low', 'medium', 'high', 'urgent'] as const;
export type Priority = (typeof PRIORITIES)[number];

export function newId(): string {
	return crypto.randomUUID();
}

export async function listBoards(userId: string): Promise<Board[]> {
	return db
		.select()
		.from(board)
		.where(eq(board.userId, userId))
		.orderBy(asc(board.position), asc(board.createdAt));
}

export async function getBoard(userId: string, boardId: string): Promise<Board> {
	const [row] = await db
		.select()
		.from(board)
		.where(and(eq(board.id, boardId), eq(board.userId, userId)))
		.limit(1);
	if (!row) error(404, 'Board not found');
	return row;
}

export async function getBoardStatuses(boardId: string): Promise<Status[]> {
	return db
		.select()
		.from(status)
		.where(eq(status.boardId, boardId))
		.orderBy(asc(status.position), asc(status.createdAt));
}

export async function getBoardTasks(boardId: string): Promise<Task[]> {
	return db
		.select()
		.from(task)
		.where(eq(task.boardId, boardId))
		.orderBy(asc(task.position), asc(task.createdAt));
}

export async function createBoard(
	userId: string,
	name: string,
	icon = 'list-todo'
): Promise<Board> {
	const boards = await listBoards(userId);
	const position = boards.length ? boards[boards.length - 1].position + 1024 : 1024;
	const id = newId();
	const [row] = await db
		.insert(board)
		.values({ id, userId, name: name.trim() || 'Untitled', icon, position })
		.returning();

	const baseTs = Date.now();
	await db.insert(status).values(
		DEFAULT_STATUSES.map((s, i) => ({
			id: newId(),
			boardId: id,
			name: s.name,
			color: s.color,
			position: (i + 1) * 1024,
			createdAt: new Date(baseTs + i)
		}))
	);

	return row;
}

export async function ensureBoardOwned(userId: string, boardId: string): Promise<Board> {
	return getBoard(userId, boardId);
}
