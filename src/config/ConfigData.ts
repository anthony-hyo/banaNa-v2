import * as fs from 'fs';

export default class ConfigData {
    public static DB_HOST: string;
    public static DB_NAME: string;
    public static DB_USERNAME: string;
    public static DB_PASSWORD: string;
    public static DB_PORT: number;
    public static DB_MAX_CONNECTIONS: number;

    public static SERVER_NAME: string;
    public static STAFF_ONLY: boolean;

    public static ANTI_MESSAGEFLOOD_MIN_MSG_TIME: number;
    public static ANTI_MESSAGEFLOOD_TOLERANCE: number;
    public static ANTI_MESSAGEFLOOD_MAX_REPEATED: number;
    public static ANTI_MESSAGEFLOOD_WARNINGS: number;

    public static ANTI_REQUESTFLOOD_MIN_MSG_TIME: number;
    public static ANTI_REQUESTFLOOD_TOLERANCE: number;
    public static ANTI_REQUESTFLOOD_MAX_REPEATED: number;
    public static ANTI_REQUESTFLOOD_WARNINGS: number;

    public static ANTI_REQUESTFLOOD_REPEAT_ENABLED: boolean;

    public static REQUESTS: Map<string, string>;
    public static ANTI_REQUESTFLOOD_EXCEPTIONS: Set<string>;

    private constructor() {
        throw new Error("not allowed to have an instance of this class");
    }

    static {
        const confName: string = process.env['augoeides.config'] !== undefined ? process.env['augoeides.config'] : "Main.conf";
        const config: Map<string, string> = new Map<string, string>();
        const curDir: string = process.cwd();
        const dirPath: string = `${curDir}/conf`;

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const filePath: string = `${curDir}/conf/${confName}`;

        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '', { encoding: 'latin1' });
            config.set("server.name", "Main");
            config.set("server.staffonly", "false");
            config.set("database.host", "127.0.0.1");
            config.set("database.port", "3306");
            config.set("database.connections.max", "50");
            config.set("database.user", "root");
            config.set("database.pass", "");
            config.set("database.name", "banana");
            config.set("antiflood.message.tolerance", "5");
            config.set("antiflood.message.maxrepeated", "3");
            config.set("antiflood.message.warnings", "2");
            config.set("antiflood.message.minimumtime", "1000");
            config.set("antiflood.request.tolerance", "5");
            config.set("antiflood.request.maxrepeated", "3");
            config.set("antiflood.request.enablerepeatfilter", "false");
            config.set("antiflood.request.warnings", "2");
            config.set("antiflood.request.minimumtime", "1000");
            fs.writeFileSync(filePath, `# Main Configuration\n`, {
                flag: 'a',
                encoding: 'latin1'
            });
            config.forEach((value, key) => {
                fs.appendFileSync(filePath, `${key}=${value}\n`, { encoding: 'latin1' });
            });
        }

        const data: Buffer = fs.readFileSync(filePath);
        const lines: Array<string> = data.toString('latin1').split('\n');
        const parsedConfig: Map<string, string> = new Map<string, string>();

        lines.forEach(line => {
            const pair: Array<string> = line.split('=');
            if (pair.length === 2) {
                parsedConfig.set(pair[0], pair[1]);
            }
        });

        ConfigData.DB_HOST = <string>parsedConfig.get("database.host");
        ConfigData.DB_USERNAME = <string>parsedConfig.get("database.user");
        ConfigData.DB_PASSWORD = <string>parsedConfig.get("database.pass");
        ConfigData.DB_NAME = <string>parsedConfig.get("database.name");
        ConfigData.DB_PORT = parseInt(parsedConfig.get("database.port")!);
        ConfigData.DB_MAX_CONNECTIONS = parseInt(parsedConfig.get("database.connections.max")!);
        ConfigData.SERVER_NAME = <string>parsedConfig.get("server.name");
        ConfigData.STAFF_ONLY = parsedConfig.get("server.staffonly") === "true";
        ConfigData.ANTI_MESSAGEFLOOD_MIN_MSG_TIME = parseInt(parsedConfig.get("antiflood.message.minimumtime")!);
        ConfigData.ANTI_MESSAGEFLOOD_TOLERANCE = parseInt(parsedConfig.get("antiflood.message.tolerance")!);
        ConfigData.ANTI_MESSAGEFLOOD_MAX_REPEATED = parseInt(parsedConfig.get("antiflood.message.maxrepeated")!);
        ConfigData.ANTI_MESSAGEFLOOD_WARNINGS = parseInt(parsedConfig.get("antiflood.message.warnings")!);
        ConfigData.ANTI_REQUESTFLOOD_MIN_MSG_TIME = parseInt(parsedConfig.get("antiflood.request.minimumtime")!);
        ConfigData.ANTI_REQUESTFLOOD_TOLERANCE = parseInt(parsedConfig.get("antiflood.request.tolerance")!);
        ConfigData.ANTI_REQUESTFLOOD_MAX_REPEATED = parseInt(parsedConfig.get("antiflood.request.maxrepeated")!);
        ConfigData.ANTI_REQUESTFLOOD_WARNINGS = parseInt(parsedConfig.get("antiflood.request.warnings")!);
        ConfigData.ANTI_REQUESTFLOOD_REPEAT_ENABLED = parsedConfig.get("antiflood.request.enablerepeatfilter") === "true";

        const filters: Set<string> = new Set<string>();
        for (let i: number = 1; i <= 20; i++) {
            const filter: string | undefined = parsedConfig.get(`antiflood.request.exceptions.${i}`);
            if (filter !== undefined) {
                filters.add(filter);
            }
        }

        const requests: Map<string, string> = new Map<string, string>();
        for (let i: number = 1; i <= 100; i++) {
            const request: string | undefined = parsedConfig.get(`handler.requests.${i}`);
            if (request !== undefined) {
                const requestProp: Array<string> = request.split('=');
                if (requestProp.length === 2) {
                    requests.set(requestProp[0], requestProp[1]);
                }
            }
        }

        ConfigData.REQUESTS = requests;
        ConfigData.ANTI_REQUESTFLOOD_EXCEPTIONS = filters;
    }
}
