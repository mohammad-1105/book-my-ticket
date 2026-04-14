import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
	const authHeader = req.headers.authorization;

	const token = authHeader?.startsWith("Bearer ")
		? authHeader.split(" ")[1]
		: null;

	if (!token) {
		return res.status(401).json({
			error: "Unauthorized access: No token provided",
		});
	}

	try {
		req.user = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
		next();
	} catch {
		return res.status(403).json({
			error: "Forbidden access: Invalid token",
		});
	}
};
