/**
 * Intializes and exports the supabase client for interacting with the database
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { Database } from "./database.types";
dotenv.config();

const supabaseUrl = process.env.DATABASE_URI!;
const supabaseKey = process.env.DATABASE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export default supabase;
