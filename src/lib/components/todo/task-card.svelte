<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Task } from '$lib/server/db/schema';
	import { priorityBadge, priorityLabel, type Priority } from './status-colors';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import FlagIcon from '@lucide/svelte/icons/flag';
	import { createSortable } from '@dnd-kit/svelte/sortable';

	type Props = {
		task: Task;
		index: number;
		statusId: string;
		onOpen?: (task: Task) => void;
	};

	let { task, index, statusId, onOpen }: Props = $props();

	const sortable = createSortable({
		get id() {
			return task.id;
		},
		get index() {
			return index;
		},
		get group() {
			return statusId;
		},
		type: 'task',
		accept: 'task',
		data: { kind: 'task' }
	});

	const due = $derived(task.dueDate ? new Date(task.dueDate) : null);

	function startOfDay(d: Date): number {
		return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
	}

	const dueLabel = $derived.by(() => {
		if (!due) return null;
		const today = startOfDay(new Date());
		const dayMs = 1000 * 60 * 60 * 24;
		const diffDays = Math.round((startOfDay(due) - today) / dayMs);
		if (diffDays === 0) return { label: 'Today', tone: 'today' as const };
		if (diffDays === 1) return { label: 'Tomorrow', tone: 'soon' as const };
		if (diffDays === -1) return { label: 'Yesterday', tone: 'overdue' as const };
		if (diffDays < 0) return { label: `${Math.abs(diffDays)}d overdue`, tone: 'overdue' as const };
		if (diffDays < 7) return { label: `In ${diffDays}d`, tone: 'soon' as const };
		return {
			label: due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
			tone: 'normal' as const
		};
	});

	const priority = $derived(task.priority as Priority);
</script>

<div
	{@attach sortable.attach}
	role="button"
	tabindex="0"
	class={cn(
		'group/card relative w-full cursor-pointer touch-none rounded-lg border bg-card p-3 text-left shadow-xs transition-all hover:border-foreground/20 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
		sortable.isDragSource && 'opacity-30'
	)}
	onclick={() => onOpen?.(task)}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onOpen?.(task);
		}
	}}
>
	<div class="flex items-start gap-2">
		<div class="min-w-0 flex-1 space-y-2">
			<div class="text-sm leading-snug font-medium">
				{task.title}
			</div>

			{#if task.description}
				<p class="line-clamp-2 text-xs text-muted-foreground">
					{task.description}
				</p>
			{/if}

			{#if task.tags?.length}
				<div class="flex flex-wrap gap-1">
					{#each task.tags as tag (tag)}
						<span
							class="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
						>
							{tag}
						</span>
					{/each}
				</div>
			{/if}

			{#if priority !== 'none' || dueLabel}
				<div class="flex flex-wrap items-center gap-1.5">
					{#if priority !== 'none'}
						<span
							class={cn(
								'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium',
								priorityBadge[priority]
							)}
						>
							<FlagIcon class="size-3" />
							{priorityLabel[priority]}
						</span>
					{/if}
					{#if dueLabel}
						<span
							class={cn(
								'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium',
								dueLabel.tone === 'overdue' &&
									'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200',
								dueLabel.tone === 'today' &&
									'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200',
								dueLabel.tone === 'soon' &&
									'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200',
								dueLabel.tone === 'normal' && 'bg-muted text-muted-foreground'
							)}
						>
							<CalendarIcon class="size-3" />
							{dueLabel.label}
						</span>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
