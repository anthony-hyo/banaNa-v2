import type IAreaMonster from "../database/interfaces/IAreaMonster.ts";
import type IMonster from "../database/interfaces/IMonster.ts";
import type IMonsterDrop from "../database/interfaces/IMonsterDrop.ts";
import type ISkillAura from "../database/interfaces/ISkillAura.ts";
import MonsterRespawn from "../scheduler/tasks/MonsterRespawn";
import Random from "../util/Random";
import JSONArray from "../util/json/JSONArray";
import JSONObject from "../util/json/JSONObject";
import PlayerConst from "../player/PlayerConst.ts";
import schedule from "node-schedule";
import RemoveAura from "../scheduler/tasks/RemoveAura.ts";
import type IDispatchable from "../interfaces/entity/IDispatchable.ts";
import type Player from "../player/Player.ts";
import type Room from "../room/Room.ts";
import Scheduler from "../scheduler/Scheduler.ts";
import GameController from "../controller/GameController.ts";
import type IMonsterData from "../interfaces/monster/IMonsterData.ts";
import type AvatarStatus from "../avatar/AvatarStatus.ts";
import type AvatarStats from "../avatar/AvatarStats.ts";

export class Monster implements IDispatchable {

	public attacking: schedule.Job | undefined;

	public monsterId: number;
	public mapId: number;
	public state: number;
	public health: number;
	public mana: number;
	public frame: string;
	public targets: Set<number>;
	public auras: Set<RemoveAura>;
	public rand: Random;
	public room: Room;

	public readonly data: IMonsterData;
	public readonly status: AvatarStatus;

	constructor(mapMon: IAreaMonster, room: Room) {
		this.monsterId = mapMon.monsterId;
		this.mapId = mapMon.monMapId;
		this.frame = mapMon.frame;
		this.room = room;
		this.rand = new Random(mapMon.monMapId * mapMon.monsterId);
		this.targets = new Set<number>();
		this.auras = new Set<RemoveAura>();
		this.state = 1;
		this.health = world.monsters.get(this.monsterId)!.health;
		this.mana = world.monsters.get(this.monsterId)!.mana;
	}

	public cancel(): void {
		if (this.targets.size === 0 && this.state > 0) {
			this.restore();
			this.attacking?.cancel();
		}
	}

	public run(): void {
		if (this.state === 0) {
			this.attacking?.cancel();
			return;
		}

		const userId: number = this.getRandomTarget();

		const player: Player | null = ExtensionHelper.instance().getUserById(userId);

		if (!player || (this.room.getId() !== player.getRoom()) || this.frame !== player.properties.get(PlayerConst.FRAME)) {
			this.removeTarget(userId);
			this.cancel();
			return;
		}

		const monDmg: number = this.world.monsters.get(this.monsterId)!.dps;
		const minDmg: number = Math.floor(monDmg - (monDmg * 0.1));
		const maxDmg: number = Math.ceil(monDmg + (monDmg * 0.1));

		let damage: number = this.rand.nextInt(maxDmg - minDmg) + minDmg;

		const stats: AvatarStats = player.properties.get(PlayerConst.STATS);

		const crit: boolean = Math.random() < 0.2;
		const dodge: boolean = Math.random() < stats.get$tdo();

		damage = dodge ? 0 : crit ? damage * 1.25 : damage;

		for (const ra of this.auras) {
			const aura: ISkillAura = ra.getAura();
			if (["stun", "freeze", "stone", "disabled"].includes(aura.category)) {
				return;
			}
		}

		const userAuras: Set<RemoveAura> = player.properties.get(PlayerConst.AURAS);
		for (const ra of userAuras) {
			const aura: ISkillAura = ra.getAura();
			if (aura.category !== "d") {
				damage *= 1 - aura.damageTakenDecrease;
			}
		}

		let userHp: number = player.properties.get(PlayerConst.HP) - damage;
		userHp = userHp <= 0 ? 0 : userHp;

		player.properties.set(PlayerConst.HP, userHp);
		player.properties.set(PlayerConst.STATE, PlayerConst.STATE_COMBAT);

		if (player.properties.get(PlayerConst.HP) <= 0) {
			player.die();
			this.removeTarget(userId);
			this.cancel();
		}

		const anims: JSONArray = new JSONArray();
		const p: JSONObject = new JSONObject();
		const userData: JSONObject = new JSONObject();
		const sara: JSONArray = new JSONArray();
		const saraObj: JSONObject = new JSONObject();
		const ct: JSONObject = new JSONObject();

		anims.add(new JSONObject()
			.element("strFrame", player.properties.get(PlayerConst.FRAME))
			.element("cInf", "m:" + this.mapId)
			.element("fx", "m")
			.element("tInf", "p:" + userId)
			.element("animStr", "Attack1,Attack2")
		);

		userData.put("intMP", player.properties.get(PlayerConst.MP));
		userData.put("intHP", player.properties.get(PlayerConst.HP));
		userData.put("intState", player.properties.get(PlayerConst.STATE));

		p.put(player.getName(), userData);

		saraObj.put("actionResult", new JSONObject()
			.element("hp", damage)
			.element("cInf", "m:" + this.mapId)
			.element("tInf", "p:" + userId)
			.element("type", dodge ? "dodge" : crit ? "crit" : "hit")
		);

		saraObj.put("iRes", 1);

		sara.add(saraObj);

		const m: JSONObject = new JSONObject();
		const monData: JSONObject = new JSONObject();

		this.mana += this.world.monsters.get(this.monsterId)!.mana * 0.02;
		this.mana = this.mana > this.world.monsters.get(this.monsterId)!.mana ? this.world.monsters.get(this.monsterId)!.mana : this.mana;

		monData.put("intMP", this.mana);

		m.put(String(this.mapId), monData);

		ct.put("anims", anims);
		ct.put("p", p);
		ct.put("m", m);
		ct.put("cmd", "ct");

		this.writeObject(ct);

		ct.put("sara", sara);

		player.network.writeObject(ct);
	}

	public restore(): void {
		this.state = 1;
		this.health = this.world.monsters.get(this.monsterId)!.health;
		this.mana = this.world.monsters.get(this.monsterId)!.mana;
		this.targets.clear();

		const monInfo: JSONObject = new JSONObject();
		monInfo.put("intHP", this.health);
		monInfo.put("intMP", this.mana);
		monInfo.put("intState", this.state);

		const mtls: JSONObject = new JSONObject();
		mtls.put("cmd", "mtls");
		mtls.put("id", this.mapId);
		mtls.put("o", monInfo);

		this.writeObject(mtls);
	}

	public async die(): Promise<void> {
		if (this.state === 0) {
			return;
		}
		this.attacking?.cancel();

		for (const ra of this.auras) {
			ra.run();
			ra.cancel();
		}

		this.auras.clear();

		this.health = 0;
		this.mana = 0;
		this.state = 0;

		Scheduler.oneTime(new MonsterRespawn(this), 4);

		const mon: IMonster = this.world.monsters.get(this.monsterId)!;

		const drops: Set<IMonsterDrop> = new Set<IMonsterDrop>();

		for (const md of mon.monstersDrops) {
			if (Math.random() <= md.chance * GameController.DROP_RATE) {
				drops.add(md);
			}
		}

		for (const userId of this.targets) {
			const user: Player | null = ExtensionHelper.instance().getUserById(userId);
			if (user) {
				for (const md of drops) {
					user.dropItem(md.itemId, md.quantity);
				}

				await user.giveRewards(mon.experience, mon.gold, mon.reputation, 0, -1, this.mapId, "m");
			}
		}
	}

	public hasAura(auraId: number): boolean {
		for (const ra of this.auras) {
			const aura: ISkillAura = ra.getAura();
			if (aura.id === auraId) {
				return true;
			}
		}
		return false;
	}

	public removeAura(ra: RemoveAura): void {
		this.auras.delete(ra);
	}

	public applyAura(aura: ISkillAura): RemoveAura {
		const ra: RemoveAura = new RemoveAura(aura, undefined, this);

		ra.setRunning(Scheduler.oneTime(ra, aura.duration));

		this.auras.add(ra);

		return ra;
	}

	public getRandomTarget(): number {
		const setArray: number[] = Array.from(this.targets);
		return setArray[this.rand.nextInt(setArray.length)];
	}

	public getTargets(): ReadonlySet<number> {
		return this.targets;
	}

	public addTarget(userId: number): void {
		if (!this.targets.has(userId)) {
			this.targets.add(userId);
		}
	}

	public removeTarget(userId: number): void {
		this.targets.delete(userId);
	}

	public getState(): number {
		return this.state;
	}

	public getRoom(): Room {
		return this.room;
	}

	public setAttacking(attacking: schedule.Job): void {
		if (!this.attacking || this.attacking.cancelled) {
			this.state = 2;
			this.attacking = attacking;
		} else {
			attacking.cancel();
		}
	}

	public setState(state: number): void {
		this.state = state;
	}

	public setHealth(health: number): void {
		this.health = health;
		if (this.health < 0) {
			this.health = 0;
		}
	}

	public setMana(mana: number): void {
		this.mana = mana;
		if (this.mana < 0) {
			this.mana = 0;
		}
	}

	public getAuras(): ReadonlySet<RemoveAura> {
		return this.auras;
	}

	public writeObject(data: JSONObject): void {
		this.room.writeObject(data);
	}

	public writeArray(...data: any[]): void {
		this.room.writeArray(data);
	}

	public writeExcept(ignored: Player, data: string): void {
		this.room.writeExcept(ignored, data);
	}

	public writeObjectExcept(ignored: Player, data: JSONObject): void {
		this.room.writeObjectExcept(ignored, data);
	}

	public writeArrayExcept(ignored: Player, ...data: any[]): void {
		this.room.writeArrayExcept(ignored, data);
	}

}
