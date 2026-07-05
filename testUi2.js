import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const adminBtn = btns.find(b => b.textContent.includes('Admin'));
    if (adminBtn) adminBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const addBtn = btns.find(b => b.textContent.includes('Add Product'));
    if (addBtn) addBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: 'before_save.png' });
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const saveBtn = btns.find(b => b.textContent.includes('Save Product to Store'));
    if (saveBtn) {
       console.log("Found save btn!");
       saveBtn.click();
    } else {
       console.log("Could not find save btn");
    }
  });

  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
