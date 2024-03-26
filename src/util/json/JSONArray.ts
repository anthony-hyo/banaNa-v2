import JSONObject from "./JSONObject.ts";

export default class JSONArray implements Iterable<any> {

	private readonly elements: any[];

	constructor(elements: any[] = []) {
		this.elements = elements;
	}

	add(element: any): void {
		this.elements.push(element);
	}

	get(index: number): any {
		return this.elements[index];
	}

	element(key: number, value: any): this {
		this.elements[key] = value;
		return this;
	}

	size(): number {
		return this.elements.length;
	}

	toJSON(): any[] {
		return this.elements;
	}

	[Symbol.iterator](): Iterator<any> {
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

	accumulate(key: string, value: any): this {
		const array = this.elements.find(item => item.hasOwnProperty(key));
		if (array) {
			array[key].push(value);
		} else {
			const newArray = new JSONObject().element(key, [value]);
			this.add(newArray);
		}
		return this;
	}

}
