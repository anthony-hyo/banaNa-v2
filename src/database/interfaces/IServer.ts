export default interface IServer {
	id: number;

	name: string;

	ip: string;

	message_of_the_day: string;

	playerCount: number;
	playerHighestCount: number;

	maximum: number;

	isOnline: boolean;
	isUpgradeOnly: boolean;

	chatType: number;

	dateUpdated: Date;
	dateCreated: Date;
}