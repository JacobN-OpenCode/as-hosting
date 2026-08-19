import { env } from '$env/dynamic/private';

export interface SlackNotifier {
	sendDM(slackId: string, message: string): Promise<void>;
}

class RealSlackNotifier implements SlackNotifier {
	private token: string;

	constructor(token: string) {
		this.token = token;
	}

	async sendDM(slackId: string, message: string): Promise<void> {
		try {
			const response = await fetch('https://slack.com/api/chat.postMessage', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					channel: slackId,
					text: message
				})
			});

			const data = await response.json();

			if (!data.ok) {
				console.error('[SLACK ERROR]', data.error);
			}
		} catch (err) {
			console.error('[SLACK ERROR] Failed to send notification:', err);
		}
	}
}

class MockSlackNotifier implements SlackNotifier {
	async sendDM(slackId: string, message: string): Promise<void> {
		console.log(`[SLACK MOCK] → ${slackId}\n${message}`);
	}
}

export function createSlackNotifier(): SlackNotifier {
	const isDev = env.NODE_ENV === 'development';
	const token = env.SLACK_BOT_TOKEN;

	if (isDev || !token) {
		return new MockSlackNotifier();
	}

	return new RealSlackNotifier(token);
}

export async function notifyDeploymentFailure(
	notifier: SlackNotifier,
	slackId: string,
	projectName: string,
	reason: string
): Promise<void> {
	await notifier.sendDM(
		slackId,
		`⚠️ AS Hosting deployment failed\n\nProject: ${projectName}\n\nReason: ${reason}`
	);
}

export async function notifyNewPersonAdded(
	notifier: SlackNotifier,
	slackId: string,
	addedBy: string,
	personName: string,
	role: string
): Promise<void> {
	await notifier.sendDM(
		slackId,
		`👋 New person added to AS Hosting\n\n${addedBy} added ${personName} as a ${role}.`
	);
}

export async function notifyPasswordChanged(
	notifier: SlackNotifier,
	slackId: string,
	changedByName: string
): Promise<void> {
	await notifier.sendDM(
		slackId,
		`🔐 Password changed\n\n${changedByName} changed their AS Hosting password.`
	);
}

export async function notifyWebsiteExpired(
	notifier: SlackNotifier,
	slackId: string,
	projectName: string
): Promise<void> {
	await notifier.sendDM(
		slackId,
		`⏰ Website expired\n\n${projectName} has expired and is no longer being served.`
	);
}
