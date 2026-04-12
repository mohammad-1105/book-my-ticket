export const notFoundHandler = (req, res) => {
	return res.status(404).json({
		error: "Route not found",
		method: req.method,
		path: req.originalUrl,
	});
};

export const errorHandler = (err, _req, res, _next) => {
	const status = err.status || err.statusCode || 500;
	const message = err.message || "Internal Server Error";

	// Log server errors with stack trace
	if (status >= 500) {
		console.error("Server Error:", {
			status,
			message,
			stack: err.stack,
		});
	}

	res.status(status).json({
		error: message,
		...(process.env.NODE_ENV === "development" && { stack: err.stack }),
		details: err.details || null,
	});
};
