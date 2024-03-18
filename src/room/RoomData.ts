import type Area from "../database/interfaces/Area.ts";
import type MapMonster from "../database/interfaces/MapMonster.ts";

export default class RoomData implements Area {

    id: number;
    name: string;
    file: string;
    max_players: number;
    required_level: number;
    is_upgrade_only: boolean;
    is_staff_only: boolean;
    is_pvp: boolean;
    monsters?: Array<MapMonster>;

    constructor(id: number, name: string, file: string, max_players: number, required_level: number, is_upgrade_only: boolean, is_staff_only: boolean, is_pvp: boolean, monsters?: Array<MapMonster>) {
        this.id = id;

        this.name = name;
        this.file = file;

        this.max_players = max_players;
        this.required_level = required_level;

        this.is_upgrade_only = is_upgrade_only;
        this.is_staff_only = is_staff_only;
        this.is_pvp = is_pvp;

        this.monsters = monsters;
    }
}
