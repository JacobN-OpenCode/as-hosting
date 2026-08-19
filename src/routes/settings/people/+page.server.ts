import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import {
	createCoLeader,
	createAmbassador,
	deactivateUser,
	resetPassword,
	getUserById,
	getAllActiveUsers,
	getCoLeaderCount
} from '$lib/server/services/user.service';
import { logAudit, AuditAction } from '$lib/server/services/audit.service';
import { createSlackNotifier, notifyNewPersonAdded } from '$lib/server/slack/notifier';
import { hasPermission, Permission } from '$lib/permissions';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/login');
	if (
		!hasPermission(
			locals.user.role,
			Permission.MANAGE_CO_LEADERS,
			locals.user.ambassadorPermission
		)
	) {
		throw redirect(302, '/settings');
	}

	const allUsers = await getAllActiveUsers();
	const coLeaderCount = await getCoLeaderCount();

	const coLeaders = allUsers.filter((u) => u.role === 'CO_LEADER');
	const ambassadors = allUsers.filter((u) => u.role === 'AMBASSADOR');

	return {
		coLeaders,
		ambassadors,
		coLeaderCount,
		maxCoLeaders: 2
	};
};

export const actions: Actions = {
	addCoLeader: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' });
		if (
			!hasPermission(
				locals.user.role,
				Permission.MANAGE_CO_LEADERS,
				locals.user.ambassadorPermission
			)
		) {
			return fail(403, { error: 'Permission denied' });
		}

		const formData = await request.formData();
		const name = (formData.get('name') as string)?.trim();
		const slackId = (formData.get('slackId') as string)?.trim();

		if (!name) return fail(400, { error: 'Name is required' });
		if (!slackId) return fail(400, { error: 'Slack ID is required' });

		try {
			const coLeader = await createCoLeader(name, slackId);
			await logAudit(locals.user.id, AuditAction.USER_CREATED, `Added ${name} as co-leader`);

			try {
				const notifier = createSlackNotifier();
				const fullUser = await getUserById(locals.user.id);
				if (fullUser) {
					await notifyNewPersonAdded(notifier, slackId, fullUser.name, name, 'co-leader');
				}
			} catch {}

			return {
				success: true,
				message: `${name} has been added. They can now select their name on the login screen and create their password.`
			};
		} catch (e) {
			return fail(400, {
				error: e instanceof Error ? e.message : 'Failed to add co-leader'
			});
		}
	},

	addAmbassador: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' });
		if (
			!hasPermission(
				locals.user.role,
				Permission.MANAGE_AMBASSADORS,
				locals.user.ambassadorPermission
			)
		) {
			return fail(403, { error: 'Permission denied' });
		}

		const formData = await request.formData();
		const name = (formData.get('name') as string)?.trim();
		const slackId = (formData.get('slackId') as string)?.trim();
		const permission = formData.get('permission') as 'VIEWER' | 'LEADER';

		if (!name) return fail(400, { error: 'Name is required' });
		if (!slackId) return fail(400, { error: 'Slack ID is required' });
		if (!permission || !['VIEWER', 'LEADER'].includes(permission))
			return fail(400, { error: 'Permission level is required' });

		const ambassador = await createAmbassador(name, slackId, permission);
		await logAudit(
			locals.user.id,
			AuditAction.USER_CREATED,
			`Added ${name} as ambassador (${permission})`
		);

		try {
			const notifier = createSlackNotifier();
			const fullUser = await getUserById(locals.user.id);
			if (fullUser) {
				await notifyNewPersonAdded(
					notifier,
					slackId,
					fullUser.name,
					name,
					`ambassador (${permission})`
				);
			}
		} catch {}

		return { success: true, message: `${name} has been added as an ambassador.` };
	},

	removeUser: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' });
		if (
			!hasPermission(
				locals.user.role,
				Permission.MANAGE_CO_LEADERS,
				locals.user.ambassadorPermission
			)
		) {
			return fail(403, { error: 'Permission denied' });
		}

		const formData = await request.formData();
		const userId = formData.get('userId') as string;

		if (!userId) return fail(400, { error: 'User ID is required' });

		const user = await getUserById(userId);
		if (!user) return fail(404, { error: 'User not found' });
		if (user.role === 'MAIN_LEADER') return fail(400, { error: 'Cannot remove the main leader' });

		await deactivateUser(userId);
		await logAudit(locals.user.id, AuditAction.USER_DEACTIVATED, `Deactivated ${user.name}`);

		return { success: true, message: `${user.name} has been deactivated.` };
	},

	resetPassword: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' });
		if (
			!hasPermission(
				locals.user.role,
				Permission.RESET_PASSWORDS,
				locals.user.ambassadorPermission
			)
		) {
			return fail(403, { error: 'Permission denied' });
		}

		const formData = await request.formData();
		const userId = formData.get('userId') as string;

		if (!userId) return fail(400, { error: 'User ID is required' });

		const user = await getUserById(userId);
		if (!user) return fail(404, { error: 'User not found' });
		if (user.role === 'MAIN_LEADER')
			return fail(400, { error: 'Cannot reset the main leader password' });

		await resetPassword(userId);
		await logAudit(
			locals.user.id,
			AuditAction.USER_PASSWORD_RESET,
			`Reset password for ${user.name}`
		);

		return {
			success: true,
			message: `Password reset. ${user.name} will be asked to create a new password the next time they log in.`
		};
	}
};
