import { clsx, type ClassValue } from 'clsx';
import { RESERVED_SLUGS } from './constants';

export function cn(...inputs: ClassValue[]) {
	return clsx(inputs);
}

export { cn as clsx };

export function normalizeSlug(input: string): string {
	return input
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

export function isValidSlug(slug: string): boolean {
	if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(slug)) return false;
	if (slug.length < 1 || slug.length > 63) return false;
	if (RESERVED_SLUGS.includes(slug)) return false;
	return true;
}

export function formatBytes(bytes: number): string {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	const value = bytes / Math.pow(k, i);
	return `${parseFloat(value.toFixed(1))} ${sizes[i]}`;
}

export function formatDate(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

export function timeAgo(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	const now = new Date();
	const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

	if (seconds < 60) return 'just now';
	if (seconds < 3600) {
		const m = Math.floor(seconds / 60);
		return `${m} minute${m !== 1 ? 's' : ''} ago`;
	}
	if (seconds < 86400) {
		const h = Math.floor(seconds / 3600);
		return `${h} hour${h !== 1 ? 's' : ''} ago`;
	}
	const days = Math.floor(seconds / 86400);
	if (days < 30) {
		return `${days} day${days !== 1 ? 's' : ''} ago`;
	}
	const months = Math.floor(days / 30);
	return `${months} month${months !== 1 ? 's' : ''} ago`;
}
