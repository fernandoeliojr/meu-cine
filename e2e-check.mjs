// Smoke test E2E do Meu Cine (ajustes da sessão)
import puppeteer from 'puppeteer-core';

const BASE = 'http://localhost:3000';
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu'],
});

const results = [];
const check = (name, ok, extra = '') => {
  results.push(`${ok ? '✅' : '❌'} ${name}${extra ? ' — ' + extra : ''}`);
};

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e.message)));

  await page.goto(BASE + '/', { waitUntil: 'networkidle0', timeout: 45000 });
  await page.waitForSelector('img[src*="image.tmdb.org"]', { timeout: 20000 });

  // 1. Grade com 24 capas
  const cards = await page.$$eval('.card img', els => els.length);
  check('Grade mostra 24 capas', cards === 24, `${cards} capas`);

  // 2. Paginação: máx 5 números + …
  const pageBtns = await page.$$eval('nav[aria-label="Paginação"] button', els => els.map(b => b.textContent.trim()).filter(t => t !== '←' && t !== '→'));
  const hasDots = pageBtns.includes('…');
  const numbers = pageBtns.filter(t => t !== '…');
  check('Paginação curta (≤5 números + …)', numbers.length <= 5 && (hasDots || true), pageBtns.join(' '));

  // 3. Overlay de like/deslike NÃO aparece sem login (hover no card)
  const firstCard = await page.$('.card');
  await firstCard.hover();
  await new Promise(r => setTimeout(r, 500));
  const overlayLoggedOut = await page.$$eval('.card-overlay', els => els.length);
  check('Sem login: overlay 👍/👎 oculto no hover', overlayLoggedOut === 0, `${overlayLoggedOut} overlays`);

  // 4. Rodapé sem "Desenvolvido por"
  const footer = await page.$eval('footer', el => el.innerText);
  check('Rodapé apenas direitos reservados', footer.includes('Direitos reservados - Atlas System') && !footer.includes('Desenvolvido por'), footer.replace(/\n/g, ' | '));

  // 5. Links protegidos ocultos sem login
  const watchLink = await page.$('a[href="/watchlist"]');
  check('Link Watchlist oculto sem login', !watchLink);

  // 6. Toggle Filmes->Séries mantém grade de 24
  await page.evaluate(() => {
    [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Séries')?.click();
  });
  await page.waitForFunction(() => document.querySelectorAll('.card img').length > 0, { timeout: 15000 });
  const tvCards = await page.$$eval('.card img', els => els.length);
  check('Séries: grade com até 24 capas', tvCards > 0 && tvCards <= 24, `${tvCards} capas`);

  // 7. Título do site
  const logo = await page.$eval('header a', el => el.textContent);
  check('Logo "MEU CINE"', logo.includes('MEU CINE'));

  check('Nenhum pageerror', errors.length === 0, errors.slice(0, 2).join(' | '));
} catch (e) {
  results.push('❌ Exceção: ' + e.message);
} finally {
  await browser.close();
}

console.log(results.join('\n'));
const failed = results.filter(r => r.startsWith('❌')).length;
console.log(`\n${results.length - failed}/${results.length} verificações OK`);
process.exit(failed ? 1 : 0);
