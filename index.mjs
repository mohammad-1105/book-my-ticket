import { createExpressApp } from "./src/app.mjs";
import "dotenv/config";

const app = createExpressApp();

app.listen(process.env.PORT, () => {
	console.log(`Server is running on port ${process.env.PORT}`);
});
