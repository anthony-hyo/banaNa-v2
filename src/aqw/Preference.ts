export default class Preference {

	public static readonly CLOAK: number = 0;
	public static readonly HELM: number = 1;
	public static readonly PET: number = 2;
	public static readonly GOTO: number = 4;
	public static readonly MUSIC: number = 6;
	public static readonly FRIEND: number = 7;
	public static readonly PARTY: number = 8;
	public static readonly GUILD: number = 9;
	public static readonly WHISPER: number = 10;
	public static readonly TOOLTIPS: number = 11;
	public static readonly FBSHARE: number = 12;
	public static readonly DUEL: number = 13;
	public static readonly CAPE: number = 14;
	public static readonly OTHER_PETS: number = 15;
	public static readonly ANIMATIONS: number = 17;
	public static readonly PROF: number = 18;

	public static readonly CLOAK_MESSAGE_ON: string = "Hiding cloak.";
	public static readonly CLOAK_MESSAGE_OFF: string = "Showing cloak.";

	public static readonly HELM_MESSAGE_ON: string = "Hiding helm.";
	public static readonly HELM_MESSAGE_OFF: string = "Showing helm.";

	public static readonly PET_MESSAGE_ON: string = "Hiding pet.";
	public static readonly PET_MESSAGE_OFF: string = "Showing pet.";

	public static readonly GOTO_MESSAGE_OFF: string = "Blocking goto requests.";
	public static readonly GOTO_MESSAGE_ON: string = "Accepting goto requests.";

	public static readonly FRIEND_MESSAGE_OFF: string = "Ignoring Friend requests.";
	public static readonly FRIEND_MESSAGE_ON: string = "Accepting Friend requests.";

	public static readonly PARTY_MESSAGE_OFF: string = "Ignoring party invites.";
	public static readonly PARTY_MESSAGE_ON: string = "Accepting party invites.";

	public static readonly GUILD_MESSAGE_OFF: string = "Ignoring guild invites.";
	public static readonly GUILD_MESSAGE_ON: string = "Accepting guild invites.";

	public static readonly WHISPER_MESSAGE_OFF: string = "Ignoring PMs.";
	public static readonly WHISPER_MESSAGE_ON: string = "Accepting PMs.";

	public static readonly TOOLTIPS_MESSAGE_OFF: string = "Ability ToolTips will not show on mouseover during combat.";
	public static readonly TOOLTIPS_MESSAGE_ON: string = "Ability ToolTips will always show on mouseover.";

	public static readonly FBSHARE_MESSAGE_ON: string = "Enabling Facebook sharing.";
	public static readonly FBSHARE_MESSAGE_OFF: string = "Disabling Facebook sharing.";

	public static readonly DUEL_MESSAGE_OFF: string = "Ignoring duel invites.";
	public static readonly DUEL_MESSAGE_ON: string = "Accepting duel invites.";

	public static readonly CAPE_MESSAGE_ON: string = "Hiding all capes.";
	public static readonly CAPE_MESSAGE_OFF: string = "Showing all capes.";

	public static readonly OTHER_PETS_MESSAGE_ON: string = "Hiding other players' pets.";
	public static readonly OTHER_PETS_MESSAGE_OFF: string = "Showing other players' pets.";

	public static readonly ANIMATIONS_MESSAGE_ON: string = "Showing game animations.";
	public static readonly ANIMATIONS_MESSAGE_OFF: string = "Hiding game animations.";

	public static readonly PROF_MESSAGE_ON: string = "Enabling profession display.";
	public static readonly PROF_MESSAGE_OFF: string = "Disabling profession display.";

}
