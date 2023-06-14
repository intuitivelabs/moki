// elastic.js hold the ES implem
import { Client } from "@elastic/elasticsearch";
import { cfg } from "./config.js";

function connectToES() {
  let client = {};
  try {
    if (cfg.debug) console.info("Connecting to ES " + cfg.es);
    client = new Client({
      node: cfg.es,
      requestTimeout: 60000,
    });
  } catch (error) {
    console.error("es client error: ", error.msg);
    error.status = 400;
    throw error;
  }
  return client;
}

export { connectToES };
