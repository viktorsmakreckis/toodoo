<script lang="ts">
	let { data } = $props();
</script>

<div class="space-y-2">
	<h1 class="text-2xl font-semibold">
		Welcome, {data.user.name}
	</h1>
	<p class="text-muted-foreground">You're signed in. Time to get things done.</p>
</div>
