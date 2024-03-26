export class Achievement {


	public static get(value: number, index: number): number {
		return index >= 0 && index <= 31 ? ((value & (1 << index)) === 0 ? 0 : 1) : -1;
	}

	public static update(valueToSet: number, index: number, value: number): number {
		let newValue: number = 0;

		if (value === 0) {
			newValue = valueToSet & ~(1 << index);
		} else if (value === 1) {
			newValue = valueToSet | (1 << index);
		}

		return newValue;
	}


}
