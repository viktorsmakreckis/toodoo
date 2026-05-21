import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { username } from 'better-auth/plugins';
import { sendResetPasswordEmail, sendVerificationEmail } from '$lib/server/email';

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		autoSignIn: true,
		minPasswordLength: 8,
		sendResetPassword: async ({ user, url }) => {
			await sendResetPasswordEmail({ to: user.email, url, name: user.name });
		}
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			await sendVerificationEmail({ to: user.email, url, name: user.name });
		}
	},
	plugins: [
		username(),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});
