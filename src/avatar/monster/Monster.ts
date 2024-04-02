import GameController from "../../controller/GameController";
import type IAreaMonster from "../../database/interfaces/IAreaMonster";
import type IMonster from "../../database/interfaces/IMonster";
import type IMonsterDrop from "../../database/interfaces/IMonsterDrop";
import type ISkillAura from "../../database/interfaces/ISkillAura";
import type IDispatchable from "../../interfaces/entity/IDispatchable";
import type Room from "../../room/Room";
import Scheduler from "../../scheduler/Scheduler";
import MonsterRespawn from "../../scheduler/tasks/MonsterRespawn";
import RemoveAura from "../../scheduler/tasks/RemoveAura";
import Random from "../../util/Random";
import JSONObject from "../../util/json/JSONObject";
import Avatar from "../Avatar";
import AvatarStatus from "../data/AvatarStatus.ts";
import MonsterData from "./data/MonsterData.ts";
import {AvatarState} from "../helper/AvatarState.ts";
import AvatarCombat from "../data/AvatarCombat.ts";

export default class Monster extends Avatar implements IDispatchable {

	public attacking: schedule.Job | undefined;

	public mana: number;
	public frame: string;
	public targets: Set<number>;
	public auras: Set<RemoveAura>;
	public rand: Random;
	public room: Room;

	public readonly data: MonsterData;
	public readonly status: AvatarStatus = new AvatarStatus(2500, 1000, 100, AvatarState.NEUTRAL);
	public readonly skills: AvatarCombat = new AvatarCombat(this);

	constructor(areaMonster: IAreaMonster, room: Room) {
		super();

		this.data = new MonsterData(this, areaMonster);

		this.frame = areaMonster.frame;
		this.room = room;
		this.rand = new Random(areaMonster.monMapId * areaMonster.monsterId);
		this.targets = new Set<number>();
		this.auras = new Set<RemoveAura>();
	}

	public cancel(): void {
		if (this.targets.size === 0 && this.state > 0) {
			this.restore();
			this.attacking?.cancel();
		}
	}

	public restore(): void {
		this.status.state = AvatarState.NEUTRAL;

		this.status.health.resetToFull();
		this.status.mana.resetToFull();

		this.targets.clear();

		const monInfo: JSONObject = new JSONObject()
			.element("intHP", this.status.health.value)
			.element("intMP", this.status.mana.value)
			.element("intState", this.status.state);

		const mtls: JSONObject = new JSONObject();
		mtls.put("cmd", "mtls");
		mtls.put("id", this.data);
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

	public writeObject(data: JSONObject): void {
		this.room.writeObject(data);
	}

	public writeArray(command: string, data: Array<string | number>): void {
		this.room.writeArray(command, data);
	}

	public writeExcept(ignored: Player, data: string): void {
		this.room.writeExcept(ignored, data);
	}

	public writeObjectExcept(ignored: Player, data: JSONObject): void {
		this.room.writeObjectExcept(ignored, data);
	}

	public writeArrayExcept(ignored: Player, command: string, data: Array<string | number>): void {
		this.room.writeArrayExcept(ignored, command, data);
	}

}
