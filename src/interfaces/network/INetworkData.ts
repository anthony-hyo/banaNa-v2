import type Player from "../../avatar/player/Player.ts";

export default interface INetworkData {

	player: Player,
	chunk: string

}