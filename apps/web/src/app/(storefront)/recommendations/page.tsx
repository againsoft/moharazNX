import { redirect } from "next/navigation";
import { storefrontPaths } from "@/lib/url-slug/storefront-paths";

export default function RecommendationsPage() {
  redirect(`${storefrontPaths.products}?sort=ai-pick`);
}
