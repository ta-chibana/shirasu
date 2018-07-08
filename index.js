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

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click('li[title="ウェブメール"]>a')
  ]);

  const pages = await browser.pages();
  const mailPage = pages[2];

  await mailPage.waitForNavigation({ waitUntil: 'networkidle0' });
  await mailPage.hover('#mail-slide_bar');
  await mailPage.mouse.down();
  await mailPage.mouse.move(500, 600);
  await mailPage.mouse.up();

  await setTimeout(async () => {
    await browser.close();
  }, 10000);
})();
