import path from "path";
import dotenv from "dotenv";

const appDir = path.dirname(new URL(import.meta.url).pathname);
dotenv.config();

const config = {
  JWT_required: false,
  port: Number(process.env.PORT) || 5000,
  addr: process.env.ADDR || "127.0.0.1",
  nodeEnv: process.env.NODE_ENV || "production",
  monitorVersion: "5.0",
  userFilter: "*",
  fileMonitor: "/data/abc-monitor/monitor.json",
  fileDefaults: "/etc/abc-monitor/defaults.json",
  fileGUILayout: "/data/abc-monitor/monitor-layout.json",
  pcapPath: "/data/sbcsync/traffic_log",
  htpasswd: "/data/abc-monitor/htpasswd",
  decapPath: "/usr/sbin/decap",
  diagramPath: "/usr/share/Moki/build-diagram/diagram.html",
  rootDir: appDir,
  es: process.env.ES || "localhost:9200",
  logstash: process.env.LOGSTASH || "http://localhost:9600",
  debug: process.env.MOKI_DEBUG || false,
};

const isLocal = process.env.NODE_ENV === "dev" ||
  process.env.NODE_ENV === "test";
const isCI = process.env.NODE_ENV === "CI";

if (isCI || isLocal) {
  config.pcapPath = path.join(appDir, "../data/pcaps");
}

if (isLocal) {
  config.fileMonitor = path.join(appDir, "../data/monitor.json");
  config.fileDefaults = path.join(appDir, "../data/defaults.json");
  config.fileGUILayout = path.join(appDir, "../data/monitor-layout.json");
  config.decapPath = path.join(appDir, "../data/bin/decap");
  // need client to run 'npm run build'
  config.diagramPath = path.join(
    appDir,
    "../../client/build-diagram/diagram.html",
  );
}

if (isCI) {
  config.diagramPath = path.join(appDir, "../data/diagram.html");
}

export { config };
