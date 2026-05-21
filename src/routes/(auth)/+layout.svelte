<script lang="ts">
	import { Toaster } from '$lib/components/ui/sonner';

	let { children } = $props();
</script>

<div class="flex min-h-svh items-center justify-center bg-background p-6">
	<div class="w-full max-w-sm">
		{@render children()}
	</div>
</div>

<Toaster richColors closeButton position="top-center" />
