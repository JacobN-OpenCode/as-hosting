import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAllWebsites, getStorageStats } from '$lib/server/services/website.service';
import { getAuditLogs } from '$lib/server/services/audit.service';
import { getRoleStats } from '$lib/server/services/user.service';
import { formatBytes } from '$lib/utils';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/login');

	const [websites, storageStats, auditLogs, roleStats] = await Promise.all([
		getAllWebsites(),
		getStorageStats(),
		getAuditLogs(10),
		getRoleStats()
	]);

	const activeCount = websites.filter((w) => w.status === 'ACTIVE').length;
	const archivedCount = websites.filter((w) => w.status === 'ARCHIVED').length;

	return {
		websites,
		stats: {
			active: activeCount,
			archived: archivedCount,
			total: websites.length,
			storage: formatBytes(storageStats.totalBytes)
		},
		auditLogs,
		roleStats,
		baseUrl: process.env.PUBLIC_BASE_URL || 'http://localhost:5173'
	};
};
