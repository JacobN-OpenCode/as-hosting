import { describe, it, expect } from 'vitest';
import { normalizeSlug, isValidSlug, formatBytes, formatDate, timeAgo } from '$lib/utils';

describe('normalizeSlug', () => {
	it('lowercases input', () => {
		expect(normalizeSlug('MyWebsite')).toBe('mywebsite');
	});

	it('converts spaces to hyphens', () => {
		expect(normalizeSlug('My Website')).toBe('my-website');
	});

	it('removes invalid characters', () => {
		expect(normalizeSlug('my@website!')).toBe('mywebsite');
	});

	it('collapses repeated hyphens', () => {
		expect(normalizeSlug('my--website')).toBe('my-website');
	});

	it('removes leading/trailing hyphens', () => {
		expect(normalizeSlug('-my-website-')).toBe('my-website');
	});

	it('handles complex input', () => {
		expect(normalizeSlug('  Hello World!!!  ')).toBe('hello-world');
	});
});

describe('isValidSlug', () => {
	it('accepts valid slugs', () => {
		expect(isValidSlug('my-website')).toBe(true);
		expect(isValidSlug('portfolio')).toBe(true);
		expect(isValidSlug('my-cool-project-123')).toBe(true);
	});

	it('rejects reserved slugs', () => {
		expect(isValidSlug('login')).toBe(false);
		expect(isValidSlug('dashboard')).toBe(false);
		expect(isValidSlug('settings')).toBe(false);
		expect(isValidSlug('api')).toBe(false);
		expect(isValidSlug('admin')).toBe(false);
	});

	it('rejects empty or too long slugs', () => {
		expect(isValidSlug('')).toBe(false);
		expect(isValidSlug('a'.repeat(64))).toBe(false);
	});

	it('rejects slugs with invalid characters', () => {
		expect(isValidSlug('my website')).toBe(false);
		expect(isValidSlug('my@website')).toBe(false);
	});
});

describe('formatBytes', () => {
	it('formats zero', () => {
		expect(formatBytes(0)).toBe('0 B');
	});

	it('formats bytes', () => {
		expect(formatBytes(500)).toBe('500 B');
	});

	it('formats kilobytes', () => {
		expect(formatBytes(1024)).toBe('1 KB');
	});

	it('formats megabytes', () => {
		expect(formatBytes(1048576)).toBe('1 MB');
	});

	it('formats gigabytes', () => {
		expect(formatBytes(1073741824)).toBe('1 GB');
	});
});

describe('timeAgo', () => {
	it('returns just now for recent dates', () => {
		const now = new Date();
		expect(timeAgo(now)).toBe('just now');
	});

	it('returns minutes ago', () => {
		const d = new Date(Date.now() - 5 * 60 * 1000);
		expect(timeAgo(d)).toBe('5 minutes ago');
	});

	it('returns hours ago', () => {
		const d = new Date(Date.now() - 3 * 60 * 60 * 1000);
		expect(timeAgo(d)).toBe('3 hours ago');
	});

	it('returns days ago', () => {
		const d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
		expect(timeAgo(d)).toBe('7 days ago');
	});
});
