export default interface Monster {
    id: number;
    name: string;
    race: string;
    file: string;
    linkage: string;
    element: string;
    level: number;
    health: number;
    mana: number;
    gold: number;
    experience: number;
    reputation: number;
    damage_per_second: number;
    teamId: number;
}