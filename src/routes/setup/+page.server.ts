import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createLeader, getAllActiveUsers } from '$lib/server/services/user.service';
import { createSession } from '$lib/server/auth/session';
import { logAudit, AuditAction } from '$lib/server/services/audit.service';
import { SESSION_COOKIE_NAME } from '$lib/constants';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) throw redirect(302, '/dashboard');
	const existingUsers = await getAllActiveUsers();
	if (existingUsers.length > 0) throw redirect(302, '/login');
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const existingUsers = await getAllActiveUsers();
		if (existingUsers.length > 0) return fail(400, { error: 'Setup has already been completed' });

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const slackId = formData.get('slackId') as string;
		const password = formData.get('password') as string;
		const confirmPassword = formData.get('confirmPassword') as string;

		if (!name?.trim()) return fail(400, { error: 'Name is required' });
		if (!slackId?.trim()) return fail(400, { error: 'Slack ID is required' });
		if (!password || password.length < 8)
			return fail(400, { error: 'Password must be at least 8 characters' });
		if (password !== confirmPassword) return fail(400, { error: 'Passwords do not match' });

		const user = await createLeader(name.trim(), slackId.trim(), password);
		const sessionId = await createSession(user.id);

		cookies.set(SESSION_COOKIE_NAME, sessionId, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 30 * 24 * 60 * 60
		});

		await logAudit(user.id, AuditAction.USER_CREATED, 'Main leader created during initial setup');

		throw redirect(302, '/dashboard');
	}
};
