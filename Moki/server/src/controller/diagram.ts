// hold the setting endpoints

import { Request, Response, NextFunction } from "express";
import { bundlePCAPFlow, loadPCAPs, runDecap } from "@/lib/diagram/pcap.js";

const ERR_NO_PCAP = { Error: "Error: No PCAP file specified" };
const ERR_NO_FILES_ARRAY = { Error: "Error: Files must be given in an array" };

/**
 * Check that files param is valid, return null if valid, else the error
 */
function checkFilesParam(req: Request): { Error: string } | null {
  if (req.body.urls == null) {
    return ERR_NO_PCAP;
  }
  if (!(req.body.urls instanceof Array)) {
    return ERR_NO_FILES_ARRAY;
  }
  return null;
}

/**
 * @swagger
 * tags:
 *   name: Diagram
 *   description: Diagram and PCAP management
 */

class DiagramController {
  /**
   * @swagger
   * /api/download/pcap:
   *   get:
   *     description: Return PCAP file content, if multiple
   *     urls are provided, merge the PCAPs together.
   *     tags: [Diagram]
   *     produces:
   *       - application
   *     parameters:
   *         description: pcap filenames
   *     responses:
   *       200:
   *         description: pcap files
   *         content:
   *           application:
   *             example:
   *               {pcap}
   *       500:
   *         description: internal error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/definitions/Error'
   *             example:
   *               error: "bash: not found"
   */
  static downloadPCAPs(req: Request, res: Response, next: NextFunction) {
    const error = checkFilesParam(req);
    if (error) return res.status(400).send(error);

    try {
      const readStream = loadPCAPs(req.body.urls, next);
      res.writeHead(200, {
        "Content-Type": "application/octet-stream",
      });
      readStream.pipe(res);
    } catch (err) {
      res.status(400).send({ err });
    }
  }

  /**
   * @swagger
   * /api/diagram:
   *   get:
   *     description: return xml pcap file to render sequence diagram
   *     tags: [Diagram]
   *     produces:
   *       - application/xml
   *     parameters:
   *         description: xml file
   *     responses:
   *       200:
   *         description: xml file
   *         content:
   *           application:
   *             example:
   *               {xml}
   *       500:
   *         description: internal error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/definitions/Error'
   *             example:
   *               error: "bash: not found"
   */
  static decapPCAP(req: Request, res: Response, next: NextFunction) {
    const error = checkFilesParam(req);
    if (error) return res.status(400).send(error);

    try {
      const readStream = runDecap(req.body.urls, next);
      res.writeHead(200, {
        "Content-Type": "application/octet-stream",
      });
      readStream.pipe(res);
    } catch (err) {
      res.status(400).send(err);
    }
  }

  /**
   * @swagger
   * /api/download/diagram:
   *   get:
   *     description: return html file with inserted xml to render whole diagram without needed external xml file
   *     tags: [Diagram]
   *     produces:
   *       - application/html
   *     parameters:
   *         description: html file
   *     responses:
   *       200:
   *         description: html file
   *         content:
   *           application:
   *             example:
   *               {html}
   *       500:
   *         description: internal error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/definitions/Error'
   *             example:
   *               error: "bash: not found"
   */
  static bundleSequenceDiagram(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const error = checkFilesParam(req);
    if (error) return res.status(400).send(error);

    try {
      const flowStream = runDecap(req.body.urls, next);
      const readStream = bundlePCAPFlow(flowStream, next);
      res.writeHead(200, {
        "Content-Type": "application/octet-stream",
      });
      readStream.pipe(res);
    } catch (err) {
      res.status(400).send(err);
    }
  }
}

export default DiagramController;
