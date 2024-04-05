import type Avatar from "../Avatar.ts";
import AvatarType from "./AvatarType.ts";

export default class AvatarTarget {

	private readonly _targetAvatarId: number;
	private readonly _targetType: AvatarType;

	constructor(avatar: Avatar) {
		this._targetAvatarId = avatar.avatarId;
		this._targetType = avatar.type;
	}

	public static parse(avatar: Avatar): AvatarTarget {
		return new AvatarTarget(avatar);
	}

	public get isPlayer(): boolean {
		return this._targetType === AvatarType.PLAYER;
	}

	public get isMonster(): boolean {
		return this._targetType === AvatarType.MONSTER;
	}

	public get targetId(): number {
		return this._targetAvatarId;
	}

	public get targetType(): AvatarType {
		return this._targetType;
	}

	public get toString(): string {
		return this._targetType + ":" + this.targetId;
	}

}
