import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:3000');
  
  // Wait for 3 seconds to let React render
  await new Promise(r => setTimeout(r, 3000));
  
  // click admin button
  // Wait, I need to know the selector
  await browser.close();
})();
