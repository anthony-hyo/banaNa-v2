export default interface ILogger {
	info: (...args: any[]) => void;
	error: (...args: any[]) => void;
	warn: (...args: any[]) => void;
	silly: (...args: any[]) => void;
	debug: (...args: any[]) => void;
}