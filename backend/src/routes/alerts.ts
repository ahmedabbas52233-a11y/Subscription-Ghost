<<<<<<< HEAD
import { Router } from 'express';
import { getAlerts, markRead, markAllRead, deleteAlert } from '../controllers/alertController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/',              getAlerts);
router.post('/mark-all-read', markAllRead);
router.put('/:id/read',      markRead);
router.delete('/:id',        deleteAlert);
=======
import { Router } from "express";
import { getAlerts, markRead, markAllRead, dismiss } from "../controllers/alertController";
import { protect } from "../middleware/auth";

const router = Router();
router.use(protect);

router.get("/",               getAlerts);
router.post("/mark-all-read", markAllRead);
router.put("/:id/read",       markRead);
router.delete("/:id",         dismiss);
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699

export default router;
