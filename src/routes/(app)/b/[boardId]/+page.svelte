<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import Swimlane from '$lib/components/todo/swimlane.svelte';
	import AddLane from '$lib/components/todo/add-lane.svelte';
	import TaskEditor from '$lib/components/todo/task-editor.svelte';
	import BoardIcon from '$lib/components/todo/board-icon.svelte';
	import IconPicker from '$lib/components/todo/icon-picker.svelte';
	import type { Status, Task } from '$lib/server/db/schema';
	import MoreHorizontalIcon from '@lucide/svelte/icons/more-horizontal';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import { DragDropProvider, DragOverlay } from '@dnd-kit/svelte';
	import { cn } from '$lib/utils';
	import {
		priorityBadge,
		priorityLabel,
		statusDot,
		asColor,
		type Priority
	} from '$lib/components/todo/status-colors';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import FlagIcon from '@lucide/svelte/icons/flag';

	let { data } = $props();

	let localStatuses = $state<Status[]>([]);
	let localTasks = $state<Task[]>([]);

	$effect(() => {
		// Sync local state with server data on load and after invalidations.
		localStatuses = [...data.statuses];
		localTasks = [...data.tasks];
	});

	let lastBoardId = $state<string | null>(null);
	$effect(() => {
		// Reset board-scoped UI when navigating between boards so dialogs/sheets
		// from the previous board don't bleed through.
		if (lastBoardId !== data.board.id) {
			lastBoardId = data.board.id;
			deleteOpen = false;
			renameOpen = false;
			editorOpen = false;
			editorTask = null;
		}
	});

	const tasksByStatus = $derived.by(() => {
		const map: Record<string, Task[]> = {};
		for (const s of localStatuses) map[s.id] = [];
		for (const t of localTasks) {
			if (!map[t.statusId]) map[t.statusId] = [];
			map[t.statusId].push(t);
		}
		return map;
	});

	let editorTask = $state<Task | null>(null);
	let editorOpen = $state(false);

	let renameOpen = $state(false);
	let renameName = $state('');
	let renameIcon = $state('list-todo');
	let renameDescription = $state('');

	let deleteOpen = $state(false);

	$effect(() => {
		renameName = data.board.name;
		renameIcon = data.board.icon;
		renameDescription = data.board.description ?? '';
	});

	function openTask(task: Task) {
		editorTask = task;
		editorOpen = true;
	}

	function closeEditor() {
		editorOpen = false;
		editorTask = null;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function onDragOver(event: any) {
		const op = event?.operation;
		const source = op?.source;
		const target = op?.target;
		if (!source || !target || source.id === target.id) return;

		if (source.type === 'lane' && target.type === 'lane') {
			const from = localStatuses.findIndex((s) => s.id === source.id);
			const to = localStatuses.findIndex((s) => s.id === target.id);
			if (from === -1 || to === -1 || from === to) return;
			const next = [...localStatuses];
			const [moved] = next.splice(from, 1);
			next.splice(to, 0, moved);
			localStatuses = next;
			return;
		}

		if (source.type === 'task') {
			const from = localTasks.findIndex((t) => t.id === source.id);
			if (from === -1) return;
			const moved = localTasks[from];

			if (target.type === 'task') {
				const to = localTasks.findIndex((t) => t.id === target.id);
				if (to === -1) return;
				const targetTask = localTasks[to];
				if (moved.statusId === targetTask.statusId && from === to) return;
				const next = [...localTasks];
				next.splice(from, 1);
				// Using the original `to` directly handles both directions:
				// - dragging down (from < to): target shifts left by one, so `to` lands
				//   the source just after the target's new position.
				// - dragging up   (from > to): target keeps its index, so `to` lands
				//   the source just before the target.
				next.splice(to, 0, { ...moved, statusId: targetTask.statusId });
				localTasks = next;
				return;
			}

			if (target.type === 'task-zone') {
				const newStatusId = String(target.data?.statusId ?? '');
				if (!newStatusId) return;
				if (moved.statusId === newStatusId) return;
				const next = [...localTasks];
				next.splice(from, 1);
				next.push({ ...moved, statusId: newStatusId });
				localTasks = next;
				return;
			}
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async function onDragEnd(event: any) {
		if (event?.canceled) return;
		const source = event?.operation?.source;
		if (!source) return;

		if (source.type === 'lane') {
			const id = String(source.id);
			const newIndex = localStatuses.findIndex((s) => s.id === id);
			if (newIndex === -1) return;
			const prev = newIndex > 0 ? localStatuses[newIndex - 1].position : 0;
			const next =
				newIndex < localStatuses.length - 1 ? localStatuses[newIndex + 1].position : prev + 1024;
			const position = (prev + next) / 2;
			localStatuses[newIndex] = { ...localStatuses[newIndex], position };

			const fd = new FormData();
			fd.set('id', id);
			fd.set('position', String(position));
			await fetch('?/reorderStatus', { method: 'POST', body: fd });
			await invalidateAll();
			return;
		}

		if (source.type === 'task') {
			const id = String(source.id);
			const moved = localTasks.find((t) => t.id === id);
			if (!moved) return;
			const statusId = moved.statusId;
			const peers = localTasks.filter((t) => t.statusId === statusId);
			const indexInLane = peers.findIndex((t) => t.id === id);
			if (indexInLane === -1) return;
			const prev = indexInLane > 0 ? peers[indexInLane - 1].position : 0;
			const next = indexInLane < peers.length - 1 ? peers[indexInLane + 1].position : prev + 1024;
			const position = (prev + next) / 2;
			const flatIdx = localTasks.findIndex((t) => t.id === id);
			if (flatIdx !== -1) localTasks[flatIdx] = { ...moved, position };

			const fd = new FormData();
			fd.set('id', id);
			fd.set('statusId', statusId);
			fd.set('position', String(position));
			await fetch('?/moveTask', { method: 'POST', body: fd });
			await invalidateAll();
		}
	}
</script>

<div class="flex h-full flex-col">
	<header class="flex items-center justify-between gap-3 border-b px-6 py-4">
		<div class="flex min-w-0 items-center gap-3">
			<div
				class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
			>
				<BoardIcon name={data.board.icon} class="size-5" />
			</div>
			<div class="min-w-0">
				<h1 class="truncate text-xl font-semibold tracking-tight">{data.board.name}</h1>
				{#if data.board.description}
					<p class="truncate text-sm text-muted-foreground">{data.board.description}</p>
				{/if}
			</div>
		</div>

		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="ghost" size="icon" aria-label="Board options">
						<MoreHorizontalIcon class="size-4" />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" class="min-w-48">
				<DropdownMenu.Group>
					<DropdownMenu.Item onclick={() => (renameOpen = true)}>
						<PencilIcon />
						<span>Edit board</span>
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item variant="destructive" onclick={() => (deleteOpen = true)}>
						<TrashIcon />
						<span>Delete board</span>
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</header>

	<DragDropProvider {onDragOver} {onDragEnd}>
		<div class="flex-1 overflow-x-auto overflow-y-hidden">
			<div class="flex h-full min-w-max items-stretch gap-3 p-4">
				{#each localStatuses as status, i (status.id)}
					<Swimlane
						{status}
						index={i}
						tasks={tasksByStatus[status.id] ?? []}
						canDelete={localStatuses.length > 1}
						onTaskOpen={openTask}
					/>
				{/each}

				<AddLane />
			</div>
		</div>

		<DragOverlay>
			{#snippet children(source)}
				{#if source.type === 'task'}
					{@const task = localTasks.find((t) => t.id === source.id)}
					{#if task}
						{@const p = task.priority as Priority}
						<div
							class="w-72 cursor-grabbing rounded-lg border bg-card p-3 text-left shadow-2xl ring-1 ring-foreground/10"
						>
							<div class="space-y-2">
								<div class="text-sm leading-snug font-medium">{task.title}</div>
								{#if task.description}
									<p class="line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
								{/if}
								{#if p !== 'none' || task.dueDate}
									<div class="flex flex-wrap items-center gap-1.5">
										{#if p !== 'none'}
											<span
												class={cn(
													'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium',
													priorityBadge[p]
												)}
											>
												<FlagIcon class="size-3" />
												{priorityLabel[p]}
											</span>
										{/if}
										{#if task.dueDate}
											<span
												class="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
											>
												<CalendarIcon class="size-3" />
												{new Date(task.dueDate).toLocaleDateString(undefined, {
													month: 'short',
													day: 'numeric'
												})}
											</span>
										{/if}
									</div>
								{/if}
							</div>
						</div>
					{/if}
				{:else if source.type === 'lane'}
					{@const lane = localStatuses.find((s) => s.id === source.id)}
					{#if lane}
						<div
							class="flex w-72 cursor-grabbing items-center gap-2 rounded-xl border bg-muted/90 px-3 py-2.5 shadow-2xl ring-1 ring-foreground/10 backdrop-blur"
						>
							<span class={cn('size-2.5 rounded-full', statusDot[asColor(lane.color)])}></span>
							<span class="text-sm font-medium">{lane.name}</span>
							<span class="ml-auto text-xs text-muted-foreground tabular-nums">
								{tasksByStatus[lane.id]?.length ?? 0}
							</span>
						</div>
					{/if}
				{/if}
			{/snippet}
		</DragOverlay>
	</DragDropProvider>
</div>

<TaskEditor open={editorOpen} task={editorTask} statuses={localStatuses} onClose={closeEditor} />

<!-- Edit board dialog -->
<Dialog.Root bind:open={renameOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Edit board</Dialog.Title>
		</Dialog.Header>
		<form
			method="POST"
			action="?/updateBoard"
			use:enhance={() => {
				return async ({ update }) => {
					await update();
					renameOpen = false;
				};
			}}
			class="space-y-4"
		>
			<div class="space-y-2">
				<Label>Icon</Label>
				<IconPicker bind:value={renameIcon} />
				<input type="hidden" name="icon" value={renameIcon} />
			</div>
			<div class="space-y-2">
				<Label for="board-name">Name</Label>
				<Input id="board-name" name="name" bind:value={renameName} required />
			</div>
			<div class="space-y-2">
				<Label for="board-description">Description</Label>
				<Textarea
					id="board-description"
					name="description"
					bind:value={renameDescription}
					rows={3}
				/>
			</div>
			<Dialog.Footer>
				<Button type="button" variant="ghost" onclick={() => (renameOpen = false)}>Cancel</Button>
				<Button type="submit">Save</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete board confirmation -->
<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Delete this board?</Dialog.Title>
			<Dialog.Description>
				All lanes and tasks on <strong>{data.board.name}</strong> will be permanently deleted. This can't
				be undone.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="ghost" onclick={() => (deleteOpen = false)}>Cancel</Button>
			<form
				method="POST"
				action="?/deleteBoard"
				use:enhance={() => {
					return async ({ update }) => {
						deleteOpen = false;
						await update();
					};
				}}
			>
				<Button type="submit" variant="destructive">Delete board</Button>
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
