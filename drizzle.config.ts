import type {Config} from 'drizzle-kit';

export default {
    out: "./drizzle",
    schema: "./src/database/drizzle/schema.ts",
    strict: true,
    verbose: true,
    driver: 'mysql2',
    dbCredentials: {
        host: 'localhost',
        user: 'root',
        password: 'a321',
        database: 'banana',
    },
} satisfies Config;