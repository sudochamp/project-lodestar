import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { generateState, generateCodeVerifier } from 'arctic';
import { google, microsoft } from '$lib/server/oauth';
import { sendMagicLink } from '$lib/server/email';
import { dev } from '$app/environment';

export const load: PageServerLoad = async ({ locals }) => {
	// If already logged in, redirect to dashboard
	if (locals.user) {
		throw redirect(302, '/dashboard');
	}
};

export const actions: Actions = {
	google: async ({ cookies }) => {
		const state = generateState();
		const codeVerifier = generateCodeVerifier();

		// Store state and code verifier in cookies
		cookies.set('google_oauth_state', state, {
			path: '/',
			secure: !dev,
			httpOnly: true,
			maxAge: 60 * 10, // 10 minutes
			sameSite: 'lax'
		});

		cookies.set('google_code_verifier', codeVerifier, {
			path: '/',
			secure: !dev,
			httpOnly: true,
			maxAge: 60 * 10,
			sameSite: 'lax'
		});

		const authUrl = google.createAuthorizationURL(state, codeVerifier, ['email', 'profile']);

		throw redirect(302, authUrl.toString());
	},

	microsoft: async ({ cookies }) => {
		const state = generateState();
		const codeVerifier = generateCodeVerifier();

		cookies.set('microsoft_oauth_state', state, {
			path: '/',
			secure: !dev,
			httpOnly: true,
			maxAge: 60 * 10,
			sameSite: 'lax'
		});

		cookies.set('microsoft_code_verifier', codeVerifier, {
			path: '/',
			secure: !dev,
			httpOnly: true,
			maxAge: 60 * 10,
			sameSite: 'lax'
		});

		const authUrl = microsoft.createAuthorizationURL(state, codeVerifier, [
			'openid',
			'email',
			'profile'
		]);

		throw redirect(302, authUrl.toString());
	},

	email: async ({ request, url }) => {
		const data = await request.formData();
		const email = data.get('email') as string;

		if (!email || !email.includes('@')) {
			return fail(400, { error: 'Please enter a valid email address' });
		}

		try {
			await sendMagicLink(email, url.origin);
			return { success: true };
		} catch (error) {
			console.error('Error sending magic link:', error);
			return fail(500, { error: 'Failed to send magic link. Please try again.' });
		}
	}
};
