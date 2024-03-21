/**
 * IDispatchable Interface
 *
 * Represents an interface for objects that can dispatch messages or data to multiple entities.
 */
import JSONObject from "../util/json/JSONObject.ts";
import Player from "../player/Player.ts";

export default interface IDispatchable {

    /**
     * Writes a JSON object to all connected entities.
     *
     * @param data The JSON object to be written.
     */
    writeObject(data: JSONObject): void;

    /**
     * Writes an array message to all connected entities.
     *
     * @param data String or any data to be converted to a string and written.
     */
    writeArray(...data: any[]): void;

    /**
     * Writes a string message to all entities except one specified {@link Player}.
     *
     * @param ignored The {@link Player} to be ignored.
     * @param data The string data to be written.
     */
    writeExcept(ignored: Player, data: string): void;

    /**
     * Writes a JSON object to all entities except one specified {@link Player}.
     *
     * @param ignored The {@link Player} to be ignored.
     * @param data The JSON object to be written.
     */
    writeObjectExcept(ignored: Player, data: JSONObject): void;

    /**
     * Writes an array message to all entities except one specified {@link Player}.
     *
     * @param ignored The {@link Player} to be ignored.
     * @param data String or any data to be converted to a string and written.
     */
    writeArrayExcept(ignored: Player, ...data: any[]): void;

}
