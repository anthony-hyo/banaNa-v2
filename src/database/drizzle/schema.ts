import {
    type AnyMySqlColumn,
    boolean,
    char,
    decimal,
    double,
    index,
    int,
    mediumint,
    type MySqlColumnBuilderBase,
    mysqlEnum,
    mysqlTable,
    smallint,
    text,
    timestamp,
    tinyint,
    unique,
    varchar
} from "drizzle-orm/mysql-core"
import {relations} from "drizzle-orm";

const combatCategory: MySqlColumnBuilderBase = mysqlEnum('category', ['M1', 'M2', 'M3', 'M4', 'C1', 'C2', 'C3', 'S1'])
    .default("M1")
    .notNull();

const genderEnum: MySqlColumnBuilderBase = mysqlEnum('gender', ['M', 'F'])
    .default("M")
    .notNull();

export const classes = mysqlTable("classes", {
    id: int("id", { unsigned: true })
        .primaryKey()
        .autoincrement().notNull(),

    itemId: int("item_id", { unsigned: true })
        .notNull()
        .references((): AnyMySqlColumn => items.id, {
            onDelete: "cascade",
            onUpdate: "cascade"
        }),

    category: combatCategory,

    description: text("description")
        .notNull(),

    manaRegenerationMethods: text("ManaRegenerationMethods")
        .notNull(),

    statsDescription: text("StatsDescription")
        .notNull(),
});

export const enhancements = mysqlTable("enhancements", {
    id: int("id", { unsigned: true }).autoincrement().primaryKey().notNull(),
    name: varchar("name", { length: 32 }).default("None").notNull(),
    patternId: int("pattern_id", { unsigned: true }).default(1).notNull().references(() => enhancementsPatterns.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),
    rarity: tinyint("rarity", { unsigned: true }).notNull(),
    damage_per_second: smallint("damage_per_second", { unsigned: true }).notNull(),
    level: tinyint("level", { unsigned: true }).default(1).notNull(),
});

export const enhancementsRelations = relations(enhancements, ({ one }) => ({
    pattern: one(enhancementsPatterns, {
        fields: [enhancements.patternId],
        references: [enhancementsPatterns.id],
    }),
}));

export const enhancementsPatterns = mysqlTable("enhancements_patterns", {
    id: int("id", { unsigned: true }).autoincrement().primaryKey().notNull(),
    name: varchar("name", { length: 32 }).default("None").notNull(),
    category: combatCategory,
    wisdom: tinyint("wisdom", { unsigned: true }).default(10).notNull(),
    strength: tinyint("strength", { unsigned: true }).default(10).notNull(),
    luck: tinyint("luck", { unsigned: true }).default(10).notNull(),
    dexterity: tinyint("dexterity", { unsigned: true }).default(10).notNull(),
    endurance: tinyint("endurance", { unsigned: true }).default(10).notNull(),
    intelligence: tinyint("intelligence", { unsigned: true }).default(10).notNull(),
});

export const enhancementsPatternsRelations = relations(enhancementsPatterns, ({
                                                                                  one,
                                                                                  many
                                                                              }) => ({
    enhancements: many(enhancementsPatterns),
}));

export const factions = mysqlTable("factions", {
    id: int("id", { unsigned: true }).autoincrement().primaryKey().notNull(),
    name: varchar("name", { length: 20 }).notNull(),
});

export const guilds = mysqlTable("guilds", {
    id: int("id", { unsigned: true }).autoincrement().primaryKey().notNull(),
    name: varchar("name", { length: 64 }).notNull(),
    messageOfTheDay: varchar("MessageOfTheDay", { length: 512 }).notNull(),
    maxMembers: tinyint("MaxMembers", { unsigned: true }).default(15).notNull(),
    hallSize: tinyint("HallSize", { unsigned: true }).default(1).notNull(),
    lastUpdated: timestamp("LastUpdated", { mode: 'string' }).onUpdateNow().notNull(),
});

export const guildsHalls = mysqlTable("guilds_halls", {
    id: int("id", { unsigned: true }).autoincrement().primaryKey().notNull(),
    guildId: int("GuildID", { unsigned: true }).notNull().references(() => guilds.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),
    linkage: varchar("Linkage", { length: 64 }).notNull(),
    cell: varchar("Cell", { length: 16 }).notNull(),
    x: double("X", {
        precision: 7,
        scale: 2
    }).notNull(),
    y: double("Y", {
        precision: 7,
        scale: 2
    }).notNull(),
    interior: text("Interior").notNull(),
});

export const guildsHallsBuildings = mysqlTable("guilds_halls_buildings", {
    id: int("id", { unsigned: true })
        .autoincrement()
        .primaryKey()
        .notNull(),

    hallId: int("HallID", { unsigned: true })
        .notNull()
        .references(() => guildsHalls.id, {
            onDelete: "cascade",
            onUpdate: "cascade"
        }),

    itemId: int("item_id", { unsigned: true })
        .notNull()
        .references(() => items.id, {
            onDelete: "cascade",
            onUpdate: "cascade"
        }),

    slot: tinyint("Slot", { unsigned: true })
        .default(1)
        .notNull(),

    size: tinyint("Size", { unsigned: true })
        .default(1)
        .notNull(),
});

export const guildsHallsConnections = mysqlTable("guilds_halls_connections", {
    id: int("id", { unsigned: true })
        .autoincrement()
        .primaryKey()
        .notNull(),

    hallId: int("HallID", { unsigned: true })
        .notNull()
        .references(() => guildsHalls.id, {
            onDelete: "cascade",
            onUpdate: "cascade"
        }),

    pad: varchar("Pad", { length: 16 })
        .notNull(),

    cell: varchar("Cell", { length: 16 })
        .notNull(),

    padPosition: varchar("PadPosition", { length: 16 })
        .notNull(),
});

export const guildsInventory = mysqlTable("guilds_inventory", {
    id: int("id", { unsigned: true })
        .autoincrement()
        .primaryKey()
        .notNull(),

    guildId: int("GuildID", { unsigned: true })
        .notNull()
        .references(() => guilds.id, {
            onDelete: "cascade",
            onUpdate: "cascade"
        }),

    itemId: int("item_id", { unsigned: true })
        .notNull()
        .references(() => items.id, {
            onDelete: "cascade",
            onUpdate: "cascade"
        }),

    userId: int("user_id", { unsigned: true })
        .notNull()
        .references(() => users.id, {
            onDelete: "cascade",
            onUpdate: "cascade"
        }),
});

export const hairs = mysqlTable("hairs", {
    id: int("id", { unsigned: true }).autoincrement().primaryKey().notNull(),
    gender: genderEnum,
    name: varchar("name", { length: 16 }).notNull(),
    file: varchar("file", { length: 64 }).notNull(),
});

export const hairsShops = mysqlTable("hairs_shops", {
    id: int("id", { unsigned: true }).autoincrement().primaryKey().notNull(),
    name: varchar("name", { length: 32 }).default('').notNull(),
});

export const hairsShopsItems = mysqlTable("hairs_shops_items", {
    gender: genderEnum,
    shopId: int("shop_id", { unsigned: true }).notNull().references(() => hairsShops.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),
    hairId: int("hair_id", { unsigned: true }).notNull().references(() => hairs.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),
});

export const items = mysqlTable("items", {
    id: int("id", { unsigned: true }).autoincrement().primaryKey().notNull(),
    name: varchar("name", { length: 60 }).notNull(),
    description: text("description").notNull(),
    type: varchar("Type", { length: 16 }).notNull(),
    element: varchar("Element", { length: 16 }).default('None').notNull(),
    file: varchar("file", { length: 64 }).notNull(),
    link: varchar("Link", { length: 64 }).notNull(),
    icon: varchar("Icon", { length: 16 }).notNull(),
    equipment: varchar("Equipment", { length: 6 }).notNull(),
    level: tinyint("Level", { unsigned: true }).default(1).notNull(),
    dps: smallint("DPS", { unsigned: true }).default(100).notNull(),
    range: smallint("Range", { unsigned: true }).default(100).notNull(),
    rarity: tinyint("Rarity", { unsigned: true }).default(10).notNull(),
    cost: int("Cost", { unsigned: true }).default(0).notNull(),
    quantity: smallint("Quantity", { unsigned: true }).default(1).notNull(),
    stack: smallint("Stack", { unsigned: true }).default(1).notNull(),
    coins: boolean("Coins").default(false).notNull(),
    temporary: boolean("Temporary").default(false).notNull(),
    upgrade: boolean("Upgrade").default(false).notNull(),
    staff: boolean("Staff").default(false).notNull(),
    enhId: int("EnhID", { unsigned: true }).default(0).notNull().references(() => enhancements.id, {
        onDelete: "restrict",
        onUpdate: "restrict"
    }),
    factionId: int("FactionID", { unsigned: true }).default(1).notNull().references(() => factions.id, {
        onDelete: "restrict",
        onUpdate: "restrict"
    }),
    reqReputation: mediumint("ReqReputation", { unsigned: true }).notNull(),
    reqClassId: int("ReqClassID", { unsigned: true }).default(0).notNull().references((): AnyMySqlColumn => classes.id, {
        onDelete: "restrict",
        onUpdate: "restrict"
    }),
    reqClassPoints: mediumint("ReqClassPoints", { unsigned: true }).notNull(),
    reqQuests: varchar("ReqQuests", { length: 64 }).default('').notNull(),
    questStringIndex: tinyint("QuestStringIndex").default(-1).notNull(),
    questStringValue: tinyint("QuestStringValue").default(0).notNull(),
    meta: varchar("Meta", { length: 32 }).default('NULL'),
});


export const itemsRelations = relations(items, ({ many }) => ({
    requirements: many(itemsRequirements),
}));

export const itemsRequirements = mysqlTable("items_requirements", {
    itemId: int("item_id", { unsigned: true })
        .notNull()
        .references(() => items.id, {
            onDelete: "cascade",
            onUpdate: "cascade"
        }),

    requiredItemId: int("required_item_id", { unsigned: true })
        .notNull()
        .references(() => items.id, {
            onDelete: "cascade",
            onUpdate: "cascade"
        }),

    quantity: smallint("quantity", { unsigned: true })
        .notNull(),
});

export const itemsRequirementsRelations = relations(itemsRequirements, ({ one }) => ({
    item: one(items, {
        fields: [itemsRequirements.itemId],
        references: [items.id],
    })
}));

export const maps = mysqlTable("maps", {
    id: int("id", { unsigned: true }).autoincrement().primaryKey().notNull(),
    name: varchar("name", { length: 32 }).default("None").notNull(),
    file: varchar("file", { length: 128 }).notNull(),
    maxPlayers: tinyint("MaxPlayers", { unsigned: true }).default(6).notNull(),
    reqLevel: tinyint("ReqLevel", { unsigned: true }).default(0).notNull(),
    upgrade: boolean("Upgrade").default(false).notNull(),
    staff: boolean("Staff").default(false).notNull(),
    pvP: boolean("PvP").default(false).notNull(),
});

export const mapsCells = mysqlTable("maps_cells", {
    id: int("id", { unsigned: true }).autoincrement().primaryKey().notNull(),
    mapId: int("MapID", { unsigned: true }).notNull().references(() => maps.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),
    frame: varchar("Frame", { length: 16 }).notNull(),
    pad: varchar("Pad", { length: 16 }).notNull(),
});

export const mapsItems = mysqlTable("maps_items", {
    mapId: int("MapID", { unsigned: true }).notNull().references(() => maps.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),
    itemId: int("item_id", { unsigned: true }).notNull().references(() => items.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),
});

export const mapsMonsters = mysqlTable("maps_monsters", {
    mapId: int("MapID", { unsigned: true }).notNull().references(() => maps.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),
    monsterId: int("MonsterID", { unsigned: true }).notNull().references(() => monsters.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),
    monMapId: int("MonMapID", { unsigned: true }).notNull(),
    frame: varchar("Frame", { length: 16 }).notNull(),
});

export const monsters = mysqlTable("monsters", {
    id: int("id", { unsigned: true }).autoincrement().primaryKey().notNull(),
    name: varchar("name", { length: 16 }).notNull(),
    race: varchar("Race", { length: 16 }).notNull(),
    file: varchar("file", { length: 128 }).notNull(),
    linkage: varchar("Linkage", { length: 32 }).notNull(),
    element: varchar("Element", { length: 8 }).notNull(),
    level: tinyint("Level", { unsigned: true }).default(1).notNull(),
    health: int("Health", { unsigned: true }).default(1000).notNull(),
    mana: int("Mana", { unsigned: true }).default(100).notNull(),
    gold: int("Gold", { unsigned: true }).default(100).notNull(),
    experience: int("Experience", { unsigned: true }).default(100).notNull(),
    reputation: int("Reputation", { unsigned: true }).default(100).notNull(),
    dps: int("DPS", { unsigned: true }).default(100).notNull(),
    teamId: tinyint("TeamID", { unsigned: true }).default(0).notNull(),
});

export const monstersDrops = mysqlTable("monsters_drops", {
    monsterId: int("MonsterID", { unsigned: true })
        .notNull()
        .references(() => monsters.id, {
            onDelete: "cascade",
            onUpdate: "cascade"
        }),

    itemId: int("item_id", { unsigned: true })
        .notNull()
        .references(() => items.id, {
            onDelete: "cascade",
            onUpdate: "cascade"
        }),

    chance: decimal("Chance", {
        precision: 7,
        scale: 2
    })
        .default('1.00')
        .notNull(),

    quantity: int("Quantity", { unsigned: true })
        .default(1)
        .notNull(),
});

export const quests = mysqlTable("quests", {
    id: int("id", { unsigned: true }).autoincrement().primaryKey().notNull(),
    factionId: int("FactionID", { unsigned: true }).default(1).notNull().references(() => factions.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),
    reqReputation: int("ReqReputation", { unsigned: true }).default(0).notNull(),
    reqClassId: int("ReqClassID", { unsigned: true }).default(0).references(() => classes.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),
    reqClassPoints: int("ReqClassPoints", { unsigned: true }).default(0).notNull(),
    name: varchar("name", { length: 64 }).notNull(),
    description: text("description").notNull(),
    endText: text("EndText").notNull(),
    experience: int("Experience", { unsigned: true }).default(0).notNull(),
    gold: int("Gold", { unsigned: true }).default(0).notNull(),
    reputation: int("Reputation", { unsigned: true }).default(0).notNull(),
    classPoints: int("ClassPoints", { unsigned: true }).default(0).notNull(),
    rewardType: char("RewardType", { length: 1 }).default('S').notNull(),
    level: boolean("Level").default(true).notNull(),
    upgrade: boolean("Upgrade").default(false).notNull(),
    once: boolean("Once").default(false).notNull(),
    slot: int("Slot").default(-1).notNull(),
    value: int("Value").default(0).notNull(),
    field: char("Field", { length: 3 }).default('').notNull(),
    index: int("Index").default(-1).notNull(),
});

export const questsChain = mysqlTable("quests_chains", {
    id: int("id", { unsigned: true }).autoincrement().primaryKey().notNull(),
    name: varchar("name", { length: 32 }).default('').notNull(),
});

export const questsLocations = mysqlTable("quests_locations", {
    questId: int("QuestID", { unsigned: true }).notNull().references(() => quests.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),
    mapId: int("MapID", { unsigned: true }).notNull().references(() => maps.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),
});

export const questsRequirements = mysqlTable("quests_requirements", {
    questId: int("QuestID", { unsigned: true }).notNull().references(() => quests.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),
    itemId: int("item_id", { unsigned: true }).notNull().references(() => items.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),
    quantity: int("Quantity", { unsigned: true }).default(1),
});

export const questsRewards = mysqlTable("quests_rewards", {
    id: int("id", { unsigned: true }).autoincrement().primaryKey().notNull(),
    questId: int("QuestID", { unsigned: true }).notNull().references(() => quests.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),
    itemId: int("item_id", { unsigned: true }).notNull().references(() => items.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),
    quantity: int("Quantity", { unsigned: true }).default(1).notNull(),
});

export const servers = mysqlTable("servers", {
    id: int("id", { unsigned: true }).autoincrement().primaryKey().notNull(),
    name: varchar("name", { length: 64 }).default('Server').notNull(),
    ip: char("IP", { length: 15 }).default('0.0.0.0').notNull(),
    online: boolean("Online").default(false).notNull(),
    upgrade: boolean("Upgrade").default(false).notNull(),
    chat: tinyint("Chat", { unsigned: true }).default(2).notNull(),
    count: mediumint("Count", { unsigned: true }).notNull(),
    max: mediumint("Max", { unsigned: true }).default(500).notNull(),
    motd: text("MOTD").notNull(),
});

export const settingsLogin = mysqlTable("settings_login", {
    id: int("id", { unsigned: true }).autoincrement().primaryKey().notNull(),

    name: varchar("name", { length: 64 })
        .default('')
        .notNull(),

    value: varchar("value", { length: 64 })
        .default('')
        .notNull(),
});

export const settingsCoreValues = mysqlTable("settings_core_values", {
    id: int("id", { unsigned: true })
        .autoincrement()
        .primaryKey()
        .notNull(),

    name: varchar("name", { length: 64 })
        .default('None')
        .notNull(),

    value: decimal("value", {
        precision: 7,
        scale: 2
    })
        .default('1')
        .notNull(),
});

export const shops = mysqlTable("shops", {
    id: int("id", { unsigned: true })
        .autoincrement()
        .primaryKey()
        .notNull(),

    name: varchar("name", { length: 32 }).default("None").notNull(),
    house: boolean("House").default(false).notNull(),
    upgrade: boolean("Upgrade").default(false).notNull(),
    staff: boolean("Staff").default(false).notNull(),
    limited: boolean("Limited").default(false).notNull(),
    field: varchar("Field", { length: 8 }).default('').notNull(),
});

export const shopsItems = mysqlTable("shops_items", {
    id: int("id", { unsigned: true }).autoincrement().primaryKey().notNull(),
    shopId: int("shop_id", { unsigned: true }).notNull().references(() => shops.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),
    itemId: int("item_id", { unsigned: true })
        .notNull()
        .references(() => items.id, {
            onDelete: "cascade",
            onUpdate: "cascade"
        }),
    quantityRemain: int("QuantityRemain", { unsigned: true }).default(0).notNull(),
});

export const shopsLocations = mysqlTable("shops_locations", {
    shopId: int("shop_id", { unsigned: true }).notNull().references(() => shops.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),
    mapId: int("MapID", { unsigned: true }).notNull().references(() => maps.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),
});

export const skills = mysqlTable("skills", {
        id: int("id", { unsigned: true }).autoincrement().primaryKey().notNull(),
        itemId: int("item_id", { unsigned: true }).notNull().references(() => items.id, {
            onDelete: "cascade",
            onUpdate: "cascade"
        }),
        auraId: int("AuraID", { unsigned: true }).notNull().references(() => skillsAuras.id, {
            onDelete: "cascade",
            onUpdate: "cascade"
        }),
        name: varchar("name", { length: 32 }).default("None").notNull(),
        animation: varchar("Animation", { length: 64 }).notNull(),
        description: text("description").notNull(),
        damage: decimal("Damage", {
            precision: 7,
            scale: 2
        }).default('1.00').notNull(),
        mana: smallint("Mana", { unsigned: true }).notNull(),
        icon: varchar("Icon", { length: 32 }).notNull(),
        range: smallint("Range", { unsigned: true }).default(808).notNull(),
        dsrc: varchar("Dsrc", { length: 16 }).notNull(),
        reference: char("Reference", { length: 2 }).notNull(),
        target: char("Target", { length: 1 }).notNull(),
        effects: char("Effects", { length: 1 }).notNull(),
        type: varchar("Type", { length: 7 }).notNull(),
        strl: varchar("Strl", { length: 32 }).notNull(),
        cooldown: int("Cooldown", { unsigned: true }).notNull(),
        hitTargets: tinyint("HitTargets", { unsigned: true }).default(1).notNull(),
    },
    (table) => {
        return {
            fkSkillsClassid: index("fk_skills_classid").on(table.itemId),
        }
    });

export const skillsAuras = mysqlTable("skills_auras", {
    id: int("id", { unsigned: true })
        .autoincrement()
        .primaryKey()
        .notNull(),

    name: varchar("name", { length: 32 })
        .notNull(),

    duration: tinyint("Duration", { unsigned: true })
        .default(6)
        .notNull(),

    category: varchar("Category", { length: 8 })
        .notNull(),

    damageIncrease: decimal("DamageIncrease", {
        precision: 7,
        scale: 2
    })
        .default('0.00')
        .notNull(),

    damageTakenDecrease: decimal("DamageTakenDecrease", {
        precision: 7,
        scale: 2
    })
        .default('0.00')
        .notNull(),
});

export const skillsAurasEffects = mysqlTable("skills_auras_effects", {
    id: int("id", { unsigned: true }).autoincrement().primaryKey().notNull(),
    auraId: int("AuraID", { unsigned: true }).notNull().references(() => skillsAuras.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),
    stat: char("Stat", { length: 3 }).notNull(),
    value: decimal("Value", {
        precision: 7,
        scale: 2
    }).default('0.00').notNull(),
    type: char("Type", { length: 1 }).default('+').notNull(),
});

export const users = mysqlTable("users", {
    id: int("id", { unsigned: true }).autoincrement().primaryKey().notNull(),
    name: varchar("name", { length: 32 }).default("None").notNull(),
    hash: char("Hash", { length: 17 }).notNull(),
    hairId: int("hair_id", { unsigned: true }).notNull().references(() => hairs.id, {
        onDelete: "restrict",
        onUpdate: "cascade"
    }),
    access: tinyint("Access", { unsigned: true }).default(1).notNull(),
    activationFlag: tinyint("ActivationFlag", { unsigned: true }).default(5).notNull(),
    permamuteFlag: boolean("PermamuteFlag").default(false).notNull(),
    country: char("Country", { length: 2 }).default('xx').notNull(),
    age: tinyint("Age", { unsigned: true }).notNull(),
    gender: genderEnum,
    email: varchar("Email", { length: 64 }).notNull(),
    level: tinyint("Level", { unsigned: true }).default(1).notNull(),
    gold: int("Gold", { unsigned: true }).default(0).notNull(),
    coins: int("Coins", { unsigned: true }).default(0).notNull(),
    exp: int("Exp", { unsigned: true }).default(0).notNull(),
    colorHair: char("ColorHair", { length: 6 }).default('000000').notNull(),
    colorSkin: char("ColorSkin", { length: 6 }).default('000000').notNull(),
    colorEye: char("ColorEye", { length: 6 }).default('000000').notNull(),
    colorBase: char("ColorBase", { length: 6 }).default('000000').notNull(),
    colorTrim: char("ColorTrim", { length: 6 }).default('000000').notNull(),
    colorAccessory: char("ColorAccessory", { length: 6 }).default('000000').notNull(),
    slotsBag: smallint("SlotsBag", { unsigned: true }).default(40).notNull(),
    slotsBank: smallint("SlotsBank", { unsigned: true }).notNull(),
    slotsHouse: smallint("SlotsHouse", { unsigned: true }).default(20).notNull(),
    dateCreated: timestamp('DateCreated', {
        mode: 'date',
        fsp: 3
    }).defaultNow().notNull(),
    lastLogin: timestamp('LastLogin', {
        mode: 'date',
        fsp: 3
    }).defaultNow().notNull(),
    cpBoostExpire: timestamp('CpBoostExpire', {
        mode: 'date',
        fsp: 3
    }).defaultNow().notNull(),
    repBoostExpire: timestamp('RepBoostExpire', {
        mode: 'date',
        fsp: 3
    }).defaultNow().notNull(),
    goldBoostExpire: timestamp('GoldBoostExpire', {
        mode: 'date',
        fsp: 3
    }).defaultNow().notNull(),
    expBoostExpire: timestamp('ExpBoostExpire', {
        mode: 'date',
        fsp: 3
    }).defaultNow().notNull(),
    upgradeExpire: timestamp('UpgradeExpire', {
        mode: 'date',
        fsp: 3
    }).defaultNow().notNull(),
    upgradeDays: smallint("UpgradeDays", { unsigned: true }).notNull(),
    upgraded: boolean("Upgraded").default(false).notNull(),
    achievement: smallint("Achievement", { unsigned: true }).notNull(),
    settings: smallint("Settings", { unsigned: true }).notNull(),
    quests: char("Quests", { length: 100 }).default('0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000').notNull(),
    quests2: char("Quests2", { length: 100 }).default('0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000').notNull(),
    dailyQuests0: smallint("DailyQuests0", { unsigned: true }).notNull(),
    dailyQuests1: smallint("DailyQuests1", { unsigned: true }).notNull(),
    dailyQuests2: smallint("DailyQuests2", { unsigned: true }).notNull(),
    monthlyQuests0: smallint("MonthlyQuests0", { unsigned: true }).notNull(),
    lastArea: varchar("LastArea", { length: 64 }).default('faroff-1|Enter|Spawn').notNull(),
    currentServer: varchar("CurrentServer", { length: 16 }).default('Offline').notNull(),
    houseInfo: text("HouseInfo").notNull(),
    killCount: int("KillCount", { unsigned: true }).default(0).notNull(),
    deathCount: int("DeathCount", { unsigned: true }).default(0).notNull(),
});

export const usersFactions = mysqlTable("users_factions", {
        id: int("id", { unsigned: true }).autoincrement().primaryKey().notNull(),
        userId: int("user_id", { unsigned: true }).notNull().references(() => users.id, {
            onDelete: "cascade",
            onUpdate: "cascade"
        }),
        factionId: int("FactionID", { unsigned: true }).notNull().references(() => factions.id, {
            onDelete: "cascade",
            onUpdate: "cascade"
        }),
        reputation: mediumint("Reputation", { unsigned: true }).notNull(),
    },
    (table) => {
        return {
            userId: unique("user_id").on(table.userId, table.factionId),
        }
    });

export const usersFriends = mysqlTable("users_friends", {
    userId: int("user_id", { unsigned: true }).notNull().references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),
    friendId: int("FriendID", { unsigned: true }).notNull().references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),
});

export const usersGuilds = mysqlTable("users_guilds", {
    guildId: int("GuildID", { unsigned: true }).notNull().references(() => guilds.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),
    userId: int("user_id", { unsigned: true }).notNull().references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),
    rank: tinyint("Rank", { unsigned: true }).default(1).notNull(),
});

export const usersItems = mysqlTable("users_items", {
        id: int("id", { unsigned: true }).autoincrement().primaryKey().notNull(),
        userId: int("user_id", { unsigned: true }).notNull().references(() => users.id, {
            onDelete: "cascade",
            onUpdate: "cascade"
        }),
        itemId: int("item_id", { unsigned: true }).notNull().references(() => items.id, {
            onDelete: "cascade",
            onUpdate: "cascade"
        }),
        enhId: int("EnhID", { unsigned: true }).notNull().references(() => enhancements.id, {
            onDelete: "restrict",
            onUpdate: "restrict"
        }),
        equipped: boolean("Equipped").notNull(),
        quantity: mediumint("Quantity", { unsigned: true }).notNull(),
        bank: boolean("Bank").notNull(),
        datePurchased: timestamp('DatePurchased', {
            mode: 'date',
            fsp: 3
        }).defaultNow().notNull(),
    },
    (table) => {
        return {
            uidItemid: index("uid_itemid").on(table.itemId, table.userId),
        }
    });

export const usersLogs = mysqlTable("users_logs", {
    id: int("id", { unsigned: true }).autoincrement().primaryKey().notNull(),
    userId: int("user_id", { unsigned: true }).notNull().references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),
    violation: varchar("Violation", { length: 64 }).notNull(),
    details: text("Details").notNull(),
});