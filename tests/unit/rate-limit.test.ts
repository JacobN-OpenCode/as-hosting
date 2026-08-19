import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkLoginRateLimit } from '$lib/server/auth/rate-limit';

describe('Rate limiting', () => {
	beforeEach(() => {
		// Reset module state by importing fresh
		vi.resetModules();
	});

	it('allows first attempt', () => {
		const result = checkLoginRateLimit('test-user');
		expect(result.allowed).toBe(true);
	});

	it('blocks after too many attempts', () => {
		for (let i = 0; i < 5; i++) {
			checkLoginRateLimit('rate-limit-user');
		}
		const result = checkLoginRateLimit('rate-limit-user');
		expect(result.allowed).toBe(false);
		expect(result.retryAfter).toBeGreaterThan(0);
	});

	it('tracks different users separately', () => {
		for (let i = 0; i < 5; i++) {
			checkLoginRateLimit('user-a');
		}
		const resultA = checkLoginRateLimit('user-a');
		const resultB = checkLoginRateLimit('user-b');
		expect(resultA.allowed).toBe(false);
		expect(resultB.allowed).toBe(true);
	});
});
