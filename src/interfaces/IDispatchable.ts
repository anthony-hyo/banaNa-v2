import JSONObject from "../util/json/JSONObject.ts";

export default interface IDispatchable {

    writeObject(data: JSONObject): void;

    writeString(...data: any[]): void;

}