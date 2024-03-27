import AvatarVitality from "./AvatarVitality.ts";
import {AvatarState} from "./AvatarState.ts";

export default class AvatarStatus {

	public _health: AvatarVitality;
	public _mana: AvatarVitality;
	public _stamina: AvatarVitality;

	public _state: AvatarState;

	constructor(health: number, mana: number, stamina: number, state: AvatarState) {
		this._health = new AvatarVitality(health, health);
		this._mana = new AvatarVitality(mana, mana);
		this._stamina = new AvatarVitality(stamina, mana);

		this._state = state;
	}

	public get health(): AvatarVitality {
		return this._health;
	}

	public get mana(): AvatarVitality {
		return this._mana;
	}

	public get stamina(): AvatarVitality {
		return this._stamina;
	}

	public get state(): AvatarState {
		return this._state;
	}

	public set state(value: AvatarState) {
		this._state = value;
	}

	public endCombat() {
		this.state = AvatarState.NEUTRAL;
	}

}

