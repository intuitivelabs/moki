var getTemplate = function (fieldTerm, agg_type, field, timebucket, timestamp_gte, timestamp_lte, queries, supress) {
    var template = {
        "size": 0,
        "track_total_hits": true,
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
                    "min_doc_count": 1,
                    "extended_bounds": {
                        "min": timestamp_gte,
                        "max": timestamp_lte
                      }
                },
                "aggs": {
                    "agg": {
                        "terms": {
                            "field": fieldTerm
                        },
                        "aggs": {
                            "agg2": {
                                [agg_type]: {
                                    "field": field
                                }
                            }
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
