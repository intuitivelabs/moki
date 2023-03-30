const Controller = require('./controller');
const query_string = require('../../js/template_queries/query_string');
const agg_query = require('../../js/template_queries/agg_query');
const two_agg_filter_query = require('../../js/template_queries/two_agg_filter_query');
const heatmap_query_three = require('../../js/template_queries/three_agg_heatmap_query');
const heatmap_query_three_animation = require('../../js/template_queries/three_agg_heatmap_query_animation');
const heatmap_query = require('../../js/template_queries/four_agg_heatmap_query');
const multiple_query = require('../../js/template_queries/multiple_query');
const datehistogram_two_agg_query = require('../../js/template_queries/datehistogram_two_agg_query');
const datehistogram_four_agg_query = require('../../js/template_queries/datehistogram_four_agg_query');
const range_query_date =  require('../../js/template_queries/range_query_date');

class ConnectivityCAController extends Controller {

  /**
   * @swagger
   * /api/connectivityCA/charts:
   *   post:
   *     description: Get ConnectivityCA charts
   *     tags: [ConnectivityCA]
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
      //0 topology chart
      { index: "logstash*", template: two_agg_filter_query, params: ["attrs.src_ca_id", "attrs.dst_ca_id"], filter: "attrs.type:call-end OR attrs.type:call-start OR attrs.type:call-attempt" },
      //1 DURATION SUM
      { index: "logstash*", template: agg_query, params: ["sum", "attrs.duration"], filter: "*" },
      //2 SUM CALL-END
      { index: "logstash*", template: query_string, filter: "attrs.type:call-end" },
      //3 SUM CALL-ATTEMPT
      { index: "logstash*", template: query_string, filter: "attrs.type:call-attempt" },
      //4 CONNECTION FAILURE RATIO CA
      { index: "logstash*", template: heatmap_query, params: ["attrs.src_ca_id", "failure", "attrs.dst_ca_id", "failure"], filter: "*" },
      //5 NUMBER OF CALL-ATTEMPS CA
      { index: "logstash*", template: two_agg_filter_query, params: ["attrs.src_ca_id", "attrs.dst_ca_id"], filter: "attrs.type:call-attempt" },
      //6 NUMBER OF CALL-ENDS CA
      { index: "logstash*", template: two_agg_filter_query, params: ["attrs.src_ca_id", "attrs.dst_ca_id"], filter: "attrs.type:call-end" },
      //7 ERROR CODE ANALYSIS
      { index: "logstash*", template: heatmap_query, params: ["attrs.sip-code", "failure", "attrs.src_ca_id", "failure"], filter: "*" },
      //8 CA RATIO HISTORY
      { index: "logstash*", template: datehistogram_two_agg_query, params: ["attrs.dst_ca_id", "failure", "timebucket", "timestamp_gte", "timestamp_lte", "avg"], filter: "*" },
      //9 CA AVAILABILITY  
      { index: "logstash*", template: range_query_date, params: ["attrs.dest_ca_uuid", "StatesCA", "timebucket", "timestamp_gte", "timestamp_lte"], filter: "*", types: "*" },
      //10 DURATION OF CALLS CA
      { index: "logstash*", template: heatmap_query_three, params: ["attrs.src_ca_id", "attrs.dst_ca_id", "attrs.duration"], filter: "*" },
      //11 DESTINATIONS CAs STATISTICS
      { index: "logstash*", template: multiple_query, params: ["attrs.dst_ca_id", "attrs.duration", "CallEnd", "CallAttempts", "SumFailureSuccess", "failure", "AnsweredCalls"], filter: "*" },
      //12 SOURCE CAs STATISTICS
      { index: "logstash*", template: multiple_query, params: ["attrs.src_ca_id", "attrs.duration", "CallEnd", "CallAttempts", "SumFailureSuccess", "failure", "AnsweredCalls"], filter: "*" },
      //13 SUM CALL-START
      { index: "logstash*", template: query_string, filter: "attrs.type:call-start" },
      //14 AVG MoS
      { index: "logstash*", template: datehistogram_two_agg_query, params: ["attrs.dst_ca_id", "attrs.rtp-MOScqex-avg", "timebucket", "timestamp_gte", "timestamp_lte", "avg"], filter: "*" }
    ]);
  }

  /**
* @swagger
* /api/connectivityCA/connection_failure_ratio_ca:
*   post:
*     description: Get connection failure ratio CA data based on time buckets
*     tags: [ConnectivityCA]
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

  static getConnectionFailureRatioCA(req, res, next) {
    super.request(req, res, next, [
      //CA RATIO HISTORY - animation
      { index: "logstash*", template: datehistogram_four_agg_query, params: ["attrs.src_ca_id", "failure", "attrs.dst_ca_id", "failure", "timebucketAnimation", "timestamp_gte", "timestamp_lte"], filter: "*" }
    ]);
  }


  /**
* @swagger
* /api/connectivityCA/error_code_analysis:
*   post:
*     description: Get connection error code analysis data based on time buckets
*     tags: [ConnectivityCA]
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

  static getErrorCodeAnalysis(req, res, next) {
    super.request(req, res, next, [
      //CA RATIO HISTORY - animation
      { index: "logstash*", template: datehistogram_four_agg_query, params: ["attrs.sip-code", "failure", "attrs.src_ca_id", "failure", "timebucketAnimation", "timestamp_gte", "timestamp_lte"], filter: "*" }
    ]);
  }

  /**
 * @swagger
 * /api/connectivityCA/number_of_call-attemps_ca:
 *   post:
 *     description: Get number of call-attempts CA data based on time buckets
 *     tags: [ConnectivityCA]
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

  static getNumberOfCallAttemptsCA(req, res, next) {
    super.request(req, res, next, [
      //CA RATIO HISTORY - animation
      { index: "logstash*", template: datehistogram_two_agg_query, params: ["attrs.dst_ca_id", "attrs.src_ca_id", "timebucketAnimation", "timestamp_gte", "timestamp_lte", "terms"], filter: "attrs.type:call-attempt" }
    ]);
  }


  /**
 * @swagger
 * /api/connectivityCA/duration_of_calls_ca_(avg):
 *   post:
 *     description: Get number of duration of calls CA (avg) based on timebucket
 *     tags: [ConnectivityCA]
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

  static getDurationCA(req, res, next) {
    super.request(req, res, next, [
      //CA RATIO HISTORY - animation
      { index: "logstash*", template: heatmap_query_three_animation, params: ["attrs.src_ca_id", "attrs.dst_ca_id", "attrs.duration", "timebucketAnimation", "timestamp_gte", "timestamp_lte"], filter: "*" }
    ]);
  }

  /**
 * @swagger
 * /api/connectivityCA/from_to_ca:
 *   post:
 *     description: Get number of topology chart data based on time buckets
 *     tags: [ConnectivityCA]
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

  static getFromToCA(req, res, next) {
    super.request(req, res, next, [
      //CA RATIO HISTORY - animation
      { index: "logstash*", template: datehistogram_two_agg_query, params: ["attrs.src_ca_id", "attrs.dst_ca_id", "timebucketAnimation", "timestamp_gte", "timestamp_lte", "terms"], filter: "attrs.type:call-end OR attrs.type:call-start OR attrs.type:call-attempt" }
    ]);
  }


  /**
  * @swagger
  * /api/connectivityCA/number_of_call-ends_ca:
  *   post:
  *     description: Get number of call-ends CA data based on time buckets
  *     tags: [ConnectivityCA]
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

  static getNumberOfCallEndsCA(req, res, next) {
    super.request(req, res, next, [
      //CA RATIO HISTORY - animation
      { index: "logstash*", template: datehistogram_two_agg_query, params: ["attrs.dst_ca_id", "attrs.src_ca_id", "timebucketAnimation", "timestamp_gte", "timestamp_lte", "terms"], filter: "attrs.type:call-end" }
    ]);
  }


  /**
   * @swagger
   * /api/connectivityCA/table:
   *   post:
   *     description: Get data for table - states CA
   *     tags: [connectivityCA]
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
    super.requestTable(req, res, next, { index: "logstash*", filter: "attrs.type:dest_monit" }, "");
  }
}



module.exports = ConnectivityCAController;
