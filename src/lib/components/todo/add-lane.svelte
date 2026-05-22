<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import StatusColorPicker from './status-color-picker.svelte';
	import { type StatusColorName } from './status-colors';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import XIcon from '@lucide/svelte/icons/x';

	let adding = $state(false);
	let name = $state('');
	let color = $state<StatusColorName>('slate');

	function cancel() {
		adding = false;
		name = '';
		color = 'slate';
	}
</script>

<div class="flex h-full w-72 shrink-0 flex-col">
	{#if adding}
		<form
			method="POST"
			action="?/createStatus"
			use:enhance={() => {
				return async ({ update }) => {
					await update();
					cancel();
				};
			}}
			class="space-y-3 rounded-xl border bg-muted/40 p-3"
		>
			<Input
				name="name"
				bind:value={name}
				placeholder="Lane name…"
				autofocus
				required
				onkeydown={(e) => {
					if (e.key === 'Escape') {
						e.preventDefault();
						cancel();
					}
				}}
			/>
			<input type="hidden" name="color" value={color} />
			<StatusColorPicker bind:value={color} onChange={(c) => (color = c)} />
			<div class="flex items-center justify-between">
				<Button type="submit" size="sm" disabled={!name.trim()}>Create</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class="size-7"
					aria-label="Cancel"
					onclick={cancel}
				>
					<XIcon class="size-4" />
				</Button>
			</div>
		</form>
	{:else}
		<button
			type="button"
			class="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed bg-transparent px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
			onclick={() => (adding = true)}
		>
			<PlusIcon class="size-4" />
			Add lane
		</button>
	{/if}
</div>
