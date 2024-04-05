export default class HelperCombat {

	public static parseSkillReference(str: string): string {
		return str.includes(",") ? str.split(",")[0].split(">")[0] : str.split(">")[0];
	}

	public static parseTargetInfo(str: string): string {
		const tb: string[] = [];

		if (str.includes(",")) {
			const multi: string[] = str.split(",");
			for (let i = 0; i < multi.length; i++) {
				if (i !== 0) {
					tb.push(",");
				}
				tb.push(multi[i].split(">")[1]);
			}
		} else {
			tb.push(str.split(">")[1]);
		}

		return tb.join("");
	}

	public static hasDuplicates(targets: string[]): boolean {
		const inputSet: Set<string> = new Set(targets);
		return inputSet.size < targets.length;
	}

}