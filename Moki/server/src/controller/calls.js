import Controller from './controller.js';
import query_string from '../js/template_queries/query_string.js';
import agg_sum_bucket_query from '../js/template_queries/agg_sum_bucket_query.js';
import agg_query from '../js/template_queries/agg_query.js';
import agg_filter from '../js/template_queries/agg_filter.js';
import two_agg_no_order_query from '../js/template_queries/two_agg_no_order_query.js';
import date_bar from '../js/template_queries/date_bar_query.js';
import datehistogram_agg_filter_query from '../js/template_queries/datehistogram_agg_filter_query.js';
import datehistogram_agg_sum_bucket_query from '../js/template_queries/datehistogram_agg_sum_bucket_query.js';

class CallsController extends Controller {

  /**
   * @swagger
   * /api/calls/charts:
   *   post:
   *     description: Get all calls charts
   *     tags: [Calls]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: pretty
   *         description: Return a pretty json
   *         in: query
   *         required: false
   *         type: bool
   *       - name: form
   *         description: Call chart form
   *         in: body
   *         required: true
   *         type: object
   *         schema:
   *           $ref: '#/definitions/ChartForm'
   *     responses:
   *       200:
   *         description: return chart data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/definitions/ChartResponse'
   *       400:
   *         description: elasticsearch error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/definitions/ChartResponseError'
   */
  static getCharts(req, res, next) {
    super.request(req, res, next, [
      //CALL TERMINATED
      { index: "logstash*", template: agg_filter, params: ["attrs.originator", 10], filter: 'attrs.type:call-end' },
      //CALL SUCCESS RATIO
      { index: "logstash*", template: two_agg_no_order_query, params: ["termination", "terms", "attrs.sip-code"], filter: "*" },
      //SUM CALL-ATTEMPT
      { index: "logstash*", template: query_string, filter: "attrs.type:call-attempt" },
      //SUM CALL-END
      { index: "logstash*", template: query_string, filter: "attrs.type:call-end" },
      //SUM CALL-START
      { index: "logstash*", template: query_string, filter: "attrs.type:call-start" },
      //DURATION SUM
      { index: "logstash*", template: agg_query, params: ["sum", "attrs.duration"], filter: "*" },
      //AVERAGE FAILURE RATIO
      { index: "logstash*", template: agg_sum_bucket_query, params: ["SumFailureSuccess", "failure"], filter: "*" },
      //AVG MoS
      { index: "logstash*", template: agg_query, params: ["avg", "attrs.rtp-MOScqex-avg"], filter: "*" },
      //ANSWER-SEIZURE RATIO
      { index: "logstash*", template: agg_sum_bucket_query, params: ["CallEnd", "AnsweredCalls"], filter: "*" },
      //CALLING COUNTRIES
      { index: "logstash*", template: agg_filter, params: ["geoip.country_code2", 128], filter: "*" },
      //SUM DURATION OVER TIME
      { index: "logstash*", template: date_bar, params: ["attrs.duration", "timebucket"], filter: "*" },
      //MAX DURATION
      { index: "logstash*", template: agg_query, params: ["max", "attrs.duration"], filter: "*" },
      //MIN DURATION
      { index: "logstash*", template: agg_query, params: ["min", "attrs.duration"], filter: "*" },
      //AVG DURATION
      { index: "logstash*", template: agg_query, params: ["avg", "attrs.duration"], filter: "*" },
      //DURATION GROUP
      { index: "logstash*", template: agg_query, params: ["terms", "attrs.durationGroup"], filter: "*" },
      //SIP-CODE COUNT
      { index: "logstash*", template: agg_filter, params: [ "attrs.sip-code", 128], filter: "*" },
      //CALLED COUNTIRES
      { index: "logstash*", template: agg_filter, params: ["attrs.tst_cc", 128], filter: "*" },
      //EVENT CALLS TIMELINE
      { index: "logstash*", template: datehistogram_agg_filter_query, params: ["attrs.type", "timebucket"], filter: "*" },
      //EVENT CALLS TIMELINE
      { index: "logstash*", template: datehistogram_agg_sum_bucket_query, params: ["CallEnd", "AnsweredCalls", "timebucket"], filter: "*" }
    ], "calls");
  }

  /**
   * @swagger
   * /api/calls/table:
   *   post:
   *     description: Get data for table
   *     tags: [Calls]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: pretty
   *         description: Return a pretty json
   *         in: query
   *         required: false
   *         type: bool
   *       - name: form
   *         description: Call chart form
   *         in: body
   *         required: true
   *         type: object
   *         schema:
   *           $ref: '#/definitions/ChartForm'
   *     responses:
   *       200:
   *         description: return chart data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/definitions/TableResponse'
   *       400:
   *         description: elasticsearch error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/definitions/ChartResponseError'
   */
  static getTable(req, res, next) {
    super.requestTable(req, res, next, { index: "logstash*", filter: "*" }, "calls");
  }
}

export default CallsController;
