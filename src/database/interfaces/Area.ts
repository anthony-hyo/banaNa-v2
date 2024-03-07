import type MapMonster from "./MapMonster.ts";

export default interface Area {
    id: number;
    name: string;
    file: string;
    maxPlayers: number;
    reqLevel: number;
    upgrade: boolean;
    staff: boolean;
    pvp: boolean;

    monsters: Array<MapMonster>
}

