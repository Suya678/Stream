import jwt from "jsonwebtoken";
import { Response } from "express";
import dotenv from "dotenv";
dotenv.config();

const JWT_KEY = process.env.JWT_KEY!;

/* Generate auth token
 *
 * @param {string} userId - The user's ID.
 * @param {string} email - The user's email.
 * @param {Response} res - The Express response object.
 * @returns {string} - The generated JWT token.
 */
export function generateAuthToken(
  userId: string,
  email: string,
  res: Response,
) {
  const token = jwt.sign({ userId, email }, JWT_KEY, { expiresIn: "7d" });
  res.cookie("auth_token", {
    httponly: true,
    secure: process.env.NODE_ENV === "PROD",
    strict: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
}
