import { redirect } from "next/navigation";

export default function AddProductPage() {
  redirect("/catalog/products?create=1");
}
