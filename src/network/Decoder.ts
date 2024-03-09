import {DecoderType} from "../util/Const";
import {XMLParser} from "fast-xml-parser";
import {Main} from "../Main";
import Room from "../room/Room";
import Player from "../player/Player.ts";
import database from "../database/drizzle/database.ts";
import {and, eq} from "drizzle-orm";
import {users} from "../database/drizzle/schema.ts";
import type PlayerNetwork from "../player/PlayerNetwork.ts";
import Settings from "../aqw/Settings.ts";
import type User from "../database/interfaces/User.ts";
import type {IRequest} from "../dispatcher/IRequest.ts";

export default class Decoder {

    private readonly playerNetwork: PlayerNetwork

    private readonly xmlParser: XMLParser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "_"
    })

    constructor(playerNetwork: PlayerNetwork) {
        this.playerNetwork = playerNetwork;
    }

    public decode(data: string): void {
        const first: string = data.charAt(0)

        switch (first) {
            case DecoderType.XML:
                if (data.includes(`policy`)) {
                    this.playerNetwork.write(`<cross-domain-policy><allow-access-from domain='*' to-ports='5588' /></cross-domain-policy>`)
                    return
                }

                const dataXML: any = this.xmlParser.parse(data)

                switch (dataXML.msg.body._action) {
                    case 'verChk':
                        // noinspection HtmlUnknownAttribute
                        this.playerNetwork.write(`<msg t='sys'><body action='${dataXML.msg.body.ver._v >= 157 ? `apiOK` : `apiKO`}' r='0'></body></msg>`)
                        break
                    case 'login':
                        const username: string = dataXML.msg.body.login.nick.split(`~`)[1]
                        const token: string = dataXML.msg.body.login.pword

                        database.query.users
                            .findFirst({
                                where: and(
                                    eq(users.name, username),
                                    eq(users.hash, token)
                                )
                            })
                            .then((user: User | undefined): void => {
                                if (!user) {
                                    this.playerNetwork.writeString(`loginResponse`, `false`, `-1`, username, `User Data for '${username}' could not be retrieved. Please contact the staff to resolve the issue.`);
                                    //TODO: Close socket
                                    return;
                                }

                                const player: Player = null!;

                                //TODO: Multi login

                                //TODO: Maintanance

                                this.playerNetwork.player = new Player(user, this.playerNetwork)

                                this.sendPreferences(user, Settings.PARTY);
                                this.sendPreferences(user, Settings.GOTO);
                                this.sendPreferences(user, Settings.FRIEND);
                                this.sendPreferences(user, Settings.WHISPER);
                                this.sendPreferences(user, Settings.TOOLTIPS);
                                this.sendPreferences(user, Settings.DUEL);
                                this.sendPreferences(user, Settings.GUILD);

                                this.playerNetwork.writeString(`loginResponse`, `true`, player.network.id, user.name, `Message of the day`, `2017-09-30T10:58:57`, GameController.singleton.gameLogin)
                            })
                        break
                    default:
                        //TODO: Kick or Ban
                        break
                }
                break
            case DecoderType.JSON:
                break
            case DecoderType.XT:
                if (!this.playerNetwork.player) {
                    //TODO: Kick or Ban
                    return;
                }

                const dataBody: number = data.indexOf('%', 1)

                const body: string = data.substring(dataBody + 1);
                const params: string[] = body.split("%")

                const args: string[] = []

                for (let i = 3; i < params.length; i++) {
                    args.push(params[i])
                }

                const request: IRequest = this.playerNetwork.request.getRequest(params[1])

                request.process(args, this.playerNetwork.player, Main.SINGLETON.world, new Room(1, '1'))
                break
            default:
            case DecoderType.NONE:
                //TODO: Kick or Ban
                break
        }
    }

}