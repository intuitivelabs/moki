/*
template for hash geoip map

aggregations.filter_agg.agg.buckets
- geohash_grid
- agg.doc_count
*/
var getTemplate = function (precision, queries) {
    var template = {
        "size": 0,
        track_total_hits: true,
        query: {
            bool: {
                must: queries,
                "must_not": {
                    "exists": {
                        "field": "geoip.city_name"
                    }
                }
            }
        },
        "aggs": {
            "cities": {
                "geohash_grid": {
                    "field": "geoip.location_all",
                    "precision": precision
                },
                "aggs": {
                    "types": {
                        "terms": { "field": "attrs.type" }

                    }
                }

            }
        }
    };
    return template;
}

export default {
    getTemplate: getTemplate
};
