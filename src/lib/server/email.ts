import { Resend } from 'resend';
import { env } from '$env/dynamic/private';

const resend = new Resend(env.RESEND_API_KEY);

const FROM = env.EMAIL_FROM ?? 'Toodoo <onboarding@resend.dev>';

type SendArgs = { to: string; url: string; name?: string };

export async function sendVerificationEmail({ to, url, name }: SendArgs) {
	const greeting = name ? `Hi ${name},` : 'Hi,';
	await resend.emails.send({
		from: FROM,
		to,
		subject: 'Verify your email',
		html: `
			<p>${greeting}</p>
			<p>Welcome to Toodoo. Please verify your email by clicking the link below:</p>
			<p><a href="${url}">Verify email</a></p>
			<p>If you didn't sign up, you can ignore this message.</p>
		`
	});
}

export async function sendResetPasswordEmail({ to, url, name }: SendArgs) {
	const greeting = name ? `Hi ${name},` : 'Hi,';
	await resend.emails.send({
		from: FROM,
		to,
		subject: 'Reset your password',
		html: `
			<p>${greeting}</p>
			<p>We received a request to reset your password. Click the link below to choose a new one:</p>
			<p><a href="${url}">Reset password</a></p>
			<p>If you didn't request this, you can safely ignore the email.</p>
		`
	});
}
