export default class Config {

	public static SERVER_ID: number;
	public static QUERY_LOG: boolean;

	static {
		if (process.env["SERVER_ID"] == undefined) {
			throw new Error("Environment variable 'SERVER_ID' is not defined. It's required for configuration.");
		}

		if (process.env["QUERY_LOG"] == undefined) {
			throw new Error("Environment variable 'QUERY_LOG' is not defined. It's required for configuration.");
		}

		Config.SERVER_ID = Number(process.env["SERVER_ID"]);
		Config.QUERY_LOG = process.env["QUERY_LOG"] === "true";
	}

}