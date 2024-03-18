import Party from "./Party.ts";
import type Player from "../player/Player.ts";

export default class PartyController {

    private static _instance: PartyController;

    private readonly parties: Map<number, Party> = new Map();

    private count: number = 0;

    public static instance(): PartyController {
        if (!this._instance) {
            this._instance = new PartyController();
        }

        return this._instance;
    }

    public getPartyInfo(partyId: number): Party | undefined {
        return this.parties.get(partyId);
    }

    public size(): number {
        return this.parties.size;
    }

    public removeParty(partyId: number): void {
        this.parties.delete(partyId);
    }

    public getPartyId(owner: Player): number {
        const id: number = ++this.count;
        const party: Party = new Party(id, [], owner);

        this.parties.set(id, party);

        return id;
    }

}
