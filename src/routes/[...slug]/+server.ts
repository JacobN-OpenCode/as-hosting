import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getWebsiteBySlug } from '$lib/server/services/website.service';
import { HostingStorage } from '$lib/server/hosting/storage';
import { readFile, stat } from 'node:fs/promises';
import { join, normalize } from 'node:path';

const MIME_TYPES: Record<string, string> = {
	'.html': 'text/html',
	'.css': 'text/css',
	'.js': 'application/javascript',
	'.json': 'application/json',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.svg': 'image/svg+xml',
	'.ico': 'image/x-icon',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.ttf': 'font/ttf',
	'.otf': 'font/otf',
	'.webp': 'image/webp',
	'.mp4': 'video/mp4',
	'.webm': 'video/webm',
	'.txt': 'text/plain',
	'.xml': 'application/xml',
	'.pdf': 'application/pdf',
	'.zip': 'application/zip'
};

function getMimeType(filePath: string): string {
	const ext = '.' + filePath.split('.').pop()?.toLowerCase();
	return MIME_TYPES[ext] || 'application/octet-stream';
}

function isPathSafe(requestedPath: string): boolean {
	const normalized = normalize(requestedPath);
	return !normalized.startsWith('..') && !normalized.startsWith('/');
}

function injectBase(html: string, basePath: string): string {
	const base = `<base href="${basePath}">`;
	if (html.includes('<head')) {
		return html.replace(/<head([^>]*)>/i, `<head$1>${base}`);
	}
	return `${base}${html}`;
}

export const GET: RequestHandler = async ({ params, url }) => {
	const rawSlug = params.slug;

	if (!rawSlug || !isPathSafe(rawSlug)) {
		throw error(404, 'Not found');
	}

	const slashIndex = rawSlug.indexOf('/');
	const slug = slashIndex === -1 ? rawSlug : rawSlug.slice(0, slashIndex);
	const subPath = slashIndex === -1 ? '' : rawSlug.slice(slashIndex + 1);

	if (!slug || !isPathSafe(slug)) {
		throw error(404, 'Not found');
	}

	const website = await getWebsiteBySlug(slug);
	if (!website) {
		throw error(404, 'Website not found');
	}

	if (website.status !== 'ACTIVE') {
		throw error(404, 'Website not available');
	}

	const storage = new HostingStorage();
	const basePath = storage.getServePath(website.id);

	// Strip trailing slashes from file path
	let filePath = subPath.replace(/\/+$/, '');
	if (!filePath || filePath === '') {
		filePath = 'index.html';
	}

	if (!isPathSafe(filePath)) {
		throw error(403, 'Forbidden');
	}

	const fullPath = join(basePath, filePath);

	const resolvedBase = normalize(basePath);
	const resolvedFull = normalize(fullPath);
	if (!resolvedFull.startsWith(resolvedBase)) {
		throw error(403, 'Forbidden');
	}

	try {
		const fileStat = await stat(fullPath);
		if (fileStat.isDirectory()) {
			const indexPath = join(fullPath, 'index.html');
			try {
				await stat(indexPath);
				const content = await readFile(indexPath, 'utf-8');
				const htmlWithBase = injectBase(content, `/${slug}/`);
				return new Response(htmlWithBase, {
					headers: {
						'Content-Type': 'text/html',
						'Cache-Control': 'public, max-age=300'
					}
				});
			} catch {
				throw error(404, 'Not found');
			}
		}

		const content = await readFile(fullPath);
		const mimeType = getMimeType(fullPath);

		// For HTML files served at slug root, inject <base> tag for correct relative URLs
		if (mimeType === 'text/html' && !subPath) {
			const html = content.toString('utf-8');
			const htmlWithBase = injectBase(html, `/${slug}/`);
			return new Response(htmlWithBase, {
				headers: {
					'Content-Type': mimeType,
					'Cache-Control': 'public, max-age=60'
				}
			});
		}

		return new Response(content, {
			headers: {
				'Content-Type': mimeType,
				'Cache-Control': mimeType.startsWith('text/') ? 'public, max-age=60' : 'public, max-age=86400'
			}
		});
	} catch (e: any) {
		if (e?.status === 404) throw e;
		throw error(404, 'Not found');
	}
};
