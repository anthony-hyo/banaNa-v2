import type Player from "../Player.ts";
import type SkillReference from "../../helper/combat/skill/SkillReference.ts";

export default class PlayerFilter {

	public readonly skills: Map<SkillReference, number> = new Map<SkillReference, number>();
	public skillWarningCount: number = 0;

	constructor(
		private readonly player: Player
	) {
	}

}