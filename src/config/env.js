import { config } from "dotenv";
import { z } from "zod";

config({
	path: ".env",
});

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.coerce.number().default("8080"),
	JWT_TOKEN_SECRET: z.string().min(1),
	JWT_TOKEN_EXPIRES_IN: z.string().default("24h"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
	const errorTree = z.treeifyError(parsedEnv.error);
	console.error("Invalid environment variables:");

	for (const [key, error] of Object.entries(errorTree)) {
		if (error) {
			console.error(`- ${key}: ${error.message}`);
		}
	}

	process.exit(1);
}

export const env = parsedEnv.data;
