import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_KQr7iUZD1Xlg@ep-weathered-frost-abmo5ax7-pooler.eu-west-2.aws.neon.tech/veyno-database?sslmode=require&channel_binding=require",
});
