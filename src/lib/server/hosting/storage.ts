import { mkdir, cp, rm, stat, access, readdir } from 'node:fs/promises';
import { join } from 'node:path';

export class HostingStorage {
	private basePath: string;

	constructor(basePath: string = 'data/websites') {
		this.basePath = basePath;
	}

	getWebsitePath(websiteId: string): string {
		return join(this.basePath, websiteId);
	}

	getCurrentPath(websiteId: string): string {
		return join(this.getWebsitePath(websiteId), 'current');
	}

	getArchivePath(websiteId: string): string {
		return join(this.getWebsitePath(websiteId), 'archive');
	}

	getServePath(websiteId: string): string {
		return this.getCurrentPath(websiteId);
	}

	async publish(websiteId: string, sourceDir: string): Promise<number> {
		const currentPath = this.getCurrentPath(websiteId);
		await mkdir(currentPath, { recursive: true });

		await cp(sourceDir, currentPath, {
			recursive: true,
			dereference: true
		});

		return this.getDirectorySize(currentPath);
	}

	async archive(websiteId: string): Promise<void> {
		const currentPath = this.getCurrentPath(websiteId);
		const archivePath = this.getArchivePath(websiteId);

		const currentExists = await this.fileExists(currentPath);
		if (!currentExists) return;

		await mkdir(archivePath, { recursive: true });

		await cp(currentPath, archivePath, { recursive: true, dereference: true });
		await rm(currentPath, { recursive: true, force: true });
	}

	async restore(websiteId: string): Promise<void> {
		const currentPath = this.getCurrentPath(websiteId);
		const archivePath = this.getArchivePath(websiteId);

		const archiveExists = await this.fileExists(archivePath);
		if (!archiveExists) throw new Error('No archived version found');

		await mkdir(currentPath, { recursive: true });

		await cp(archivePath, currentPath, { recursive: true, dereference: true });
		await rm(archivePath, { recursive: true, force: true });
	}

	async remove(websiteId: string): Promise<void> {
		const websitePath = this.getWebsitePath(websiteId);
		await rm(websitePath, { recursive: true, force: true });
	}

	async removeArchived(websiteId: string): Promise<void> {
		const archivePath = this.getArchivePath(websiteId);
		await rm(archivePath, { recursive: true, force: true });
	}

	async getDirectorySize(dirPath: string): Promise<number> {
		let totalSize = 0;

		const entries = await readdir(dirPath, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = join(dirPath, entry.name);

			if (entry.isDirectory()) {
				totalSize += await this.getDirectorySize(fullPath);
			} else {
				const fileStat = await stat(fullPath);
				totalSize += fileStat.size;
			}
		}

		return totalSize;
	}

	async fileExists(path: string): Promise<boolean> {
		try {
			await access(path);
			return true;
		} catch {
			return false;
		}
	}
}
