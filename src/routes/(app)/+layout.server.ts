import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.session || !locals.user) {
		const redirectTo = url.pathname + url.search;
		redirect(303, `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`);
	}

	if (!locals.user.emailVerified) {
		redirect(303, `/verify-email?email=${encodeURIComponent(locals.user.email)}`);
	}

	return {
		user: locals.user
	};
};
