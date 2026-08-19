declare global {
	namespace App {
		interface Locals {
			user?: {
				id: string;
				name: string;
				role: 'MAIN_LEADER' | 'CO_LEADER' | 'AMBASSADOR';
				ambassadorPermission: 'VIEWER' | 'LEADER' | null;
				slackNotificationsEnabled: boolean;
			};
		}
		interface PageData {}
		interface Error {}
		interface Platform {}
	}
}

export {};
