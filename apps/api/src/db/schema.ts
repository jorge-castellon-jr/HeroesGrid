import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

// Users (for authentication and profile)
export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    discordId: text("discord_id").notNull().unique(),
    username: text("username").notNull(),
    discriminator: text("discriminator"),
    avatar: text("avatar"),
    email: text("email"),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
      () => new Date()
    ),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdateFn(
      () => new Date()
    ),
    lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
  },
  (table) => ({
    discordIdIdx: index("discord_id_idx").on(table.discordId),
    usernameIdx: index("username_idx").on(table.username),
  })
);

// Sessions (for authentication)
export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
      () => new Date()
    ),
  },
  (table) => ({
    userIdIdx: index("session_user_id_idx").on(table.userId),
    tokenIdx: index("session_token_idx").on(table.token),
  })
);

// User Settings
export const userSettings = sqliteTable(
  "user_settings",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    theme: text("theme").default("system"), // light, dark, system
    emailNotifications: integer("email_notifications", {
      mode: "boolean",
    }).default(true),
    publicProfile: integer("public_profile", { mode: "boolean" }).default(
      false
    ),
    preferences: text("preferences"), // JSON object for additional settings
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
      () => new Date()
    ),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdateFn(
      () => new Date()
    ),
  },
  (table) => ({
    userIdIdx: index("user_settings_user_id_idx").on(table.userId),
  })
);

// Custom Rangers (User-created rangers)
export const customRangers = sqliteTable(
  "custom_rangers",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    title: text("title"),
    cardTitle: text("card_title"),
    color: text("color").notNull(), // red, blue, yellow, black, pink, green, white, gold, silver, purple, orange
    type: text("type").notNull(), // core, sixth, extra, ally
    abilityName: text("ability_name").notNull(),
    ability: text("ability").notNull(),
    deck: text("deck").notNull(), // JSON array of card objects
    extraCharacters: text("extra_characters"), // JSON array for extra characters
    teamId: text("team_id"), // Reference to official team (stored in WatermelonDB)
    customTeamName: text("custom_team_name"),
    teamPosition: integer("team_position"),
    published: integer("published", { mode: "boolean" })
      .notNull()
      .default(false),
    views: integer("views").default(0),
    likes: integer("likes").default(0),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
      () => new Date()
    ),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdateFn(
      () => new Date()
    ),
  },
  (table) => ({
    userIdIdx: index("custom_rangers_user_id_idx").on(table.userId),
    slugIdx: index("custom_rangers_slug_idx").on(table.slug),
    publishedIdx: index("custom_rangers_published_idx").on(table.published),
    colorIdx: index("custom_rangers_color_idx").on(table.color),
    typeIdx: index("custom_rangers_type_idx").on(table.type),
  })
);

// Custom Ranger Likes (for tracking who liked what)
export const customRangerLikes = sqliteTable(
  "custom_ranger_likes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    customRangerId: text("custom_ranger_id")
      .notNull()
      .references(() => customRangers.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
      () => new Date()
    ),
  },
  (table) => ({
    userRangerIdx: index("likes_user_ranger_idx").on(
      table.userId,
      table.customRangerId
    ),
  })
);
