import { products } from "./products";
import { computerBlogPosts } from "./storefront-computer-store";
import { toStorefrontProduct } from "./storefront-home";
import type { StorefrontProduct } from "./storefront-types";

export type BlogCategory = "style" | "tech" | "home" | "beauty" | "guides";

export type StorefrontBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: BlogCategory;
  author: string;
  readMinutes: number;
  featured?: boolean;
  body?: string[];
};

export const BLOG_CATEGORIES: { value: BlogCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "style", label: "Style" },
  { value: "tech", label: "Tech" },
  { value: "home", label: "Home" },
  { value: "beauty", label: "Beauty" },
  { value: "guides", label: "Guides" },
];

export const blogPosts: StorefrontBlogPost[] = [
  {
    id: "blog1",
    slug: "summer-style-guide",
    title: "Summer style guide 2026",
    excerpt: "Five essentials to refresh your wardrobe without breaking the bank.",
    image: "https://picsum.photos/seed/blog1/800/500",
    date: "Jun 8, 2026",
    category: "style",
    author: "Nadia Rahman",
    readMinutes: 5,
    featured: true,
    body: [
      "Summer in Bangladesh means light fabrics, breathable layers, and colors that feel fresh without trying too hard. This season we're keeping it simple: fewer pieces, better quality, more versatility.",
      "Start with a neutral linen shirt — it works over a tee for casual Fridays or tucked into chinos for evening plans. Pair with one statement accessory: a woven belt or minimal watch goes a long way.",
      "For footwear, white sneakers remain the default, but consider a slip-on espadrille for weekend outings. They're easy to pack and work with shorts or cropped trousers.",
      "Our top pick from the catalog: the Premium Cotton T-Shirt in sand and navy — under ৳500 during flash deals, and durable enough to last the full season.",
    ],
  },
  {
    id: "blog2",
    slug: "smart-home-starter",
    title: "Smart home starter kit",
    excerpt: "Build your connected home with these beginner-friendly gadgets.",
    image: "https://picsum.photos/seed/blog2/800/500",
    date: "Jun 5, 2026",
    category: "tech",
    author: "Karim Hassan",
    readMinutes: 6,
    body: [
      "You don't need a full renovation to make your apartment smarter. Start with three devices: a smart plug, a voice assistant speaker, and one smart bulb in your main living area.",
      "Smart plugs let you schedule fans and lamps — useful during load-shedding when you want lights on before you arrive home. Most work with bKash-linked apps for local payment support.",
      "Add a smart doorbell or indoor camera only after you're comfortable with the basics. Privacy settings matter: enable two-factor auth and review recording schedules monthly.",
      "Browse our Electronics category for USB-C hubs, LED lamps, and speakers that integrate cleanly without cluttering your setup.",
    ],
  },
  {
    id: "blog3",
    slug: "skincare-routine",
    title: "Minimal skincare routine",
    excerpt: "Dermatologist-backed steps for busy professionals.",
    image: "https://picsum.photos/seed/blog3/800/500",
    date: "Jun 1, 2026",
    category: "beauty",
    author: "Dr. Samira Chowdhury",
    readMinutes: 4,
    body: [
      "A three-step routine beats a ten-step shelf. Cleanse, treat, protect — morning and night. Skip anything that stings or leaves your skin tight.",
      "In humid climates, gel cleansers outperform heavy creams. Follow with a lightweight serum (niacinamide or vitamin C) and SPF 30+ every morning, even indoors near windows.",
      "Our Organic Face Serum has been a consistent bestseller — gentle enough for daily use, with reviews noting visible brightness after two weeks.",
    ],
  },
  {
    id: "blog4",
    slug: "small-space-living",
    title: "Small space living tips",
    excerpt: "Maximize a compact apartment with smart storage and layout.",
    image: "https://picsum.photos/seed/blog4/800/500",
    date: "May 28, 2026",
    category: "home",
    author: "HomeNest Editors",
    readMinutes: 5,
    body: [
      "Vertical storage wins in Dhaka apartments. Wall-mounted shelves free floor space and draw the eye upward, making rooms feel taller.",
      "Multi-use furniture — ottomans with storage, nesting tables — reduces clutter without sacrificing style. Stick to a tight color palette: two neutrals plus one accent.",
      "Kitchen zones matter: keep daily items at counter height, bulk goods higher. Our Ceramic Coffee Mug Set and Stainless Water Bottle are customer favorites for tidy, matching sets.",
    ],
  },
  {
    id: "blog5",
    slug: "gift-guide-under-2000",
    title: "Gift guide: best picks under ৳2,000",
    excerpt: "Thoughtful gifts that don't feel cheap — curated by our team.",
    image: "https://picsum.photos/seed/blog5/800/500",
    date: "May 22, 2026",
    category: "guides",
    author: "MoharazNX Team",
    readMinutes: 3,
    body: [
      "Great gifts aren't about price tags — they're about knowing someone. Under ৳2,000 you can still deliver a premium unboxing experience.",
      "For coworkers: scented candles, quality notebooks, or a compact Bluetooth speaker. For family: running shoes on sale, graphic hoodies, or skincare minis.",
      "Pro tip: add a handwritten note and ship direct — we offer gift-friendly packaging at checkout.",
    ],
  },
  {
    id: "blog6",
    slug: "wireless-earbuds-buying-guide",
    title: "How to choose wireless earbuds",
    excerpt: "Battery, fit, and codec support — what actually matters.",
    image: "https://picsum.photos/seed/blog6/800/500",
    date: "May 15, 2026",
    category: "tech",
    author: "Karim Hassan",
    readMinutes: 7,
    body: [
      "ANC isn't mandatory for everyone. If you commute on foot or ride in quiet cars, save money and prioritize fit and battery life instead.",
      "Look for IPX4 or higher if you exercise. Touch controls are convenient but easy to trigger by accident — button controls still win for many users.",
      "Our Wireless Earbuds Pro balance call quality and bass — check current deals before buying; they frequently drop 20–30% during flash sales.",
    ],
  },
];

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((p) => p.slug === slug) ?? computerBlogPosts.find((p) => p.slug === slug);
}

export function getFeaturedPost() {
  return blogPosts.find((p) => p.featured) ?? blogPosts[0];
}

export function getRelatedPosts(slug: string, limit = 4) {
  const post = getBlogPostBySlug(slug);
  if (!post) return [];
  const same = blogPosts.filter((p) => p.slug !== slug && p.category === post.category);
  if (same.length >= limit) return same.slice(0, limit);
  const others = blogPosts.filter((p) => p.slug !== slug && p.category !== post.category);
  return [...same, ...others].slice(0, limit);
}

const CATEGORY_PRODUCT_MAP: Record<BlogCategory, string> = {
  style: "Apparel",
  tech: "Electronics",
  home: "Home",
  beauty: "Beauty",
  guides: "Home",
};

const SLUG_PRODUCT_KEYWORDS: Record<string, string[]> = {
  "skincare-routine": ["Face Serum", "Serum"],
  "summer-style-guide": ["T-Shirt", "Dress", "Hoodie"],
  "smart-home-starter": ["Speaker", "Lamp", "Hub"],
  "wireless-earbuds-buying-guide": ["Earbuds", "Watch"],
  "small-space-living": ["Mug", "Bottle", "Lamp"],
  "gift-guide-under-2000": ["Candle", "Wallet", "Bottle"],
};

export function getPostsInCategory(category: BlogCategory, excludeSlug?: string) {
  return blogPosts.filter((p) => p.category === category && p.slug !== excludeSlug);
}

export function getRelatedProductsForPost(slug: string, limit = 4): StorefrontProduct[] {
  const post = getBlogPostBySlug(slug);
  if (!post) return [];

  const productCategory = CATEGORY_PRODUCT_MAP[post.category];
  const keywords = SLUG_PRODUCT_KEYWORDS[slug] ?? [];

  let matched = products.filter(
    (p) => p.status === "published" && p.category === productCategory,
  );

  if (keywords.length > 0) {
    matched.sort((a, b) => {
      const aHit = keywords.some((k) => a.name.includes(k)) ? 1 : 0;
      const bHit = keywords.some((k) => b.name.includes(k)) ? 1 : 0;
      return bHit - aHit;
    });
  }

  if (matched.length < limit) {
    const extra = products.filter(
      (p) => p.status === "published" && !matched.some((m) => m.id === p.id),
    );
    matched = [...matched, ...extra];
  }

  return matched.slice(0, limit).map((p, i) => toStorefrontProduct(p, i));
}

export function filterBlogPosts(category: BlogCategory | "all") {
  if (category === "all") return blogPosts;
  return blogPosts.filter((p) => p.category === category);
}
