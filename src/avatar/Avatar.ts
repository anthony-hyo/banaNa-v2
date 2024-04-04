import type AvatarType from "./helper/AvatarType.ts";
import type Room from "../room/Room.ts";
import type AvatarStatus from "./data/AvatarStatus.ts";
import type AvatarStats from "./data/AvatarStats.ts";
import type AvatarAuras from "./data/AvatarAuras.ts";
import type AvatarCombat from "./data/AvatarCombat.ts";
import type IDispatchable from "../interfaces/entity/IDispatchable.ts";
import type Player from "./player/Player.ts";
import type JSONObject from "../util/json/JSONObject.ts";

export default abstract class Avatar implements IDispatchable {

	abstract get avatarId(): number;

	abstract get avatarName(): string;

	abstract get databaseId(): number;

	abstract get type(): AvatarType;

	abstract get room(): Room | undefined;

	abstract get frame(): string;

	abstract set frame(frame: string);

	abstract get auras(): AvatarAuras;

	abstract get combat(): AvatarCombat;

	abstract get stats(): AvatarStats;

	abstract get status(): AvatarStatus;

	abstract writeArray(command: string, data: Array<string | number>): void;

	abstract writeArrayExcept(ignored: Player, command: string, data: Array<string | number>): void;

	abstract writeExcept(ignored: Player, data: string): void;

	abstract writeObject(data: JSONObject): void;

	abstract writeObjectExcept(ignored: Player, data: JSONObject): void;

}