var getTemplate = function (field, field2, timebucket, timestamp_gte, timestamp_lte,  agg_type, queries, supress) {
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
                    "min_doc_count": 0,
                    "extended_bounds": {
                        "min": timestamp_gte,
                        "max": timestamp_lte
                      }
                },
                "aggs": {
                    "agg": {
                        "terms": {
                            "field": field,
                            "size": 20
                        },
                        "aggs": {
                            "agg": {
                                [agg_type]: {
                                    "field": field2
                                }
                            }
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
