<script lang="ts">
	import { enhance } from '$app/forms';
	import { PRODUCT_NAME, CLUB_NAME } from '$lib/constants';
	import type { SubmitFunction } from './$types';

	let { form } = $props();
	let submitting = $state(false);

	const handleEnhance: SubmitFunction = () => {
		submitting = true;
		return async ({ update }) => {
			await update();
			submitting = false;
		};
	};
</script>

<svelte:head>
	<title>Set up — {PRODUCT_NAME}</title>
</svelte:head>

<div class="flex min-h-[calc(100vh-60px)] items-center justify-center px-4">
	<div class="w-full max-w-md">
		<div class="mb-10 text-center">
			<div class="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
				<svg class="h-7 w-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
				</svg>
			</div>
			<h1 class="text-2xl font-bold tracking-tight text-white">Welcome to {PRODUCT_NAME}</h1>
			<p class="mt-2 text-sm text-zinc-400">Set up hosting for {CLUB_NAME}</p>
		</div>

		<div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-xl shadow-black/20">
			<form method="POST" use:enhance={handleEnhance} class="space-y-4">
				<div>
					<label for="setup-name" class="mb-1.5 block text-sm font-medium text-zinc-300">
						Your name
					</label>
					<input
						id="setup-name"
						type="text"
						name="name"
						required
						placeholder="e.g. Jamie"
						class="block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
					/>
				</div>

				<div>
					<label for="setup-slack" class="mb-1.5 block text-sm font-medium text-zinc-300">
						Slack ID
					</label>
					<input
						id="setup-slack"
						type="text"
						name="slackId"
						required
						placeholder="e.g. U01ABC123DEF"
						class="block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
					/>
					<p class="mt-1.5 text-xs text-zinc-500">
						Find this in your Slack profile under "Member ID"
					</p>
				</div>

				<div>
					<label for="setup-password" class="mb-1.5 block text-sm font-medium text-zinc-300">
						Password
					</label>
					<input
						id="setup-password"
						type="password"
						name="password"
						required
						minlength="8"
						placeholder="At least 8 characters"
						class="block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
					/>
				</div>

				<div>
					<label for="setup-confirm" class="mb-1.5 block text-sm font-medium text-zinc-300">
						Confirm password
					</label>
					<input
						id="setup-confirm"
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
						Creating your account…
					{:else}
						Create hosting
					{/if}
				</button>
			</form>
		</div>

		<p class="mt-8 text-center text-xs text-zinc-600">
			{CLUB_NAME}
		</p>
	</div>
</div>
