<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { createForm } from '@tanstack/svelte-form';
	import { toast } from 'svelte-sonner';
	import { resetPassword } from '$lib/auth-client';
	import { resetPasswordSchema, type ResetPasswordInput } from '$lib/schemas/auth';
	import * as Field from '$lib/components/ui/field';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';

	const token = $derived(page.url.searchParams.get('token'));
	const linkError = $derived(page.url.searchParams.get('error'));

	const form = createForm(() => ({
		defaultValues: {
			password: '',
			confirmPassword: ''
		} satisfies ResetPasswordInput,
		validators: { onSubmit: resetPasswordSchema },
		onSubmit: async ({ value }) => {
			if (!token) {
				toast.error('Missing reset token');
				return;
			}
			const { error } = await resetPassword({
				newPassword: value.password,
				token
			});
			if (error) {
				toast.error(error.message ?? 'Could not reset password');
				return;
			}
			toast.success('Password updated — sign in with your new password.');
			await goto(resolve('/sign-in'));
		}
	}));
</script>

<Card.Root>
	{#if linkError || !token}
		<Card.Header>
			<Card.Title>Reset link expired</Card.Title>
			<Card.Description>
				This reset link is invalid or has already been used. Request a new one below.
			</Card.Description>
		</Card.Header>
		<Card.Footer class="flex-col gap-3">
			<Button href="/forgot-password" class="w-full">Request a new link</Button>
			<Button href="/sign-in" variant="outline" class="w-full">Back to sign in</Button>
		</Card.Footer>
	{:else}
		<Card.Header>
			<Card.Title>Choose a new password</Card.Title>
			<Card.Description>Pick something memorable but secure.</Card.Description>
		</Card.Header>

		<Card.Content>
			<form
				id="reset-password-form"
				onsubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<Field.Group>
					<form.Field name="password">
						{#snippet children(field)}
							<Field.Field data-invalid={field.state.meta.errors.length > 0}>
								<Field.Label for={field.name}>New password</Field.Label>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									autocomplete="new-password"
									value={field.state.value}
									oninput={(e) => field.handleChange(e.currentTarget.value)}
									onblur={field.handleBlur}
									aria-invalid={field.state.meta.errors.length > 0}
								/>
								<Field.Description>At least 8 characters.</Field.Description>
								<Field.Error errors={field.state.meta.errors} />
							</Field.Field>
						{/snippet}
					</form.Field>

					<form.Field name="confirmPassword">
						{#snippet children(field)}
							<Field.Field data-invalid={field.state.meta.errors.length > 0}>
								<Field.Label for={field.name}>Confirm password</Field.Label>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									autocomplete="new-password"
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

		<Card.Footer>
			<form.Subscribe selector={(s) => s.isSubmitting}>
				{#snippet children(isSubmitting)}
					<Button form="reset-password-form" type="submit" class="w-full" disabled={isSubmitting}>
						{isSubmitting ? 'Updating…' : 'Update password'}
					</Button>
				{/snippet}
			</form.Subscribe>
		</Card.Footer>
	{/if}
</Card.Root>
