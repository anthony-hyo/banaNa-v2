import type ILogger from "../interfaces/util/ILogger.ts";

const logger: ILogger = {
	info: (...args: any[]) => {
		console.log('\x1b[36m%s\x1b[0m %s', `[${new Date().toLocaleString()}]`, `info:`, ...args);

		if (args.length > 0 && args[args.length - 1] instanceof Error) {
			console.error((args[args.length - 1] as Error).stack);
		}
	},
	error: (...args: any[]) => {
		console.error('\x1b[31m%s\x1b[0m %s', `[${new Date().toLocaleString()}]`, `error:`, ...args);

		if (args.length > 0 && args[args.length - 1] instanceof Error) {
			console.error((args[args.length - 1] as Error).stack);
		}
	},
	warn: (...args: any[]) => {
		console.warn('\x1b[33m%s\x1b[0m %s', `[${new Date().toLocaleString()}]`, `warn::`, ...args);

		if (args.length > 0 && args[args.length - 1] instanceof Error) {
			console.error((args[args.length - 1] as Error).stack);
		}
	},
	silly: (...args: any[]) => {
		console.log('\x1b[35m%s\x1b[0m %s', `[${new Date().toLocaleString()}]`, `silly:`, ...args);

		if (args.length > 0 && args[args.length - 1] instanceof Error) {
			console.error((args[args.length - 1] as Error).stack);
		}
	},
	debug: (...args: any[]) => {
		console.debug('\x1b[34m%s\x1b[0m %s', `[${new Date().toLocaleString()}]`, `debug:`, ...args);

		if (args.length > 0 && args[args.length - 1] instanceof Error) {
			console.error((args[args.length - 1] as Error).stack);
		}
	},
};

export default logger;
