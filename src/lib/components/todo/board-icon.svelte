<script lang="ts">
	import { getBoardIcon } from './board-icons';

	type Props = {
		name: string | null | undefined;
		class?: string;
	};

	let { name, class: className }: Props = $props();

	const Icon = $derived(getBoardIcon(name));
</script>

<Icon class={className} />
