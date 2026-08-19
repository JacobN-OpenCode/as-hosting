import { pgTable, uuid, varchar, text, boolean, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['MAIN_LEADER', 'CO_LEADER', 'AMBASSADOR']);
export const ambassadorPermEnum = pgEnum('ambassador_permission', ['VIEWER', 'LEADER']);
export const websiteStatusEnum = pgEnum('website_status', ['BUILDING', 'ACTIVE', 'ARCHIVED', 'FAILED']);

export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 255 }).notNull(),
	slackId: varchar('slack_id', { length: 50 }).notNull(),
	role: userRoleEnum('role').notNull(),
	ambassadorPermission: ambassadorPermEnum('ambassador_permission'),
	passwordHash: text('password_hash'),
	passwordConfigured: boolean('password_configured').notNull().default(false),
	slackNotificationsEnabled: boolean('slack_notifications_enabled').notNull().default(true),
	active: boolean('active').notNull().default(true),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const sessions = pgTable('sessions', {
	id: varchar('id', { length: 255 }).primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

export const websites = pgTable('websites', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 255 }).notNull(),
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	gitUrl: text('git_url').notNull(),
	status: websiteStatusEnum('status').notNull().default('BUILDING'),
	storageBytes: integer('storage_bytes').notNull().default(0),
	createdBy: uuid('created_by')
		.notNull()
		.references(() => users.id),
	expiresAt: timestamp('expires_at'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const deployments = pgTable('deployments', {
	id: uuid('id').primaryKey().defaultRandom(),
	websiteId: uuid('website_id')
		.notNull()
		.references(() => websites.id, { onDelete: 'cascade' }),
	deployedBy: uuid('deployed_by')
		.notNull()
		.references(() => users.id),
	success: boolean('success').notNull(),
	log: text('log').notNull().default(''),
	errorMessage: text('error_message'),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

export const auditLogs = pgTable('audit_logs', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id').references(() => users.id),
	action: varchar('action', { length: 100 }).notNull(),
	details: text('details'),
	createdAt: timestamp('created_at').notNull().defaultNow()
});
