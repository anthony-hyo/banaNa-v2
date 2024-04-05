import JSONArray from "../../../util/json/JSONArray.ts";
import type AvatarTarget from "../AvatarTarget.ts";
import JSONObject from "../../../util/json/JSONObject.ts";
import type ISkill from "../../../database/interfaces/ISkill.ts";

export default class Animation {

	private readonly animation: JSONArray;

	constructor(skill: ISkill, tInf: string, fromTarget: AvatarTarget, frame: string) {
		const anim: JSONObject = new JSONObject()
			.element("strFrame", frame)
			.element("fx", skill.effectType)
			.element("tInf", tInf)
			.element("cInf", fromTarget.toString)
			.element("animStr", skill.animation);

		if (skill.effectName.length > 0) {
			anim.element("strl", skill.effectName);
		}

		this.animation = new JSONArray().add(anim);
	}

	public data(): JSONArray {
		return this.animation;
	}


}
