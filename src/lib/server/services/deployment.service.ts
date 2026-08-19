import { eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { deployments } from '../db/schema';

export async function createDeployment(
	websiteId: string,
	deployedBy: string,
	success: boolean,
	log: string,
	errorMessage?: string
) {
	const [deployment] = await db
		.insert(deployments)
		.values({
			websiteId,
			deployedBy,
			success,
			log,
			errorMessage: errorMessage ?? null
		})
		.returning();
	return deployment;
}

export async function getDeploymentsByWebsite(websiteId: string) {
	return db
		.select()
		.from(deployments)
		.where(eq(deployments.websiteId, websiteId))
		.orderBy(desc(deployments.createdAt));
}

export async function getLatestDeployment(websiteId: string) {
	const [deployment] = await db
		.select()
		.from(deployments)
		.where(eq(deployments.websiteId, websiteId))
		.orderBy(desc(deployments.createdAt))
		.limit(1);
	return deployment ?? null;
}
