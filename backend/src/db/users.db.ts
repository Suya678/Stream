// db/users.db.ts
import supabaseClient from "./db_client";
import { Tables } from "./database.types";

export type User = Tables<"users">;

/**
 * Get a user by email.
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabaseClient
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new Error(`Database error checking email: ${error.message}`);
  }

  return data;
}

/**
 * Get a user by username.
 */
export async function getUserByUserName(
  userName: string,
): Promise<User | null> {
  const { data, error } = await supabaseClient
    .from("users")
    .select("*")
    .eq("username", userName)
    .maybeSingle();

  if (error) {
    throw new Error(`Database error checking username: ${error.message}`);
  }

  return data;
}

/**
 * Create a new user and return the created record.
 */
export async function createNewUser(
  email: string,
  userName: string,
  avatar: string,
  hashedPassword: string,
  verificationToken: string,
  tokenExpires: Date,
  is_verified = false,
): Promise<User> {
  const { data, error } = await supabaseClient
    .from("users")
    .insert({
      email: email,
      username: userName,
      avatar: avatar,
      password: hashedPassword,
      is_verified: is_verified,
      verification_token: verificationToken,
      verification_token_expires: tokenExpires.toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Database error creating user: ${error.message}`);
  }

  return data;
}

/**
 * Get a user by their verification token.
 */
export async function getUserByVerificationToken(
  token: string,
): Promise<User | null> {
  const { data, error } = await supabaseClient
    .from("users")
    .select("*")
    .eq("verification_token", token)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Database error fetching user by verification token: ${error.message}`,
    );
  }

  return data;
}

/**
 * Mark a user as verified.
 */
export async function verifyUser(userId: string): Promise<User> {
  const { data, error } = await supabaseClient
    .from("users")
    .update({
      is_verified: true,
      verification_token: null,
      verification_token_expires: null,
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Database error verifying user: ${error.message}`);
  }

  return data;
}

/**
 * Update a user's verification token and expiration.
 */
export async function updateVerificationToken(
  userId: string,
  verificationToken: string,
  tokenExpires: Date,
): Promise<User> {
  const { data, error } = await supabaseClient
    .from("users")
    .update({
      verification_token: verificationToken,
      verification_token_expires: tokenExpires.toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(
      `Database error updating verification token: ${error.message}`,
    );
  }

  return data;
}
