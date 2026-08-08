import { Router } from "express";
import postsRouter from "./posts";
import aiRouter from "./ai";
import pipelineRouter from "./pipeline";

const seoRouter = Router();

seoRouter.use(postsRouter);
seoRouter.use(aiRouter);
seoRouter.use(pipelineRouter);

export default seoRouter;
