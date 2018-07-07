require('dotenv').config();
const puppeteer = require('puppeteer');

const url = process.env.TARGET_URL;

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const url = process.env.TARGET_URL;
  await page.goto(url, { waitUntil: 'networkidle0' });

  await page.type('[name="UserID"]', process.env.LOGIN_ID);
  await page.type('[name="_word"]', process.env.PASSWORD);

  await Promise.all([
    page.waitForNavigation(),
    page.click('#login-btn')
  ]);

  await setTimeout(async () => {
    console.log('hello');
    await browser.close();
  }, 10000);
})();
