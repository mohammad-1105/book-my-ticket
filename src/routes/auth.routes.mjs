import { Router } from "express";

import { authenticateToken } from "../middlewares/authenticate-token.mjs";
import { findUserById, sanitizeUser } from "../models/user.model.mjs";
import { loginUser, registerUser } from "../services/auth.services.mjs";

export const createAuthRouter = ({ legacy = false } = {}) => {
	const router = Router();

	router.post("/register", async (req, res) => {
		const user = await registerUser(req.body);
		res.status(201).json(user);
	});

	router.post("/login", async (req, res) => {
		const { username, password } = req.body;
		const session = await loginUser(username, password);
		res.status(200).json(session);
	});

	if (!legacy) {
		router.get("/me", authenticateToken, async (req, res) => {
			const user = findUserById(req.user.id);
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			res.status(200).json({
				user: sanitizeUser(user),
			});
		});
	}

	return router;
};
