/*
Properties:
index, timestamp from, timestamp to, type of aggregation, type filter, search query, types filter
*/
var getTemplate = function ( agg, size, queries, supress) {
    var template = {
        "size": 0,
        track_total_hits: true,
        query: {
            bool: {
                must: queries,
                "must_not": {
                    "exists": {
                        "field": supress
                    }
                }
            }
        },
        aggs: {
              "nested" : { "value_count" : { "field" : agg } },
            agg: {
                terms: {
                    field: agg,
                    size: size,
                    order: {
                        "_count": "desc"
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
