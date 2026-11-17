import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new', args: ['--no-sandbox', '--disable-gpu'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 45000 });
await page.waitForSelector('.hero-title', { timeout: 20000 });
const heroMovie = await page.$eval('.hero-title', el => el.textContent);
const labelMovie = await page.evaluate(() => [...document.querySelectorAll('.hero-meta span')].map(s => s.textContent).join(' | '));

await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Séries')?.click());
await page.waitForFunction(() => document.querySelector('.hero-title')?.textContent.length > 0, { timeout: 15000 });
await new Promise(r => setTimeout(r, 2500)); // espera fetch do hero trocar
const heroTv = await page.$eval('.hero-title', el => el.textContent);
const labelTv = await page.evaluate(() => [...document.querySelectorAll('.hero-meta span')].map(s => s.textContent).join(' | '));

console.log('Hero Filmes:', heroMovie, '||', labelMovie);
console.log('Hero Séries:', heroTv, '||', labelTv);
console.log(heroMovie !== heroTv ? '✅ HERO TROCA AO ALTERNAR FILME/SÉRIE' : '❌ HERO NÃO TROCOU');
await browser.close();
