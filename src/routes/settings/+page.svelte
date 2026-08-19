<script lang="ts">
	import { enhance } from '$app/forms';
	import { PRODUCT_NAME, CLUB_NAME } from '$lib/constants';
	import { formatBytes } from '$lib/utils';

	let { data, form } = $props<{ data: any; form?: { success?: boolean; message?: string } }>();

	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let passwordLoading = $state(false);
	let passwordMessage = $state('');
	let passwordError = $state('');

	let notificationsEnabled = $state(true);

	$effect(() => {
		notificationsEnabled = data.user?.slackNotificationsEnabled ?? true;
	});

	async function handlePasswordSubmit(e: Event) {
		e.preventDefault();
		passwordLoading = true;
		passwordMessage = '';
		passwordError = '';

		try {
			const res = await fetch('/api/settings/password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
			});

			const result = await res.json();

			if (res.ok && result.success) {
				passwordMessage = 'Password updated successfully.';
				currentPassword = '';
				newPassword = '';
				confirmPassword = '';
			} else {
				passwordError = result.error || 'Something went wrong.';
			}
		} catch {
			passwordError = 'Failed to connect to server.';
		} finally {
			passwordLoading = false;
		}
	}

	let roleBadgeColor = $derived.by(() => {
		switch (data.profile?.role) {
			case 'MAIN_LEADER':
				return 'bg-amber-500/10 text-amber-400 ring-amber-500/20';
			case 'CO_LEADER':
				return 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20';
			case 'AMBASSADOR':
				return 'bg-blue-500/10 text-blue-400 ring-blue-500/20';
			default:
				return 'bg-zinc-500/10 text-zinc-400 ring-zinc-500/20';
		}
	});

	let roleLabel = $derived.by(() => {
		switch (data.profile?.role) {
			case 'MAIN_LEADER':
				return 'Main Leader';
			case 'CO_LEADER':
				return 'Co-Leader';
			case 'AMBASSADOR':
				return `Ambassador (${data.profile?.ambassadorPermission ?? 'Viewer'})`;
			default:
				return 'Unknown';
		}
	});
</script>

<svelte:head>
	<title>Settings — {PRODUCT_NAME}</title>
</svelte:head>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-bold tracking-tight text-white">Settings</h1>
		<p class="mt-1 text-sm text-zinc-400">Manage your account and system preferences.</p>
	</div>

	{#if form?.success}
		<div class="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
			{form.message}
		</div>
	{/if}

	<section class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
		<h2 class="text-lg font-semibold text-white">My Profile</h2>
		<p class="mt-1 text-sm text-zinc-400">Your account information.</p>

		<div class="mt-6 space-y-4">
			<div>
				<span class="mb-1.5 block text-sm font-medium text-zinc-300">Name</span>
				<div class="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white">
					{data.profile?.name}
				</div>
			</div>

			<div>
				<span class="mb-1.5 block text-sm font-medium text-zinc-300">Slack ID</span>
				<div class="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-300">
					<code class="font-mono text-xs text-zinc-400">{data.profile?.slackId}</code>
				</div>
			</div>

			<div>
				<span class="mb-1.5 block text-sm font-medium text-zinc-300">Role</span>
				<div class="flex items-center gap-2">
					<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset {roleBadgeColor}">
						{roleLabel}
					</span>
				</div>
			</div>
		</div>
	</section>

	{#if data.profile?.passwordConfigured}
		<section class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
			<h2 class="text-lg font-semibold text-white">Password</h2>
			<p class="mt-1 text-sm text-zinc-400">Change your account password.</p>

			<form onsubmit={handlePasswordSubmit} class="mt-6 space-y-4">
				<div>
					<label for="current-password" class="mb-1.5 block text-sm font-medium text-zinc-300">
						Current password
					</label>
					<input
						id="current-password"
						type="password"
						bind:value={currentPassword}
						required
						placeholder="Enter current password"
						class="block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
					/>
				</div>

				<div>
					<label for="new-password" class="mb-1.5 block text-sm font-medium text-zinc-300">
						New password
					</label>
					<input
						id="new-password"
						type="password"
						bind:value={newPassword}
						required
						minlength="8"
						placeholder="At least 8 characters"
						class="block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
					/>
				</div>

				<div>
					<label for="confirm-password" class="mb-1.5 block text-sm font-medium text-zinc-300">
						Confirm new password
					</label>
					<input
						id="confirm-password"
						type="password"
						bind:value={confirmPassword}
						required
						minlength="8"
						placeholder="Type it again"
						class="block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
					/>
				</div>

				{#if passwordMessage}
					<div class="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
						{passwordMessage}
					</div>
				{/if}

				{#if passwordError}
					<div class="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
						{passwordError}
					</div>
				{/if}

				<button
					type="submit"
					disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
					class="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if passwordLoading}
						<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
						Updating…
					{:else}
						Update password
					{/if}
				</button>
			</form>
		</section>
	{/if}

	{#if data.user?.role !== 'MAIN_LEADER'}
		<section class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
			<h2 class="text-lg font-semibold text-white">Notifications</h2>
			<p class="mt-1 text-sm text-zinc-400">Configure Slack notifications for your account.</p>

			<form method="POST" action="?/toggleNotifications" use:enhance class="mt-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-zinc-200">Slack notifications</p>
						<p class="mt-0.5 text-xs text-zinc-500">Receive DMs about deployments and account changes.</p>
					</div>
				<button
					type="submit"
					aria-label="Toggle Slack notifications"
					class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900 {notificationsEnabled ? 'bg-emerald-600' : 'bg-zinc-700'}"
				>
					<span class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out {notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}"></span>
				</button>
					<input type="hidden" name="enabled" value={notificationsEnabled ? 'true' : 'false'} />
				</div>
			</form>
		</section>
	{/if}

	{#if data.user?.role === 'MAIN_LEADER'}
		<section class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
			<h2 class="text-lg font-semibold text-white">System</h2>
			<p class="mt-1 text-sm text-zinc-400">Overview of {PRODUCT_NAME}.</p>

			<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div class="rounded-xl border border-zinc-800 bg-zinc-800/50 p-4">
					<p class="text-xs font-medium uppercase tracking-wider text-zinc-500">Club</p>
					<p class="mt-2 text-2xl font-bold text-white">{CLUB_NAME}</p>
				</div>

				<div class="rounded-xl border border-zinc-800 bg-zinc-800/50 p-4">
					<p class="text-xs font-medium uppercase tracking-wider text-zinc-500">People</p>
					<p class="mt-2 text-2xl font-bold text-white">{data.roleStats.total}</p>
					<p class="mt-1 text-xs text-zinc-500">
						{data.roleStats.coLeaderCount} co-leader{data.roleStats.coLeaderCount !== 1 ? 's' : ''},
						{data.roleStats.ambassadorCount} ambassador{data.roleStats.ambassadorCount !== 1 ? 's' : ''}
					</p>
				</div>

				<div class="rounded-xl border border-zinc-800 bg-zinc-800/50 p-4">
					<p class="text-xs font-medium uppercase tracking-wider text-zinc-500">Hosting</p>
					<p class="mt-2 text-2xl font-bold text-white">{data.activeWebsiteCount}</p>
					<p class="mt-1 text-xs text-zinc-500">
						{data.websiteCount} total, {data.archivedWebsiteCount} archived
					</p>
				</div>

				<div class="rounded-xl border border-zinc-800 bg-zinc-800/50 p-4">
					<p class="text-xs font-medium uppercase tracking-wider text-zinc-500">Storage</p>
					<p class="mt-2 text-2xl font-bold text-white">{formatBytes(data.storageStats.totalBytes)}</p>
					<p class="mt-1 text-xs text-zinc-500">
						Across {data.storageStats.websites.length} site{data.storageStats.websites.length !== 1 ? 's' : ''}
					</p>
				</div>
			</div>

			<div class="mt-6">
				<div class="rounded-xl border border-zinc-800 bg-zinc-800/50 p-4">
					<p class="text-xs font-medium uppercase tracking-wider text-zinc-500">Base URL</p>
					<p class="mt-2 font-mono text-sm text-zinc-300">{data.baseUrl}</p>
				</div>
			</div>
		</section>
	{/if}
</div>
