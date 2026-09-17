// script rapido pra tirar screenshots do portfolio
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const url = 'file:///C:/Users/User/Desktop/portfolio%20vyctor/index.html';
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  await page.screenshot({ path: path.join(__dirname, '_shot-hero.png'), fullPage: false });

  // scroll para section 2 (projetos)
  await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 1.1, behavior: 'instant' }));
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(__dirname, '_shot-sobre.png'), fullPage: false });

  // scroll para projetos
  await page.evaluate(() => document.getElementById('projetos').scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(__dirname, '_shot-projetos.png'), fullPage: false });

  // scroll para habilidades
  await page.evaluate(() => document.getElementById('habilidades').scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(__dirname, '_shot-skills.png'), fullPage: false });

  // scroll para contato
  await page.evaluate(() => document.getElementById('contato').scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(__dirname, '_shot-contato.png'), fullPage: false });

  // mobile view
  await ctx.close();
  const ctxM = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const pageM = await ctxM.newPage();
  await pageM.goto(url, { waitUntil: 'networkidle' });
  await pageM.waitForTimeout(1500);
  await pageM.screenshot({ path: path.join(__dirname, '_shot-mobile.png'), fullPage: false });

  await browser.close();
  console.log('OK');
})();