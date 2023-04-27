import puppeteer from 'puppeteer';

const scrape = (async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://app.datadoghq.com/dashboard/aj6-7mt-c7x/backend-metrics?from_ts=1682531393143&to_ts=1682534993143&live=true');
  await page.screenshot('./result.jpg');
  await browser.close();
})();

export {scrape};
