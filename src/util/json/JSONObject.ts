import type IJSONObject from "./IJSONObject.ts";
import JSONArray from "./JSONArray.ts";

export default class JSONObject {

	constructor(
		private readonly properties: IJSONObject = {}
	) {
	}

	public put(key: string, value: string | number | boolean | JSONObject | JSONArray): void {
		this.properties[key] = value;
	}

	public element(key: string, value: string | number | boolean | JSONObject | JSONArray): this {
		this.properties[key] = value;
		return this;
	}

	public elementIf(condition: boolean, key: string, value: string | number | boolean | JSONObject | JSONArray): this {
		if (condition) {
			this.properties[key] = value;
		}
		return this;
	}

	public has(key: string): boolean {
		return key in this.properties;
	}

	public get(key: string): any {
		return this.properties[key];
	}

	public getJSONObject(key: string): JSONObject | null {
		const value: any = this.properties[key];

		if (value instanceof JSONObject) {
			return value;
		}

		return null;
	}

	public getJSONArray(key: string): JSONArray | null {
		const value: any = this.properties[key];

		if (value instanceof JSONArray) {
			return value;
		}

		return null;
	}

	public getInt(key: string): number | null {
		const value = this.properties[key];

		if (typeof value === 'number') {
			return value;
		}

		return null;
	}

	public getString(key: string): string | null {
		const value = this.properties[key];

		if (typeof value === 'string') {
			return value;
		}

		return null;
	}

	public toJSON(): IJSONObject {
		return this.properties;
	}

	public get isEmpty(): boolean {
		return Object.keys(this.properties).length === 0;
	}

}