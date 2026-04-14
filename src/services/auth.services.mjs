import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { env } from "../config/env.mjs";
import {
	createUser,
	findUserByUsername,
	sanitizeUser,
} from "../models/user.model.mjs";
import { createHttpError } from "../utils/http-error.mjs";
import {
	loginUserSchema,
	registerUserSchema,
} from "../zod-schema/user-credential-schema.mjs";

function getValidationMessages(error) {
	return error.issues.map((issue) => issue.message);
}

export const registerUser = async (userData) => {
	const validation = registerUserSchema.safeParse(userData);

	if (!validation.success) {
		const errors = getValidationMessages(validation.error);
		throw createHttpError(400, "Validation failed", errors);
	}

	if (findUserByUsername(userData.username)) {
		throw createHttpError(409, "An account with that username already exists");
	}

	const hashedPassword = await bcrypt.hash(userData.password, 10);
	const user = createUser(userData.username, hashedPassword);

	return sanitizeUser(user);
};

export const loginUser = async (username, password) => {
	const validation = loginUserSchema.safeParse({ username, password });

	if (!validation.success) {
		const errors = getValidationMessages(validation.error);
		throw createHttpError(400, "Validation failed", errors);
	}

	const user = findUserByUsername(username);

	if (!user) {
		throw createHttpError(401, "Invalid credentials");
	}

	const passwordMatches = await bcrypt.compare(password, user.password);
	if (!passwordMatches) {
		throw createHttpError(401, "Invalid credentials");
	}

	const token = jwt.sign(
		{
			id: user.id,
			username: user.username,
		},
		env.JWT_TOKEN_SECRET,
		{ expiresIn: env.JWT_TOKEN_EXPIRES_IN },
	);

	return {
		token,
		user: sanitizeUser(user),
	};
};
