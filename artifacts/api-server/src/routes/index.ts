import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dataProductsRouter from "./dataProducts";
import favouritesRouter from "./favourites";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dataProductsRouter);
router.use(favouritesRouter);

export default router;
