<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils';
	import type { Status, Task } from '$lib/server/db/schema';
	import TaskCard from './task-card.svelte';
	import StatusColorPicker from './status-color-picker.svelte';
	import { asColor, statusDot, type StatusColorName } from './status-colors';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import MoreHorizontalIcon from '@lucide/svelte/icons/more-horizontal';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import XIcon from '@lucide/svelte/icons/x';
	import GripVerticalIcon from '@lucide/svelte/icons/grip-vertical';
	import { createSortable } from '@dnd-kit/svelte/sortable';
	import { createDroppable } from '@dnd-kit/svelte';

	type Props = {
		status: Status;
		index: number;
		tasks: Task[];
		canDelete: boolean;
		onTaskOpen: (task: Task) => void;
	};

	let { status, index, tasks, canDelete, onTaskOpen }: Props = $props();

	const laneSortable = createSortable({
		get id() {
			return status.id;
		},
		get index() {
			return index;
		},
		type: 'lane',
		accept: 'lane',
		data: { kind: 'lane' }
	});

	const tasksDroppable = createDroppable({
		get id() {
			return `tasks-${status.id}`;
		},
		type: 'task-zone',
		accept: 'task',
		get data() {
			return { kind: 'task-zone', statusId: status.id };
		}
	});

	let addingTask = $state(false);
	let newTaskTitle = $state('');
	let renaming = $state(false);
	let renameValue = $state('');
	let pickerOpen = $state(false);
	let chosenColor: StatusColorName = $derived(asColor(status.color));
	let deleteLaneForm: HTMLFormElement | undefined = $state();

	const color = $derived(asColor(status.color));
</script>

<div
	{@attach laneSortable.attach}
	class={cn(
		'relative flex h-full w-72 shrink-0 flex-col rounded-xl border bg-muted/40 transition-all',
		laneSortable.isDragSource && 'opacity-40',
		tasksDroppable.isDropTarget && 'border-foreground/40 bg-muted'
	)}
	role="list"
	aria-label={status.name}
>
	<header class="group/header flex items-center gap-2 px-3 py-2.5">
		<button
			{@attach laneSortable.attachHandle}
			type="button"
			class="-ml-1 flex size-5 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground opacity-0 transition group-hover/header:opacity-100 hover:bg-accent hover:text-foreground active:cursor-grabbing"
			aria-label="Drag lane to reorder"
		>
			<GripVerticalIcon class="size-4" />
		</button>

		<Popover.Root bind:open={pickerOpen}>
			<Popover.Trigger>
				{#snippet child({ props })}
					<button
						{...props}
						type="button"
						class={cn(
							'size-2.5 rounded-full ring-offset-2 ring-offset-background transition hover:ring-2 hover:ring-foreground/30',
							statusDot[color]
						)}
						aria-label="Change color"
					></button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content class="w-auto p-3" align="start">
				<form
					method="POST"
					action="?/updateStatus"
					use:enhance={() => {
						return async ({ update }) => {
							await update();
							pickerOpen = false;
						};
					}}
				>
					<input type="hidden" name="id" value={status.id} />
					<input type="hidden" name="color" value={chosenColor} />
					<div class="space-y-3">
						<StatusColorPicker bind:value={chosenColor} onChange={(c) => (chosenColor = c)} />
						<Button type="submit" size="sm" class="w-full">Save</Button>
					</div>
				</form>
			</Popover.Content>
		</Popover.Root>

		{#if renaming}
			<form
				method="POST"
				action="?/updateStatus"
				class="flex-1"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						renaming = false;
					};
				}}
			>
				<input type="hidden" name="id" value={status.id} />
				<Input
					name="name"
					bind:value={renameValue}
					autofocus
					class="h-7 px-2 text-sm font-medium"
					onblur={() => (renaming = false)}
					onkeydown={(e) => {
						if (e.key === 'Escape') renaming = false;
					}}
				/>
			</form>
		{:else}
			<button
				type="button"
				class="flex-1 truncate text-left text-sm font-medium"
				ondblclick={() => {
					renameValue = status.name;
					renaming = true;
				}}
			>
				{status.name}
			</button>
		{/if}

		<span class="text-xs text-muted-foreground tabular-nums">{tasks.length}</span>

		<Button
			variant="ghost"
			size="icon"
			class="size-7"
			aria-label="Add task"
			onclick={() => {
				addingTask = true;
				newTaskTitle = '';
			}}
		>
			<PlusIcon class="size-4" />
		</Button>

		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="ghost" size="icon" class="size-7" aria-label="Lane menu">
						<MoreHorizontalIcon class="size-4" />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" class="min-w-44">
				<DropdownMenu.Group>
					<DropdownMenu.Item
						onclick={() => {
							renameValue = status.name;
							renaming = true;
						}}
					>
						<PencilIcon />
						<span>Rename</span>
					</DropdownMenu.Item>
					<DropdownMenu.Item
						onclick={() => {
							addingTask = true;
							newTaskTitle = '';
						}}
					>
						<PlusIcon />
						<span>Add task</span>
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				{#if canDelete}
					<DropdownMenu.Separator />
					<DropdownMenu.Group>
						<DropdownMenu.Item
							variant="destructive"
							onclick={() => deleteLaneForm?.requestSubmit()}
						>
							<TrashIcon />
							<span>Delete lane</span>
						</DropdownMenu.Item>
					</DropdownMenu.Group>
				{/if}
			</DropdownMenu.Content>
		</DropdownMenu.Root>

		<form
			bind:this={deleteLaneForm}
			method="POST"
			action="?/deleteStatus"
			class="hidden"
			use:enhance={() => {
				return async ({ update }) => {
					await update();
				};
			}}
		>
			<input type="hidden" name="id" value={status.id} />
		</form>
	</header>

	<div {@attach tasksDroppable.attach} class="flex-1 space-y-2 overflow-y-auto px-2 pb-2">
		{#each tasks as task, i (task.id)}
			<TaskCard {task} index={i} statusId={status.id} onOpen={onTaskOpen} />
		{/each}

		{#if addingTask}
			<form
				method="POST"
				action="?/createTask"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						newTaskTitle = '';
					};
				}}
				class="space-y-2 rounded-lg border bg-card p-2 shadow-xs"
			>
				<input type="hidden" name="statusId" value={status.id} />
				<Input
					name="title"
					bind:value={newTaskTitle}
					placeholder="Task title…"
					class="h-8"
					autofocus
					required
					onkeydown={(e) => {
						if (e.key === 'Escape') {
							e.preventDefault();
							addingTask = false;
						}
					}}
				/>
				<div class="flex items-center justify-between gap-1">
					<Button type="submit" size="sm" disabled={!newTaskTitle.trim()}>Add</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						class="size-7"
						aria-label="Cancel"
						onclick={() => (addingTask = false)}
					>
						<XIcon class="size-4" />
					</Button>
				</div>
			</form>
		{:else}
			<button
				type="button"
				class="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"
				onclick={() => {
					addingTask = true;
					newTaskTitle = '';
				}}
			>
				<PlusIcon class="size-3.5" />
				Add task
			</button>
		{/if}
	</div>
</div>
