import type AvatarType from "./helper/AvatarType.ts";
import type Room from "../room/Room.ts";
import type AvatarStatus from "./data/AvatarStatus.ts";
import AvatarStats from "./data/AvatarStats.ts";
import AvatarAuras from "./data/AvatarAuras.ts";
import AvatarCombat from "./data/AvatarCombat.ts";

export default abstract class Avatar {

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

}