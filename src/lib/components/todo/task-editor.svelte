<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as Drawer from '$lib/components/ui/drawer';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import type { Status, Task } from '$lib/server/db/schema';
	import { PRIORITY_OPTIONS, priorityLabel, type Priority } from './status-colors';
	import TrashIcon from '@lucide/svelte/icons/trash-2';

	type Props = {
		open: boolean;
		task: Task | null;
		statuses: Status[];
		onClose: () => void;
	};

	let { open, task, statuses, onClose }: Props = $props();

	const isMobile = new IsMobile();

	let title = $state('');
	let description = $state('');
	let priority = $state<Priority>('none');
	let dueDate = $state('');
	let tags = $state('');
	let statusId = $state('');
	let saving = $state(false);
	let deleting = $state(false);

	function formatLocalDate(d: Date | null): string {
		if (!d) return '';
		const date = new Date(d);
		const yyyy = date.getFullYear();
		const mm = String(date.getMonth() + 1).padStart(2, '0');
		const dd = String(date.getDate()).padStart(2, '0');
		return `${yyyy}-${mm}-${dd}`;
	}

	$effect(() => {
		if (task) {
			title = task.title;
			description = task.description ?? '';
			priority = task.priority as Priority;
			dueDate = task.dueDate ? formatLocalDate(new Date(task.dueDate)) : '';
			tags = (task.tags ?? []).join(', ');
			statusId = task.statusId;
		}
	});

	const statusName = $derived(statuses.find((s) => s.id === statusId)?.name ?? 'Select status');

	function onOpenChange(v: boolean) {
		if (!v) onClose();
	}
</script>

{#snippet header()}
	<form
		method="POST"
		action="?/updateTask"
		use:enhance={() => {
			saving = true;
			return async ({ update }) => {
				await update({ reset: false });
				saving = false;
			};
		}}
		class="flex items-start gap-2"
	>
		<input type="hidden" name="id" value={task!.id} />
		<input type="hidden" name="title" value={title} />
		<Input
			bind:value={title}
			class="h-auto border-0 bg-transparent px-0 text-xl font-semibold shadow-none focus-visible:ring-0"
			placeholder="Untitled task"
			onblur={(e) => {
				const form = e.currentTarget.form;
				if (form && title.trim() && title.trim() !== task!.title) form.requestSubmit();
			}}
		/>
	</form>
{/snippet}

{#snippet body()}
	<form
		method="POST"
		action="?/moveTask"
		use:enhance={() => {
			return async ({ update }) => {
				await update({ reset: false });
				await invalidateAll();
			};
		}}
		id="move-form"
	>
		<input type="hidden" name="id" value={task!.id} />
		<input type="hidden" name="statusId" value={statusId} />
		<input type="hidden" name="position" value="1" />
	</form>

	<div class="grid grid-cols-[120px_1fr] items-center gap-3">
		<Label class="text-sm text-muted-foreground">Status</Label>
		<Select.Root
			type="single"
			value={statusId}
			onValueChange={(v) => {
				if (v && v !== statusId) {
					statusId = v;
					const form = document.getElementById('move-form') as HTMLFormElement | null;
					form?.requestSubmit();
				}
			}}
		>
			<Select.Trigger class="w-full">
				{statusName}
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					{#each statuses as s (s.id)}
						<Select.Item value={s.id} label={s.name}>{s.name}</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
	</div>

	<form
		id="task-update-form"
		method="POST"
		action="?/updateTask"
		use:enhance={() => {
			saving = true;
			return async ({ result, update }) => {
				await update({ reset: false });
				saving = false;
				if (result.type === 'success') onClose();
			};
		}}
		class="space-y-5"
	>
		<input type="hidden" name="id" value={task!.id} />

		<div class="grid grid-cols-[120px_1fr] items-center gap-3">
			<Label class="text-sm text-muted-foreground">Priority</Label>
			<Select.Root
				type="single"
				name="priority"
				value={priority}
				onValueChange={(v) => {
					if (v) priority = v as Priority;
				}}
			>
				<Select.Trigger class="w-full">
					{priorityLabel[priority]}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						{#each PRIORITY_OPTIONS as p (p)}
							<Select.Item value={p} label={priorityLabel[p]}>
								{priorityLabel[p]}
							</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>
		</div>

		<div class="grid grid-cols-[120px_1fr] items-center gap-3">
			<Label for="task-due" class="text-sm text-muted-foreground">Due date</Label>
			<Input id="task-due" name="dueDate" type="date" bind:value={dueDate} />
		</div>

		<div class="grid grid-cols-[120px_1fr] items-center gap-3">
			<Label for="task-tags" class="text-sm text-muted-foreground">Tags</Label>
			<Input id="task-tags" name="tags" bind:value={tags} placeholder="design, frontend" />
		</div>

		<Separator />

		<div class="space-y-2">
			<Label for="task-description" class="text-sm text-muted-foreground">Notes</Label>
			<Textarea
				id="task-description"
				name="description"
				bind:value={description}
				rows={6}
				placeholder="Add details, links, or context…"
			/>
		</div>
	</form>
{/snippet}

{#snippet footer()}
	<form
		method="POST"
		action="?/deleteTask"
		use:enhance={() => {
			deleting = true;
			return async ({ update }) => {
				await update();
				deleting = false;
				onClose();
			};
		}}
	>
		<input type="hidden" name="id" value={task!.id} />
		<Button
			type="submit"
			variant="ghost"
			class="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
			disabled={deleting}
		>
			<TrashIcon class="size-4" />
			{deleting ? 'Deleting…' : 'Delete'}
		</Button>
	</form>

	<Button type="submit" form="task-update-form" disabled={saving}>
		{saving ? 'Saving…' : 'Save changes'}
	</Button>
{/snippet}

{#if isMobile.current}
	<Drawer.Root {open} {onOpenChange}>
		<Drawer.Content>
			{#if task}
				<Drawer.Header class="text-left">
					<Drawer.Title class="sr-only">Edit task</Drawer.Title>
					{@render header()}
				</Drawer.Header>
				<div class="flex-1 space-y-5 overflow-y-auto px-4 pb-4">
					{@render body()}
				</div>
				<Drawer.Footer class="flex flex-row items-center justify-between gap-2 pb-2">
					{@render footer()}
				</Drawer.Footer>
			{/if}
		</Drawer.Content>
	</Drawer.Root>
{:else}
	<Sheet.Root {open} {onOpenChange}>
		<Sheet.Content class="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
			{#if task}
				<Sheet.Header class="border-b p-6">
					<Sheet.Title class="sr-only">Edit task</Sheet.Title>
					{@render header()}
				</Sheet.Header>
				<div class="flex-1 space-y-5 overflow-y-auto p-6">
					{@render body()}
				</div>
				<div class="flex items-center justify-between gap-2 border-t p-4">
					{@render footer()}
				</div>
			{/if}
		</Sheet.Content>
	</Sheet.Root>
{/if}
