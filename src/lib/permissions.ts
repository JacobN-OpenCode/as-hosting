export enum Permission {
	VIEW_DASHBOARD = 'VIEW_DASHBOARD',
	CREATE_WEBSITE = 'CREATE_WEBSITE',
	EDIT_WEBSITE = 'EDIT_WEBSITE',
	ARCHIVE_WEBSITE = 'ARCHIVE_WEBSITE',
	RELAUNCH_WEBSITE = 'RELAUNCH_WEBSITE',
	VIEW_BUILD_LOGS = 'VIEW_BUILD_LOGS',
	MANAGE_CO_LEADERS = 'MANAGE_CO_LEADERS',
	MANAGE_AMBASSADORS = 'MANAGE_AMBASSADORS',
	RESET_PASSWORDS = 'RESET_PASSWORDS',
	MANAGE_SETTINGS = 'MANAGE_SETTINGS',
	VIEW_WEBSITE = 'VIEW_WEBSITE',
	DELETE_WEBSITE = 'DELETE_WEBSITE'
}

export type Role = 'MAIN_LEADER' | 'CO_LEADER' | 'AMBASSADOR';
export type AmbassadorPermission = 'VIEWER' | 'LEADER' | null;

const ALL_PERMISSIONS = Object.values(Permission);

const CO_LEADER_PERMISSIONS = [
	Permission.VIEW_DASHBOARD,
	Permission.CREATE_WEBSITE,
	Permission.EDIT_WEBSITE,
	Permission.ARCHIVE_WEBSITE,
	Permission.RELAUNCH_WEBSITE,
	Permission.VIEW_BUILD_LOGS,
	Permission.VIEW_WEBSITE,
	Permission.DELETE_WEBSITE
];

const AMBASSADOR_LEADER_PERMISSIONS = [...CO_LEADER_PERMISSIONS];

const AMBASSADOR_VIEWER_PERMISSIONS = [
	Permission.VIEW_DASHBOARD,
	Permission.VIEW_WEBSITE,
	Permission.VIEW_BUILD_LOGS
];

export function getPermissions(role: Role, ambassadorPermission?: AmbassadorPermission): Permission[] {
	switch (role) {
		case 'MAIN_LEADER':
			return ALL_PERMISSIONS;
		case 'CO_LEADER':
			return CO_LEADER_PERMISSIONS;
		case 'AMBASSADOR':
			if (ambassadorPermission === 'LEADER') {
				return AMBASSADOR_LEADER_PERMISSIONS;
			}
			return AMBASSADOR_VIEWER_PERMISSIONS;
	}
}

export function hasPermission(
	role: Role,
	permission: Permission,
	ambassadorPermission?: AmbassadorPermission
): boolean {
	return getPermissions(role, ambassadorPermission).includes(permission);
}
