import type MapMonster from "./MapMonster.ts";

export default interface Area {
    id: number;

    name: string;
    file: string;

    max_players: number;
    required_level: number;

    is_upgrade_only: boolean;
    is_staff_only: boolean;
    is_pvp: boolean;

    monsters?: Array<MapMonster>;
}

