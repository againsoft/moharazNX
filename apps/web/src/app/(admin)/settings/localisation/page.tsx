import { redirect } from "next/navigation";

export default function LocalisationIndexPage() {
  redirect("/settings/localisation/store-locations");
}
