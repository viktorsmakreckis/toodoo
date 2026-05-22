<script lang="ts">
	import { page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { resetMode, setMode, userPrefersMode } from 'mode-watcher';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import MonitorIcon from '@lucide/svelte/icons/monitor';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import LayoutGridIcon from '@lucide/svelte/icons/layout-grid';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { Toaster } from '$lib/components/ui/sonner';
	import { signOut } from '$lib/auth-client';
	import CreateBoardDialog from '$lib/components/todo/create-board-dialog.svelte';
	import BoardIcon from '$lib/components/todo/board-icon.svelte';

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

	const activeBoardId = $derived(page.params.boardId);

	let createBoardOpen = $state(false);

	async function handleSignOut() {
		await signOut();
		await invalidateAll();
		await goto(resolve('/sign-in'));
	}
</script>

<Sidebar.Provider>
	<Sidebar.Root collapsible="icon">
		<Sidebar.Header>
			<div
				class="flex items-center justify-between gap-2 px-2 py-1.5 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
			>
				<a
					href={resolve('/')}
					class="flex items-center gap-2 font-semibold tracking-tight group-data-[collapsible=icon]:hidden"
				>
					<LayoutGridIcon class="size-5" />
					<span>Toodoo</span>
				</a>
				<Button
					variant="ghost"
					size="icon"
					class="size-7"
					aria-label="New board"
					onclick={() => (createBoardOpen = true)}
				>
					<PlusIcon class="size-4" />
				</Button>
			</div>
		</Sidebar.Header>

		<Sidebar.Content>
			<Sidebar.Group>
				<Sidebar.GroupLabel>Boards</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each data.boards as b (b.id)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton isActive={activeBoardId === b.id} tooltipContent={b.name}>
									{#snippet child({ props })}
										<a href={resolve(`/b/${b.id}`)} {...props}>
											<BoardIcon name={b.icon} class="size-4 shrink-0" />
											<span>{b.name}</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
						{#if data.boards.length === 0}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton
									onclick={() => (createBoardOpen = true)}
									tooltipContent="New board"
								>
									<PlusIcon class="size-4" />
									<span class="text-muted-foreground">Create your first board</span>
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/if}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		</Sidebar.Content>

		<Sidebar.Footer>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Sidebar.MenuButton {...props} size="lg" tooltipContent={displayName}>
									<Avatar.Root>
										<Avatar.Fallback>{initials}</Avatar.Fallback>
									</Avatar.Root>
									<div class="flex min-w-0 flex-col text-left">
										<span class="truncate text-sm font-medium">{displayName}</span>
										<span class="truncate text-xs text-muted-foreground">{data.user.email}</span>
									</div>
									<ChevronUpIcon class="ml-auto size-4 opacity-60" />
								</Sidebar.MenuButton>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content side="top" align="start" class="min-w-56">
							<DropdownMenu.Group>
								<DropdownMenu.Label class="text-xs text-muted-foreground">Theme</DropdownMenu.Label>
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
							</DropdownMenu.Group>
							<DropdownMenu.Separator />
							<DropdownMenu.Group>
								<DropdownMenu.Item variant="destructive" onclick={handleSignOut}>
									<LogOutIcon />
									Sign out
								</DropdownMenu.Item>
							</DropdownMenu.Group>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Footer>
		<Sidebar.Rail />
	</Sidebar.Root>

	<Sidebar.Inset class="overflow-hidden">
		<header
			class="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur"
		>
			<Sidebar.Trigger />
		</header>
		<main class="flex-1 overflow-auto">
			{@render children()}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>

<CreateBoardDialog bind:open={createBoardOpen} />

<Toaster richColors closeButton position="top-center" />
