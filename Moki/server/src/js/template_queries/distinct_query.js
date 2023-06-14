var getTemplate = function (field, domainFilter) {
    let template = {
            "size": 0,
            "aggs": {
                "distinct": {
                    "terms": {
                        "field": field
                    }
                }
            }
        };
    if (domainFilter !== "*") {
        template = {
            "size": 0,
            "query": {
                "query_string": {
                    "query": domainFilter
                }
            },
            "aggs": {
                "distinct": {
                    "terms": {
                        "field": field
                    }
                }
            }
        };
    } 
    return template;
}

export default {
    getTemplate: getTemplate
};
