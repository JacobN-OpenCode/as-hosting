import { execSync } from 'node:child_process';
import { mkdtemp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { HostingStorage } from './storage.js';
import { validateStaticFiles, sanitizeFiles } from './validator.js';

export class Deployer {
	private storage: HostingStorage;

	constructor() {
		this.storage = new HostingStorage();
	}

	async deploy(
		websiteId: string,
		gitUrl: string
	): Promise<{ success: boolean; log: string; error?: string }> {
		const log: string[] = [];
		let tempDir: string | null = null;

		const logMsg = (msg: string) => {
			log.push(msg);
		};

		try {
			logMsg('Fetching repository...');
			tempDir = await mkdtemp(join(tmpdir(), 'as-hosting-deploy-'));

			execSync(`git clone --depth 1 ${gitUrl} ${tempDir}`, {
				timeout: 60000,
				stdio: 'pipe'
			});

			logMsg('Repository cloned.');

			const gitDir = join(tempDir, '.git');
			try {
				await stat(gitDir);
			} catch {
				logMsg('Error: .git directory not found after clone.');
				return { success: false, log: log.join('\n'), error: 'Clone failed: .git directory missing' };
			}

			const validation = await validateStaticFiles(tempDir);
			if (!validation.valid) {
				logMsg(`Error: ${validation.error}`);
				return { success: false, log: log.join('\n'), error: validation.error };
			}

			logMsg('Checking static files... index.html found.');

			await sanitizeFiles(tempDir);

			logMsg('Publishing website...');
			const bytesPublished = await this.storage.publish(websiteId, tempDir);
			logMsg('Website is live.');

			return { success: true, log: log.join('\n') };
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			logMsg(`Error: ${message}`);
			return { success: false, log: log.join('\n'), error: message };
		} finally {
			if (tempDir) {
				await rm(tempDir, { recursive: true, force: true }).catch(() => {});
			}
		}
	}
}
