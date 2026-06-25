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

export default router;
