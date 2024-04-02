import AvatarVitality from "../helper/AvatarVitality.ts";
import {AvatarState} from "../helper/AvatarState.ts";

export default class AvatarStatus {

	public _health: AvatarVitality;
	public _mana: AvatarVitality;
	public _state: AvatarState = AvatarState.NEUTRAL;

	constructor(health: number, mana: number) {
		this._health = new AvatarVitality(health, health);
		this._mana = new AvatarVitality(mana, mana);
	}

	public get health(): AvatarVitality {
		return this._health;
	}

	public get mana(): AvatarVitality {
		return this._mana;
	}

	public get state(): AvatarState {
		return this._state;
	}

	public set state(value: AvatarState) {
		this._state = value;
	}

	public endCombat(): void {
		this.state = AvatarState.NEUTRAL;
	}

}

