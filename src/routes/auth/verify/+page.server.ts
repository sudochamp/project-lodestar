import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { verifyMagicLink } from '$lib/server/email';
import { generateSessionToken, createSession, setSessionTokenCookie } from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
	const { url } = event;
	const token = url.searchParams.get('token');

	if (!token) {
		throw redirect(302, '/auth/login?error=invalid_link');
	}

	const result = await verifyMagicLink(token);

	if (!result.success || !result.user) {
		throw redirect(302, `/auth/login?error=${encodeURIComponent(result.error || 'Invalid link')}`);
	}

	// Create session
	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, result.user.id);
	setSessionTokenCookie(event, sessionToken, session.expiresAt);

	throw redirect(302, '/dashboard');
};
