<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ListTodoIcon from '@lucide/svelte/icons/list-todo';
	import CreateBoardDialog from '$lib/components/todo/create-board-dialog.svelte';

	let { data } = $props();

	let createOpen = $state(false);
</script>

<div class="flex h-full w-full items-center justify-center p-8">
	<div class="max-w-md space-y-4 text-center">
		<div
			class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
		>
			<ListTodoIcon class="size-6" />
		</div>
		<h1 class="text-2xl font-semibold tracking-tight">Welcome, {data.user.name}</h1>
		<p class="text-sm text-muted-foreground">
			You don't have any boards yet. Create one to start organizing your work into swimlanes.
		</p>
		<Button onclick={() => (createOpen = true)} class="gap-2">
			<PlusIcon class="size-4" />
			Create your first board
		</Button>
	</div>
</div>

<CreateBoardDialog bind:open={createOpen} />
