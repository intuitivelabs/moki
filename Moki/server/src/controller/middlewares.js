// middlewares.js hold some useful middlware to force json error

import { cfg } from "../modules/config.js";
const { nodeEnv } = cfg;

// return a 404 error not found
function notFound(req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err, req, res);
}

// handleError to generate JSON from obj
function handleError(err, _req, res) {
  const val = err.status || 500;
  let ret = { error: err.message, trace: err.statck };

  if (nodeEnv === "production") {
    ret = { error: err.message };
  }

  if (val !== 404) {
    console.error(err.stack);
  }

  res.status(val).json(ret)
}

export { handleError, notFound };
