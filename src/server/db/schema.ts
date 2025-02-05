// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  timestamp,
  varchar,
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
 * Stores game state and player information
 */
export const rpsGames = createTable("rps_games", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  gameId: varchar("gameId", { length: 36 }).notNull().unique(), // UUID for external reference
  creatorId: text("creatorId").notNull(),
  joinerId: text("joinerId"),
  status: varchar("status", { length: 20 }).notNull().default("WAITING"), // 'WAITING', 'IN_PROGRESS', 'COMPLETED'
  winnerId: text("winnerId"),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .$onUpdate(() => new Date())
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

/**
 * Rock Paper Scissors moves table
 * Used by: Rock Paper Scissors Game
 * Stores individual moves for each game
 */
export const rpsMoves = createTable("rps_moves", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  gameId: varchar("gameId", { length: 36 }).notNull(),
  playerId: text("playerId").notNull(),
  move: varchar("move", { length: 10 }).notNull(), // 'ROCK', 'PAPER', 'SCISSORS'
  createdAt: timestamp("createdAt", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const socialComments = createTable("social_comments", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: text("userId").notNull(),
  username: text("username").notNull(),
  game: text("game").notNull(),
  comment: text("comment").notNull(),
  likes: integer("likes").default(0).notNull(),
  parentCommentId: integer("parent_comment_id"), // For reply/thread functionality
  isEdited: boolean("is_edited").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const socialCommentLikes = createTable("social_comment_likes", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  commentId: integer("comment_id").notNull(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
