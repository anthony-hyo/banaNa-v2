import type MapMonster from "../database/interfaces/MapMonster";
import type Monster from "../database/interfaces/Monster";
import type MonsterDrop from "../database/interfaces/MonsterDrop";
import type SkillAura from "../database/interfaces/SkillAura";
import ExtensionHelper from "../examples/ExtensionHelper";
import type Player from "../player/Player";
import type Room from "../room/Room";
import MonsterRespawn from "../scheduler/tasks/MonsterRespawn";
import Random from "../util/Random";
import JSONArray from "../util/json/JSONArray";
import JSONObject from "../util/json/JSONObject";
import Users from "../world/Users";
import type Stats from "../world/stats/Stats";

export class MonsterAI {

    public attacking: ScheduledTask | null;

    public world: World;
    public monsterId: number;
    public mapId: number;
    public state: number;
    public health: number;
    public mana: number;
    public frame: string;
    public targets: Set<number>;
    public auras: Set<RemoveAura>;
    public rand: Random;
    public room: Room;

    constructor(mapMon: MapMonster, room: Room) {
        this.monsterId = mapMon.monsterId;
        this.mapId = mapMon.monMapId;
        this.frame = mapMon.frame;
        this.room = room;
        this.rand = new Random(mapMon.monMapId * mapMon.monsterId);
        this.targets = new Set<number>();
        this.auras = new Set<RemoveAura>();
        this.state = 1;
        this.health = world.monsters.get(this.monsterId)!.health;
        this.mana = world.monsters.get(this.monsterId)!.mana;
    }

    public cancel(): void {
        if (this.targets.size === 0 && this.state > 0) {
            this.restore();
            this.attacking?.cancel();
        }
    }

    public run(): void {
        if (this.state === 0) {
            this.attacking?.cancel();
            return;
        }

        const userId: number = this.getRandomTarget();

        const user: Player | null = ExtensionHelper.instance().getUserById(userId);

        if (!user || (this.room.getId() !== user.getRoom()) || this.frame !== user.properties.get(Users.FRAME)) {
            this.removeTarget(userId);
            this.cancel();
            return;
        }

        const monDmg: number = this.world.monsters.get(this.monsterId)!.dps;
        const minDmg: number = Math.floor(monDmg - (monDmg * 0.1));
        const maxDmg: number = Math.ceil(monDmg + (monDmg * 0.1));

        let damage: number = this.rand.nextInt(maxDmg - minDmg) + minDmg;

        const stats: Stats = user.properties.get(Users.STATS);

        const crit: boolean = Math.random() < 0.2;
        const dodge: boolean = Math.random() < stats.get$tdo();

        damage = dodge ? 0 : crit ? damage * 1.25 : damage;

        for (const ra of this.auras) {
            const aura: SkillAura = ra.getAura();
            if (["stun", "freeze", "stone", "disabled"].includes(aura.category)) {
                return;
            }
        }

        const userAuras: Set<RemoveAura> = user.properties.get(Users.AURAS);
        for (const ra of userAuras) {
            const aura: SkillAura = ra.getAura();
            if (aura.category !== "d") {
                damage *= 1 - aura.damageTakenDecrease;
            }
        }

        let userHp: number = user.properties.get(Users.HP) - damage;
        userHp = userHp <= 0 ? 0 : userHp;

        user.properties.set(Users.HP, userHp);
        user.properties.set(Users.STATE, Users.STATE_COMBAT);

        if (user.properties.get(Users.HP) <= 0) {
            this.world.users.die(user);
            this.removeTarget(userId);
            this.cancel();
        }

        const anims: JSONArray = new JSONArray();
        const p: JSONObject = new JSONObject();
        const userData: JSONObject = new JSONObject();
        const sara: JSONArray = new JSONArray();
        const saraObj: JSONObject = new JSONObject();
        const ct: JSONObject = new JSONObject();

        anims.add(new JSONObject()
            .element("strFrame", user.properties.get(Users.FRAME))
            .element("cInf", "m:" + this.mapId)
            .element("fx", "m")
            .element("tInf", "p:" + userId)
            .element("animStr", "Attack1,Attack2")
        );

        userData.put("intMP", user.properties.get(Users.MP));
        userData.put("intHP", user.properties.get(Users.HP));
        userData.put("intState", user.properties.get(Users.STATE));

        p.put(user.getName(), userData);

        saraObj.put("actionResult", new JSONObject()
            .element("hp", damage)
            .element("cInf", "m:" + this.mapId)
            .element("tInf", "p:" + userId)
            .element("type", dodge ? "dodge" : crit ? "crit" : "hit")
        );

        saraObj.put("iRes", 1);

        sara.add(saraObj);

        const m: JSONObject = new JSONObject();
        const monData: JSONObject = new JSONObject();

        this.mana += this.world.monsters.get(this.monsterId)!.mana * 0.02;
        this.mana = this.mana > this.world.monsters.get(this.monsterId)!.mana ? this.world.monsters.get(this.monsterId)!.mana : this.mana;

        monData.put("intMP", this.mana);

        m.put(String(this.mapId), monData);

        ct.put("anims", anims);
        ct.put("p", p);
        ct.put("m", m);
        ct.put("cmd", "ct");

        this.world.send(ct, this.room.getChannellList());

        ct.put("sara", sara);

        this.world.send(ct, user);
    }

    public restore(): void {
        this.state = 1;
        this.health = this.world.monsters.get(this.monsterId)!.health;
        this.mana = this.world.monsters.get(this.monsterId)!.mana;
        this.targets.clear();

        const monInfo: JSONObject = new JSONObject();
        monInfo.put("intHP", this.health);
        monInfo.put("intMP", this.mana);
        monInfo.put("intState", this.state);

        const mtls: JSONObject = new JSONObject();
        mtls.put("cmd", "mtls");
        mtls.put("id", this.mapId);
        mtls.put("o", monInfo);

        this.world.send(mtls, this.room.getChannellList());
    }

    public die(): void {
        if (this.state === 0) {
            return;
        }
        this.attacking?.cancel();

        for (const ra of this.auras) {
            ra.run();
            ra.cancel();
        }

        this.auras.clear();

        this.health = 0;
        this.mana = 0;
        this.state = 0;

        schedule(new MonsterRespawn(this.world, this), 20, TimeUnit.SECONDS);

        const mon: Monster = this.world.monsters.get(this.monsterId)!;

        const drops: Set<MonsterDrop> = new Set<MonsterDrop>();

        for (const md of mon.monstersDrops) {
            if (Math.random() <= md.chance * this.world.DROP_RATE) {
                drops.add(md);
            }
        }

        for (const userId of this.targets) {
            const user: Player | null = ExtensionHelper.instance().getUserById(userId);
            if (user) {
                for (const md of drops) {
                    this.world.users.dropItem(user, md.itemId, md.quantity);
                }

                this.world.users.giveRewards(user, mon.experience, mon.gold, mon.reputation, 0, -1, this.mapId, "m");
            }
        }
    }

    public hasAura(auraId: number): boolean {
        for (const ra of this.auras) {
            const aura: SkillAura = ra.getAura();
            if (aura.id === auraId) {
                return true;
            }
        }
        return false;
    }

    public removeAura(ra: RemoveAura): void {
        this.auras.delete(ra);
    }

    public applyAura(aura: SkillAura): RemoveAura {
        const ra: RemoveAura = new RemoveAura(this.world, aura, this);
        ra.setRunning(this.world.scheduleTask(ra, aura.duration, TimeUnit.SECONDS));

        this.auras.add(ra);

        return ra;
    }

    public getRandomTarget(): number {
        const setArray: number[] = Array.from(this.targets);
        return setArray[this.rand.nextInt(setArray.length)];
    }

    public getTargets(): ReadonlySet<number> {
        return this.targets;
    }

    public addTarget(userId: number): void {
        if (!this.targets.has(userId)) {
            this.targets.add(userId);
        }
    }

    public removeTarget(userId: number): void {
        this.targets.delete(userId);
    }

    public getState(): number {
        return this.state;
    }

    public getMapId(): number {
        return this.mapId;
    }

    public getFrame(): string {
        return this.frame;
    }

    public getMonsterId(): number {
        return this.monsterId;
    }

    public getHealth(): number {
        return this.health;
    }

    public getMana(): number {
        return this.mana;
    }

    public getRoom(): Room {
        return this.room;
    }

    public setAttacking(attacking: ScheduledTask): void {
        if (!this.attacking || this.attacking.cancelled) {
            this.state = 2;
            this.attacking = attacking;
        } else {
            attacking.cancel();
        }
    }

    public setState(state: number): void {
        this.state = state;
    }

    public setHealth(health: number): void {
        this.health = health;
        if (this.health < 0) {
            this.health = 0;
        }
    }

    public setMana(mana: number): void {
        this.mana = mana;
        if (this.mana < 0) {
            this.mana = 0;
        }
    }

    public getAuras(): ReadonlySet<RemoveAura> {
        return this.auras;
    }
}
