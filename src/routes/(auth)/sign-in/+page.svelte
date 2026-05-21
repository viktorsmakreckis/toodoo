<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { createForm } from '@tanstack/svelte-form';
	import { toast } from 'svelte-sonner';
	import { signIn } from '$lib/auth-client';
	import { signInSchema, type SignInInput } from '$lib/schemas/auth';
	import * as Field from '$lib/components/ui/field';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';

	const form = createForm(() => ({
		defaultValues: {
			email: '',
			password: ''
		} satisfies SignInInput,
		validators: { onSubmit: signInSchema },
		onSubmit: async ({ value }) => {
			const { error } = await signIn.email({
				email: value.email,
				password: value.password
			});

			if (error) {
				if (error.code === 'EMAIL_NOT_VERIFIED') {
					toast.error('Please verify your email first.');
					const target = new URL(resolve('/verify-email'), window.location.origin);
					target.searchParams.set('email', value.email);
					// eslint-disable-next-line svelte/no-navigation-without-resolve -- URL built from resolve()
					await goto(target);
					return;
				}
				toast.error(error.message ?? 'Invalid email or password');
				return;
			}

			const redirectTo = page.url.searchParams.get('redirectTo') ?? resolve('/');
			// eslint-disable-next-line svelte/no-navigation-without-resolve -- redirectTo comes from a server-issued search param after sign-in
			await goto(new URL(redirectTo, window.location.origin));
		}
	}));
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Welcome back</Card.Title>
		<Card.Description>Sign in to your Toodoo account.</Card.Description>
	</Card.Header>

	<Card.Content>
		<form
			id="sign-in-form"
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

				<form.Field name="password">
					{#snippet children(field)}
						<Field.Field data-invalid={field.state.meta.errors.length > 0}>
							<div class="grid grid-cols-[1fr_auto] items-center gap-x-2 gap-y-1.5">
								<Field.Label for={field.name} class="col-start-1 row-start-1">Password</Field.Label>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									autocomplete="current-password"
									value={field.state.value}
									oninput={(e) => field.handleChange(e.currentTarget.value)}
									onblur={field.handleBlur}
									aria-invalid={field.state.meta.errors.length > 0}
									class="col-span-2 row-start-2"
								/>
								<a
									href={resolve('/forgot-password')}
									class="col-start-2 row-start-1 text-sm text-muted-foreground underline underline-offset-4 hover:text-primary"
								>
									Forgot?
								</a>
							</div>
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
				<Button form="sign-in-form" type="submit" class="w-full" disabled={isSubmitting}>
					{isSubmitting ? 'Signing in…' : 'Sign in'}
				</Button>
			{/snippet}
		</form.Subscribe>

		<p class="text-center text-sm text-muted-foreground">
			New here?
			<a href={resolve('/sign-up')} class="underline underline-offset-4 hover:text-primary">
				Create an account
			</a>
		</p>
	</Card.Footer>
</Card.Root>
