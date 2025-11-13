import { redirect } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import { invalidateSession, deleteSessionTokenCookie } from '$lib/server/auth';

export const load = async ({ locals }: any) => {
	// Require authentication
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	return {
		user: locals.user
	};
};

export const actions: Actions = {
	logout: async (event) => {
		const { locals } = event;

		if (locals.session) {
			await invalidateSession(locals.session.id);
		}

		deleteSessionTokenCookie(event);

		throw redirect(302, '/');
	}
};
