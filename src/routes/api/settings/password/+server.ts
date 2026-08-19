import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserById, changePassword } from '$lib/server/services/user.service';
import { verifyPassword } from '$lib/server/auth/password';
import { logAudit, AuditAction } from '$lib/server/services/audit.service';
import { createSlackNotifier, notifyPasswordChanged } from '$lib/server/slack/notifier';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) return json({ error: 'Not authenticated' }, { status: 401 });

	const { currentPassword, newPassword, confirmPassword } = await request.json();

	if (!currentPassword || !newPassword) return json({ error: 'Missing fields' }, { status: 400 });
	if (newPassword !== confirmPassword)
		return json({ error: 'New passwords do not match' }, { status: 400 });
	if (newPassword.length < 8)
		return json({ error: 'Password must be at least 8 characters' }, { status: 400 });

	const user = await getUserById(locals.user.id);
	if (!user || !user.passwordHash)
		return json({ error: 'Account issue' }, { status: 400 });

	const valid = await verifyPassword(currentPassword, user.passwordHash);
	if (!valid) return json({ error: 'Current password is incorrect' }, { status: 400 });

	await changePassword(locals.user.id, newPassword);
	await logAudit(locals.user.id, AuditAction.USER_PASSWORD_CHANGED);

	try {
		const notifier = createSlackNotifier();
		await notifyPasswordChanged(notifier, user.slackId, user.name);
	} catch {}

	return json({ success: true });
};
