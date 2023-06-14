/*
Properties:
index, timestamp from, timestamp to, type of aggregation, type of subaggregation, search query, types
*/
var getTemplate = function ( agg, agg_type, subagg, queries, supress) {
    var template = {
        "size": 0,
        track_total_hits: true,
        "query": {
            "bool": {
                "must":  queries,
                "must_not": {
                    "exists": {
                        "field": supress
                    }
                }
            }
        },
        "aggs": {
            "agg": {
                "terms": {
                    "field": agg,
                    "size": 10
                },
                "aggs": {
                    "agg": {
                        [agg_type]: {
                            "field": subagg
                        }
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
