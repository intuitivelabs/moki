// metrics.js hold some metric logic
import fs from 'fs';

import { cfg } from '../modules/config.js';
import { parseBase64 } from '../modules/jwt.js';
const hfName = 'x-amzn-oidc-data';

function getFiltersConcat(filters) {
  // get filters, if no place "*", if more than 1, concat with AND
  const filter = '*';
  if (filters && filters.length !== 0) {
    const filtersList = [];
    for (let i = 0; i < filters.length; i++) {
      if (cfg.debug) console.info(filters[i].title);
      let tit = filters[i].title;

      //replace double shash with ASCII - ES had a problem to parse it
      if (tit.includes("\\")) {
        tit = tit.replace("\\", String.fromCharCode(92));
      }

      //wildcard search - special ES query
      if ((tit.includes("*") || tit.includes("?")) && !tit.includes("/")) {
        if (cfg.debug) console.info("Creating wildcard query - it constains *?/");

        //is field name?
        if (tit.includes(":")) {
          filtersList.push({
            "wildcard": {
              [tit.substring(0, tit.indexOf(":"))]: tit.substring(tit.indexOf(":") + 1)
            }
          });
        } else {
          filtersList.push({
            "wildcard": {
              "attrs.all_copy": tit
            }
          });
        }
      } else {
        filtersList.push({
          "query_string": {
            "query": tit
          }
        });
      }
    }
    return filtersList;
  }
  return filter;
}

//get type list from monitor_layout and check if all should be displayed
async function checkSelectedTypes(types, dashboardName) {
  return new Promise(function (resolve, reject) {
    fs.readFile(cfg.fileGUILayout, (err, layout) => {
      if (err) {
        console.error(`Problem with reading default file. ${err}`);
        reject(err);
      }
      const jsonLayout = JSON.parse(layout);
      const selectedTypes = jsonLayout.types[dashboardName];
      const field = dashboardName === "exceeded" ? "exceeded" : "attrs.type";
      //filter out not selected types
      if (selectedTypes) {
        let filtredTypes = types.filter(item => selectedTypes.includes(item));
        //if no spec types, return selected types from file
        if (types.length === 0) { filtredTypes = selectedTypes; }
        //concat types with OR
        if (filtredTypes.length === 0) {
          resolve("noTypes");
        } else {
          let result = "";
          for (let i = 0; i < filtredTypes.length; i++) {
            if (i === 0) {
              result = field + ":" + filtredTypes[i];
            } else {
              result = result + " OR " + field + ":" + filtredTypes[i];
            }
          }
          resolve(result);
        }
      }
      else {
        resolve("*");
      }
    });
  });
}

//concat all enable types (if exceeded use field exceeded, otherwise attrs.type)
function getTypesConcat(value, type = "attrs.type") {
  if (cfg.debug) console.info("Concatine types " + JSON.stringify(value));
  // concat types with OR
  let types = '*';
  if (value && value.length !== 0) {
    for (let i = 0; i < value.length; i++) {
      if (i === 0) {
        types = type + ":" + value[i].id;
      } else {
        types = types + " OR " + type + ":" + value[i].id;
      }
    }
  }
  return types;
}

function getQueries(filter, types, timestamp_gte, timestamp_lte, userFilter, chartFilter, domain, isEncryptChecksumFilter, exists, index) {
  if (cfg.debug) console.info("--queries--");

  const queries = [];
  if (isEncryptChecksumFilter !== "*") {
    //anonymous mode,  see everything encrypted
    if (isEncryptChecksumFilter === "anonymous") {
      if (index && index.includes("exceeded")) {
        //do nothing, anonymous for exceeded can see all
        if (cfg.debug) console.info("Exceeded anonymous case - no encrypt filter");
      }
      else {
        queries.push({
          "query_string": {
            "query": "NOT encrypt: plain"
          }
        });
        if (cfg.debug) console.info("Adding NOT PLAIN  encrypt filter");
      }
    }
    else {
      if (cfg.debug) console.info("Adding encrypt filter " + isEncryptChecksumFilter);
      if (index.includes("exceeded")) {
        if (cfg.debug) console.info("Exceeded case - adding encrypt filter and plain text");
        queries.push({
          "query_string": {
            "query": "encrypt: \"" + isEncryptChecksumFilter + "\" OR encrypt:plain"
          }
        });
      }
      else {
        if (cfg.debug) console.info("Adding encrypt filter");

        queries.push({
          "match": {
            "encrypt": isEncryptChecksumFilter
          }
        });
      }
    }
  }

  if (domain !== "*") {
    if (cfg.debug) console.info("Adding domain filter " + domain);
    let match = "tls-cn";
    if (index.includes("lastlog")) {
      match = "domain";
    }

    queries.push({
      "match": {
        [match]: domain
      }
    });
  }

  //add user filters 
  if (filter !== '*') {
    for (let i = 0; i < filter.length; i++) {
      queries.push(filter[i]);
    }
  }

  if (types !== "*") {
    queries.push({
      "query_string": {
        "query": types
      }
    });
  }

  //exists attribute condition
  if (exists) {
    queries.push({
      "exists": {
        "field": exists
      }
    });
  }

  if (timestamp_gte !== "*" && timestamp_lte !== "*") {
    queries.push({
      "range": {
        "@timestamp": {
          "gte": timestamp_gte,
          "lte": timestamp_lte,
          "format": "epoch_millis"
        }
      }
    });
  }

  if (userFilter && userFilter !== "*") {
    queries.push({
      "query_string": {
        "query": userFilter
      }
    });
  }

  if (chartFilter && chartFilter !== "*") {
    queries.push({
      "query_string": {
        "query": chartFilter
      }
    });
  }

  return queries;
}


function getParameterFromHeader(req, info) {
  try {
    let parsedHeader = parseBase64(req.headers[hfName]);
    return parsedHeader[info];
  } catch (e) {
    console.log("parsing failed header failed");
    return { error: "Problem to get " + info + " parameter from request header" };
  }

}


export {
  getFiltersConcat,
  getTypesConcat,
  getQueries,
  checkSelectedTypes,
  getParameterFromHeader
};
