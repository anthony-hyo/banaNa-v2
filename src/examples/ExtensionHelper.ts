import Player from "./Player";
import Zone from "./Zone";
import Room from "../room/Room";
import {Socket} from "net";

export default class ExtensionHelper {
    private static _instance: ExtensionHelper;

    private constructor() {
    }

    public static instance(): ExtensionHelper {
        if (!ExtensionHelper.instance) {
            ExtensionHelper._instance = new ExtensionHelper();
        }
        return ExtensionHelper._instance;
    }

    public getUserById(userId: number): Player | null {
        return null;
    }

    public joinRoom(user: Player, oldRoomId: number, newRoomId: number, addToLeaveList: boolean, leaveData: string, fireClientEvent: boolean, fireServerEvent: boolean): void {
    }

    public createRoom(zone: Zone, properties: Map<string, string>, settings: any, sendUpdate: boolean, fireServerEvent: boolean): Room {
        // @ts-ignore
        return null;
    }

    public canLogin(name: string, hash: string, chan: Socket, zoneName: string, b: boolean): Player {
        // @ts-ignore
        return null;
    }

    destroyRoom(zone: Zone, id: number) {

    }

    getZone(ownerZone: any): any {
        return undefined;
    }
}
