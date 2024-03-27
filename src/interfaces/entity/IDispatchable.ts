import type JSONObject from "../../util/json/JSONObject.ts";
import type Player from "../../player/Player.ts";

/**
 * IDispatchable Interface
 *
 * Represents an interface for objects that can dispatch messages or data to multiple entities.
 */
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
	 * @param command
	 * @param data String or any data to be converted to a string and written.
	 */
	writeArray(command: string, data: Array<string | number>): void;

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
	 * @param command
	 * @param data String or any data to be converted to a string and written.
	 */
	writeArrayExcept(ignored: Player, command: string, data: Array<string | number>): void;

}
