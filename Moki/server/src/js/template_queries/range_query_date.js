var getTemplate = function (field1, field2, timebucket, timestamp_gte, timestamp_lte, queries, supress) {
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
                            "field": field1
                        },
                        "aggs": {
                            "agg2": {
                                "range": {
                                    "field": field2,
                                    "ranges": [
                                        {"key": "reachable", "to": 0.01 },
                                        {"key": "unreachable", "from": 0.01, "to": 1.01 },
                                        {"key": "partially", "from": 1.01 }
                                    ]
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
