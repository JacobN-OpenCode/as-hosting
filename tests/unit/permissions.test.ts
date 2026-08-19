import { describe, it, expect } from 'vitest';
import { Permission, hasPermission, getPermissions } from '$lib/permissions';

describe('Permission system', () => {
	it('main leader has all permissions', () => {
		const perms = getPermissions('MAIN_LEADER');
		expect(perms).toContain(Permission.VIEW_DASHBOARD);
		expect(perms).toContain(Permission.CREATE_WEBSITE);
		expect(perms).toContain(Permission.MANAGE_CO_LEADERS);
		expect(perms).toContain(Permission.MANAGE_AMBASSADORS);
		expect(perms).toContain(Permission.RESET_PASSWORDS);
		expect(perms).toContain(Permission.DELETE_WEBSITE);
		expect(perms.length).toBe(Object.values(Permission).length);
	});

	it('co-leader has operational permissions', () => {
		expect(hasPermission('CO_LEADER', Permission.VIEW_DASHBOARD)).toBe(true);
		expect(hasPermission('CO_LEADER', Permission.CREATE_WEBSITE)).toBe(true);
		expect(hasPermission('CO_LEADER', Permission.EDIT_WEBSITE)).toBe(true);
		expect(hasPermission('CO_LEADER', Permission.ARCHIVE_WEBSITE)).toBe(true);
		expect(hasPermission('CO_LEADER', Permission.MANAGE_CO_LEADERS)).toBe(false);
		expect(hasPermission('CO_LEADER', Permission.MANAGE_AMBASSADORS)).toBe(false);
		expect(hasPermission('CO_LEADER', Permission.RESET_PASSWORDS)).toBe(false);
	});

	it('ambassador leader has same as co-leader', () => {
		expect(hasPermission('AMBASSADOR', Permission.CREATE_WEBSITE, 'LEADER')).toBe(true);
		expect(hasPermission('AMBASSADOR', Permission.MANAGE_CO_LEADERS, 'LEADER')).toBe(false);
	});

	it('ambassador viewer has limited permissions', () => {
		expect(hasPermission('AMBASSADOR', Permission.VIEW_DASHBOARD, 'VIEWER')).toBe(true);
		expect(hasPermission('AMBASSADOR', Permission.VIEW_WEBSITE, 'VIEWER')).toBe(true);
		expect(hasPermission('AMBASSADOR', Permission.CREATE_WEBSITE, 'VIEWER')).toBe(false);
		expect(hasPermission('AMBASSADOR', Permission.EDIT_WEBSITE, 'VIEWER')).toBe(false);
	});
});
