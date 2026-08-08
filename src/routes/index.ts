import { Router, type IRouter } from "express";
import healthRouter from "./health";
import seoRouter from "./seo/index";
import pinterestRouter from "./pinterest";
import contactRouter from "./contact";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/seo", seoRouter);
router.use(pinterestRouter);
router.use(contactRouter);

export default router;
