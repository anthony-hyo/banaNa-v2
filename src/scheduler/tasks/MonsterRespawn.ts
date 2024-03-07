import type {MonsterAI} from "../../ai/MonsterAI";
import type ITask from "../../interfaces/ITask";
import type World from "../../world/World";

export default class MonsterRespawn implements ITask {
    private ai: MonsterAI;
    private world: World;

    constructor(world: World, ai: MonsterAI) {
        this.ai = ai;
        this.world = world;
    }

    public run(): void {
        this.ai.restore();
        this.world.send(["respawnMon", this.ai.getMapId().toString()], this.ai.getRoom().getChannellList());
    }
}
