import PartyInfo from "./PartyInfo";
import type Player from "../player/Player.ts";

export default class Parties {
    private partyId: number;
    private parties: Map<number, PartyInfo>;

    constructor() {
        this.partyId = 0;
        this.parties = new Map();
    }

    public getPartyInfo(partyId: number): PartyInfo | undefined {
        return this.parties.get(partyId);
    }

    public size(): number {
        return this.parties.size;
    }

    public removeParty(partyId: number): void {
        this.parties.delete(partyId);
    }

    public getPartyId(owner: Player): number {
        const id: number = ++this.partyId;
        const partyInfo: PartyInfo = new PartyInfo(owner, id);

        this.parties.set(id, partyInfo);

        return id;
    }
}
