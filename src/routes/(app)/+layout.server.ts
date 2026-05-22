import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { listBoards } from '$lib/server/todo';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.session || !locals.user) {
		const redirectTo = url.pathname + url.search;
		redirect(303, `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`);
	}

	if (!locals.user.emailVerified) {
		redirect(303, `/verify-email?email=${encodeURIComponent(locals.user.email)}`);
	}

	const boards = await listBoards(locals.user.id);

	return {
		user: locals.user,
		boards
	};
};
