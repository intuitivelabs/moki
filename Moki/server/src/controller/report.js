// report.js hold the report endpoint

const puppeteer = require('puppeteer');
const fs = require('fs');
const Controller = require('./controller');

class reportController extends Controller {

  static getReport(req, res, next) {
    async function getPDF() {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setViewport({
        width: 1200,
        height: 2000,
        deviceScaleFactor: 1,
      });

      await page.goto('https://siem.intuitivelabs.com/web', { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'A4', margin: {
          top: '0px',
          bottom: '0px',
          right: '20px'
        }
      });

      await browser.close();


      //store it

      fs.writeFile("/etc/abc-monitor/report.pdf", pdf, 'binary', function (error, stdout, stderr) {
        if (error) {
          console.error(error);
          return res.json(error);

        }
        return res.json(pdf);

      })
    }

    return getPDF().catch(e => {
      return next(e);
    });
  }

}

module.exports = reportController;
