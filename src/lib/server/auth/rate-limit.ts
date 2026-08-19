const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

interface AttemptRecord {
	count: number;
	resetAt: number;
}

const attempts = new Map<string, AttemptRecord>();

function cleanup(): void {
	const now = Date.now();
	for (const [key, record] of attempts) {
		if (now > record.resetAt) {
			attempts.delete(key);
		}
	}
}

export function checkLoginRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
	cleanup();

	const now = Date.now();
	const record = attempts.get(identifier);

	if (!record || now > record.resetAt) {
		attempts.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
		return { allowed: true };
	}

	if (record.count >= MAX_ATTEMPTS) {
		const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
		return { allowed: false, retryAfter: retryAfterSeconds };
	}

	record.count++;
	return { allowed: true };
}
