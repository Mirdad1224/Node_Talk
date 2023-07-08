import { Router } from "express";
import { protect } from "../controllers/auth";
import {
  getFriends,
  getRequests,
  getUsers,
  updateMe,
} from "../controllers/user";

const router = Router();

router.patch("/update-me", protect, updateMe);
router.get("/get-users", protect, getUsers);
router.get("/get-requests", protect, getRequests);
router.get("/get-friends", protect, getFriends);

export default router;
