enum TypeStat {
	CMO = "cmo", // Magic Boost
	CMI = "cmi", // Magic Resistance

	CPO = "cpo", // Physical Boost
	CPI = "cpi", // Physical Resistance

	CAO = "cao", // Damage Boost
	CAI = "cai", // Damage Resistance

	CMC = "cmc", // Mana Consumption

	CHO = "cho", // Heal Over Time Boost
	CHI = "chi", // Heal Over Time Intake

	CDO = "cdo", // Damage Over Time Boost
	CDI = "cdi", // Damage Over Time Resistance

	SCM = "scm", // Stat Critical Multiplier
	SBM = "sbm", // Stat Block Multiplier
	SEM = "sem", // Stat Event Multiplier TODO
	SRM = "srm", // Stat Resist Multiplier
	SHB = "shb", // Stat Health Boost TODO
	SMB = "smb", // Stat Mana Boost TODO

	TCR = "tcr", // Critical
	THA = "tha", // Haste
	TDO = "tdo", // Evasion
	THI = "thi", // Hit

	AP = "ap",   // Attack Power
	MP = "mp",   // Magic Power

	INCREASE = "+",
	DECREASE = "-",
	MULTIPLY = "*"
}


export default TypeStat;