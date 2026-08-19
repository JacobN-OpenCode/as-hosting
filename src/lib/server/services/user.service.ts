import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import { MAX_CO_LEADERS } from '$lib/constants';
import { hashPassword } from '../auth/password';
import { deleteAllUserSessions } from '../auth/session';
import type { AmbassadorPermission } from '$lib/permissions';

export async function getAllActiveUsers() {
	return db.select().from(users).where(eq(users.active, true));
}

export async function getAllActiveLoginUsers() {
	return db.select().from(users).where(
		and(
			eq(users.active, true)
		)
	);
}

export async function getUserById(id: string) {
	const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
	return user ?? null;
}

export async function getUserByName(name: string) {
	const [user] = await db.select().from(users).where(eq(users.name, name)).limit(1);
	return user ?? null;
}

export async function createLeader(name: string, slackId: string, password: string) {
	const passwordHash = await hashPassword(password);
	const [user] = await db
		.insert(users)
		.values({
			name,
			slackId,
			role: 'MAIN_LEADER',
			passwordHash,
			passwordConfigured: true
		})
		.returning();
	return user;
}

export async function createCoLeader(name: string, slackId: string) {
	const count = await getCoLeaderCount();
	if (count >= MAX_CO_LEADERS) {
		throw new Error(`Maximum of ${MAX_CO_LEADERS} co-leaders reached`);
	}
	const [user] = await db
		.insert(users)
		.values({
			name,
			slackId,
			role: 'CO_LEADER',
			passwordConfigured: false
		})
		.returning();
	return user;
}

export async function createAmbassador(
	name: string,
	slackId: string,
	permission: AmbassadorPermission
) {
	const [user] = await db
		.insert(users)
		.values({
			name,
			slackId,
			role: 'AMBASSADOR',
			ambassadorPermission: permission,
			passwordConfigured: false
		})
		.returning();
	return user;
}

export async function updatePassword(userId: string, password: string) {
	const passwordHash = await hashPassword(password);
	await db
		.update(users)
		.set({ passwordHash, passwordConfigured: true, updatedAt: new Date() })
		.where(eq(users.id, userId));
}

export async function resetPassword(userId: string) {
	await db
		.update(users)
		.set({ passwordHash: null, passwordConfigured: false, updatedAt: new Date() })
		.where(eq(users.id, userId));
	await deleteAllUserSessions(userId);
}

export async function deactivateUser(userId: string) {
	await db
		.update(users)
		.set({ active: false, updatedAt: new Date() })
		.where(eq(users.id, userId));
	await deleteAllUserSessions(userId);
}

export async function changePassword(userId: string, newPassword: string) {
	const passwordHash = await hashPassword(newPassword);
	await db
		.update(users)
		.set({ passwordHash, updatedAt: new Date() })
		.where(eq(users.id, userId));
}

export async function getCoLeaderCount(): Promise<number> {
	const result = await db
		.select()
		.from(users)
		.where(and(eq(users.role, 'CO_LEADER'), eq(users.active, true)));
	return result.length;
}

export async function getRoleStats() {
	const allUsers = await db.select().from(users).where(eq(users.active, true));
	const coLeaderCount = allUsers.filter((u) => u.role === 'CO_LEADER').length;
	const ambassadorCount = allUsers.filter((u) => u.role === 'AMBASSADOR').length;
	return {
		total: allUsers.length,
		coLeaderCount,
		ambassadorCount
	};
}
