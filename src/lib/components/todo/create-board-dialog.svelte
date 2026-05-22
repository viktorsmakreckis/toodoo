<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { invalidateAll } from '$app/navigation';
	import IconPicker from './icon-picker.svelte';
	import { DEFAULT_BOARD_ICON } from './board-icons';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	let name = $state('');
	let icon = $state(DEFAULT_BOARD_ICON);
	let submitting = $state(false);

	function reset() {
		name = '';
		icon = DEFAULT_BOARD_ICON;
	}

	$effect(() => {
		if (!open) reset();
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>New board</Dialog.Title>
			<Dialog.Description>Create a new todo board with its own swimlanes.</Dialog.Description>
		</Dialog.Header>

		<form
			method="POST"
			action="/?/createBoard"
			use:enhance={() => {
				submitting = true;
				return async ({ result, update }) => {
					await update();
					submitting = false;
					if (result.type === 'redirect') {
						open = false;
						await invalidateAll();
					}
				};
			}}
			class="space-y-4"
		>
			<div class="space-y-2">
				<Label>Icon</Label>
				<IconPicker bind:value={icon} />
				<input type="hidden" name="icon" value={icon} />
			</div>

			<div class="space-y-2">
				<Label for="board-name">Name</Label>
				<Input
					id="board-name"
					name="name"
					bind:value={name}
					placeholder="Personal goals"
					autocomplete="off"
					required
				/>
			</div>

			<Dialog.Footer>
				<Button type="button" variant="ghost" onclick={() => (open = false)} disabled={submitting}>
					Cancel
				</Button>
				<Button type="submit" disabled={submitting || !name.trim()}>
					{submitting ? 'Creating…' : 'Create board'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
