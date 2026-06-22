import { toStorefrontProduct } from "./storefront-home";
import { products } from "./products";

const published = products.filter((p) => p.status === "published");

export const crossSell = published.slice(30, 36).map((p, i) => toStorefrontProduct(p, i));
