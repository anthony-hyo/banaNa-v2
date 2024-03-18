import logger from "../util/Logger";
import {Socket} from "net";
import {DELIMITER} from "../util/Const";

export default class Encoder {

    public static writeObject(socket: Socket, data: object): void {
        Encoder.write(socket, JSON.stringify({
            t: `xt`,
            b: {
                r: -1,
                o: data
            },
        }))
    }

    public static writeArray(socket: Socket, ...data: any[]): void {
        let response: string = ``

        for (let i: number = 1; i < data.length; ++i) {
            response += `${data[i]}%`
        }

        Encoder.write(socket, `%xt%${data[0]}%-1%${response}`)
    }


    private static write(socket: Socket, data: string): void {
        logger.debug(`[PlayerNetwork] sending ${data}`)
        socket.write(data + DELIMITER)
    }

}