#! /usr/bin/env /usr/local/bin/node
const puppeteer = require('puppeteer');
const path = require('path');

const configPath = path.join(path.dirname(process.argv[1]), '.env');
const env = require('dotenv').config({ path: configPath });
if (env.error) {
  throw env.error;
}

const truncate = (text, length) => {
  const trimed = text.trim();
  if (trimed.length < length) {
    return trimed;
  }

  return `${trimed.substring(0, length)}...`;
}

const printMails = mails => {
  if (mails.length === 0) {
    printEmpty();
    return;
  }

  console.log(`:mailbox_with_mail: ${mails.length} | color=#00ffff`);
  console.log('---');

  mails.forEach(mail => {
    const { sender, subject, date } = mail;
    const row = [
      `:calendar:${date} `,
      `${truncate(sender, 10)} `,
      `:arrow_forward:${truncate(subject, 30)}`
    ].join('');
    console.log(row);
  });
}

const printEmpty = () => {
  console.log(':mailbox_with_no_mail: 0');
  console.log('---');
  console.log('unread mail not exists.');
}

const printError = error => {
  console.log(':mailbox_with_no_mail:');
  console.log('---');
  console.error(error);
}

const fetchMails = async browser => {
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

  if (parseInt(unreadCount) === 0) return [];

  await mailPage.click('.toolbar-item[data-action="search"]');
  await mailPage.waitFor('[name="unseen"]');
  await mailPage.click('[name="unseen"]');
  await mailPage.click('[name="sfolder"]');
  await mailPage.click('.search-button-container > [data-action="exec_search"]');

  const slideBarSelector = '#mail-slide_bar';
  await mailPage.waitFor(slideBarSelector);
  await mailPage.hover(slideBarSelector);
  await mailPage.mouse.down();
  await mailPage.mouse.move(500, 600);
  await mailPage.mouse.up();

  const unreadSelector = 'tr.mail-table-row-unread';
  await mailPage.waitFor(unreadSelector);
  const selectors = {
    from: '.mail-table-cell-from > .com_table-box',
    subject: '.mail-table-cell-subject > .com_table-box',
    datetime: '.mail-table-cell-datetime > .com_table-box'
  };
  return mailPage.$$eval(unreadSelector, (rows, selectors) => {
    return Array.prototype.map.call(rows, mail => {
      const sender = mail
        .querySelector(selectors.from)
        .innerText;
      const subject = mail
        .querySelector(selectors.subject)
        .innerText;
      const date = mail
        .querySelector(selectors.datetime)
        .innerText;

      return { sender, subject, date };
    });
  }, selectors);
}

(async () => {
  const browser = await puppeteer.launch();

  try {
    const mails = await fetchMails(browser);
    printMails(mails);
  } catch (e) {
    printError(e);
  } finally {
    console.log('refresh | color=red refresh=true');
    await browser.close();
  }
})();
