<script lang="ts">
	import { enhance } from '$app/forms';
	import { PRODUCT_NAME } from '$lib/constants';

	let { data, form } = $props();

	let activeTab = $state<'coLeaders' | 'ambassadors'>('coLeaders');

	let showAddCoLeader = $state(false);
	let showAddAmbassador = $state(false);
	let removeTarget = $state<{ id: string; name: string } | null>(null);
	let resetTarget = $state<{ id: string; name: string } | null>(null);

	let addCoLeaderSubmitting = $state(false);
	let addAmbassadorSubmitting = $state(false);
	let removeSubmitting = $state(false);
	let resetSubmitting = $state(false);

	$effect(() => {
		if (form?.success) {
			showAddCoLeader = false;
			showAddAmbassador = false;
			removeTarget = null;
			resetTarget = null;
		}
	});

	let coLeaderFull = $derived(data.coLeaderCount >= data.maxCoLeaders);
</script>

<svelte:head>
	<title>People — {PRODUCT_NAME}</title>
</svelte:head>

<div class="space-y-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight text-white">People</h1>
			<p class="mt-1 text-sm text-zinc-400">Manage co-leaders and ambassadors.</p>
		</div>
	</div>

	{#if form?.success && form?.message}
		<div class="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
			{form.message}
		</div>
	{/if}

	{#if form?.error}
		<div class="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
			{form.error}
		</div>
	{/if}

	<div class="flex gap-1 rounded-xl border border-zinc-800 bg-zinc-900/50 p-1">
		<button
			type="button"
			onclick={() => (activeTab = 'coLeaders')}
			class="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all {activeTab === 'coLeaders' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}"
		>
			Co-leaders
			<span class="ml-2 inline-flex items-center justify-center rounded-full bg-zinc-700 px-2 py-0.5 text-xs font-medium text-zinc-300">
				{data.coLeaders.length}
			</span>
		</button>
		<button
			type="button"
			onclick={() => (activeTab = 'ambassadors')}
			class="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all {activeTab === 'ambassadors' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}"
		>
			Ambassadors
			<span class="ml-2 inline-flex items-center justify-center rounded-full bg-zinc-700 px-2 py-0.5 text-xs font-medium text-zinc-300">
				{data.ambassadors.length}
			</span>
		</button>
	</div>

	{#if activeTab === 'coLeaders'}
		<section class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
			<div class="flex items-center justify-between">
				<div>
					<h2 class="text-lg font-semibold text-white">Co-leaders</h2>
					<p class="mt-1 text-sm text-zinc-400">
						{data.coLeaderCount} / {data.maxCoLeaders} co-leader positions used
					</p>
				</div>
				<button
					type="button"
					onclick={() => (showAddCoLeader = true)}
					disabled={coLeaderFull}
					class="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
					</svg>
					Add co-leader
				</button>
			</div>

			{#if coLeaderFull}
				<div class="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
					Maximum of {data.maxCoLeaders} co-leaders reached. Remove a co-leader to add a new one.
				</div>
			{/if}

			<div class="mt-6 space-y-3">
				{#if data.coLeaders.length === 0}
					<div class="rounded-xl border border-dashed border-zinc-700 px-6 py-12 text-center">
						<svg class="mx-auto h-10 w-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
						</svg>
						<p class="mt-3 text-sm text-zinc-400">No co-leaders yet.</p>
						<p class="mt-1 text-xs text-zinc-600">Add a co-leader to get started.</p>
					</div>
				{:else}
					{#each data.coLeaders as coLeader}
						<div class="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-800/50 p-4 transition-colors hover:border-zinc-700">
							<div class="flex items-center gap-4">
								<div class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-bold text-emerald-400">
									{coLeader.name.charAt(0).toUpperCase()}
								</div>
								<div>
									<p class="text-sm font-medium text-white">{coLeader.name}</p>
									<p class="mt-0.5 font-mono text-xs text-zinc-500">{coLeader.slackId}</p>
								</div>
							</div>
							<div class="flex items-center gap-2">
								<button
									type="button"
									onclick={() => (resetTarget = { id: coLeader.id, name: coLeader.name })}
									class="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
								>
									Reset password
								</button>
								<button
									type="button"
									onclick={() => (removeTarget = { id: coLeader.id, name: coLeader.name })}
									class="rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
								>
									Remove
								</button>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</section>
	{/if}

	{#if activeTab === 'ambassadors'}
		<section class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
			<div class="flex items-center justify-between">
				<div>
					<h2 class="text-lg font-semibold text-white">Ambassadors</h2>
					<p class="mt-1 text-sm text-zinc-400">
						Ambassadors with view or leader access.
					</p>
				</div>
				<button
					type="button"
					onclick={() => (showAddAmbassador = true)}
					class="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/30 active:scale-[0.98]"
				>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
					</svg>
					Add ambassador
				</button>
			</div>

			<div class="mt-6 space-y-3">
				{#if data.ambassadors.length === 0}
					<div class="rounded-xl border border-dashed border-zinc-700 px-6 py-12 text-center">
						<svg class="mx-auto h-10 w-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
						</svg>
						<p class="mt-3 text-sm text-zinc-400">No ambassadors yet.</p>
						<p class="mt-1 text-xs text-zinc-600">Add an ambassador to give someone limited access.</p>
					</div>
				{:else}
					{#each data.ambassadors as ambassador}
						<div class="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-800/50 p-4 transition-colors hover:border-zinc-700">
							<div class="flex items-center gap-4">
								<div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-sm font-bold text-blue-400">
									{ambassador.name.charAt(0).toUpperCase()}
								</div>
								<div>
									<p class="text-sm font-medium text-white">{ambassador.name}</p>
									<div class="mt-0.5 flex items-center gap-2">
										<p class="font-mono text-xs text-zinc-500">{ambassador.slackId}</p>
										<span class="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20">
											{ambassador.ambassadorPermission === 'LEADER' ? 'Leader' : 'Viewer'}
										</span>
									</div>
								</div>
							</div>
							<div class="flex items-center gap-2">
								<button
									type="button"
									onclick={() => (resetTarget = { id: ambassador.id, name: ambassador.name })}
									class="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
								>
									Reset password
								</button>
								<button
									type="button"
									onclick={() => (removeTarget = { id: ambassador.id, name: ambassador.name })}
									class="rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
								>
									Remove
								</button>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</section>
	{/if}
</div>

{#if showAddCoLeader}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick={() => (showAddCoLeader = false)} onkeydown={(e) => { if (e.key === 'Escape') showAddCoLeader = false; }}></div>
		<div class="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
			<div class="flex items-center justify-between">
				<h3 class="text-lg font-semibold text-white">Add co-leader</h3>
				<button type="button" aria-label="Close" onclick={() => (showAddCoLeader = false)} class="rounded-lg p-1 text-zinc-400 transition-colors hover:text-zinc-200">
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<form
				method="POST"
				action="?/addCoLeader"
				use:enhance={() => {
					addCoLeaderSubmitting = true;
					return async ({ update }) => {
						await update();
						addCoLeaderSubmitting = false;
					};
				}}
				class="mt-6 space-y-4"
			>
				<div>
					<label for="coleader-name" class="mb-1.5 block text-sm font-medium text-zinc-300">Name</label>
					<input
						id="coleader-name"
						type="text"
						name="name"
						required
						placeholder="e.g. Jane Smith"
						class="block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
					/>
				</div>

				<div>
					<label for="coleader-slack" class="mb-1.5 block text-sm font-medium text-zinc-300">Slack ID</label>
					<input
						id="coleader-slack"
						type="text"
						name="slackId"
						required
						placeholder="e.g. U01ABC123"
						class="block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
					/>
					<p class="mt-1.5 text-xs text-zinc-500">Find this in the person's Slack profile.</p>
				</div>

				<div class="flex items-center justify-end gap-3 pt-2">
					<button
						type="button"
						onclick={() => (showAddCoLeader = false)}
						class="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={addCoLeaderSubmitting}
						class="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{#if addCoLeaderSubmitting}
							<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
							</svg>
							Adding…
						{:else}
							Add co-leader
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if showAddAmbassador}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick={() => (showAddAmbassador = false)} onkeydown={(e) => { if (e.key === 'Escape') showAddAmbassador = false; }}></div>
		<div class="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
			<div class="flex items-center justify-between">
				<h3 class="text-lg font-semibold text-white">Add ambassador</h3>
				<button type="button" aria-label="Close" onclick={() => (showAddAmbassador = false)} class="rounded-lg p-1 text-zinc-400 transition-colors hover:text-zinc-200">
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<form
				method="POST"
				action="?/addAmbassador"
				use:enhance={() => {
					addAmbassadorSubmitting = true;
					return async ({ update }) => {
						await update();
						addAmbassadorSubmitting = false;
					};
				}}
				class="mt-6 space-y-4"
			>
				<div>
					<label for="ambassador-name" class="mb-1.5 block text-sm font-medium text-zinc-300">Name</label>
					<input
						id="ambassador-name"
						type="text"
						name="name"
						required
						placeholder="e.g. Sam Jones"
						class="block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
					/>
				</div>

				<div>
					<label for="ambassador-slack" class="mb-1.5 block text-sm font-medium text-zinc-300">Slack ID</label>
					<input
						id="ambassador-slack"
						type="text"
						name="slackId"
						required
						placeholder="e.g. U01ABC123"
						class="block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
					/>
				</div>

				<div>
					<label for="ambassador-permission" class="mb-1.5 block text-sm font-medium text-zinc-300">Permission level</label>
					<select
						id="ambassador-permission"
						name="permission"
						required
						class="block w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
					>
						<option value="">Select a level…</option>
						<option value="VIEWER">Viewer — Can view dashboard and sites</option>
						<option value="LEADER">Leader — Can also create and edit sites</option>
					</select>
				</div>

				<div class="flex items-center justify-end gap-3 pt-2">
					<button
						type="button"
						onclick={() => (showAddAmbassador = false)}
						class="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={addAmbassadorSubmitting}
						class="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{#if addAmbassadorSubmitting}
							<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
							</svg>
							Adding…
						{:else}
							Add ambassador
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if removeTarget}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick={() => (removeTarget = null)} onkeydown={(e) => { if (e.key === 'Escape') removeTarget = null; }}></div>
		<div class="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
					<svg class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
					</svg>
				</div>
				<div>
					<h3 class="text-lg font-semibold text-white">Remove {removeTarget.name}</h3>
					<p class="mt-1 text-sm text-zinc-400">This will deactivate their account. They won't be able to log in.</p>
				</div>
			</div>

			<form
				method="POST"
				action="?/removeUser"
				use:enhance={() => {
					removeSubmitting = true;
					return async ({ update }) => {
						await update();
						removeSubmitting = false;
					};
				}}
				class="mt-6"
			>
				<input type="hidden" name="userId" value={removeTarget.id} />
				<div class="flex items-center justify-end gap-3">
					<button
						type="button"
						onclick={() => (removeTarget = null)}
						class="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={removeSubmitting}
						class="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-500 hover:shadow-red-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{#if removeSubmitting}
							<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
							</svg>
							Removing…
						{:else}
							Remove
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if resetTarget}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick={() => (resetTarget = null)} onkeydown={(e) => { if (e.key === 'Escape') resetTarget = null; }}></div>
		<div class="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
					<svg class="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
					</svg>
				</div>
				<div>
					<h3 class="text-lg font-semibold text-white">Reset password for {resetTarget.name}</h3>
					<p class="mt-1 text-sm text-zinc-400">They'll be asked to create a new password on their next login.</p>
				</div>
			</div>

			<form
				method="POST"
				action="?/resetPassword"
				use:enhance={() => {
					resetSubmitting = true;
					return async ({ update }) => {
						await update();
						resetSubmitting = false;
					};
				}}
				class="mt-6"
			>
				<input type="hidden" name="userId" value={resetTarget.id} />
				<div class="flex items-center justify-end gap-3">
					<button
						type="button"
						onclick={() => (resetTarget = null)}
						class="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={resetSubmitting}
						class="flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-600/20 transition-all hover:bg-amber-500 hover:shadow-amber-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{#if resetSubmitting}
							<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
							</svg>
							Resetting…
						{:else}
							Reset password
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
