import AvatarVitality from "./AvatarVitality.ts";
import {AvatarState} from "./AvatarState.ts";

export default class AvatarStatus {

	constructor(health: number, mana: number, stamina: number, state: AvatarState) {
		this._health = new AvatarVitality(health, health);
		this._mana = new AvatarVitality(mana, mana);
		this._stamina = new AvatarVitality(stamina, mana);

		this._state = state;
	}

	public _health: AvatarVitality;

	public get health(): AvatarVitality {
		return this._health;
	}

	public _mana: AvatarVitality;

	public get mana(): AvatarVitality {
		return this._mana;
	}

	public _stamina: AvatarVitality;

	public get stamina(): AvatarVitality {
		return this._stamina;
	}

	public _state: AvatarState;

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

