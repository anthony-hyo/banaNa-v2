import type IJSONObject from "./IJSONObject.ts";
import JSONArray from "./JSONArray.ts";
import type {JSONValue} from "./JSONValue.ts";

export default class JSONObject {

	constructor(
		private readonly properties: IJSONObject = {}
	) {
	}

	public element(key: string, value: JSONValue): this {
		this.properties[key] = value;
		return this;
	}

	public elementIf(condition: boolean, key: string, value: JSONValue): this {
		if (condition) {
			this.properties[key] = value;
		}
		return this;
	}

	public has(key: string): boolean {
		return key in this.properties;
	}

	public get(key: string): JSONValue {
		return this.properties[key];
	}

	public getString(key: string): string | null {
		const value = this.properties[key];

		if (typeof value === 'string') {
			return value;
		}

		return null;
	}

	public getNumber(key: string): number | undefined {
		const value = this.properties[key];

		if (typeof value === 'number') {
			return value;
		}

		return undefined;
	}

	public getBoolean(key: string): boolean | undefined {
		const value = this.properties[key];

		if (typeof value === 'boolean') {
			return value;
		}

		return undefined;
	}

	public getJSONObject(key: string): JSONObject | undefined {
		const value: any = this.properties[key];

		if (value instanceof JSONObject) {
			return value;
		}

		return undefined;
	}

	public getJSONArray(key: string): JSONArray | undefined {
		const value: any = this.properties[key];

		if (value instanceof JSONArray) {
			return value;
		}

		return undefined;
	}

	public toJSON(): IJSONObject {
		return this.properties;
	}

	public get isEmpty(): boolean {
		return Object.keys(this.properties).length === 0;
	}

}