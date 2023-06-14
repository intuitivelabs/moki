var getTemplate = function ( field, size, queries, supress) {
    var template = {
        size: size,
        "track_total_hits": true,
        "sort": [
            {
                [field]: {
                    "order": "desc",
                    "unmapped_type": "boolean"
                }
            }
            ],
        "query": {
            "bool": {
                "must": queries,
                "must_not": {
                    "exists": {
                        "field": supress
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
