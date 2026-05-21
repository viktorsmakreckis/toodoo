import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

// Pages a user may reach even while signed in (e.g. clicking the verification link
// in an email after they've already started a session, or completing a reset flow).
const ALWAYS_ALLOWED = new Set(['/verify-email', '/reset-password']);

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (ALWAYS_ALLOWED.has(url.pathname)) return {};

	if (locals.session && locals.user?.emailVerified) {
		const redirectTo = url.searchParams.get('redirectTo') ?? '/';
		redirect(303, redirectTo);
	}
	return {};
};
