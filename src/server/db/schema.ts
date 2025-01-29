// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  timestamp,
  varchar,
  serial,
  text,
  boolean,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `eucgames_${name}`);

/**
 * Example table from Drizzle documentation
 * TODO: Remove if not needed for the application
 */
export const posts = createTable(
  "post",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),
  }),
);

/**
 * Generic scores table for storing game results
 * Used by: Snake or games without specific score requirements
 */
export const scores = createTable("scores", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: text("userId").notNull(),
  username: text("username").notNull(),
  score: integer("score").notNull(),
  game: varchar("game", { length: 256 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/**
 * Specialized scores table for the Memory Game
 * Used by: Memory Game
 * Stores detailed game results including tries, completion time, difficulty level, and game mode
 */
export const scoresMemory = createTable("scores_memory", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: text("userId").notNull(),
  username: text("username").notNull(),
  tries: integer("tries").notNull(),
  time: integer("time").notNull(),
  difficulty: varchar("difficulty", { length: 10 }).notNull(),
  gameMode: varchar("gameMode", { length: 20 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/**
 * User feedback and bug report table
 * Used by: Feedback system across all games
 * Stores user submitted feedback with title, comment, and categorization tags
 */
export const feedback = createTable("feedback", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: text("userId").notNull(),
  username: text("username").notNull(),
  title: text("title").notNull(),
  comment: text("comment").notNull(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/**
 * Social comments table for Snake game
 * Used by: Snake Game
 * Stores user comments and interactions specific to the Snake game
 */
export const snakeSocial = createTable("snake_social", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: text("userId").notNull(),
  username: text("username").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/**
 * Rock Paper Scissors games table
 * Used by: Rock Paper Scissors Game
 * Stores game results including player choices, winner, and completion status
 */
export const RPSgames = createTable("rock_paper_scissors_games", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  player1Id: text("player1_id").notNull(),
  player2Id: text("player2_id"), // Null until a second player joins
  player1Choice: text("player1_choice").notNull(), // 'rock', 'paper', 'scissors'
  player2Choice: text("player2_choice"), // Null until player 2 picks
  winnerId: text("winner_id"), // Null until match is decided
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
