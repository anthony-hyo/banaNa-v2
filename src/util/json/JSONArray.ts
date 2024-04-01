import type JSONObject from "./JSONObject.ts";

export default class JSONArray implements Iterable<any> {

	constructor(
		private readonly elements: Array<string | number | boolean | JSONObject | JSONArray> = []
	) {
	}

	public add(element: string | number | boolean | JSONObject | JSONArray): this {
		this.elements.push(element);
		return this;
	}

	public get(index: number): any {
		return this.elements[index];
	}

	public element(key: number, value: string | number | boolean | JSONObject | JSONArray): this {
		this.elements[key] = value;
		return this;
	}

	public get size(): number {
		return this.elements.length;
	}

	public toJSON(): Array<string | number | boolean | JSONObject | JSONArray> {
		return this.elements;
	}

	public [Symbol.iterator](): Iterator<any> {
		let index: number = 0;
		const elements: any[] = this.elements;

		return {
			next(): IteratorResult<any> {
				if (index < elements.length) {
					return {
						value: elements[index++],
						done: false
					};
				} else {
					return {
						value: undefined,
						done: true
					};
				}
			}
		};
	}

}
