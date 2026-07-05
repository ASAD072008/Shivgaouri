import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.error('PAGE ERROR:', error.message));

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  
  // click admin button
  console.log("Clicking admin...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const adminBtn = btns.find(b => b.textContent.includes('Admin'));
    if (adminBtn) adminBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  // click add product button
  console.log("Clicking add product...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const addBtn = btns.find(b => b.textContent.includes('Add Product'));
    if (addBtn) addBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));

  // click save product to store
  console.log("Clicking save product...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const saveBtn = btns.find(b => b.textContent.includes('Save Product to Store'));
    if (saveBtn) saveBtn.click();
  });

  await new Promise(r => setTimeout(r, 2000));
  
  console.log("Done");
  await browser.close();
})();
