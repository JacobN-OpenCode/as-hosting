<script lang="ts">
	import { enhance } from '$app/forms';
	import { PRODUCT_NAME } from '$lib/constants';
	import { normalizeSlug } from '$lib/utils';
	import type { SubmitFunction } from './$types';

	let { form }: { form: Record<string, unknown> } = $props();

	let name = $state('');
	let gitUrl = $state('');
	let rawSlug = $state('');
	let slugTouched = $state(false);
	let submitting = $state(false);
	let submitted = $state(false);

	const generatedSlug = $derived(normalizeSlug(name));
	const displaySlug = $derived(slugTouched ? normalizeSlug(rawSlug) : generatedSlug);

	$effect(() => {
		if (form?.success && form?.websiteId) {
			submitted = true;
		}
	});

	const handleEnhance: SubmitFunction = () => {
		submitting = true;
		return async ({ update }) => {
			await update();
			submitting = false;
		};
	};
</script>

<svelte:head>
	<title>Add website — {PRODUCT_NAME}</title>
</svelte:head>

<div class="mx-auto max-w-xl space-y-6">
	<div>
		<a href="/websites" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300">
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
			</svg>
			Back to websites
		</a>
		<h1 class="mt-4 text-2xl font-bold tracking-tight text-white">Add website</h1>
		<p class="mt-1 text-sm text-zinc-400">
			Deploy a static site from a Git repository.
		</p>
	</div>

	{#if form?.success}
		<div class="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
			<div class="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
				<svg class="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
				</svg>
			</div>
			<h2 class="text-lg font-semibold text-white">
				{form.deployed ? 'Website is live!' : 'Website created'}
			</h2>
			<p class="mt-1 text-sm text-zinc-400">
				{#if form.deployed}
					Your website has been deployed successfully.
				{:else}
					The website was created but the deployment had issues. You can redeploy from the management page.
				{/if}
			</p>
			<div class="mt-4 flex items-center justify-center gap-3">
				<a
					href="/websites/{form.websiteId}"
					class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-emerald-500 active:scale-[0.98]"
				>
					Manage website
				</a>
				<a
					href="/websites/new"
					class="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
				>
					Create another
				</a>
			</div>
		</div>
	{:else}
		<div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
			<form method="POST" use:enhance={handleEnhance} class="space-y-5">
				<div>
					<label for="name" class="mb-1.5 block text-sm font-medium text-zinc-300">
						Website name
					</label>
					<input
						id="name"
						type="text"
						name="name"
						required
						placeholder="My awesome project"
						bind:value={name}
						class="block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
					/>
				</div>

				<div>
					<label for="gitUrl" class="mb-1.5 block text-sm font-medium text-zinc-300">
						Git repository URL
					</label>
					<input
						id="gitUrl"
						type="url"
						name="gitUrl"
						required
						placeholder="https://github.com/username/repo"
						bind:value={gitUrl}
						class="block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
					/>
					<p class="mt-1.5 text-xs text-zinc-500">Must be an HTTPS URL to a repository with an index.html.</p>
				</div>

				<div>
					<label for="slug" class="mb-1.5 block text-sm font-medium text-zinc-300">
						Project slug
					</label>
					<input
						id="slug"
						type="text"
						name="slug"
						placeholder={generatedSlug || 'my-awesome-project'}
						bind:value={rawSlug}
						onfocus={() => (slugTouched = true)}
						class="block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
					/>
					{#if displaySlug}
						<p class="mt-1.5 text-xs text-zinc-500">
							Your site will be at <span class="font-mono text-emerald-400">/{displaySlug}/</span>
						</p>
					{/if}
				</div>

				{#if form?.error}
					<div class="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
						{form.error}
					</div>
				{/if}

				<button
					type="submit"
					disabled={submitting || !name || !gitUrl}
					class="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if submitting}
						<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
						</svg>
						Deploying...
					{:else}
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
						</svg>
						Deploy website
					{/if}
				</button>
			</form>
		</div>

		<p class="text-xs text-zinc-600">
			The repository must contain a static site with an <code class="rounded bg-zinc-800 px-1 py-0.5 text-zinc-400">index.html</code> at the root.
		</p>
	{/if}
</div>
