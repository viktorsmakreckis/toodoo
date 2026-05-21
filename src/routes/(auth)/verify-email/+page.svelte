<script lang="ts">
	import { page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { toast } from 'svelte-sonner';
	import { sendVerificationEmail } from '$lib/auth-client';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';

	const verified = $derived(page.url.searchParams.get('verified') === '1');
	const errorCode = $derived(page.url.searchParams.get('error'));
	const email = $derived(page.url.searchParams.get('email'));

	let resending = $state(false);

	async function resend() {
		if (!email) {
			toast.error('Add your email to the URL to resend a verification link.');
			return;
		}
		resending = true;
		const { error } = await sendVerificationEmail({
			email,
			callbackURL: '/verify-email?verified=1'
		});
		resending = false;
		if (error) {
			toast.error(error.message ?? 'Could not resend verification email');
			return;
		}
		toast.success('Verification email sent — check your inbox.');
	}

	async function continueToApp() {
		await invalidateAll();
		await goto(resolve('/'));
	}
</script>

<Card.Root>
	{#if verified}
		<Card.Header>
			<Card.Title>Email verified</Card.Title>
			<Card.Description>You're all set — your email has been confirmed.</Card.Description>
		</Card.Header>
		<Card.Footer class="flex-col gap-3">
			<Button class="w-full" onclick={continueToApp}>Continue</Button>
		</Card.Footer>
	{:else if errorCode}
		<Card.Header>
			<Card.Title>Verification failed</Card.Title>
			<Card.Description>
				The link is invalid or has expired. Request a new one below.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if email}
				<p class="text-sm text-muted-foreground">
					We'll send a new link to
					<span class="font-medium text-foreground">{email}</span>.
				</p>
			{:else}
				<p class="text-sm text-muted-foreground">Sign in to request a new verification email.</p>
			{/if}
		</Card.Content>
		<Card.Footer class="flex-col gap-3">
			{#if email}
				<Button class="w-full" onclick={resend} disabled={resending}>
					{resending ? 'Sending…' : 'Resend verification email'}
				</Button>
			{/if}
			<Button href="/sign-in" variant="outline" class="w-full">Back to sign in</Button>
		</Card.Footer>
	{:else}
		<Card.Header>
			<Card.Title>Check your inbox</Card.Title>
			<Card.Description>
				{#if email}
					We sent a verification link to
					<span class="font-medium text-foreground">{email}</span>.
				{:else}
					We sent you a verification link. Open it to finish signing in.
				{/if}
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<p class="text-sm text-muted-foreground">
				The link expires in one hour. Didn't get it? Check spam, or resend below.
			</p>
		</Card.Content>
		<Card.Footer class="flex-col gap-3">
			{#if email}
				<Button class="w-full" onclick={resend} disabled={resending}>
					{resending ? 'Sending…' : 'Resend verification email'}
				</Button>
			{/if}
			<Button href="/sign-in" variant="outline" class="w-full">Back to sign in</Button>
		</Card.Footer>
	{/if}
</Card.Root>
