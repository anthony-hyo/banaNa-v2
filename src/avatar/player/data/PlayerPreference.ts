import {Achievement} from "../../../aqw/Achievement";
import Preference from "../../../aqw/Preference";
import type Player from "../Player.ts";

export default class PlayerPreference {

	constructor(
		private readonly player: Player
	) {
	}

	private get(achievement: number, index: number): boolean {
		return Achievement.get(achievement, index) === 0;
	}

	public set(pref: string, val: boolean): void {
		throw new Error(`Not Implemented`);
	}

	public isShowingHelm(index: number): boolean {
		return this.get(Preference.HELM, index);
	}

	public isShowingCloak(index: number): boolean {
		return this.get(Preference.CLOAK, index);
	}

	public isNotAcceptingWhisper(index: number): boolean {
		return !this.get(Preference.WHISPER, index);
	}

	public isNotAcceptingGuild(index: number): boolean {
		return !this.get(Preference.GUILD, index);
	}

	public isNotAcceptingFriend(index: number): boolean {
		return !this.get(Preference.FRIEND, index);
	}

	public isNotAcceptingDuel(index: number): boolean {
		return !this.get(Preference.DUEL, index);
	}

	public isNotAcceptingParty(index: number): boolean {
		return !this.get(Preference.PARTY, index);
	}

	public isNotAcceptingGoto(index: number): boolean {
		return !this.get(Preference.GOTO, index);
	}

}
