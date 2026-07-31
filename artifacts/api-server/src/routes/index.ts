import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import dataProductsRouter from "./dataProducts";
import favouritesRouter from "./favourites";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dataProductsRouter);
router.use(favouritesRouter);

export default router;
