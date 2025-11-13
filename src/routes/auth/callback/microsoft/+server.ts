import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { microsoft, type MicrosoftUser } from '$lib/server/oauth';
import { generateSessionToken, createSession, setSessionTokenCookie } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const GET: RequestHandler = async (event) => {
	const { url, cookies } = event;
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');

	const storedState = cookies.get('microsoft_oauth_state');
	const codeVerifier = cookies.get('microsoft_code_verifier');

	// Validate state
	if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
		return new Response('Invalid request', { status: 400 });
	}

	try {
		// Exchange code for tokens
		const tokens = await microsoft.validateAuthorizationCode(code, codeVerifier);

		// Fetch user info from Microsoft Graph API
		const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});
		const graphUser = await userResponse.json();

		const microsoftUser: MicrosoftUser = {
			sub: graphUser.id,
			name: graphUser.displayName,
			email: graphUser.mail || graphUser.userPrincipalName
		};

		// Find or create user
		let [existingUser] = await db
			.select()
			.from(user)
			.where(eq(user.email, microsoftUser.email))
			.limit(1);

		if (!existingUser) {
			// Create new user
			const newUser = {
				id: nanoid(),
				email: microsoftUser.email,
				name: microsoftUser.name,
				picture: null,
				provider: 'microsoft',
				providerId: microsoftUser.sub
			};

			await db.insert(user).values(newUser);
			existingUser = newUser as any;
		} else {
			// Update user info if needed
			await db
				.update(user)
				.set({
					name: microsoftUser.name,
					updatedAt: new Date()
				})
				.where(eq(user.id, existingUser.id));
		}

		// Create session
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingUser.id);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		// Clean up OAuth cookies
		cookies.delete('microsoft_oauth_state', { path: '/' });
		cookies.delete('microsoft_code_verifier', { path: '/' });

		throw redirect(302, '/dashboard');
	} catch (error) {
		console.error('Microsoft OAuth error:', error);
		throw redirect(302, '/auth/login?error=oauth_failed');
	}
};
