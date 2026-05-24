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

export default router;
