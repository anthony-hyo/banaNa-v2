import type IAreaMonster from "../../database/interfaces/IAreaMonster";
import type IDispatchable from "../../interfaces/entity/IDispatchable";
import type Room from "../../room/Room";
import JSONObject from "../../util/json/JSONObject";
import Avatar from "../Avatar";
import MonsterData from "./data/MonsterData.ts";
import AvatarCombat from "../data/AvatarCombat.ts";
import AvatarAuras from "../data/AvatarAuras.ts";
import AvatarStats from "../data/AvatarStats.ts";
import MonsterStatus from "./data/MonsterStatus.ts";
import AvatarType from "../helper/AvatarType.ts";
import Network from "../../network/Network.ts";
import schedule from "node-schedule";
import type Player from "../player/Player.ts";

export default class Monster extends Avatar implements IDispatchable {

	private readonly _avatarId: number;
	private readonly _avatarName: string;

	private readonly _databaseId: number;
	private readonly _name: string;

	private _room: Room | undefined;

	private _frame: string = 'Enter';

	private _pad: string = 'Enter';

	private readonly _auras: AvatarAuras = new AvatarAuras(this);
	private readonly _combat: AvatarCombat = new AvatarCombat(this);
	private readonly _status: MonsterStatus = new MonsterStatus(this, 2500, 1000);
	private readonly _stats: AvatarStats = new AvatarStats(this);

	private readonly _data: MonsterData;

	private attacking: schedule.Job | undefined;

	constructor(areaMonster: IAreaMonster, room: Room) {
		super();

		this._avatarId = Network.increaseAndGet;
		this._avatarName = areaMonster.monster!.name.toLowerCase();

		this._databaseId = areaMonster.monsterId;
		this._name = areaMonster.monster!.name;


		this._data = new MonsterData(this, areaMonster);

		this._frame = areaMonster.frame;
		this._room = room;
	}

	public override get avatarId(): number {
		return this._avatarId;
	}

	public override get avatarName(): string {
		return this._avatarName;
	}

	public override get databaseId(): number {
		return this._databaseId;
	}

	public get name(): string {
		return this._name;
	}

	public override get type(): AvatarType {
		return AvatarType.MONSTER;
	}

	public override get room(): Room | undefined {
		return this._room;
	}

	public override set room(room: Room) {
		this._room = room;
	}

	public override get frame(): string {
		return this._frame;
	}

	public override set frame(frame: string) {
		this._frame = frame;
	}

	public get pad(): string {
		return this._pad;
	}

	public set pad(pad: string) {
		this._pad = pad;
	}

	public override get auras(): AvatarAuras {
		return this._auras;
	}

	public override get combat(): AvatarCombat {
		return this._combat;
	}

	public override get stats(): AvatarStats {
		return this._stats;
	}

	public override get status(): MonsterStatus {
		return this._status;
	}

	public get data(): MonsterData {
		return this._data;
	}

	public writeObject(data: JSONObject): void {
		this.room?.writeObject(data);
	}

	public writeArray(command: string, data: Array<string | number>): void {
		this.room?.writeArray(command, data);
	}

	public writeExcept(ignored: Player, data: string): void {
		this.room?.writeExcept(ignored, data);
	}

	public writeObjectExcept(ignored: Player, data: JSONObject): void {
		this.room?.writeObjectExcept(ignored, data);
	}

	public writeArrayExcept(ignored: Player, command: string, data: Array<string | number>): void {
		this.room?.writeArrayExcept(ignored, command, data);
	}

}
