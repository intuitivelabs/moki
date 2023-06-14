var getTemplate = function ( field, agg_type,  timebucket, queries, supress) {
    var template = {
        "size": 0,
        track_total_hits: true,
        "query": {
            "bool": {
                "must": queries,
                "must_not": {
                    "exists": {
                        "field": supress
                    }
                }
            }
        },
        "aggs": {
            "agg": {
                "date_histogram": {
                    "field": "@timestamp",
                    "fixed_interval": timebucket,
                    "time_zone": "Europe/Berlin",
                    "min_doc_count": 0
                },
                "aggs": {
                    "agg": {
                        [agg_type]: {
                            "field": field,
                            "size": 50
                        }
                    }
                }
            }
        }
    }
    return template;
}

export default {
    getTemplate: getTemplate
};
