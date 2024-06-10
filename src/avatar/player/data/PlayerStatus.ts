import AvatarVitality from "../../helper/AvatarVitality.ts";
import AvatarStatus from "../../data/AvatarStatus.ts";
import type Player from "../Player.ts";
import JSONObject from "../../../util/json/JSONObject.ts";

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
		this.restore();

		this.endCombat();

		this.player.auras.clear();

		await this.player.sendUotls(true, false, true, false, false, true);
	}

	public jsonTls(...args: boolean[]): void {
		if (!this.player.room) {
			this.player.writeArray("warning", ["Error occurred while updating stats, contact staff if the problem persist."]);
			this.player.kick("[jsonTls] Null room, player kicked.");
			return;
		}

		const uotls: JSONObject = new JSONObject().element("cmd", "uotls");
		const o: JSONObject = new JSONObject();

		if (args[0]) {
			o.element("intHP", String(this.health.value));
		}
		if (args[1]) {
			o.element("intHPMax", this.health.max);
		}
		if (args[2]) {
			o.element("intMP", this.mana.value);
		}
		if (args[3]) {
			o.element("intMPMax", this.mana.max);
		}
		if (args[4]) {
			o.element("intState", this.state);
		}

		this.player.room.writeObject(
			uotls
				.element("o", o)
				.element("unm", this.player.avatarName)
		);
	}

}