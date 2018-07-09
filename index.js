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

  const unreadCountSelector = [
    '.mail-folder-node-received',
    '.tree-link',
    '.mail-folder-unread-container',
    '.mail-folder-unread'
  ].join(' > ');
  const unreadCount = await mailPage.$eval(unreadCountSelector, e => e.innerText);
  if (parseInt(unreadCount) === 0) return;

  await mailPage.click('.toolbar-item[data-action="search"]');
  await mailPage.waitFor('[name="unseen"]');
  await mailPage.click('[name="unseen"]');
  await mailPage.click('.search-button-container > [data-action="exec_search"]');

  const slideBarSelector = '#mail-slide_bar';
  await mailPage.waitFor(slideBarSelector);
  await mailPage.hover(slideBarSelector);
  await mailPage.mouse.down();
  await mailPage.mouse.move(500, 600);
  await mailPage.mouse.up();

  // TODO: unreadSelectorに対応するnodeがない場合の処理
  const unreadSelector = 'tr.mail-table-row-unread';
  await mailPage.waitFor(unreadSelector);
  const mails = await mailPage.$$eval(unreadSelector, rows => {
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

  await browser.close();

  mails.forEach(mail => {
    console.log(mail);
  });
})();
