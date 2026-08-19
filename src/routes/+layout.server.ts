import type { LayoutServerLoad } from './$types';
import { getPermissions } from '$lib/permissions';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = locals.user ?? null;
	let permissions: string[] = [];

	if (user) {
		permissions = getPermissions(user.role, user.ambassadorPermission);
	}

	return {
		user,
		permissions
	};
};
