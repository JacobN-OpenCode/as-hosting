import { access, rm, readdir } from 'node:fs/promises';
import { join } from 'node:path';

async function pathExists(filePath: string): Promise<boolean> {
	try {
		await access(filePath);
		return true;
	} catch {
		return false;
	}
}

export async function validateStaticFiles(cloneDir: string): Promise<{ valid: boolean; error?: string }> {
	const indexExists = await pathExists(join(cloneDir, 'index.html'));
	if (!indexExists) {
		return { valid: false, error: 'No index.html found in repository root' };
	}

	const entries = await readdir(cloneDir);
	for (const entry of entries) {
		if (entry === '.env' || entry.startsWith('.env.')) {
			return { valid: false, error: '.env files are not allowed in deployments' };
		}
	}

	return { valid: true };
}

export async function sanitizeFiles(cloneDir: string): Promise<void> {
	const gitDir = join(cloneDir, '.git');
	await rm(gitDir, { recursive: true, force: true });

	const nodeModulesDir = join(cloneDir, 'node_modules');
	await rm(nodeModulesDir, { recursive: true, force: true });

	const entries = await readdir(cloneDir);
	for (const entry of entries) {
		if (entry === '.env' || entry.startsWith('.env.')) {
			await rm(join(cloneDir, entry), { force: true });
		}
	}
}
