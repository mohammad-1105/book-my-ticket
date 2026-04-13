import cors from "cors";
import express from "express";
import { publicDir } from "./config/paths.mjs";
import {
	errorHandler,
	notFoundHandler,
} from "./middlewares/error-handlers.mjs";
import { createAuthRouter } from "./routes/auth.routes.mjs";
import { createBookingRouter } from "./routes/booking.routes.mjs";
import { createMovieRouter } from "./routes/movie.routes.mjs";
import { createSeatRouter } from "./routes/seat.routes.mjs";

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

	app.use("/api/auth", createAuthRouter());
	app.use("/api", createMovieRouter());
	app.use("/api", createSeatRouter());
	app.use("/api", createBookingRouter());

	app.use("/", createAuthRouter({ legacy: true }));
	app.use("/", createSeatRouter({ legacy: true }));
	app.use("/", createBookingRouter({ legacy: true }));

	app.get("/", (_req, res) => {
		res.sendFile(`${publicDir}/index.html`);
	});

	app.use(notFoundHandler);
	app.use(errorHandler);

	return app;
};
