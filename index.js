require('dotenv').config();
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const url = process.env.TARGET_URL;
  await page.goto(url, { waitUntil: 'networkidle0' });

  await page.type('[name="UserID"]', process.env.LOGIN_ID);
  await page.type('[name="_word"]', process.env.PASSWORD);
  await page.click('#login-btn');
  await page.waitForNavigation();

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click('li[title="ウェブメール"] > a')
  ]);

  const pages = await browser.pages();
  const mailPage = pages[2];

  await mailPage.waitForNavigation({ waitUntil: 'networkidle0' });
  await mailPage.hover('#mail-slide_bar');
  await mailPage.mouse.down();
  await mailPage.mouse.move(500, 600);
  await mailPage.mouse.up();

  const mails = await mailPage.$$eval('tr.mail-table-row-unread', rows => {
    return Array.prototype.map.call(rows, mail => {
      const sender = mail
        .querySelector('.mail-table-cell-from > .com_table-box')
        .innerText;
      const subject = mail
        .querySelector('.mail-table-cell-subject > .com_table-box')
        .innerText;

      return { sender, subject };
    });
  });

  mails.forEach(mail => {
    console.log(mail);
  });

  await browser.close();
})();
