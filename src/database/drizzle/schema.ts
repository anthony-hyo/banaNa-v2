import {
	type AnyMySqlColumn,
	boolean,
	char,
	decimal,
	index,
	int,
	mediumint,
	mysqlEnum,
	mysqlTable,
	smallint,
	text,
	timestamp,
	tinyint,
	unique,
	uniqueIndex,
	varchar
} from "drizzle-orm/mysql-core";
import {relations, sql} from "drizzle-orm";

const combatCategory = mysqlEnum('category', ['M1', 'M2', 'M3', 'M4', 'C1', 'C2', 'C3', 'S1'])
	.default("M1")
	.notNull();

const genderEnum = mysqlEnum('gender', ['M', 'F'])
	.default("M")
	.notNull();

const targetEnum = mysqlEnum('target', ['s', 'h', 'f'])
	.default("h")
	.notNull();

const idColumn = (table: string = `id`) => int(table, {
	unsigned: true
})
	.autoincrement()
	.primaryKey()
	.notNull();

const userIdColumn = (table: string = `user_id`) => int(table, {
	unsigned: true
})
	.notNull()
	.references((): AnyMySqlColumn => users.id, {
		onDelete: "cascade",
		onUpdate: "cascade"
	});

const itemIdColumn = (table: string = `item_id`) => int(table, {
	unsigned: true
})
	.notNull()
	.default(1)
	.references((): AnyMySqlColumn => items.id, {
		onDelete: "cascade",
		onUpdate: "cascade"
	});

const enhancementIdColumn = int("enhancement_id", {
	unsigned: true
})
	.notNull()
	.default(1)
	.references((): AnyMySqlColumn => enhancements.id, {
		onDelete: "set default",
		onUpdate: "cascade"
	});

const questIdColumn = int("quest_id", {
	unsigned: true
})
	.notNull()
	.references((): AnyMySqlColumn => quests.id, {
		onDelete: "cascade",
		onUpdate: "cascade"
	});

const areaIdColumn = int("area_id", {
	unsigned: true
})
	.notNull()
	.default(1)
	.references((): AnyMySqlColumn => areas.id, {
		onDelete: "cascade",
		onUpdate: "cascade"
	});

const shopIdColumn = int("shop_id", {
	unsigned: true
})
	.notNull()
	.references((): AnyMySqlColumn => shops.id, {
		onDelete: "cascade",
		onUpdate: "cascade"
	});

const monsterIdColumn = int("monster_id", {
	unsigned: true
})
	.notNull()
	.references((): AnyMySqlColumn => monsters.id, {
		onDelete: "cascade",
		onUpdate: "cascade"
	});

const skillIdColumn = int("skill_id", {
	unsigned: true
})
	.notNull()
	.references((): AnyMySqlColumn => skills.id, {
		onDelete: "cascade",
		onUpdate: "cascade"
	});

const levelColumn = (table: string = `level`) => int(table, {
	unsigned: true
})
	.default(1)
	.notNull()
	.references((): AnyMySqlColumn => settingsLevels.level, {
		onDelete: "restrict",
		onUpdate: "cascade"
	});

const dateColumn = (table: string) => timestamp(table, {
	mode: 'date',
	fsp: 3
})
	.defaultNow()
	.notNull();

const dateUpdatedColumn = timestamp('date_updated', {
	mode: 'date',
	fsp: 3
})
	.default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`)
	//.onUpdateNow()
	.notNull();

const dateCreatedColumn = dateColumn('date_created');

const dateDeletedColumn = dateColumn('date_deleted');

export const accesses = mysqlTable("accesses", {
	id: idColumn(),

	name:
		varchar("name", {
			length: 64
		})
			.default("None")
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	unique: unique().on(table.name),
}));

export const areas = mysqlTable("areas", {
	id: idColumn(),

	name:
		varchar("name", {
			length: 64
		})
			.default("banaNa")
			.notNull(),

	file:
		varchar("file", {
			length: 128
		})
			.default('banaNa')
			.notNull(),

	maxPlayers:
		tinyint("max_players", {
			unsigned: true
		})
			.default(10)
			.notNull(),

	requiredLevel: levelColumn('required_level'),

	requiredAccessId: levelColumn('required_access_id'),

	isUpgradeOnly:
		boolean("is_upgrade_only")
			.default(false)
			.notNull(),

	isStaffOnly:
		boolean("is_staff_only")
			.default(false)
			.notNull(),

	isPvP:
		boolean("is_pvp")
			.default(false)
			.notNull(),

	isKeyUnique:
		boolean("is_pvp")
			.default(false)
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	uniqueIndex: uniqueIndex("areas_name_unique_index").on(table.name),
}));

export const areasRelations = relations(areas, ({ many }) => ({
	cells: many(areasCells),
	items: many(areasItems),
	monsters: many(areasMonsters),
}));

export const areasCells = mysqlTable("areas_cells", {
	id: idColumn(),

	areaId: areaIdColumn,

	cellId:
		int("cell_id", {
			unsigned: true
		})
			.default(1)
			.notNull(),

	frame:
		varchar("frame", {
			length: 32
		})
			.default('Enter')
			.notNull(),

	pad:
		varchar("pad", {
			length: 32
		})
			.default('Right')
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
});

export const areasCellsRelations = relations(areasCells, ({ one }) => ({
	area: one(areas, {
		fields: [areasCells.areaId],
		references: [areas.id],
	})
}));

export const areasItems = mysqlTable("areas_items", {
	id: idColumn(),

	areaId: areaIdColumn,

	itemId: itemIdColumn(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	unique: unique().on(table.areaId, table.itemId),
}));

export const areasItemsRelations = relations(areasItems, ({ one }) => ({
	area: one(areas, {
		fields: [areasItems.areaId],
		references: [areas.id],
	}),
	item: one(items, {
		fields: [areasItems.itemId],
		references: [items.id],
	})
}));

export const areasMonsters = mysqlTable("areas_monsters", {
	id: idColumn(),

	areaId: areaIdColumn,

	monsterId: monsterIdColumn,

	monsterAreaId:
		int("monster_area_id", {
			unsigned: true
		})
			.default(1)
			.notNull(),

	frame:
		varchar("frame", {
			length: 32
		})
			.default('Enter')
			.notNull(),

	isAggressive:
		boolean("is_aggressive")
			.default(false)
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	unique: unique().on(table.areaId, table.monsterAreaId),
}));

export const areasMonstersRelations = relations(areasMonsters, ({ one }) => ({
	area: one(areas, {
		fields: [areasMonsters.areaId],
		references: [areas.id],
	}),
	monster: one(monsters, {
		fields: [areasMonsters.monsterId],
		references: [monsters.id],
	})
}));

export const classes = mysqlTable("classes", {
	id: idColumn(),

	category: combatCategory,

	description:
		text("description")
			.default("")
			.notNull(),

	manaRegenerationMethods:
		text("mana_regeneration_methods")
			.default("")
			.notNull(),

	statsDescription:
		text("stats_description")
			.default("")
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
});

export const classesRelations = relations(classes, ({ one, many }) => ({
	item: one(items, {
		fields: [classes.id],
		references: [items.classId],
	}),

	skills: many(classesSkills)
}));

export const classesSkills = mysqlTable("classes_skills", {
	id: idColumn(),

	classId: int("class_id", {
		unsigned: true
	})
		.notNull()
		.references((): AnyMySqlColumn => classes.id, {
			onDelete: "cascade",
			onUpdate: "cascade"
		}),

	skillId: skillIdColumn,

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
});

export const classesSkillsRelations = relations(classesSkills, ({ one, many }) => ({
	class: one(classes, {
		fields: [classesSkills.classId],
		references: [classes.id],
	}),
	skill: one(skills, {
		fields: [classesSkills.skillId],
		references: [skills.id],
	}),
}));

export const countries = mysqlTable("countries", {
	code:
		char("code", {
			length: 2
		})
			.primaryKey()
			.default("XX")
			.notNull(),

	name:
		varchar("name", {
			length: 64
		})
			.default("Unknown")
			.notNull()
}, (table) => ({
	unique: unique().on(table.code, table.name),
}));

export const enhancements = mysqlTable("enhancements", {
	id: idColumn(),

	name:
		varchar("name", {
			length: 64
		})
			.default("None")
			.notNull(),

	patternId:
		int("pattern_id", {
			unsigned: true
		})
			.default(1)
			.notNull()
			.references((): AnyMySqlColumn => enhancementsPatterns.id, {
				onDelete: "set default",
				onUpdate: "cascade"
			}),

	rarity:
		int("rarity", {
			unsigned: true
		})
			.default(1)
			.notNull(),

	damagePerSecond:
		smallint("damage_per_second", {
			unsigned: true
		})
			.default(100)
			.notNull(),

	level: levelColumn(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	unique: unique().on(table.name),
}));


export const enhancementsRelations = relations(enhancements, ({ one }) => ({
	pattern: one(enhancementsPatterns, {
		fields: [enhancements.patternId],
		references: [enhancementsPatterns.id],
	}),
}));

export const enhancementsPatterns = mysqlTable("enhancements_patterns", {
	id: idColumn(),

	name:
		varchar("name", {
			length: 64
		})
			.default("None")
			.notNull(),

	category: combatCategory,

	wisdom:
		int("wisdom", {
			unsigned: true
		})
			.default(10)
			.notNull(),

	strength:
		int("strength", {
			unsigned: true
		})
			.default(10)
			.notNull(),

	luck:
		int("luck", {
			unsigned: true
		})
			.default(10)
			.notNull(),

	dexterity:
		int("dexterity", {
			unsigned: true
		})
			.default(10)
			.notNull(),

	endurance:
		int("endurance", {
			unsigned: true
		})
			.default(10)
			.notNull(),

	intelligence:
		int("intelligence", {
			unsigned: true
		})
			.default(10)
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	unique: unique().on(table.name)
}));

export const enhancementsPatternsRelations = relations(enhancementsPatterns, ({ many }) => ({
	enhancements: many(enhancements),
}));

export const factions = mysqlTable("factions", {
	id: idColumn(),

	name:
		varchar("name", {
			length: 64
		})
			.default("None")
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	unique: unique().on(table.name)
}));

export const guilds = mysqlTable("guilds", {
	id: idColumn(),

	name:
		varchar("name", {
			length: 64
		})
			.default("None")
			.notNull(),

	messageOfTheDay:
		varchar("message_of_the_day", {
			length: 512
		})
			.default("Welcome to our guild!")
			.notNull(),

	maxMembers:
		tinyint("max_members", {
			unsigned: true
		})
			.default(10)
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	unique: unique().on(table.name)
}));

export const guildsRelations = relations(guilds, ({ many }) => ({
	members: many(users),
}));

export const hairs = mysqlTable("hairs", {
	id: idColumn(),

	name:
		varchar("name", {
			length: 64
		})
			.default(`banaNa`)
			.notNull(),

	file:
		varchar("file", {
			length: 64
		})
			.default('')
			.notNull(),

	gender: genderEnum,

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	unique: unique().on(table.name, table.gender),
	unique2: unique().on(table.file),
}));

export const hairsShops = mysqlTable("hairs_shops", {
	id: idColumn(),

	name:
		varchar("name", {
			length: 64
		})
			.default(`banaNa`)
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	unique: unique().on(table.name)
}));

export const hairsShopsRelations = relations(hairsShops, ({ many }) => ({
	shopItems: many(hairsShopsItems),
}));

export const hairsShopsItems = mysqlTable("hairs_shops_items", {
	id: idColumn(),

	hairShopId:
		int("hair_shop_id", {
			unsigned: true
		})
			.notNull()
			.references((): AnyMySqlColumn => hairsShops.id, {
				onDelete: "cascade",
				onUpdate: "cascade"
			}),

	hairId:
		int("hair_id", {
			unsigned: true
		})
			.notNull()
			.references((): AnyMySqlColumn => hairs.id, {
				onDelete: "cascade",
				onUpdate: "cascade"
			}),

	gender: genderEnum,

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	unique: unique().on(table.hairShopId, table.hairId)
}));

export const hairsShopsItemsRelations = relations(hairsShopsItems, ({ one }) => ({
	hairShop: one(hairsShops, {
		fields: [hairsShopsItems.hairShopId],
		references: [hairsShops.id],
	}),
	hair: one(hairs, {
		fields: [hairsShopsItems.hairId],
		references: [hairs.id],
	}),
}));

export const items = mysqlTable("items", {
	id: idColumn(),

	name:
		varchar("name", {
			length: 128
		})
			.default('banaNa')
			.notNull(),

	description: text("description")
		.default('Description')
		.notNull(),

	file:
		varchar("file", {
			length: 128
		})
			.default('')
			.notNull(),

	linkage:
		varchar("linkage", {
			length: 64
		})
			.default('')
			.notNull(),

	icon:
		varchar("icon", {
			length: 32
		})
			.default('iibag')
			.notNull(),

	typeItemId:
		int("type_item_id", {
			unsigned: true
		})
			.default(1)
			.notNull()
			.references((): AnyMySqlColumn => typesItems.id, {
				onDelete: "restrict",
				onUpdate: "cascade"
			}),

	typeRarityId:
		int("type_rarity_id", {
			unsigned: true
		})
			.default(10)
			.notNull()
			.references((): AnyMySqlColumn => typesRarities.id, {
				onDelete: "restrict",
				onUpdate: "cascade"
			}),

	typeElementId:
		int("type_element_id", {
			unsigned: true
		})
			.default(1)
			.notNull()
			.references((): AnyMySqlColumn => typesElements.id, {
				onDelete: "restrict",
				onUpdate: "cascade"
			}),

	classId:
		int("class_id", {
			unsigned: true
		})
			.references((): AnyMySqlColumn => classes.id, {
				onDelete: "restrict",
				onUpdate: "cascade"
			}),

	level: levelColumn(),

	range:
		smallint("range", {
			unsigned: true
		})
			.default(10)
			.notNull(),

	cost:
		int("cost", {
			unsigned: true
		})
			.default(0)
			.notNull(),

	quantity:
		smallint("quantity", {
			unsigned: true
		})
			.default(1)
			.notNull(),

	stack:
		smallint("stack", {
			unsigned: true
		})
			.default(1)
			.notNull(),

	isCoins:
		boolean("is_coins")
			.default(false)
			.notNull(),

	isTemporary:
		boolean("is_temporary")
			.default(false)
			.notNull(),

	isUpgradeOnly:
		boolean("is_upgrade_only")
			.default(false)
			.notNull(),

	isStaffOnly:
		boolean("is_staff_only")
			.default(false)
			.notNull(),

	enhancementId:
		int("enhancement_id", {
			unsigned: true
		})
			.default(1)
			.notNull()
			.references((): AnyMySqlColumn => enhancements.id, {
				onDelete: "set default",
				onUpdate: "cascade"
			}),

	requiredFactionId:
		int("required_faction_id", {
			unsigned: true
		})
			.references((): AnyMySqlColumn => factions.id, {
				onDelete: "restrict",
				onUpdate: "cascade"
			}),

	requiredFactionReputation:
		mediumint("required_faction_reputation", {
			unsigned: true
		})
			.default(0)
			.notNull(),

	requiredClassItemId:
		int("required_class_item_id", {
			unsigned: true
		})
			.references((): AnyMySqlColumn => classes.id, {
				onDelete: "restrict",
				onUpdate: "cascade"
			}),

	requiredClassPoints:
		mediumint("required_class_points", {
			unsigned: true
		})
			.default(0)
			.notNull(),

	questStringIndex:
		tinyint("quest_string_index")
			.default(-1)
			.notNull(),

	questStringValue:
		tinyint("quest_string_value")
			.default(0)
			.notNull(),

	skillPotionId:
		int("skill_potion_id", {
			unsigned: true
		})
			.references((): AnyMySqlColumn => skills.id, {
				onDelete: "restrict",
				onUpdate: "cascade"
			}),

	meta:
		varchar("meta", {
			length: 32
		})
			.default('null'),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
});

export const itemsRelations = relations(items, ({ one, many }) => ({
	typeItem: one(typesItems, {
		fields: [items.typeItemId],
		references: [typesItems.id],
	}),
	typeRarity: one(typesRarities, {
		fields: [items.typeRarityId],
		references: [typesRarities.id],
	}),
	typeElement: one(typesElements, {
		fields: [items.typeElementId],
		references: [typesElements.id],
	}),

	class: one(classes, {
		fields: [items.classId],
		references: [classes.id],
	}),

	enhancement: one(enhancements, {
		fields: [items.enhancementId],
		references: [enhancements.id],
	}),

	requiredFaction: one(factions, {
		fields: [items.requiredFactionId],
		references: [factions.id],
	}),

	requiredClassItem: one(items, {
		fields: [items.requiredClassItemId],
		references: [items.id],
	}),

	skillPotion: one(skills, {
		fields: [items.skillPotionId],
		references: [skills.id],
	}),

	requirements: many(itemsRequirements),
}));

export const itemsRequirements = mysqlTable("items_requirements", {
	itemId: itemIdColumn(),

	requiredItemId: itemIdColumn("required_item_id"),

	quantity:
		int("quantity", {
			unsigned: true
		})
			.default(1)
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
});

export const itemsRequirementsRelations = relations(itemsRequirements, ({ one }) => ({
	item: one(items, {
		fields: [itemsRequirements.itemId],
		references: [items.id],
	}),
	requiredItem: one(items, {
		fields: [itemsRequirements.requiredItemId],
		references: [items.id],
	})
}));

export const monsters = mysqlTable("monsters", {
	id: idColumn(),

	name:
		varchar("name", {
			length: 64
		})
			.default('banaNa')
			.notNull(),

	file:
		varchar("file", {
			length: 128
		})
			.default('Mosquito.swf')
			.notNull(),

	linkage:
		varchar("linkage", {
			length: 64
		})
			.default('Mosquito')
			.notNull(),

	typeElementId:
		int("type_element_id", {
			unsigned: true
		})
			.default(1)
			.notNull()
			.references((): AnyMySqlColumn => typesElements.id, {
				onDelete: "restrict",
				onUpdate: "cascade"
			}),

	typeRaceId:
		int("type_race_id", {
			unsigned: true
		})
			.default(1)
			.notNull()
			.references((): AnyMySqlColumn => typesRaces.id, {
				onDelete: "restrict",
				onUpdate: "cascade"
			}),

	coins:
		int("coins", {
			unsigned: true
		})
			.default(100)
			.notNull(),

	gold:
		int("gold", {
			unsigned: true
		})
			.default(100)
			.notNull(),

	experience:
		int("experience", {
			unsigned: true
		})
			.default(100)
			.notNull(),

	classPoints:
		int("class_points", {
			unsigned: true
		})
			.default(100)
			.notNull(),

	level: levelColumn(),

	health:
		int("health", {
			unsigned: true
		})
			.default(1000)
			.notNull(),

	mana:
		int("mana", {
			unsigned: true
		})
			.default(100)
			.notNull(),

	damagePerSecond:
		int("damage_per_second", {
			unsigned: true
		})
			.default(100)
			.notNull(),

	range:
		smallint("range", {
			unsigned: true
		})
			.default(10)
			.notNull(),

	category: combatCategory,

	wisdom:
		int("wisdom", {
			unsigned: true
		})
			.default(10)
			.notNull(),

	strength:
		int("strength", {
			unsigned: true
		})
			.default(10)
			.notNull(),

	luck:
		int("luck", {
			unsigned: true
		})
			.default(10)
			.notNull(),

	dexterity:
		int("dexterity", {
			unsigned: true
		})
			.default(10)
			.notNull(),

	endurance:
		int("endurance", {
			unsigned: true
		})
			.default(10)
			.notNull(),

	intelligence:
		int("intelligence", {
			unsigned: true
		})
			.default(10)
			.notNull(),

	teamId:
		int("team_id", {
			unsigned: true
		})
			.default(0)
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
});

export const monstersRelations = relations(monsters, ({ one, many }) => ({
	typeElement: one(typesElements, {
		fields: [monsters.typeElementId],
		references: [typesElements.id],
	}),
	typeRace: one(typesRarities, {
		fields: [monsters.typeRaceId],
		references: [typesRarities.id],
	}),

	settingLevel: one(settingsLevels, {
		fields: [monsters.level],
		references: [settingsLevels.level],
	}),

	drops: many(monstersDrops),
}));

export const monstersDrops = mysqlTable("monsters_drops", {
	id: idColumn(),

	monsterId: monsterIdColumn,

	itemId: itemIdColumn(),

	chance:
		decimal("chance", {
			precision: 7,
			scale: 2
		})
			.default('1.00')
			.notNull(),

	quantity:
		int("quantity", {
			unsigned: true
		})
			.default(1)
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
});

export const monstersDropsRelations = relations(monstersDrops, ({ one }) => ({
	monster: one(monsters, {
		fields: [monstersDrops.monsterId],
		references: [monsters.id],
	}),
	item: one(items, {
		fields: [monstersDrops.itemId],
		references: [items.id],
	}),
}));

export const quests = mysqlTable("quests", {
	id: idColumn(),

	name:
		varchar("name", {
			length: 64
		})
			.default('banaNa')
			.notNull(),

	description:
		text("description")
			.default('Retrieve the banaNa')
			.notNull(),

	descriptionTurnIn:
		text("description_turn_in")
			.default('Congratulations!')
			.notNull(),

	experience:
		int("experience", {
			unsigned: true
		})
			.default(0)
			.notNull(),

	coins:
		int("coins", {
			unsigned: true
		})
			.default(0)
			.notNull(),

	gold:
		int("gold", {
			unsigned: true
		})
			.default(0)
			.notNull(),

	classPoints:
		int("class_points", {
			unsigned: true
		})
			.default(0)
			.notNull(),

	factionId:
		int("faction_id", {
			unsigned: true
		})
			.default(1)
			.notNull()
			.references((): AnyMySqlColumn => factions.id, {
				onDelete: "cascade",
				onUpdate: "cascade"
			}),

	factionReputation:
		int("faction_reputation", {
			unsigned: true
		})
			.default(0)
			.notNull(),

	factionRequiredReputation:
		int("faction_required_reputation", {
			unsigned: true
		})
			.default(0)
			.notNull(),

	requiredClassId: itemIdColumn('required_class_item_id'),

	requiredClassPoints:
		int("required_class_points", {
			unsigned: true
		})
			.default(0)
			.notNull(),

	level: levelColumn(),

	isUpgradeOnly:
		boolean("is_upgrade_only")
			.default(false)
			.notNull(),

	isOnce:
		boolean("is_once")
			.default(false)
			.notNull(),

	slot:
		int("slot")
			.default(-1)
			.notNull(),

	value:
		int("value")
			.default(0)
			.notNull(),

	field:
		char("field", {
			length: 3
		})
			.default('')
			.notNull(),

	index:
		int("index")
			.default(-1)
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
});

export const questsRelations = relations(quests, ({ one, many }) => ({
	faction: one(factions, {
		fields: [quests.factionId],
		references: [factions.id],
	}),
	requiredClass: one(items, {
		fields: [quests.requiredClassId],
		references: [items.id],
	}),
	settingLevel: one(items, {
		fields: [quests.level],
		references: [items.id],
	}),

	areas: many(questsAreas),
	requirements: many(questsRequirements),
	rewards: many(questsRewards),
}));

export const questsAreas = mysqlTable("quests_areas", {
	id: idColumn(),

	questId: questIdColumn,

	areaId: areaIdColumn,

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	unique: unique().on(table.questId, table.areaId),
}));

export const questsAreasRelations = relations(questsAreas, ({ one }) => ({
	quest: one(quests, {
		fields: [questsAreas.questId],
		references: [quests.id],
	}),
	area: one(areas, {
		fields: [questsAreas.areaId],
		references: [areas.id],
	}),
}));

export const questsChains = mysqlTable("quests_chains", {
	id: idColumn(),

	name:
		varchar("name", {
			length: 64
		})
			.default(`banaNa`)
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	unique: unique().on(table.name),
}));

export const questsRequirements = mysqlTable("quests_requirements", {
	id: idColumn(),

	questId: questIdColumn,

	itemId: itemIdColumn(),

	quantity:
		int("quantity", {
			unsigned: true
		})
			.notNull()
			.default(1),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
});

export const questsRequirementsRelations = relations(questsRequirements, ({ one }) => ({
	quest: one(quests, {
		fields: [questsRequirements.questId],
		references: [quests.id],
	}),
	item: one(items, {
		fields: [questsRequirements.itemId],
		references: [items.id],
	}),
}));

export const questsRewards = mysqlTable("quests_rewards", {
	id: idColumn(),

	questId: questIdColumn,

	itemId: itemIdColumn(),

	rewardType:
		mysqlEnum('reward_type', ['s', 'c', 'r'])
			.default("s")
			.notNull(),

	quantity:
		int("quantity", {
			unsigned: true
		})
			.default(1)
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
});

export const questsRewardsRelations = relations(questsRewards, ({ one }) => ({
	quest: one(quests, {
		fields: [questsRewards.questId],
		references: [quests.id],
	}),
	item: one(items, {
		fields: [questsRewards.itemId],
		references: [items.id],
	}),
}));

export const servers = mysqlTable("servers", {
	id: idColumn(),

	name:
		varchar("name", {
			length: 64

		})
			.default('banaNa')
			.notNull(),

	ip:
		char("ip", {
			length: 128
		})
			.default('0.0.0.0')
			.notNull(),

	port:
		int("port", {
			unsigned: true
		})
			.default(5588)
			.notNull(),

	message_of_the_day:
		text("message_of_the_day")
			.default("Welcome to banaNa!")
			.notNull(),

	playerCount:
		mediumint("player_count", {
			unsigned: true
		})
			.default(0)
			.notNull(),

	playerHighestCount:
		mediumint("player_highest_count", {
			unsigned: true
		})
			.default(0)
			.notNull(),

	maximum:
		mediumint("player_maximum", {
			unsigned: true
		})
			.default(500)
			.notNull(),

	isOnline:
		boolean("is_online")
			.default(false)
			.notNull(),

	isUpgradeOnly:
		boolean("is_upgrade_only")
			.default(false)
			.notNull(),

	isStaffOnly:
		boolean("is_staff_only")
			.default(false)
			.notNull(),

	chatType:
		tinyint("chat_type", {
			unsigned: true
		})
			.default(2)
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	unique: unique().on(table.name),
	unique2: unique().on(table.ip, table.port),
}));

export const settingsCoreValues = mysqlTable("settings_core_values", {
	id: idColumn(),

	name:
		varchar("name", {
			length: 64
		})
			.default('None')
			.notNull(),

	value:
		decimal("value", {
			precision: 7,
			scale: 2
		})
			.default('1')
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	unique: unique().on(table.name)
}));

export const settingsLevels = mysqlTable("settings_levels", {
	level: idColumn(`level`),

	requiredExperience:
		int("required_experience", {
			unsigned: true
		})
			.default(10000)
			.notNull(),

	health:
		int("health", {
			unsigned: true
		})
			.default(1500)
			.notNull(),

	mana:
		int("mana", {
			unsigned: true
		})
			.default(100)
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
});

export const settingsLogin = mysqlTable("settings_login", {
	id: idColumn(),

	name:
		varchar("name", {
			length: 64
		})
			.default('')
			.notNull(),

	value:
		varchar("value", {
			length: 64
		})
			.default('')
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	unique: unique().on(table.name)
}));

export const shops = mysqlTable("shops", {
	id: idColumn(),

	name:
		varchar("name", {
			length: 64
		})
			.default("None")
			.notNull(),

	isLimited:
		boolean("is_limited")
			.default(false)
			.notNull(),

	isHouseType:
		boolean("is_house_type")
			.default(false)
			.notNull(),

	isUpgradeOnly:
		boolean("is_upgrade_only")
			.default(false)
			.notNull(),

	isStaffOnly:
		boolean("is_staff_only")
			.default(false)
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	unique: unique().on(table.name)
}));

export const shopsRelations = relations(shops, ({ many }) => ({
	items: many(shopsItems),
	areas: many(shopsAreas),
}));

export const shopsAreas = mysqlTable("shops_areas", {
	id: idColumn(),

	shopId: shopIdColumn,

	areaId: areaIdColumn,

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	unique: unique().on(table.shopId, table.areaId)
}));

export const shopsAreasRelations = relations(shopsAreas, ({ one }) => ({
	shop: one(shops, {
		fields: [shopsAreas.shopId],
		references: [shops.id],
	}),
	area: one(areas, {
		fields: [shopsAreas.areaId],
		references: [areas.id],
	}),
}));

export const shopsItems = mysqlTable("shops_items", {
	id: idColumn(),

	shopId: shopIdColumn,

	itemId: itemIdColumn(),

	quantityRemain:
		int("quantity_remain", {
			unsigned: true
		})
			.default(0)
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	unique: unique().on(table.shopId, table.itemId)
}));

export const shopsItemsRelations = relations(shopsItems, ({ one }) => ({
	shop: one(shops, {
		fields: [shopsItems.shopId],
		references: [shops.id],
	}),
	item: one(items, {
		fields: [shopsItems.itemId],
		references: [items.id],
	}),
}));

export const skills = mysqlTable("skills", {
	id: idColumn(),

	name:
		varchar("name", {
			length: 64
		})
			.default("banaNa")
			.notNull(),

	description:
		text("description")
			.default('A basic attack, taught to all adventurers.')
			.notNull(),

	icon:
		varchar("icon", {
			length: 64
		})
			.default('iwd1')
			.notNull(),

	damage:
		decimal("damage", {
			precision: 7,
			scale: 2
		})
			.default('2.00')
			.notNull(),

	mana:
		smallint("mana", {
			unsigned: true
		})
			.default(25)
			.notNull(),

	cooldown:
		int("cooldown", {
			unsigned: true
		})
			.default(10000)
			.notNull(),

	range:
		smallint("range", {
			unsigned: true
		})
			.default(100)
			.notNull(),

	reference:
		mysqlEnum('reference', ['aa', 'a1', 'a2', 'a3', 'a4', 'p1', 'p2', 'i1'])
			.default("aa")
			.notNull(),

	type:
		mysqlEnum('type', ['aa', 'passive', 'i', 'p', 'm', 'mp', 'pm'])
			.default("p")
			.notNull(),

	target: targetEnum,

	animation:
		varchar("animation", {
			length: 64
		})
			.default('Attack1,PetAttack1,Attack2')
			.notNull(),

	effectName:
		varchar("effect_name", {
			length: 32
		})
			.default("")
			.notNull(),

	effectType:
		mysqlEnum('effect_type', ['', 'w', 'p', 'c'])
			.default("")
			.notNull(),

	hitTargets:
		tinyint("hit_targets", {
			unsigned: true
		})
			.default(1)
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
});

export const skillsRelations = relations(skills, ({ many }) => ({
	classesSkills: many(classesSkills),
	auras: many(skillsAuras),
}));

export const skillsAuras = mysqlTable("skills_auras", {
	id: idColumn(),

	name:
		varchar("name", {
			length: 64
		})
			.default('banaNa')
			.notNull(),

	skillId: skillIdColumn,

	target: targetEnum,

	maxStack:
		tinyint("max_stack", {
			unsigned: true
		})
			.default(1)
			.notNull(),

	duration:
		int("duration", {
			unsigned: true
		})
			.default(10)
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
});

export const skillsAurasRelations = relations(skillsAuras, ({ one, many }) => ({
	skill: one(skills, {
		fields: [skillsAuras.skillId],
		references: [skills.id],
	}),

	effects: many(skillsAurasEffects),
}));

export const skillsAurasEffects = mysqlTable("skills_auras_effects", {
	id: idColumn(),

	skillAuraId:
		int("skill_aura_id", {
			unsigned: true
		})
			.notNull()
			.references((): AnyMySqlColumn => skillsAuras.id, {
				onDelete: "cascade",
				onUpdate: "cascade"
			}),

	typeStatId:
		int("type_stat_id", {
			unsigned: true
		})
			.notNull()
			.references((): AnyMySqlColumn => typesStats.id, {
				onDelete: "restrict",
				onUpdate: "cascade"
			}),

	target: targetEnum,

	value:
		decimal("value", {
			precision: 7,
			scale: 2
		})
			.default('0.00')
			.notNull(),

	type:
		mysqlEnum('type', ['+', '-', '*'])
			.default("+")
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
});

export const skillsAurasEffectsRelations = relations(skillsAurasEffects, ({ one }) => ({
	skillAura: one(skillsAuras, {
		fields: [skillsAurasEffects.skillAuraId],
		references: [skillsAuras.id],
	}),
	typeStat: one(typesStats, {
		fields: [skillsAurasEffects.typeStatId],
		references: [typesStats.id],
	})
}));

export const typesElements = mysqlTable("types_elements", {
	id: idColumn(),

	name:
		varchar("name", {
			length: 64
		})
			.default('')
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	unique: unique().on(table.name)
}));

export const typesItems = mysqlTable("types_items", {
	id: idColumn(),

	name:
		varchar("name", {
			length: 64
		})
			.default('')
			.notNull(),

	equipment:
		varchar("equipment", {
			length: 64
		})
			.default('')
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	unique: unique().on(table.name, table.equipment)
}));

export const typesRaces = mysqlTable("types_races", {
	id: idColumn(),

	name:
		varchar("name", {
			length: 64
		})
			.default('')
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	unique: unique().on(table.name)
}));

export const typesRarities = mysqlTable("types_rarities", {
	id: idColumn(),

	name:
		varchar("name", {
			length: 64
		})
			.default('')
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	unique: unique().on(table.name)
}));

export const typesStats = mysqlTable("types_stats", {
	id: idColumn(),

	name:
		varchar("name", {
			length: 64
		})
			.default('')
			.notNull(),

	stat:
		char("stat", {
			length: 3
		})
			.default('')
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	unique: unique().on(table.name)
}));

export const users = mysqlTable("users", {
	id: idColumn(),

	username:
		varchar("username", {
			length: 32
		})
			.default("banaNa")
			.notNull(),

	password:
		varchar("password", {
			length: 64
		})
			.notNull(),

	token:
		varchar("token", {
			length: 64
		})
			.default('null'),

	email:
		varchar("email", {
			length: 64
		})
			.default('bn@banaNa.bn')
			.notNull(),

	accessId:
		int("access_id", {
			unsigned: true
		})
			.default(0)
			.notNull()
			.references((): AnyMySqlColumn => accesses.id, {
				onDelete: "restrict",
				onUpdate: "cascade"
			}),

	countryCode:
		char("country_code", {
			length: 2
		})
			.default('XX')
			.notNull()
			.references((): AnyMySqlColumn => countries.code, {
				onDelete: "restrict",
				onUpdate: "cascade"
			}),

	level: levelColumn(),

	coins:
		int("coins", {
			unsigned: false
		})
			.default(0)
			.notNull(),

	gold:
		int("gold", {
			unsigned: false
		})
			.default(0)
			.notNull(),

	experience:
		int("experience", {
			unsigned: true
		})
			.default(0)
			.notNull(),

	guildId:
		int("guild_id", {
			unsigned: true
		})
			.references((): AnyMySqlColumn => guilds.id, {
				onDelete: "set default",
				onUpdate: "cascade"
			}),

	guildRank:
		tinyint("guild_rank", {
			unsigned: true
		})
			.default(1)
			.notNull(),

	activationFlag:
		tinyint("activation_flag", {
			unsigned: true
		})
			.default(5)
			.notNull(),

	isPermanentMute:
		boolean("is_permanent_mute")
			.default(false)
			.notNull(),

	lastArea:
		varchar("last_area", {
			length: 64
		})
			.default('yulgar-1|Enter|Spawn')
			.notNull(),

	currentArea:
		varchar("current_area", {
			length: 64
		})
			.default('yulgar-1|Enter|Spawn')
			.notNull(),

	currentServerId:
		int("current_server_id", {
			unsigned: true
		})
			.default(sql`null`)
			.references((): AnyMySqlColumn => servers.id, {
				onDelete: "set null",

				onUpdate: "cascade"
			}),

	hairId:
		int("hair_id", {
			unsigned: true
		})
			.notNull()
			.references((): AnyMySqlColumn => hairs.id, {
				onDelete: "restrict",
				onUpdate: "cascade"
			}),

	colorSkin:
		char("color_skin", {
			length: 6
		})
			.default('eacd8a')
			.notNull(),

	colorEye:
		char("color_eye", {
			length: 6
		})
			.default('1649e')
			.notNull(),

	colorHair:
		char("color_hair", {
			length: 6
		})
			.default('5e4f37')
			.notNull(),

	colorBase:
		char("color_base", {
			length: 6
		})
			.default('000000')
			.notNull(),

	colorTrim:
		char("color_trim", {
			length: 6
		})
			.default('000000')
			.notNull(),

	colorAccessory:
		char("color_accessory", {
			length: 6
		})
			.default('000000')
			.notNull(),

	slotsBag:
		smallint("slots_bag", {
			unsigned: true
		})
			.default(30)
			.notNull(),

	slotsBank:
		smallint("slots_bank", {
			unsigned: true
		})
			.default(0)
			.notNull(),
	slotsHouse:
		smallint("slots_house", {
			unsigned: true
		})
			.default(0)
			.notNull(),

	quests1:
		char("quests_1", {
			length: 100
		})
			.default('0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000')
			.notNull(),

	quests2:
		char("quests_2", {
			length: 100
		})
			.default('0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000')
			.notNull(),

	quests3:
		char("quests_3", {
			length: 100
		})
			.default('0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000')
			.notNull(),

	quests4:
		char("quests_4", {
			length: 100
		})
			.default('0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000')
			.notNull(),

	quests5:
		char("quests_5", {
			length: 100
		})
			.default('0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000')
			.notNull(),

	quests6:
		char("quests_6", {
			length: 100
		})
			.default('0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000')
			.notNull(),

	dailyQuests0:
		smallint("daily_quests_0", {
			unsigned: true
		})
			.default(0)
			.notNull(),

	dailyQuests1:
		smallint("daily_quests_1", {
			unsigned: true
		})
			.default(0)
			.notNull(),

	dailyQuests2:
		smallint("daily_quests_2", {
			unsigned: true
		})
			.default(0)
			.notNull(),

	monthlyQuests0:
		smallint("monthly_quests_0", {
			unsigned: true
		})
			.default(0)
			.notNull(),

	achievement:
		smallint("achievement", {
			unsigned: true
		})
			.default(0)
			.notNull(),

	settings:
		smallint("settings", {
			unsigned: true
		})
			.default(0)
			.notNull(),

	houseInfo:
		text("house_info")
			.default('')
			.notNull(),

	killCount:
		int("kill_count", {
			unsigned: true
		})
			.default(0)
			.notNull(),

	deathCount:
		int("death_count", {
			unsigned: true
		})
			.default(0)
			.notNull(),

	dateClassPointBoostExpire: dateColumn('date_class_point_boost_expire'),

	dateReputationBoostExpire: dateColumn('date_reputation_boost_expire'),

	dateCoinsBoostExpire: dateColumn('date_coins_boost_expire'),

	dateGoldBoostExpire: dateColumn('date_gold_boost_expire'),

	dateExperienceBoostExpire: dateColumn('date_experience_boost_expire'),

	dateUpgradeExpire: dateColumn('date_upgrade_expire'),

	dateLastLogin: dateColumn('date_last_login'),

	dateBirth: dateColumn('date_birth'),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	index: index("users_username_token_index").on(table.username, table.token),
	index2: index("users_username_password_index").on(table.username, table.password),
	index3: index("users_email_index").on(table.email),
	uniqueIndex: uniqueIndex("users_username_unique_index").on(table.username),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
	access: one(accesses, {
		fields: [users.accessId],
		references: [accesses.id],
	}),
	settingLevel: one(settingsLevels, {
		fields: [users.level],
		references: [settingsLevels.level],
	}),
	guild: one(guilds, {
		fields: [users.guildId],
		references: [guilds.id],
	}),
	currentServer: one(servers, {
		fields: [users.currentServerId],
		references: [servers.id],
	}),
	hair: one(hairs, {
		fields: [users.hairId],
		references: [hairs.id],
	}),

	factions: many(usersFactions),
	friends: many(usersFriends),
	inventory: many(usersInventory),
	logs: many(usersLogs),
}));

export const usersFactions = mysqlTable("users_factions", {
	id: idColumn(),

	userId: userIdColumn(),

	factionId:
		int("faction_id", {
			unsigned: true
		})
			.notNull()
			.references((): AnyMySqlColumn => factions.id, {
				onDelete: "cascade",
				onUpdate: "cascade"
			}),

	reputation:
		mediumint("reputation", {
			unsigned: true
		})
			.default(0)
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	unique: unique("users_factions_user_id_faction_id_index").on(table.userId, table.factionId),
}));

export const usersFactionsRelations = relations(usersFactions, ({ one }) => ({
	user: one(users, {
		fields: [usersFactions.userId],
		references: [users.id],
	}),
	faction: one(factions, {
		fields: [usersFactions.factionId],
		references: [factions.id],
	}),
}));

export const usersFriends = mysqlTable("users_friends", {
	id: idColumn(),

	userId: userIdColumn(),

	friendId: userIdColumn(`friend_id`),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	unique: unique().on(table.userId, table.friendId),
}));

export const usersFriendsRelations = relations(usersFriends, ({ one }) => ({
	user: one(users, {
		fields: [usersFriends.userId],
		references: [users.id],
	}),
	friend: one(users, {
		fields: [usersFriends.friendId],
		references: [users.id],
	}),
}));

export const usersInventory = mysqlTable("users_inventory", {
	id: idColumn(),

	userId: userIdColumn(),

	itemId: itemIdColumn(),

	enhancementId: enhancementIdColumn,

	quantity:
		mediumint("quantity", {
			unsigned: true
		})
			.default(1)
			.notNull(),

	isEquipped:
		boolean("is_equipped")
			.default(false)
			.notNull(),

	isOnBank:
		boolean("is_on_bank")
			.default(false)
			.notNull(),

	dateDeleted: dateDeletedColumn,

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
}, (table) => ({
	unique: unique().on(table.userId, table.itemId),
}));

export const usersInventoryRelations = relations(usersInventory, ({ one }) => ({
	user: one(users, {
		fields: [usersInventory.userId],
		references: [users.id],
	}),
	item: one(items, {
		fields: [usersInventory.itemId],
		references: [items.id],
	}),
	enhancement: one(enhancements, {
		fields: [usersInventory.enhancementId],
		references: [enhancements.id],
	}),
}));

export const usersLogs = mysqlTable("users_logs", {
	id: idColumn(),

	userId: userIdColumn(),

	details:
		text("details")
			.default('None')
			.notNull(),

	dateUpdated: dateUpdatedColumn,

	dateCreated: dateCreatedColumn,
});

export const usersLogsRelations = relations(usersLogs, ({ one }) => ({
	user: one(users, {
		fields: [usersLogs.userId],
		references: [users.id],
	}),
}));