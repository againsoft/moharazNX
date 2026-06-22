import type { LocalisationResourceId } from "@/lib/localisation/resources";

export type LocalisationRow = Record<string, string | number | boolean>;

const storeLocations: LocalisationRow[] = [
  { id: "loc_1", name: "Dhaka HQ", code: "DHK-HQ", city: "Dhaka", type: "Warehouse", status: "Active", isDefault: true },
  { id: "loc_2", name: "Chittagong Hub", code: "CTG-HUB", city: "Chittagong", type: "Warehouse", status: "Active", isDefault: false },
  { id: "loc_3", name: "Gulshan Showroom", code: "GLS-STORE", city: "Dhaka", type: "Retail", status: "Active", isDefault: false },
  { id: "loc_4", name: "Online Fulfilment", code: "ONLINE", city: "Dhaka", type: "Virtual", status: "Active", isDefault: false },
];

const languages: LocalisationRow[] = [
  { id: "lang_1", name: "English", code: "en", locale: "en-BD", direction: "LTR", status: "Active", isDefault: true },
  { id: "lang_2", name: "Bengali", code: "bn", locale: "bn-BD", direction: "LTR", status: "Active", isDefault: false },
  { id: "lang_3", name: "Arabic", code: "ar", locale: "ar-SA", direction: "RTL", status: "Inactive", isDefault: false },
];

const currencies: LocalisationRow[] = [
  { id: "cur_1", name: "Bangladeshi Taka", code: "BDT", symbol: "৳", rate: "1.0000", status: "Active", isDefault: true },
  { id: "cur_2", name: "US Dollar", code: "USD", symbol: "$", rate: "0.0091", status: "Active", isDefault: false },
  { id: "cur_3", name: "Euro", code: "EUR", symbol: "€", rate: "0.0084", status: "Active", isDefault: false },
];

const stockStatuses: LocalisationRow[] = [
  { id: "ss_1", name: "In Stock", color: "Green", notify: "No", showOnStorefront: "Yes", sortOrder: 1 },
  { id: "ss_2", name: "Low Stock", color: "Amber", notify: "Yes", showOnStorefront: "Yes", sortOrder: 2 },
  { id: "ss_3", name: "Out of Stock", color: "Red", notify: "Yes", showOnStorefront: "Yes", sortOrder: 3 },
  { id: "ss_4", name: "Pre-order", color: "Blue", notify: "No", showOnStorefront: "Yes", sortOrder: 4 },
];

const orderStatuses: LocalisationRow[] = [
  { id: "os_1", name: "Pending", color: "Amber", sendEmail: "Yes", fulfillment: "Unfulfilled", sortOrder: 1 },
  { id: "os_2", name: "Processing", color: "Blue", sendEmail: "Yes", fulfillment: "Unfulfilled", sortOrder: 2 },
  { id: "os_3", name: "Shipped", color: "Indigo", sendEmail: "Yes", fulfillment: "Partial", sortOrder: 3 },
  { id: "os_4", name: "Delivered", color: "Green", sendEmail: "Yes", fulfillment: "Fulfilled", sortOrder: 4 },
  { id: "os_5", name: "Cancelled", color: "Red", sendEmail: "Yes", fulfillment: "Cancelled", sortOrder: 5 },
];

const countries: LocalisationRow[] = [
  { id: "co_1", name: "Bangladesh", iso2: "BD", iso3: "BGD", phoneCode: "+880", status: "Active" },
  { id: "co_2", name: "India", iso2: "IN", iso3: "IND", phoneCode: "+91", status: "Active" },
  { id: "co_3", name: "United States", iso2: "US", iso3: "USA", phoneCode: "+1", status: "Active" },
  { id: "co_4", name: "United Kingdom", iso2: "GB", iso3: "GBR", phoneCode: "+44", status: "Active" },
];

const regions: LocalisationRow[] = [
  { id: "reg_1", name: "Dhaka Division", code: "DHK", country: "Bangladesh", status: "Active" },
  { id: "reg_2", name: "Chittagong Division", code: "CTG", country: "Bangladesh", status: "Active" },
  { id: "reg_3", name: "Maharashtra", code: "MH", country: "India", status: "Active" },
  { id: "reg_4", name: "California", code: "CA", country: "United States", status: "Active" },
];

const zones: LocalisationRow[] = [
  { id: "zn_1", name: "Dhaka Metro", code: "DHK-M", region: "Dhaka Division", country: "Bangladesh", status: "Active" },
  { id: "zn_2", name: "Gulshan", code: "GLS", region: "Dhaka Division", country: "Bangladesh", status: "Active" },
  { id: "zn_3", name: "Agrabad", code: "AGR", region: "Chittagong Division", country: "Bangladesh", status: "Active" },
  { id: "zn_4", name: "Mumbai", code: "BOM", region: "Maharashtra", country: "India", status: "Active" },
];

const geoZones: LocalisationRow[] = [
  { id: "gz_1", name: "Bangladesh Domestic", description: "All BD regions for local shipping", zoneCount: 8, status: "Active" },
  { id: "gz_2", name: "South Asia", description: "BD + IN for regional rates", zoneCount: 12, status: "Active" },
  { id: "gz_3", name: "International", description: "US, UK, EU export zones", zoneCount: 24, status: "Active" },
  { id: "gz_4", name: "EU VAT Zone", description: "EU tax and compliance grouping", zoneCount: 27, status: "Inactive" },
];

export const LOCALISATION_MOCK_DATA: Record<LocalisationResourceId, LocalisationRow[]> = {
  "store-locations": storeLocations,
  languages,
  currencies,
  "stock-statuses": stockStatuses,
  "order-statuses": orderStatuses,
  countries,
  regions,
  zones,
  "geo-zones": geoZones,
};

export function formatLocalisationCell(value: string | number | boolean | undefined): string {
  if (value === undefined || value === null) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}
