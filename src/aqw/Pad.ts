export class Pad {

	private static readonly pads: Map<string, string> = new Map([
		["Pad1", "Right"],
		["Pad2", "Down1"],
		["Pad3", "Down1"],
		["Pad4", "Down2"],
		["Pad5", "Left"],
		["Pad6", "Top1"],
		["Pad7", "Top3"],
		["Pad8", "Top2"]
	]);

	private static readonly pairs: Map<string, string> = new Map([
		["Pad3", "Pad7"],
		["Pad5", "Pad1"],
		["Pad2", "Pad6"],
		["Pad1", "Pad5"],
		["Pad7", "Pad3"],
		["Pad6", "Pad2"],
		["Pad4", "Pad8"],
		["Pad8", "Pad4"]
	]);

	public static getPair(pad: string): string {
		return Pad.pairs.get(pad) || "";
	}

	public static getPad(pad: string): string {
		return Pad.pads.get(pad) || "";
	}

}
