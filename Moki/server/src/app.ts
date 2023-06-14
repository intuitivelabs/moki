// server.js hold the main process for the server part

// TODO: rename to app.js (this isn't a server isn't ;) )

import app from "./express.js";
import { config } from "./config.js";

// const port = process.env.PORT || 5000;
// start server
const server = app.listen(config.port, config.addr, undefined);

// eslint-disable-next-line no-console
server.on("listening", () => {
  console.log(`listening on:\t ${config.addr}:${config.port}`);
}).on("error", console.log);

export default app;

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Process terminated");
  });
});
