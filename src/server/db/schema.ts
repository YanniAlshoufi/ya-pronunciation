// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { index, pgTableCreator } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `ya-pronunciation_${name}`);

export const words = createTable(
  "words",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    word: d.varchar({ length: 512 }).notNull(),
    level: d.varchar({ length: 2 }).notNull(),
    hyphenation: d.varchar({ length: 512 }),
    audioLink: d.varchar({ length: 2048 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("word_idx").on(t.word)],
);
