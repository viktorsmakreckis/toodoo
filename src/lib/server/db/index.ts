import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

/**
 * postgres-js can't parse a URL whose host is a Unix socket path
 * (e.g. Cloud SQL on Cloud Run: `postgres://user:pw@/db?host=/cloudsql/INST`)
 * because `new URL()` rejects the empty hostname. Detect that form and build
 * the client from explicit options instead.
 */
function createClient(url: string) {
	const socket = url.match(/^postgres(?:ql)?:\/\/([^:@]+):([^@]*)@\/([^?]+)\?host=(.+)$/);
	if (socket) {
		const [, username, password, database, host] = socket;
		return postgres({
			host: decodeURIComponent(host),
			database: decodeURIComponent(database),
			username: decodeURIComponent(username),
			password: decodeURIComponent(password)
		});
	}
	return postgres(url);
}

const client = createClient(env.DATABASE_URL);

export const db = drizzle(client, { schema });
