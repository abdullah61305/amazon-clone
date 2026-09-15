// Fetches DummyJSON once and writes a curated, enriched catalog to data/catalog.json.
// Run: node scripts/build-catalog.mjs
import { writeFileSync, mkdirSync } from 'node:fs';

const DEPARTMENTS = [
  { slug: 'electronics', name: 'Electronics', categories: ['smartphones', 'laptops', 'tablets', 'mobile-accessories'] },
  { slug: 'home-kitchen', name: 'Home & Kitchen', categories: ['kitchen-accessories', 'home-decoration', 'furniture'] },
  { slug: 'beauty', name: 'Beauty & Personal Care', categories: ['beauty', 'skin-care', 'fragrances'] },
  { slug: 'womens-fashion', name: "Women's Fashion", categories: ['tops', 'womens-dresses', 'womens-shoes', 'womens-bags', 'womens-jewellery', 'womens-watches'] },
  { slug: 'mens-fashion', name: "Men's Fashion", categories: ['mens-shirts', 'mens-shoes', 'mens-watches', 'sunglasses'] },
  { slug: 'sports-outdoors', name: 'Sports & Outdoors', categories: ['sports-accessories'] },
];

const CATEGORY_NAMES = {
  smartphones: 'Cell Phones', laptops: 'Laptops', tablets: 'Tablets', 'mobile-accessories': 'Phone Accessories',
  'kitchen-accessories': 'Kitchen & Dining', 'home-decoration': 'Home Décor', furniture: 'Furniture',
  beauty: 'Makeup', 'skin-care': 'Skin Care', fragrances: 'Fragrances',
  tops: 'Tops & Tees', 'womens-dresses': 'Dresses', 'womens-shoes': "Women's Shoes", 'womens-bags': 'Handbags',
  'womens-jewellery': 'Jewelry', 'womens-watches': "Women's Watches",
  'mens-shirts': "Men's Shirts", 'mens-shoes': "Men's Shoes", 'mens-watches': "Men's Watches", sunglasses: 'Sunglasses',
  'sports-accessories': 'Sports Equipment',
};

// Deterministic pseudo-random so the catalog is stable between runs.
const rand = (seed) => { const x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); };
const round99 = (n) => Math.max(0.99, Math.floor(n) + 0.99);

function variations(p) {
  const c = p.category;
  if (['smartphones', 'tablets'].includes(c)) {
    return { name: 'Capacity', options: [{ label: '128 GB', delta: 0 }, { label: '256 GB', delta: round99(p.price * 0.15) - 0.99 }, { label: '512 GB', delta: round99(p.price * 0.35) - 0.99 }] };
  }
  if (c === 'laptops') {
    return { name: 'Memory', options: [{ label: '16GB RAM | 512GB SSD', delta: 0 }, { label: '32GB RAM | 1TB SSD', delta: round99(p.price * 0.25) - 0.99 }] };
  }
  if (['mens-shoes', 'womens-shoes'].includes(c)) {
    return { name: 'Size', options: ['7', '8', '9', '10', '11'].map((label) => ({ label, delta: 0 })) };
  }
  if (['mens-shirts', 'tops', 'womens-dresses'].includes(c)) {
    return { name: 'Size', options: ['XS', 'S', 'M', 'L', 'XL'].map((label) => ({ label, delta: 0 })) };
  }
  if (c === 'fragrances') {
    return { name: 'Size', options: [{ label: '1.7 Fl Oz', delta: 0 }, { label: '3.4 Fl Oz', delta: round99(p.price * 0.6) - 0.99 }] };
  }
  return null;
}

const res = await fetch('https://dummyjson.com/products?limit=0');
const { products } = await res.json();

const deptOf = Object.fromEntries(DEPARTMENTS.flatMap((d) => d.categories.map((c) => [c, d.slug])));

const catalog = products
  .filter((p) => deptOf[p.category])
  .map((p) => {
    const r = rand(p.id);
    const price = Math.round(p.price * 100) / 100;
    const hasDeal = p.discountPercentage >= 8;
    const listPrice = hasDeal ? round99(price / (1 - p.discountPercentage / 100)) : null;
    const reviewCount = Math.round(40 + r * r * 48000);
    const bought = r > 0.75 ? '10K+' : r > 0.5 ? '5K+' : r > 0.3 ? '1K+' : r > 0.15 ? '500+' : null;
    return {
      id: p.id,
      slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title: p.title,
      brand: p.brand || null,
      description: p.description,
      department: deptOf[p.category],
      category: p.category,
      price,
      listPrice,
      rating: Math.round(Math.min(5, Math.max(3.4, p.rating + 0.6)) * 10) / 10,
      reviewCount,
      boughtLastMonth: bought,
      stock: p.stock,
      badge: r > 0.88 ? 'Best Seller' : r < 0.08 ? "Amazon's Choice" : null,
      primeDays: p.shippingInformation?.includes('overnight') ? 1 : p.shippingInformation?.includes('1-2') || p.shippingInformation?.includes('3-5') ? 2 : 3,
      warranty: p.warrantyInformation,
      returnPolicy: p.returnPolicy,
      specs: {
        Brand: p.brand || 'Generic',
        Weight: `${p.weight} lb`,
        Dimensions: `${p.dimensions.width} x ${p.dimensions.depth} x ${p.dimensions.height} in`,
        SKU: p.sku,
      },
      tags: p.tags,
      images: p.images,
      thumbnail: p.thumbnail,
      variation: variations(p),
      reviews: p.reviews.map(({ rating, comment, date, reviewerName }) => ({ rating, comment, date, reviewerName })),
    };
  });

mkdirSync('data', { recursive: true });
writeFileSync(
  'data/catalog.json',
  JSON.stringify({ departments: DEPARTMENTS.map(({ slug, name, categories }) => ({ slug, name, categories: categories.map((c) => ({ slug: c, name: CATEGORY_NAMES[c] })) })), products: catalog }, null, 1),
);
console.log(`Wrote ${catalog.length} products`);
