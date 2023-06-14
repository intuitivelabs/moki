import { connectToES } from '../modules/elastic.js';
import { cfg } from '../modules/config.js';
/*
ES search query

*/
async function searchES(indexName, queries) {
  const client = connectToES();
  if (cfg.debug) console.info("Search in ES " + JSON.stringify(queries));
  return await client.search({
    index: indexName,
    body: {
      query: {
        bool: {
          must:
            queries
        }
      }
    }
  })
}

/*
ES create new index
arg: index name and JSON format of mapping

*/
async function newIndexES(indexName, mapping) {
  const client = connectToES();
  if (cfg.debug) console.info("Creating new index " + indexName + " " + JSON.stringify(mapping));
  return await client.indices.create({
    index: indexName,
    body: {
      mappings: mapping
    }
  })
}

/*
ES exists index
*/
async function existsIndexES(indexName) {
  const client = connectToES();
  return await client.indices.exists({ index: indexName });
}

/*
insert new event to index
*/
async function insertES(indexName, event) {
  const client = connectToES();
  if (cfg.debug) console.info("Inserting " + indexName + " " + JSON.stringify(event));
  return client.index({
    index: indexName,
    refresh: true,
    body: {
      event
    }
  })
}

/*
ES update query
*/
async function updateES(indexName, queries, script, params) {
  if (cfg.debug) console.info("Updating " + indexName + " " + JSON.stringify("{index: " + indexName + ",type: '_doc', refresh: true, body: {query: { bool: { must:" + JSON.stringify(queries) + "} },'script': { 'source': " + JSON.stringify(script) + ",'lang': 'painless','params': " + JSON.stringify(params) + "}}"));
  const client = connectToES();
  return await client.updateByQuery({
    index: indexName,
    refresh: true,
    body: {
      query: {
        bool: {
          must: queries
        }
      },
      script: {
        source: script,
        lang: "painless",
        params: params
      }
    }
  })
}

/*
ES delete  query
*/
async function deleteES(indexName, queries) {
  const client = connectToES();
  if (cfg.debug) console.info("deleting from index " + indexName + " " + JSON.stringify(queries));
  return await client.deleteByQuery({
    index: indexName,
    refresh: true,
    body: queries
  })
}

export {
  searchES,
  newIndexES,
  existsIndexES,
  insertES,
  updateES,
  deleteES
};
