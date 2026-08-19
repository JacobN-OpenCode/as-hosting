import { eq, and, gt } from 'drizzle-orm';
import { db } from '../db';
import { sessions } from '../db/schema';

export const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

export async function createSession(userId: string): Promise<string> {
	const sessionId = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + SESSION_DURATION);

	await db.insert(sessions).values({
		id: sessionId,
		userId,
		expiresAt
	});

	return sessionId;
}

export async function validateSession(sessionId: string): Promise<{ userId: string } | null> {
	const [session] = await db
		.select()
		.from(sessions)
		.where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())))
		.limit(1);

	if (!session) return null;

	const newExpiresAt = new Date(Date.now() + SESSION_DURATION);
	await db.update(sessions).set({ expiresAt: newExpiresAt }).where(eq(sessions.id, sessionId));

	return { userId: session.userId };
}

export async function deleteSession(sessionId: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function deleteAllUserSessions(userId: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.userId, userId));
}
