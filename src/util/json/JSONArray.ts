import type {JSONValue} from "./JSONValue.ts";

export default class JSONArray implements Iterable<any> {

	constructor(
		private readonly elements: Array<JSONValue> = []
	) {
	}

	public element(key: number, value: JSONValue): this {
		this.elements[key] = value;
		return this;
	}

	public add(element: JSONValue): this {
		this.elements.push(element);
		return this;
	}

	public get(index: number): any {
		return this.elements[index];
	}

	public get size(): number {
		return this.elements.length;
	}

	public toJSON(): Array<JSONValue> {
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
