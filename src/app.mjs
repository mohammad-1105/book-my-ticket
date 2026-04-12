import cors from "cors";
import express from "express";
import { publicDir } from "./config/paths.mjs";
import {
	errorHandler,
	notFoundHandler,
} from "./middlewares/error-handlers.mjs";

export const createExpressApp = () => {
	const app = express();

	app.disable("x-powered-by");
	app.use(cors());
	app.use(express.json());
	app.use(express.static(publicDir));

	app.get("/health", (_req, res) => {
		res.status(200).json({
			status: "ok",
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
		});
	});

	app.get("/", (_req, res) => {
		res.sendFile(`${publicDir}/index.html`);
	});

	app.use(notFoundHandler);
	app.use(errorHandler);

	return app;
};
