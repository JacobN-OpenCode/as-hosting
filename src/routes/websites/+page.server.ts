import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAllWebsites, getStorageStats } from '$lib/server/services/website.service';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/login');
	const [websites, storageStats] = await Promise.all([
		getAllWebsites(),
		getStorageStats()
	]);
	return { websites, storage: storageStats };
};
