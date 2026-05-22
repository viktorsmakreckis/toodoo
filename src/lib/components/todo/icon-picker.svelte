<script lang="ts">
	import { cn } from '$lib/utils';
	import { BOARD_ICON_NAMES, BOARD_ICONS } from './board-icons';

	type Props = {
		value: string;
		onChange?: (v: string) => void;
	};

	let { value = $bindable('list-todo'), onChange }: Props = $props();
</script>

<div class="grid grid-cols-7 gap-1">
	{#each BOARD_ICON_NAMES as name (name)}
		{@const Icon = BOARD_ICONS[name]}
		<button
			type="button"
			class={cn(
				'flex size-9 items-center justify-center rounded-md border text-muted-foreground transition hover:bg-accent hover:text-foreground',
				value === name && 'border-foreground bg-accent text-foreground'
			)}
			onclick={() => {
				value = name;
				onChange?.(name);
			}}
			aria-label={name}
		>
			<Icon class="size-4" />
		</button>
	{/each}
</div>
