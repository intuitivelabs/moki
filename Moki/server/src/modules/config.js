// config.js
import fs from "fs";
import path from "path";
import { config } from "../config.js";
const hfName = "x-amzn-oidc-data";

const appDir = path.dirname(import.meta.url);

if (config.nodeEnv === "test") {
  config.port = 5001;
}

function readJsonFileSync(filepath, encoding) {
  return (typeof (encoding) == "undefined")
    ? JSON.parse(fs.readFileSync(filepath, "utf8"))
    : JSON.parse(fs.readFileSync(filepath, encoding));
}

// get filter for website
async function getWebFilter() {
  return new Promise(function (resolve, reject) {
    fs.readFile(config.fileMonitor, (err2, data) => {
      if (err2) {
        console.error(`Problem with reading default file. ${err2}`);
        reject;
      }
      const jsonData = JSON.parse(data);
      if ("general" in jsonData && jsonData.general["global-config"]) {
        jsonData.general["global-config"].forEach((data) => {
          if (data.app === "m_settings") {
            data.attrs.forEach((attrs) => {
              if (attrs.attribute === "webFilter") {
                resolve(attrs.value);
              }
            });
          }
        });
        resolve("nodata");
      }
    });
    reject;
  });
}

// is accept JWT in settings
async function isRequireJWT() {
  //check if files exists
  if (!fs.existsSync(config.fileMonitor)) {
    return;
  }
  if (!fs.existsSync(config.fileDefaults)) {
    return;
  }

  //check if in monitor.json
  fs.readFile(config.fileMonitor, (err2, data) => {
    if (err2) {
      console.error(`Problem with reading default file. ${err2}`);
      return;
    }
    const jsonData = JSON.parse(data);
    if ("general" in jsonData && jsonData.general["global-config"]) {
      jsonData.general["global-config"].forEach((data) => {
        if (data.app === "m_config") {
          data.attrs.forEach((attrs) => {
            if (attrs.attribute === "requireJwt") {
              return attrs.value;
            }
          });
        }
      });
    }

    //get value from defaults.json
    fs.readFile(config.fileDefaults, (err2, data) => {
      if (err2) {
        console.error(`Problem with reading default file. ${err2}`);
        return;
      }
      const jsonData = JSON.parse(data);
      jsonData.forEach((data) => {
        if (data.app === "m_config") {
          data.attrs.forEach((attrs) => {
            if (attrs.attribute === "requireJwt") {
              return attrs.value;
            }
          });
        }
      });
    });
  });
  return;
}

function getActualConfig() {
  return fs.readFile(config.fileDefaults, "utf-8", (err, defaults) => {
    if (err) {
      console.error(`Problem with reading default file. ${err}`);
      return `Problem with reading data: ${err}`;
    }

    return fs.readFile(config.fileMonitor, "utf-8", (err2, data) => {
      if (err2) {
        console.error(`Problem with reading default file. ${err2}`);
        return `Problem with reading data: ${err2}`;
      }

      console.info("Reading files and inserting default values.");
      // if value in monitor.json use this one, not default
      const jsonData = JSON.parse(data);
      const jsonDefaults = JSON.parse(defaults);
      if ("general" in jsonData && jsonData.general["global-config"]) {
        jsonData.general["global-config"].forEach((data) => {
          jsonDefaults.forEach((defaults) => {
            if (data.app == defaults.app) {
              data.attrs.forEach((attrs) => {
                defaults.attrs.forEach((defaultsAttrs) => {
                  if (attrs.attribute == defaultsAttrs.attribute) {
                    defaultsAttrs.value = attrs.value;
                    if (attrs.comments) {
                      defaultsAttrs.comments = attrs.comments;
                    }
                  }
                });
              });
            }
          });
        });
      }
      return jsonDefaults;
    });
  });
}

//get second default
async function getDefaults() {
  return new Promise(function (resolve, reject) {
    fs.readFile("/etc/abc-monitor/defaults_intuitive.json", (err, defaults) => {
      if (err) {
        console.error(`Problem with reading default file. ${err}`);
        reject;
      }
      resolve(JSON.parse(defaults));
    });
  });
}

function parseBase64(token) {
  if (!token) {
    return "redirect";
  }
  const base64Url = token.split(".")[1];
  if (!base64Url) {
    return JSON.parse(Buffer.from(token, "base64").toString("utf8"));
  }
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const dataJSON = JSON.parse(Buffer.from(base64, "base64").toString());
  return dataJSON;
}

/*
  return login user info
  */
function getUser(req) {
  let parsedHeader;
  try {
    //get domain id
    parsedHeader = parseBase64(req.headers[hfName]);
  } catch (e) {
    console.log("ACCESS getJWTsipUserFilter: JWT parsing failed");
    throw new Error("ACCESS: JWT parsing error");
  }
  const sip = parsedHeader["custom:sip"];
  const jwtbit = parsedHeader["custom:adminlevel"];
  const domainID = parsedHeader["custom:domainid"];
  const subId = parsedHeader["sub"];
  const userbackend = parsedHeader["custom:userbackend"];

  if (domainID) {
    return {
      sip: sip,
      jwtbit: jwtbit,
      domain: domainID,
      sub: subId,
      userbackend: userbackend,
    };
  } else {
    return {
      sip: "admin",
      jwtbit: 0,
      domain: "default",
      sub: "default",
    };
  }
}

export function setMonitorVersion(v) {
  config.monitorVersion = v;
}

export function getConfig(file) {
  const filepath = `${appDir}/../${file}`;
  return readJsonFileSync(filepath);
}

export {
  config as cfg,
  getActualConfig,
  getDefaults,
  getUser,
  getWebFilter,
  isRequireJWT,
};
