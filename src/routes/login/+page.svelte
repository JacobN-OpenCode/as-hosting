<script lang="ts">
	import { enhance } from '$app/forms';
	import { PRODUCT_NAME, CLUB_NAME } from '$lib/constants';
	import type { SubmitFunction } from './$types';

	let { form, data } = $props();

	let selectedName = $state('');
	let showPasswordSetup = $state(false);
	let submitting = $state(false);

	$effect(() => {
		if (form?.needsPassword) {
			showPasswordSetup = true;
			selectedName = form.userName ?? '';
		}
	});

	const handleEnhance: SubmitFunction = () => {
		submitting = true;
		return async ({ update, result }) => {
			await update();
			submitting = false;

			if (result.type === 'failure' && result.data && 'needsPassword' in result.data) {
				showPasswordSetup = true;
				selectedName = (result.data as { userName?: string }).userName ?? '';
			}
		};
	};
</script>

<svelte:head>
	<title>Log in — {PRODUCT_NAME}</title>
</svelte:head>

<div class="flex min-h-[calc(100vh-60px)] items-center justify-center px-4">
	<div class="w-full max-w-md">
		<div class="mb-10 text-center">
			<div class="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
				<svg class="h-7 w-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
				</svg>
			</div>
			<h1 class="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
			<p class="mt-2 text-sm text-zinc-400">Sign in to {PRODUCT_NAME}</p>
		</div>

		<div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-xl shadow-black/20">
			{#if showPasswordSetup}
				<div class="mb-6">
					<h2 class="text-lg font-semibold text-white">Create your password</h2>
					<p class="mt-1 text-sm text-zinc-400">
						Hi <span class="font-medium text-zinc-200">{form?.userName ?? selectedName}</span>!
						This is your first time signing in. Set a password for your account.
					</p>
				</div>

				<form method="POST" action="?/createPassword" use:enhance={handleEnhance} class="space-y-4">
					<input type="hidden" name="userId" value={form?.userId ?? ''} />

					<div>
						<label for="create-password" class="mb-1.5 block text-sm font-medium text-zinc-300">
							Password
						</label>
						<input
							id="create-password"
							type="password"
							name="password"
							required
							minlength="8"
							placeholder="At least 8 characters"
							class="block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
						/>
					</div>

					<div>
						<label for="create-confirm" class="mb-1.5 block text-sm font-medium text-zinc-300">
							Confirm password
						</label>
						<input
							id="create-confirm"
							type="password"
							name="confirmPassword"
							required
							minlength="8"
							placeholder="Type it again"
							class="block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
						/>
					</div>

					{#if form?.error}
						<div class="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
							{form.error}
						</div>
					{/if}

					<button
						type="submit"
						disabled={submitting}
						class="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{#if submitting}
							<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
							</svg>
							Creating account…
						{:else}
							Create password & sign in
						{/if}
					</button>
				</form>
			{:else}
				<form method="POST" action="?/login" use:enhance={handleEnhance} class="space-y-5">
					<div>
						<label for="user-select" class="mb-1.5 block text-sm font-medium text-zinc-300">
							Who are you?
						</label>
						<select
							id="user-select"
							name="name"
							required
							bind:value={selectedName}
							class="block w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
						>
							<option value="" disabled>Select your name…</option>
							{#each data.users as user}
								<option value={user.name}>{user.name}</option>
							{/each}
						</select>
					</div>

					{#if selectedName}
						{@const currentUser = data.users.find((u) => u.name === selectedName)}
						{#if currentUser?.passwordConfigured}
							<div>
								<label for="login-password" class="mb-1.5 block text-sm font-medium text-zinc-300">
									Password
								</label>
								<input
									id="login-password"
									type="password"
									name="password"
									required
									placeholder="Enter your password"
									class="block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
								/>
							</div>
						{:else}
							<p class="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
								You haven't set a password yet. Click <strong>Sign in</strong> to create one.
							</p>
						{/if}
					{/if}

					{#if form?.error}
						<div class="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
							{form.error}
						</div>
					{/if}

					<button
						type="submit"
						disabled={submitting || !selectedName}
						class="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{#if submitting}
							<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
							</svg>
							Signing in…
						{:else}
							Sign in
						{/if}
					</button>
				</form>
			{/if}
		</div>

		<p class="mt-8 text-center text-xs text-zinc-600">
			{CLUB_NAME}
		</p>
	</div>
</div>
