import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { invalidateSession, deleteSessionTokenCookie } from '$lib/server/auth';

export const POST: RequestHandler = async (event) => {
	const { locals } = event;

	if (locals.session) {
		await invalidateSession(locals.session.id);
	}

	deleteSessionTokenCookie(event);

	throw redirect(302, '/auth/login');
};
