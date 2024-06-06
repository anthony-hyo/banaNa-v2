import type IRequest from "../../interfaces/request/IRequest.ts";
import type RequestArg from "../RequestArg.ts";
import type Player from "../../avatar/player/Player.ts";
import RequestType from "../RequestType.ts";
import RequestRegister from "../RequestRegister.ts";
import PlayerController from "../../controller/PlayerController";
import UserNotFoundException from "../../exceptions/UserNotFoundException.ts";
import JSONObject from "../../util/json/JSONObject";

@RequestRegister({
    name: "isModerator",
    type: RequestType.DEFAULT
})
export default class IsModerator implements IRequest {

    public async handler(player: Player, args: RequestArg): Promise<void> {
        let username: string = args.getString(0);

        const target: Player = PlayerController.findByUsername(username);
        if (!target) {
            throw new UserNotFoundException(`User ${username} not found.`);
        }

        player.writeObject(new JSONObject()
            .element("cmd", "isModerator")
            .element("val", target.data.isStaff)
            .element("unm", target.user)
        )
    }

}