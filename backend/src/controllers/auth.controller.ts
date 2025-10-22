import { Request, Response } from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import crypto from "crypto";
import * as userDb from "../db/users.db";
import { sendEmail, SendEmailResult } from "../email/sendEmail";
import { generateAuthToken } from "../utils/jwt";
dotenv.config();

// signs up a new user
export async function signUp(req: Request, res: Response) {
  if (!req.body) {
    return res.status(400).json({ message: "Request body is missing" });
  }
  const { email, password, userName } = req.body;

  if (!email.trim() || !password.trim() || !userName.trim()) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!checkPassword(password)) {
    return res
      .status(400)
      .json({ message: "Password must be at least 10 characters" });
  }
  if (!checkEmail(email)) {
    return res.status(400).json({ message: "Email is invalid" });
  }

  try {
    // Check if email already exists
    const existingEmailUser = await userDb.getUserByEmail(email);
    if (existingEmailUser === null) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    // Check if username already exists
    const existingUsernameUser = await userDb.getUserByUserName(userName);
    if (existingUsernameUser === null) {
      return res
        .status(409)
        .json({ message: "User with this username already exists" });
    }

    // hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPasword = await bcrypt.hash(password, salt);

    //Generating random avatar
    const avatar = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${userName}`;

    // Generate verificiation token
    const { token, expiry } = generateVerificationToken();

    const user = await userDb.createNewUser(
      email,
      userName,
      avatar,
      hashedPasword,
      token,
      expiry,
      false,
    );

    // Generate auth token
    generateAuthToken(userName, email, res);

    return res.status(201).json({
      message: "User created successfully",
      userId: user.id,
      email,
      userName,
      avatar,
    });
  } catch (err) {
    console.error(`Error signing up user: ${err}`);
    return res.status(500).json({
      message: "Sorry, the request could not be completed at the moment",
    });
  }
}

export async function signIn(req: Request, res: Response) {
  if (!req.body) {
    return res.status(400).json({ message: "Request body is missing" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const user = await userDb.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    generateAuthToken(user.username, user.email, res);

    return res.status(200).json({
      message: "User sign in successfully",
      userId: user.id,
      email: user.email,
      userName: user.username,
      avatar: user.avatar,
    });
  } catch (err) {
    console.error("Error signing in user:", err);
    return res.status(500).json({
      message: "Sorry, the request could not be completed at the moment",
    });
  }
}

export async function signOut(req: Request, res: Response) {}

// Generates a 24 hour verificationToken
function generateVerificationToken() {
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return { token: verificationToken, expiry: tokenExpires };
}
function checkPassword(password: string): boolean {
  // No spaces, 10+ chars, 1 upper, 1 lower, 1 digit, 1 special, less than 30
  const re =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=[\]{}|;:,.<>])(?!.*\s).{10,30}$/;
  return re.test(password);
}

function checkEmail(email: string): boolean {
  // Got from ChatGPT
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}
