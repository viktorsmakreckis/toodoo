<script lang="ts">
	import { resolve } from '$app/paths';
	import { createForm } from '@tanstack/svelte-form';
	import { toast } from 'svelte-sonner';
	import { requestPasswordReset } from '$lib/auth-client';
	import { forgotPasswordSchema, type ForgotPasswordInput } from '$lib/schemas/auth';
	import * as Field from '$lib/components/ui/field';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';

	let sentTo = $state<string | null>(null);

	const form = createForm(() => ({
		defaultValues: { email: '' } satisfies ForgotPasswordInput,
		validators: { onSubmit: forgotPasswordSchema },
		onSubmit: async ({ value }) => {
			const { error } = await requestPasswordReset({
				email: value.email,
				redirectTo: resolve('/reset-password')
			});

			if (error) {
				toast.error(error.message ?? 'Could not send reset email');
				return;
			}

			sentTo = value.email;
		}
	}));
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Reset your password</Card.Title>
		<Card.Description>
			{#if sentTo}
				If an account exists for that email, we just sent a reset link.
			{:else}
				Enter your email and we'll send you a link to choose a new password.
			{/if}
		</Card.Description>
	</Card.Header>

	{#if sentTo}
		<Card.Content>
			<p class="text-sm text-muted-foreground">
				Check <span class="font-medium text-foreground">{sentTo}</span> for instructions. The link expires
				in one hour.
			</p>
		</Card.Content>
		<Card.Footer class="flex-col gap-3">
			<Button href="/sign-in" variant="outline" class="w-full">Back to sign in</Button>
		</Card.Footer>
	{:else}
		<Card.Content>
			<form
				id="forgot-password-form"
				onsubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<Field.Group>
					<form.Field name="email">
						{#snippet children(field)}
							<Field.Field data-invalid={field.state.meta.errors.length > 0}>
								<Field.Label for={field.name}>Email</Field.Label>
								<Input
									id={field.name}
									name={field.name}
									type="email"
									autocomplete="email"
									placeholder="you@example.com"
									value={field.state.value}
									oninput={(e) => field.handleChange(e.currentTarget.value)}
									onblur={field.handleBlur}
									aria-invalid={field.state.meta.errors.length > 0}
								/>
								<Field.Error errors={field.state.meta.errors} />
							</Field.Field>
						{/snippet}
					</form.Field>
				</Field.Group>
			</form>
		</Card.Content>
		<Card.Footer class="flex-col gap-3">
			<form.Subscribe selector={(s) => s.isSubmitting}>
				{#snippet children(isSubmitting)}
					<Button form="forgot-password-form" type="submit" class="w-full" disabled={isSubmitting}>
						{isSubmitting ? 'Sending…' : 'Send reset link'}
					</Button>
				{/snippet}
			</form.Subscribe>

			<p class="text-center text-sm text-muted-foreground">
				Remembered it?
				<a href={resolve('/sign-in')} class="underline underline-offset-4 hover:text-primary">
					Sign in
				</a>
			</p>
		</Card.Footer>
	{/if}
</Card.Root>
