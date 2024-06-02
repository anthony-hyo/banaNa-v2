import AvatarVitality from "../../helper/AvatarVitality.ts";
import AvatarStatus from "../../data/AvatarStatus.ts";
import {AvatarState} from "../../helper/AvatarState.ts";
import type Player from "../Player.ts";

export default class PlayerStatus extends AvatarStatus {

	public readonly _stamina: AvatarVitality;

	constructor(
		public readonly player: Player,
		health: number, mana: number, stamina: number,
	) {
		super(health, mana);

		this._stamina = new AvatarVitality(stamina, stamina);
	}

	public get stamina(): AvatarVitality {
		return this._stamina;
	}

	public async respawn(): Promise<void> {
		this.health.update = this.health.max;
		this.mana.update = this.mana.max;

		this.state = AvatarState.NEUTRAL;

		this.player.auras.clear();

		await this.player.sendUotls(true, false, true, false, false, true);
	}

	public die(): void {
		this.health.update = 0;
		this.mana.update = 0;

		this.state = AvatarState.DEAD;

		this.player.properties.set(PlayerConst.RESPAWN_TIME, Date.now());
	}

}