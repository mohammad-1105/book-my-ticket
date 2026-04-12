import { createExpressApp } from "./src/app.mjs";
import { env } from "./src/config/env.mjs";

const app = createExpressApp();

app.listen(env.PORT, () => {
	console.log(`Server is running on port ${env.PORT}`);
});
