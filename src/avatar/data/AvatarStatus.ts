import AvatarVitality from "../helper/AvatarVitality.ts";
import {AvatarState} from "../helper/AvatarState.ts";
import JSONObject from "../../util/json/JSONObject.ts";

export default abstract class AvatarStatus {

	public _health: AvatarVitality;
	public _mana: AvatarVitality;
	public _state: AvatarState = AvatarState.NEUTRAL;

	protected constructor(health: number, mana: number) {
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

	public die(): void {
		if (this.state == AvatarState.DEAD) {
			return;
		}

		this.state = AvatarState.DEAD;

		this.health.update = 0;
		this.mana.update = 0;
	}

	public restore(): void {
		this.health.resetToFull();
		this.mana.resetToFull();
	}

	public endCombat(): void {
		this.state = AvatarState.NEUTRAL;
	}

	public json(): JSONObject {
		return new JSONObject()
			.element("intState", this.state)
			.element("intHP", this.health.value)
			.element("intMP", this.mana.value);
	}

	public abstract jsonTls(...args: boolean[]): void;

}

