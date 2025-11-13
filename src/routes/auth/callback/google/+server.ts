import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { google, type GoogleUser } from '$lib/server/oauth';
import { generateSessionToken, createSession, setSessionTokenCookie } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const GET: RequestHandler = async (event) => {
	const { url, cookies } = event;
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');

	const storedState = cookies.get('google_oauth_state');
	const codeVerifier = cookies.get('google_code_verifier');

	// Validate state
	if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
		return new Response('Invalid request', { status: 400 });
	}

	try {
		// Exchange code for tokens
		const tokens = await google.validateAuthorizationCode(code, codeVerifier);

		// Fetch user info from Google
		const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});

		const googleUser: GoogleUser = await response.json();

		// Find or create user
		let [existingUser] = await db
			.select()
			.from(user)
			.where(eq(user.email, googleUser.email))
			.limit(1);

		if (!existingUser) {
			// Create new user
			const newUser = {
				id: nanoid(),
				email: googleUser.email,
				name: googleUser.name,
				picture: googleUser.picture,
				provider: 'google',
				providerId: googleUser.sub
			};

			await db.insert(user).values(newUser);
			existingUser = newUser as any;
		} else {
			// Update user info if needed
			await db
				.update(user)
				.set({
					name: googleUser.name,
					picture: googleUser.picture,
					updatedAt: new Date()
				})
				.where(eq(user.id, existingUser.id));
		}

		// Create session
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingUser.id);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		// Clean up OAuth cookies
		cookies.delete('google_oauth_state', { path: '/' });
		cookies.delete('google_code_verifier', { path: '/' });

		throw redirect(302, '/dashboard');
	} catch (error) {
		console.error('Google OAuth error:', error);
		throw redirect(302, '/auth/login?error=oauth_failed');
	}
};
