const fs = require('fs');
let code = fs.readFileSync('src/store.ts', 'utf-8');

const replacement = `const defaultProducts: Product[] = [
  {
    id: 1,
    price: '₹ 15,999',
    image: 'https://images.unsplash.com/photo-1610189013669-7b3b33190805?auto=format&fit=crop&q=80',
    en: { name: 'Kanjivaram Silk Saree', badge: 'Bestseller', description: 'Authentic Kanjivaram silk saree with zari border.', subcategory: 'Silk' },
    kn: { name: 'ಕಾಂಜೀವರಂ ರೇಷ್ಮೆ ಸೀರೆ', badge: 'ಹೆಚ್ಚು ಮಾರಾಟ', description: 'ಅಪ್ಪಟ ಕಾಂಜೀವರಂ ರೇಷ್ಮೆ ಸೀರೆ, ಜರಿ ಅಂಚುಗಳೊಂದಿಗೆ.', subcategory: 'ರೇಷ್ಮೆ' },
    categoryId: 'cat-1',
    stock: 5,
    specifications: [
      { key: 'Material', value: '100% Pure Silk' },
      { key: 'Wash Care', value: 'Dry Clean Only' }
    ]
  },
  {
    id: 2,
    price: '₹ 8,499',
    image: 'https://images.unsplash.com/photo-1583391733958-d25e77d20626?auto=format&fit=crop&q=80',
    en: { name: 'Banarasi Brocade Saree', badge: 'New Arrival', description: 'Intricate Banarasi brocade work for festive occasions.', subcategory: 'Brocade' },
    kn: { name: 'ಬನಾರಸಿ ಬ್ರೊಕೇಡ್ ಸೀರೆ', badge: 'ಹೊಸ ಆಗಮನ', description: 'ಹಬ್ಬದ ದಿನಗಳಿಗಾಗಿ ಸಂಕೀರ್ಣವಾದ ಬನಾರಸಿ ಬ್ರೊಕೇಡ್ ಕೆಲಸ.', subcategory: 'ಬ್ರೊಕೇಡ್' },
    categoryId: 'cat-1',
    stock: 12,
    specifications: [
      { key: 'Material', value: 'Silk Blend' },
      { key: 'Wash Care', value: 'Dry Clean Only' }
    ]
  }
];`;

code = code.replace(/const defaultProducts: Product\[\] = \[\];/, replacement);
fs.writeFileSync('src/store.ts', code);
