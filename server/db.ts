/**
 * Database access layer — Supabase PostgreSQL
 * Replaces the previous Drizzle ORM / MySQL implementation.
 * All queries go through the Supabase client using the service_role key.
 */
import { getSupabaseClient } from "./_core/supabase";
import type { User, InsertUser } from "../shared/types";

/**
 * Upsert a user record. If the open_id already exists, update the
 * mutable fields; otherwise insert a new row.
 */
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.open_id) {
    throw new Error("User open_id is required for upsert");
  }

  const supabase = getSupabaseClient();

  const record: Record<string, unknown> = {
    open_id: user.open_id,
    last_signed_in: user.last_signed_in ?? new Date().toISOString(),
  };

  if (user.name !== undefined) record.name = user.name;
  if (user.email !== undefined) record.email = user.email;
  if (user.login_method !== undefined) record.login_method = user.login_method;
  if (user.role !== undefined) record.role = user.role;

  const { error } = await supabase
    .from("users")
    .upsert(record, { onConflict: "open_id" });

  if (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

/**
 * Look up a user by their OAuth open_id.
 */
export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("open_id", openId)
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = "no rows returned" — not a real error
    console.error("[Database] Failed to get user:", error);
    return undefined;
  }

  return (data as User) ?? undefined;
}
