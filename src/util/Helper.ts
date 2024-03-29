import * as fs from "fs";

export default class Helper {


	public static getAllFilesFromDirectory(dir: string): Array<string> {
		let results: Array<string> = [];

		for (let file of fs.readdirSync(dir)) {
			const path: string = dir + '/' + file;

			const stat: fs.Stats = fs.statSync(path);

			if (stat && stat.isDirectory()) {
				results = results.concat(Helper.getAllFilesFromDirectory(path));
			} else {
				results.push(path);
			}
		}

		return results;
	}

}