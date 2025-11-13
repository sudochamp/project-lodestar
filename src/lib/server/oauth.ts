import { Google, MicrosoftEntraId } from "arctic";
import { dev } from "$app/environment";
import { PUBLIC_URL } from "$env/static/public";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET } from "$env/static/private";

const PUBLIC_URL_DEV = dev ? 'http://localhost:5173' : PUBLIC_URL;

// Initialize Google OAuth
export const google = new Google(
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	`${PUBLIC_URL_DEV}/auth/callback/google`,
);

// Initialize Microsoft OAuth
export const microsoft = new MicrosoftEntraId(
	"common", // tenant ID for multi-tenant
    MICROSOFT_CLIENT_ID,
    MICROSOFT_CLIENT_SECRET,
	`${PUBLIC_URL_DEV}/auth/callback/microsoft`,
);

export interface GoogleUser {
	sub: string;
	name: string;
	email: string;
	picture: string;
	email_verified: boolean;
}

export interface MicrosoftUser {
	sub: string;
	name: string;
	email: string;
	picture?: string;
}
