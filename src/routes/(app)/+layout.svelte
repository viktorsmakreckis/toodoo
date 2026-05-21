<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { resetMode, setMode, userPrefersMode } from 'mode-watcher';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import MonitorIcon from '@lucide/svelte/icons/monitor';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Toaster } from '$lib/components/ui/sonner';
	import { signOut } from '$lib/auth-client';

	let { data, children } = $props();

	const displayName = $derived(data.user.displayUsername ?? data.user.username ?? data.user.email);

	const initials = $derived(
		data.user.name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part: string) => part[0]?.toUpperCase() ?? '')
			.join('') || data.user.email[0]?.toUpperCase()
	);

	async function handleSignOut() {
		await signOut();
		await invalidateAll();
		await goto(resolve('/sign-in'));
	}
</script>

<div class="flex min-h-svh flex-col bg-background">
	<header class="border-b">
		<div class="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
			<a href={resolve('/')} class="text-lg font-semibold">Toodoo</a>

			<div class="flex items-center gap-2">
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="ghost" size="icon" aria-label="Toggle theme">
								<SunIcon
									class="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
								/>
								<MoonIcon
									class="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
								/>
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end">
						<DropdownMenu.Item onclick={() => setMode('light')}>
							<SunIcon />
							<span>Light</span>
							{#if userPrefersMode.current === 'light'}
								<CheckIcon class="ml-auto" />
							{/if}
						</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => setMode('dark')}>
							<MoonIcon />
							<span>Dark</span>
							{#if userPrefersMode.current === 'dark'}
								<CheckIcon class="ml-auto" />
							{/if}
						</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => resetMode()}>
							<MonitorIcon />
							<span>System</span>
							{#if userPrefersMode.current === 'system'}
								<CheckIcon class="ml-auto" />
							{/if}
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>

				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="ghost" class="gap-2">
								<Avatar.Root size="sm">
									<Avatar.Fallback>{initials}</Avatar.Fallback>
								</Avatar.Root>
								<span class="hidden sm:inline">{displayName}</span>
								<ChevronDownIcon class="size-3.5 opacity-60" />
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end" class="min-w-64">
						<DropdownMenu.Label class="p-0">
							<div class="flex items-center gap-3 px-2 py-1.5">
								<Avatar.Root>
									<Avatar.Fallback>{initials}</Avatar.Fallback>
								</Avatar.Root>
								<div class="flex min-w-0 flex-col">
									<span class="truncate text-sm font-medium">{data.user.name}</span>
									<span
										class="truncate text-xs font-normal text-muted-foreground"
										title={data.user.email}
									>
										{data.user.email}
									</span>
									{#if data.user.username}
										<span class="truncate text-xs font-normal text-muted-foreground">
											@{data.user.displayUsername ?? data.user.username}
										</span>
									{/if}
								</div>
							</div>
						</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.Item variant="destructive" onclick={handleSignOut}>
							<LogOutIcon />
							Sign out
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		</div>
	</header>

	<main class="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
		{@render children()}
	</main>
</div>

<Toaster richColors closeButton position="top-center" />
