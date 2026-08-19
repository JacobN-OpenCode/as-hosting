import type { Handle } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth/session';
import { getUserById } from '$lib/server/services/user.service';
import { SESSION_COOKIE_NAME } from '$lib/constants';
import { runStartupRecovery } from '$lib/server/startup';

runStartupRecovery().catch(console.error);

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(SESSION_COOKIE_NAME);

	if (sessionId) {
		const session = await validateSession(sessionId);
		if (session) {
			const user = await getUserById(session.userId);
			if (user && user.active) {
				event.locals.user = {
					id: user.id,
					name: user.name,
					role: user.role,
					ambassadorPermission: user.ambassadorPermission,
					slackNotificationsEnabled: user.slackNotificationsEnabled
				};
			} else {
				event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
			}
		} else {
			event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
		}
	}

	return resolve(event);
};
