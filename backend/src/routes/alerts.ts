import { Router } from "express";
import { getAlerts, markRead, markAllRead, dismiss } from "../controllers/alertController";
import { protect } from "../middleware/auth";

const router = Router();
router.use(protect);

router.get("/",               getAlerts);
router.post("/mark-all-read", markAllRead);
router.put("/:id/read",       markRead);
router.delete("/:id",         dismiss);

export default router;
