import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  numeric,
  smallint,
} from "drizzle-orm/pg-core";

// users
export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(), // external auth id (use text to match external auth providers)
  displayName: text("display_name").notNull(),
  email: text("email").notNull().unique(),
  password:text("password"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* recipes */
export const recipesTable = pgTable("recipes", {
  id: serial("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  servings: text("servings"),
  prepTime: text("prep_time"),
  cookTime: text("cook_time"),
  totalTime: text("total_time"),
  difficulty: text("difficulty"),
  notes: text("notes"),
  isPublic: boolean("is_public").default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const favoritesTable = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(()=>usersTable.id),
  recipeId: integer("recipe_id").notNull().references(()=>recipesTable.id),
  title: text("title").notNull(),
  image: text("image"),
  cookTime: text("cook_time"),
  servings: text("servings"),
  createdAt: timestamp("created_at").defaultNow(),
});
