import nodemailer from 'nodemailer';
import { dev } from '$app/environment';
import { nanoid } from 'nanoid';
import { db } from './db';
import { magicLink, user } from './db/schema';
import { eq } from 'drizzle-orm';
import { EMAIL_FROM, SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER } from '$env/static/private';

// Email configuration
const getTransporter = () => {
	if (dev) {
		// Development
		return {
            // TODO: Add options type
			sendMail: async (options: any) => {
				console.log('📧 Development Email:', EMAIL_FROM ?? 'Undefined');
				console.log('To:', options.to);
				console.log('Subject:', options.subject);
				console.log('HTML:', options.html);
				return { messageId: 'dev-' + nanoid() };
			}
		};
	}

    // Production
	return nodemailer.createTransport({
		host: SMTP_HOST || 'smtp.gmail.com',
		port: Number(SMTP_PORT) || 587,
		secure: false,
		auth: {
			user: SMTP_USER || '',
			pass: SMTP_PASS || ''
		}
	});
};

export async function sendMagicLink(email: string, origin: string) {
	// Generate secure token
	const token = nanoid(32);
	const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

	// Store magic link in database
	await db.insert(magicLink).values({
		id: nanoid(),
		email,
		token,
		expiresAt
	});

	// Create magic link URL
	const magicLinkUrl = `${origin}/auth/verify?token=${token}`;

	// Email HTML template
	const html = `
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
				.content { background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px; }
				.button { display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
				.footer { text-align: center; color: #718096; font-size: 12px; margin-top: 20px; }
				.warning { background: #fed7d7; color: #c53030; padding: 10px; border-radius: 5px; margin-top: 20px; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1>Project Lodestar - Asset Tracker</h1>
				</div>
				<div class="content">
					<h2>Sign in to your account</h2>
					<p>Click the button below to sign in to Asset Tracker. This link will expire in 15 minutes.</p>
					<div style="text-align: center;">
						<a href="${magicLinkUrl}" class="button">Sign In</a>
					</div>
					<p style="color: #718096; font-size: 14px;">Or copy and paste this URL into your browser:</p>
					<p style="word-break: break-all; color: #4a5568; font-size: 12px;">${magicLinkUrl}</p>
					<div class="warning">
						<strong>Security Notice:</strong> If you didn't request this email, please ignore it. Someone may have entered your email by mistake.
					</div>
				</div>
				<div class="footer">
					<p>This is an automated message from Asset Tracker.</p>
					<p>© ${new Date().getFullYear()} SUDOCORP. All rights reserved.</p>
				</div>
			</div>
		</body>
		</html>
	`;

	// Send email
	const transporter = getTransporter();
	await transporter.sendMail({
		from: EMAIL_FROM || '"Asset Tracker" <noreply@assettracker.com>',
		to: email,
		subject: 'Sign in to Asset Tracker',
		html
	});

	return { success: true };
}

export async function verifyMagicLink(token: string) {
	// Find the magic link
	const [link] = await db.select().from(magicLink).where(eq(magicLink.token, token)).limit(1);

	if (!link) {
		return { success: false, error: 'Invalid or expired link' };
	}

	// Check if expired
	if (new Date() > link.expiresAt) {
		return { success: false, error: 'Link has expired' };
	}

	// Check if already used
	if (link.usedAt) {
		return { success: false, error: 'Link has already been used' };
	}

	// Mark as used
	await db.update(magicLink).set({ usedAt: new Date() }).where(eq(magicLink.id, link.id));

	// Find or create user
	let [existingUser] = await db.select().from(user).where(eq(user.email, link.email)).limit(1);

	if (!existingUser) {
		// Create new user
		const newUser = {
			id: nanoid(),
			email: link.email,
			name: link.email.split('@')[0], // Default name from email
			provider: 'email',
			providerId: null,
			picture: null
		};

		await db.insert(user).values(newUser);
		existingUser = newUser as any;
	}

	return { success: true, user: existingUser };
}
