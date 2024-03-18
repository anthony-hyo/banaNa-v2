export default class Config {

    public static SERVER_ID: number;

    static {
        if (process.env["SERVER_ID"] == undefined) {
            throw new Error("Environment variable 'SERVER_ID' is not defined. It's required for configuration.");
        }

        Config.SERVER_ID = Number(process.env["SERVER_ID"]);
    }

}