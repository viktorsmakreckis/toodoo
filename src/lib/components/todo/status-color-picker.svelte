<script lang="ts">
	import { cn } from '$lib/utils';
	import { STATUS_COLOR_OPTIONS, statusDot, type StatusColorName } from './status-colors';

	type Props = {
		value: StatusColorName;
		onChange?: (v: StatusColorName) => void;
	};

	let { value = $bindable('slate'), onChange }: Props = $props();
</script>

<div class="grid grid-cols-10 gap-1">
	{#each STATUS_COLOR_OPTIONS as c (c)}
		<button
			type="button"
			class={cn(
				'flex size-6 items-center justify-center rounded-full ring-offset-2 ring-offset-background transition',
				value === c && 'ring-2 ring-foreground'
			)}
			aria-label={c}
			onclick={() => {
				value = c;
				onChange?.(c);
			}}
		>
			<span class={cn('block size-4 rounded-full', statusDot[c])}></span>
		</button>
	{/each}
</div>
