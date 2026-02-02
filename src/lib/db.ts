import postgres from "postgres";

const DATABASE_URL =
  process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/assembly";

const ssl =
  process.env.DATABASE_SSL === "true"
    ? {
        rejectUnauthorized: false,
      }
    : undefined;

declare global {
  // eslint-disable-next-line no-var
  var __assemblySql: ReturnType<typeof postgres> | undefined;
}

const sql =
  global.__assemblySql ||
  postgres(DATABASE_URL, {
    max: 5,
    ssl,
  });

if (!global.__assemblySql) {
  global.__assemblySql = sql;
}

export { sql };
