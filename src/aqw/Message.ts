export default class Message {

	private constructor(
		private readonly prefix: string,
		private readonly message: string
	) {
	}

	public static create(prefix: "warning" | "server" | "administrator" | "guardian", message: string): [string, string] {
		return [prefix, message];
	}

}