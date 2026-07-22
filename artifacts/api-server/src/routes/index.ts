import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dataProductsRouter from "./dataProducts";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dataProductsRouter);

export default router;
