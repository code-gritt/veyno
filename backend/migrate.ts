import { pool } from "./db";
import fs from "fs";

async function migrate() {
  const schema = fs.readFileSync("schema.sql", "utf-8");
  try {
    await pool.query(schema);
    console.log("Migration successful");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

migrate();
