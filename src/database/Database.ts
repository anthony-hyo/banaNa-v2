import {
	drizzle,
	type MySql2Client,
	type MySql2PreparedQueryHKT,
	type MySql2QueryResultHKT,
	MySqlDatabase
} from "drizzle-orm/mysql2";
import {type Connection, createPool, type Pool} from "mysql2";
import * as schema from "./drizzle/schema";
import Config from "../config/Config.ts";

export default class Database {

	private static _drizzle: MySqlDatabase<MySql2QueryResultHKT, MySql2PreparedQueryHKT, typeof schema>;

	public static get drizzle() {
		if (!this._drizzle) {
			this.initialize();
		}

		return this._drizzle;
	}

	private static _pool: MySql2Client | Connection | Pool;

	public static get pool(): MySql2Client | Connection | Pool {
		if (!this._pool) {
			this.initialize();
		}

		return this._pool;
	}

	private static initialize(): void {
		this._pool = createPool({
			host: 'localhost',
			user: 'root',
			password: 'a321',
			database: 'banana',
			connectionLimit: 25,
		});

		this._drizzle = drizzle(this._pool, {
			logger: Config.QUERY_LOG,
			mode: 'default',
			schema: {
				...schema
			}
		});
	}

}
