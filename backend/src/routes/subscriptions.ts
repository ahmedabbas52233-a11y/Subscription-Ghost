<<<<<<< HEAD
import { Router } from 'express';
import {
  getSubscriptions,
  createSubscription,
  getSubscription,
  updateSubscription,
  deleteSubscription,
  bulkDeleteSubscriptions,
  getStats,
} from '../controllers/subscriptionController';
import { protect } from '../middleware/auth';
import { validate, subscriptionSchema, subscriptionUpdateSchema } from '../middleware/validate';

const router = Router();

// All subscription routes are protected
router.use(protect);

router.get('/',              getSubscriptions);
router.post('/',              validate(subscriptionSchema), createSubscription);
router.get('/stats',         getStats);
router.post('/bulk-delete',  bulkDeleteSubscriptions);
router.get('/:id',           getSubscription);
router.put('/:id',           validate(subscriptionUpdateSchema), updateSubscription);
router.delete('/:id',        deleteSubscription);
=======
import { Router } from "express";
import { list, create, getOne, update, remove, stats } from "../controllers/subscriptionController";
import { protect }                                      from "../middleware/auth";
import { validate, subscriptionSchema, subUpdateSchema } from "../middleware/validate";

const router = Router();
router.use(protect);

router.get("/",       list);
router.post("/",      validate(subscriptionSchema), create);
router.get("/stats",  stats);
router.get("/:id",    getOne);
router.put("/:id",    validate(subUpdateSchema), update);
router.delete("/:id", remove);
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699

export default router;
