import RequestType from "./RequestType.ts";
import RequestFactory from "./RequestFactory.ts";

export default function RequestRegister(options: {
	name: string;
	type: RequestType
}) {
	return (target: any): void => RequestFactory.add(options.type, options.name, target);
}
