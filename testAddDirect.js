import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  
  await page.evaluate(async () => {
     // Wait for window to load
     const mod = await import('/src/firebase.ts');
     const p = {
        id: Date.now(),
        price: '₹',
        image: '',
        images: [],
        colors: [],
        en: { name: 'Test Direct', badge: '', description: '', subcategory: '' },
        kn: { name: '', badge: '', description: '', subcategory: '' },
        categoryId: '',
        subcategoryId: '',
        inOffer: false,
        isDailyOffer: false,
        discountRate: '',
        offerPrice: '',
        stock: 0,
        specifications: []
     };
     await mod.saveProduct(p);
     console.log("Saved directly!");
  });

  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
