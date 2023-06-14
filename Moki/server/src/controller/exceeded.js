import Controller from './controller.js';
import datehistogram_agg_filter_query from '../js/template_queries/datehistogram_agg_filter_query.js';
import timerange_query from '../js/template_queries/timerange_query.js';
import agg from '../js/template_queries/agg.js';

class exceededController extends Controller {

  /**
   * @swagger
   * /api/exceeded/charts:
   *   post:
   *     description: Get exceeded (alarms) charts 
   *     tags: [Exceeded]
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
      //EVENT TIMELINE
      { index: "exceeded*", template: datehistogram_agg_filter_query, params: ["exceeded", "timebucket"], filter: "*" },
      //INCIDENT COUNT
      { index: "exceeded*", template: timerange_query, filter: "*" },
      //EXCEEDED TYPE
      { index: "exceeded*", template: agg, params: ["exceeded", "50"], filter: "*" },
      //TOP OFFENDERS BY COUNT
      { index: "exceeded*", template: agg, params: ["attrs.from.keyword", "128"], filter: "*" },
      //EVENTS BY IP ADDR EXCEEDED 
      { index: "exceeded*", template: agg, params: ["attrs.source", "128"], filter: "*" },
      //TOP SUBNETS /24 EXCEEDED
      { index: "exceeded*", template: agg, params: ["attrs.sourceSubnets", "128"], filter: "*" },
      //EXCEEDED TYPE
      { index: "exceeded*", template: agg, params: ["exceeded-by", "128"], filter: "*" }
    ], "exceeded");

  }

  /**
   * @swagger
   * /api/exceeded/table:
   *   post:
   *     description: Get data for table
   *     tags: [Exceeded]
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
    super.requestTable(req, res, next, { index: "exceeded*", filter: "*" }, "exceeded");
  }
}

export default exceededController;
