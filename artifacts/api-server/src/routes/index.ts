import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import domainsRouter from "./domains";
import originsRouter from "./origins";
import cacheRouter from "./cache";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(domainsRouter);
router.use(originsRouter);
router.use(cacheRouter);
router.use(statsRouter);

export default router;
