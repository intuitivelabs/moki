import { join } from "path";
import express from "express";
import logger from "morgan";
import { config } from "./config.js";
import routes from "./routes/index.js";
import { handleError, notFound } from "./controller/middlewares.js";
const PUBLIC_URL = process.env.PUBLIC_URL || "";

const app = express();
//app.use(cors());   “Access-Control -Allow-Origin” header would be set to *
if (config.nodeEnv !== "test") app.use(logger("dev"));
app.use(express.json());

// Serve the static files from the React app
app.use("/static", express.static(join(process.cwd(), "report")));

//set routes paths (different with modules)
app.use(PUBLIC_URL + "/api", routes());

// load error mdlw at the end
app.use(notFound);
app.use(handleError);

export default app;
