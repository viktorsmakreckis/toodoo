<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { createForm } from '@tanstack/svelte-form';
	import { toast } from 'svelte-sonner';
	import { signUp } from '$lib/auth-client';
	import { signUpSchema, type SignUpInput } from '$lib/schemas/auth';
	import * as Field from '$lib/components/ui/field';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';

	const form = createForm(() => ({
		defaultValues: {
			name: '',
			username: '',
			email: '',
			password: ''
		} satisfies SignUpInput,
		validators: { onSubmit: signUpSchema },
		onSubmit: async ({ value }) => {
			const { error } = await signUp.email({
				name: value.name,
				username: value.username,
				email: value.email,
				password: value.password,
				callbackURL: '/verify-email?verified=1'
			});

			if (error) {
				toast.error(error.message ?? 'Could not create your account');
				return;
			}

			toast.success('Account created — check your email to verify.');
			const target = new URL(resolve('/verify-email'), window.location.origin);
			target.searchParams.set('email', value.email);
			// eslint-disable-next-line svelte/no-navigation-without-resolve -- URL built from resolve()
			await goto(target);
		}
	}));
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Create your account</Card.Title>
		<Card.Description>Get started with Toodoo in under a minute.</Card.Description>
	</Card.Header>

	<Card.Content>
		<form
			id="sign-up-form"
			onsubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<Field.Group>
				<form.Field name="name">
					{#snippet children(field)}
						<Field.Field data-invalid={field.state.meta.errors.length > 0}>
							<Field.Label for={field.name}>Name</Field.Label>
							<Input
								id={field.name}
								name={field.name}
								type="text"
								autocomplete="name"
								placeholder="Ada Lovelace"
								value={field.state.value}
								oninput={(e) => field.handleChange(e.currentTarget.value)}
								onblur={field.handleBlur}
								aria-invalid={field.state.meta.errors.length > 0}
							/>
							<Field.Error errors={field.state.meta.errors} />
						</Field.Field>
					{/snippet}
				</form.Field>

				<form.Field name="username">
					{#snippet children(field)}
						<Field.Field data-invalid={field.state.meta.errors.length > 0}>
							<Field.Label for={field.name}>Username</Field.Label>
							<Input
								id={field.name}
								name={field.name}
								type="text"
								autocomplete="username"
								placeholder="ada"
								value={field.state.value}
								oninput={(e) => field.handleChange(e.currentTarget.value)}
								onblur={field.handleBlur}
								aria-invalid={field.state.meta.errors.length > 0}
							/>
							<Field.Description>Letters, numbers, and underscores only.</Field.Description>
							<Field.Error errors={field.state.meta.errors} />
						</Field.Field>
					{/snippet}
				</form.Field>

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
							<Field.Label for={field.name}>Password</Field.Label>
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
			</Field.Group>
		</form>
	</Card.Content>

	<Card.Footer class="flex-col gap-3">
		<form.Subscribe selector={(s) => s.isSubmitting}>
			{#snippet children(isSubmitting)}
				<Button form="sign-up-form" type="submit" class="w-full" disabled={isSubmitting}>
					{isSubmitting ? 'Creating account…' : 'Create account'}
				</Button>
			{/snippet}
		</form.Subscribe>

		<p class="text-center text-sm text-muted-foreground">
			Already have an account?
			<a href={resolve('/sign-in')} class="underline underline-offset-4 hover:text-primary"
				>Sign in</a
			>
		</p>
	</Card.Footer>
</Card.Root>
