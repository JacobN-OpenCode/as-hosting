import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getUserById, getRoleStats } from '$lib/server/services/user.service';
import { getStorageStats, getAllWebsites } from '$lib/server/services/website.service';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/login');

	const user = await getUserById(locals.user.id);
	const [roleStats, storageStats, websites] = await Promise.all([
		getRoleStats(),
		getStorageStats(),
		getAllWebsites()
	]);

	return {
		profile: user,
		roleStats,
		storageStats,
		websiteCount: websites.length,
		activeWebsiteCount: websites.filter((w) => w.status === 'ACTIVE').length,
		archivedWebsiteCount: websites.filter((w) => w.status === 'ARCHIVED').length,
		baseUrl: process.env.PUBLIC_BASE_URL || 'http://localhost:5173'
	};
};

export const actions: Actions = {
	toggleNotifications: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' });

		const formData = await request.formData();
		const enabled = formData.get('enabled') === 'true';

		await db
			.update(users)
			.set({ slackNotificationsEnabled: enabled, updatedAt: new Date() })
			.where(eq(users.id, locals.user.id));

		return { success: true, message: 'Notification preferences updated.' };
	}
};
