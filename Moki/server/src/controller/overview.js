import { checkSelectedTypes } from '../utils/metrics.js';

import Controller from './controller.js';
import datehistogram_agg_filter_query from '../js/template_queries/datehistogram_agg_filter_query.js';
import agg_query from '../js/template_queries/agg_query.js';
import datehistogram_agg_query from '../js/template_queries/datehistogram_agg_query.js';
import two_agg_query_limit from '../js/template_queries/two_agg_query_limit.js';
import distinct_query_string from '../js/template_queries/distinct_query_string.js';
import query_string from '../js/template_queries/query_string.js';


class overviewController extends Controller {

  /**
   * @swagger
   * /api/overview/charts:
   *   post:
   *     description: Get overview charts
   *     tags: [Overview]
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
      //EVENT OVERVIEW TIMELINE
      { index: "logstash*", template: datehistogram_agg_filter_query, params: ["attrs.type", "timebucket"], filter: "*" },
      //TOTAL EVENTS IN INTERVAL
      { index: "logstash*", template: agg_query, params: ["terms", "attrs.type"], filter: "*" },
      //ACTIVITY OF SBCS
      { index: "logstash*", template: datehistogram_agg_query, params: ["attrs.hostname", "terms", "timebucket"], filter: "*" },
      //SBC KEEP ALIVE, types: none - no type fiilter - special case different index 
      { index: "collectd*", template: datehistogram_agg_query, params: ["attrs.hostname", "terms", "timebucket"], filter: "*", types: "*" },
      //SBC ACTIVITY TYPES
      { index: "logstash*", template: two_agg_query_limit, params: ["attrs.sbc", "terms", "attrs.type"], filter: "*" },
      //list of tags
      { index: "logstash*", template: agg_query, params: ["terms", "attrs.tags"], filter: "*" },
      //DISTINCT IP
      { index: "logstash*", template: distinct_query_string, params: ["attrs.source"], filter: "*" },
      //TOTAL EVENT COUNT
      { index: "logstash*", template: query_string, filter: "*" },
      //DISTINCT URI
      { index: "logstash*", template: distinct_query_string, params: ["attrs.from.keyword"], filter: "*" },
    ], "overview");
  }

  /**
  * @swagger
  * /api/overview/table:
  *   post:
  *     description: Get data for table
  *     tags: [Overview]
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: pretty
  *         description: Return a pretty json
  *         in: query
  *         required: false
  *         type: bool
  *       - name: form
  *         description: Overview chart form
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
  static async getTable(req, res, next) {
    const types = await checkSelectedTypes([], "overview");
    super.requestTable(req, res, next, { index: "logstash*", filter: types });
  }

}

export default overviewController;
