import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, index, doublePrecision } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export const board = pgTable(
	'board',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		icon: text('icon').notNull().default('list-todo'),
		description: text('description'),
		position: doublePrecision('position').notNull().default(0),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('board_userId_idx').on(table.userId)]
);

export const status = pgTable(
	'status',
	{
		id: text('id').primaryKey(),
		boardId: text('board_id')
			.notNull()
			.references(() => board.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		color: text('color').notNull().default('slate'),
		position: doublePrecision('position').notNull().default(0),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => [index('status_boardId_idx').on(table.boardId)]
);

export const task = pgTable(
	'task',
	{
		id: text('id').primaryKey(),
		boardId: text('board_id')
			.notNull()
			.references(() => board.id, { onDelete: 'cascade' }),
		statusId: text('status_id')
			.notNull()
			.references(() => status.id, { onDelete: 'cascade' }),
		title: text('title').notNull(),
		description: text('description'),
		priority: text('priority').notNull().default('none'),
		dueDate: timestamp('due_date'),
		tags: text('tags').array().notNull().default([]),
		position: doublePrecision('position').notNull().default(0),
		completedAt: timestamp('completed_at'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [
		index('task_boardId_idx').on(table.boardId),
		index('task_statusId_idx').on(table.statusId)
	]
);

export const boardRelations = relations(board, ({ one, many }) => ({
	user: one(user, { fields: [board.userId], references: [user.id] }),
	statuses: many(status),
	tasks: many(task)
}));

export const statusRelations = relations(status, ({ one, many }) => ({
	board: one(board, { fields: [status.boardId], references: [board.id] }),
	tasks: many(task)
}));

export const taskRelations = relations(task, ({ one }) => ({
	board: one(board, { fields: [task.boardId], references: [board.id] }),
	status: one(status, { fields: [task.statusId], references: [status.id] })
}));

export type Board = typeof board.$inferSelect;
export type Status = typeof status.$inferSelect;
export type Task = typeof task.$inferSelect;
