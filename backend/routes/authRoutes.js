import express from "express";
import {
  userSignup,
  userSignin,
  getMe,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/signup", userSignup);
router.post("/signin", userSignin);
router.get("/me", protect, getMe);

export default router;
