import { Router } from "express";
import { signIn, signOut, signUp } from "../controllers/auth.controller";

const router = Router();

router.post("/signup", signUp);

router.post("/signin", signIn);

router.post("/logout", signOut);

export default router;
