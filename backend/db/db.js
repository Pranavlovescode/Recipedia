import * as schema from "./schema.js";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
dotenv.config();

// create a neon client using the serverless helper and pass to drizzle's neon http driver
const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });