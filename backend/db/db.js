import * as schema from "./schema.js";
import {neon} from "@neondatabase/serverless"
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/singlestore/driver";
dotenv.config()

const sql = neon(process.env.DATABASE_URL)

export const db = drizzle(sql,{schema})