import JSONArray from "../../../util/json/JSONArray.ts";
import JSONObject from "../../../util/json/JSONObject.ts";

export default class Sara {
	private readonly sara: any;

	constructor(damageResult: any) {
		this.sara = new JSONArray()
			.add(
				new JSONObject()
					.element("iRes", 1)
					.element("actionResult", damageResult)
			);
	}

	public get data(): any {
		return this.sara;
	}

}
