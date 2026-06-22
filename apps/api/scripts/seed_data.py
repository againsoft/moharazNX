#!/usr/bin/env python3
"""Seed MoharazNX catalog_products — computer-store style (BDT)."""

from decimal import Decimal

from app.database import SessionLocal
from app.models.catalog_product import CatalogProduct

CATALOG_SEED: list[dict] = [
    {
        "name": "ASUS TUF Gaming F15",
        "slug": "asus-tuf-gaming-f15",
        "sku": "SKU-ASUS-F15",
        "price": Decimal("89999.00"),
        "stock": 12,
        "status": "published",
        "brand": "ASUS",
        "category": "Laptops",
        "thumbnail": "https://picsum.photos/seed/asus-f15/80/80",
    },
    {
        "name": "Dell Inspiron 15",
        "slug": "dell-inspiron-15",
        "sku": "SKU-DELL-15",
        "price": Decimal("64999.00"),
        "stock": 8,
        "status": "published",
        "brand": "Dell",
        "category": "Laptops",
        "thumbnail": "https://picsum.photos/seed/dell-15/80/80",
    },
    {
        "name": "HP Pavilion 14",
        "slug": "hp-pavilion-14",
        "sku": "SKU-HP-P14",
        "price": Decimal("58999.00"),
        "stock": 15,
        "status": "published",
        "brand": "HP",
        "category": "Laptops",
        "thumbnail": "https://picsum.photos/seed/hp-p14/80/80",
    },
    {
        "name": "Lenovo IdeaPad Slim 5",
        "slug": "lenovo-ideapad-slim-5",
        "sku": "SKU-LNV-SL5",
        "price": Decimal("72999.00"),
        "stock": 6,
        "status": "published",
        "brand": "Lenovo",
        "category": "Laptops",
        "thumbnail": "https://picsum.photos/seed/lenovo-sl5/80/80",
    },
    {
        "name": "MacBook Air M2",
        "slug": "macbook-air-m2",
        "sku": "SKU-APL-MBA2",
        "price": Decimal("134999.00"),
        "stock": 4,
        "status": "published",
        "brand": "Apple",
        "category": "Laptops",
        "thumbnail": "https://picsum.photos/seed/mba-m2/80/80",
    },
    {
        "name": "Logitech MX Master 3S",
        "slug": "logitech-mx-master-3s",
        "sku": "SKU-LOGI-MX3S",
        "price": Decimal("8990.00"),
        "stock": 45,
        "status": "published",
        "brand": "Logitech",
        "category": "Accessories",
        "thumbnail": "https://picsum.photos/seed/logi-mx/80/80",
    },
    {
        "name": "Razer DeathAdder V3",
        "slug": "razer-deathadder-v3",
        "sku": "SKU-RZR-DA3",
        "price": Decimal("7490.00"),
        "stock": 30,
        "status": "published",
        "brand": "Razer",
        "category": "Accessories",
        "thumbnail": "https://picsum.photos/seed/razer-da3/80/80",
    },
    {
        "name": "Samsung 27\" Odyssey G5",
        "slug": "samsung-odyssey-g5-27",
        "sku": "SKU-SAM-G527",
        "price": Decimal("32999.00"),
        "stock": 10,
        "status": "published",
        "brand": "Samsung",
        "category": "Monitors",
        "thumbnail": "https://picsum.photos/seed/sam-g5/80/80",
    },
    {
        "name": "LG UltraWide 34WP65C",
        "slug": "lg-ultrawide-34wp65c",
        "sku": "SKU-LG-UW34",
        "price": Decimal("45999.00"),
        "stock": 7,
        "status": "published",
        "brand": "LG",
        "category": "Monitors",
        "thumbnail": "https://picsum.photos/seed/lg-uw/80/80",
    },
    {
        "name": "Intel Core i7-14700K",
        "slug": "intel-core-i7-14700k",
        "sku": "SKU-INT-14700K",
        "price": Decimal("42999.00"),
        "stock": 18,
        "status": "published",
        "brand": "Intel",
        "category": "Components",
        "thumbnail": "https://picsum.photos/seed/intel-i7/80/80",
    },
    {
        "name": "AMD Ryzen 7 7800X3D",
        "slug": "amd-ryzen-7-7800x3d",
        "sku": "SKU-AMD-7800X3D",
        "price": Decimal("38999.00"),
        "stock": 14,
        "status": "published",
        "brand": "AMD",
        "category": "Components",
        "thumbnail": "https://picsum.photos/seed/amd-r7/80/80",
    },
    {
        "name": "Corsair Vengeance 32GB DDR5",
        "slug": "corsair-vengeance-32gb-ddr5",
        "sku": "SKU-COR-DDR5-32",
        "price": Decimal("11999.00"),
        "stock": 25,
        "status": "published",
        "brand": "Corsair",
        "category": "Components",
        "thumbnail": "https://picsum.photos/seed/corsair-ram/80/80",
    },
    {
        "name": "Samsung 990 Pro 1TB NVMe",
        "slug": "samsung-990-pro-1tb",
        "sku": "SKU-SAM-990P1T",
        "price": Decimal("14999.00"),
        "stock": 22,
        "status": "published",
        "brand": "Samsung",
        "category": "Storage",
        "thumbnail": "https://picsum.photos/seed/sam-990/80/80",
    },
    {
        "name": "ASUS ROG Strix RTX 4070",
        "slug": "asus-rog-strix-rtx-4070",
        "sku": "SKU-ASUS-4070",
        "price": Decimal("89999.00"),
        "stock": 5,
        "status": "published",
        "brand": "ASUS",
        "category": "Components",
        "thumbnail": "https://picsum.photos/seed/asus-4070/80/80",
    },
    {
        "name": "Keychron K2 Pro",
        "slug": "keychron-k2-pro",
        "sku": "SKU-KEY-K2P",
        "price": Decimal("12999.00"),
        "stock": 20,
        "status": "published",
        "brand": "Keychron",
        "category": "Accessories",
        "thumbnail": "https://picsum.photos/seed/keychron/80/80",
    },
    {
        "name": "Sony WH-1000XM5",
        "slug": "sony-wh-1000xm5",
        "sku": "SKU-SNY-XM5",
        "price": Decimal("34999.00"),
        "stock": 11,
        "status": "published",
        "brand": "Sony",
        "category": "Audio",
        "thumbnail": "https://picsum.photos/seed/sony-xm5/80/80",
    },
    {
        "name": "TP-Link Archer AX73",
        "slug": "tp-link-archer-ax73",
        "sku": "SKU-TPL-AX73",
        "price": Decimal("8999.00"),
        "stock": 35,
        "status": "published",
        "brand": "TP-Link",
        "category": "Networking",
        "thumbnail": "https://picsum.photos/seed/tplink/80/80",
    },
    {
        "name": "Canon PIXMA G3730",
        "slug": "canon-pixma-g3730",
        "sku": "SKU-CAN-G3730",
        "price": Decimal("18999.00"),
        "stock": 9,
        "status": "draft",
        "brand": "Canon",
        "category": "Printers",
        "thumbnail": "https://picsum.photos/seed/canon-g3730/80/80",
    },
    {
        "name": "Xiaomi Redmi Pad SE",
        "slug": "xiaomi-redmi-pad-se",
        "sku": "SKU-XMI-PADSE",
        "price": Decimal("22999.00"),
        "stock": 16,
        "status": "published",
        "brand": "Xiaomi",
        "category": "Tablets",
        "thumbnail": "https://picsum.photos/seed/xiaomi-pad/80/80",
    },
    {
        "name": "Anker 737 Power Bank",
        "slug": "anker-737-power-bank",
        "sku": "SKU-ANK-737",
        "price": Decimal("9990.00"),
        "stock": 40,
        "status": "published",
        "brand": "Anker",
        "category": "Accessories",
        "thumbnail": "https://picsum.photos/seed/anker-737/80/80",
    },
]

# Parents must appear before children (parent_slug resolved at seed time).
CATEGORY_SEED: list[dict] = [
    {
        "slug": "computers",
        "name": "Computers",
        "caption": "Computers",
        "parent_slug": None,
        "sort_order": 0,
        "is_active": True,
        "show_in_top_menu": True,
        "description": "Desktops, laptops, and tablets.",
        "icon_url": "https://picsum.photos/seed/cat-computers/64/64",
    },
    {
        "slug": "laptops",
        "name": "Laptops",
        "caption": "Laptops",
        "parent_slug": "computers",
        "sort_order": 0,
        "is_active": True,
        "show_in_top_menu": True,
        "icon_url": "https://picsum.photos/seed/cat-laptops/64/64",
    },
    {
        "slug": "tablets",
        "name": "Tablets",
        "caption": "Tablets",
        "parent_slug": "computers",
        "sort_order": 1,
        "is_active": True,
        "show_in_top_menu": False,
    },
    {
        "slug": "peripherals",
        "name": "Peripherals",
        "caption": "Peripherals",
        "parent_slug": None,
        "sort_order": 1,
        "is_active": True,
        "show_in_top_menu": True,
    },
    {
        "slug": "monitors",
        "name": "Monitors",
        "caption": "Monitors",
        "parent_slug": "peripherals",
        "sort_order": 0,
        "is_active": True,
        "show_in_top_menu": False,
    },
    {
        "slug": "accessories",
        "name": "Accessories",
        "caption": "Accessories",
        "parent_slug": "peripherals",
        "sort_order": 1,
        "is_active": True,
        "show_in_top_menu": True,
    },
    {
        "slug": "audio",
        "name": "Audio",
        "caption": "Audio",
        "parent_slug": "peripherals",
        "sort_order": 2,
        "is_active": True,
        "show_in_top_menu": False,
    },
    {
        "slug": "printers",
        "name": "Printers",
        "caption": "Printers",
        "parent_slug": "peripherals",
        "sort_order": 3,
        "is_active": True,
        "show_in_top_menu": False,
    },
    {
        "slug": "components",
        "name": "Components",
        "caption": "Components",
        "parent_slug": None,
        "sort_order": 2,
        "is_active": True,
        "show_in_top_menu": True,
    },
    {
        "slug": "storage",
        "name": "Storage",
        "caption": "Storage",
        "parent_slug": "components",
        "sort_order": 0,
        "is_active": True,
        "show_in_top_menu": False,
    },
    {
        "slug": "networking",
        "name": "Networking",
        "caption": "Networking",
        "parent_slug": None,
        "sort_order": 3,
        "is_active": True,
        "show_in_top_menu": False,
    },
]

# Computer-store brands — slugs upserted in init_db.
BRAND_SEED: list[dict] = [
    {"name": "ASUS", "slug": "asus", "sort_order": 0, "logo_url": "https://picsum.photos/seed/brand-asus/64/64"},
    {"name": "Dell", "slug": "dell", "sort_order": 1, "logo_url": "https://picsum.photos/seed/brand-dell/64/64"},
    {"name": "HP", "slug": "hp", "sort_order": 2, "logo_url": "https://picsum.photos/seed/brand-hp/64/64"},
    {"name": "Lenovo", "slug": "lenovo", "sort_order": 3, "logo_url": "https://picsum.photos/seed/brand-lenovo/64/64"},
    {"name": "Apple", "slug": "apple", "sort_order": 4, "logo_url": "https://picsum.photos/seed/brand-apple/64/64"},
    {"name": "Logitech", "slug": "logitech", "sort_order": 5, "logo_url": "https://picsum.photos/seed/brand-logitech/64/64"},
    {"name": "Razer", "slug": "razer", "sort_order": 6, "logo_url": "https://picsum.photos/seed/brand-razer/64/64"},
    {"name": "Samsung", "slug": "samsung", "sort_order": 7, "logo_url": "https://picsum.photos/seed/brand-samsung/64/64"},
    {"name": "LG", "slug": "lg", "sort_order": 8, "logo_url": "https://picsum.photos/seed/brand-lg/64/64"},
    {"name": "Intel", "slug": "intel", "sort_order": 9, "logo_url": "https://picsum.photos/seed/brand-intel/64/64"},
    {"name": "AMD", "slug": "amd", "sort_order": 10, "logo_url": "https://picsum.photos/seed/brand-amd/64/64"},
    {"name": "Corsair", "slug": "corsair", "sort_order": 11, "logo_url": "https://picsum.photos/seed/brand-corsair/64/64"},
    {"name": "Keychron", "slug": "keychron", "sort_order": 12, "logo_url": "https://picsum.photos/seed/brand-keychron/64/64"},
    {"name": "Sony", "slug": "sony", "sort_order": 13, "logo_url": "https://picsum.photos/seed/brand-sony/64/64"},
    {"name": "TP-Link", "slug": "tp-link", "sort_order": 14, "logo_url": "https://picsum.photos/seed/brand-tplink/64/64"},
    {"name": "Canon", "slug": "canon", "sort_order": 15, "logo_url": "https://picsum.photos/seed/brand-canon/64/64"},
    {"name": "Xiaomi", "slug": "xiaomi", "sort_order": 16, "logo_url": "https://picsum.photos/seed/brand-xiaomi/64/64"},
    {"name": "Anker", "slug": "anker", "sort_order": 17, "logo_url": "https://picsum.photos/seed/brand-anker/64/64"},
]

ATTRIBUTE_PROFILE_SEED: list[dict] = [
    {
        "code": "laptop",
        "name": "Laptop",
        "description": "Notebook and laptop specification template.",
        "sort_order": 0,
        "is_active": True,
        "icon_url": "https://picsum.photos/seed/prof-laptop/64/64",
        "category_labels": ["Computers", "Laptops"],
        "groups": [
            {
                "code": "processor",
                "name": "Processor",
                "sort_order": 0,
                "attributes": [
                    {
                        "code": "processor_brand",
                        "name": "Processor Brand",
                        "field_type": "dropdown",
                        "is_filterable": True,
                        "predefined_values": ["Intel", "AMD", "Apple"],
                    },
                    {
                        "code": "ram",
                        "name": "RAM",
                        "field_type": "dropdown",
                        "is_filterable": True,
                        "unit": "GB",
                        "predefined_values": ["8 GB", "16 GB", "32 GB"],
                    },
                ],
            },
            {
                "code": "display",
                "name": "Display",
                "sort_order": 1,
                "attributes": [
                    {
                        "code": "display_size",
                        "name": "Display Size",
                        "field_type": "dropdown",
                        "is_filterable": True,
                        "unit": "inch",
                        "predefined_values": ["14\"", "15.6\"", "16\""],
                    },
                ],
            },
        ],
    },
    {
        "code": "mobile_phone",
        "name": "Mobile Phone",
        "description": "Smartphone specification template.",
        "sort_order": 1,
        "is_active": True,
        "icon_url": "https://picsum.photos/seed/prof-mobile/64/64",
        "category_labels": ["Electronics", "Phones"],
        "groups": [
            {
                "code": "display",
                "name": "Display",
                "sort_order": 0,
                "attributes": [
                    {
                        "code": "screen_size",
                        "name": "Screen Size",
                        "field_type": "dropdown",
                        "is_filterable": True,
                        "predefined_values": ["6.1\"", "6.4\"", "6.7\""],
                    },
                ],
            },
        ],
    },
    {
        "code": "monitor",
        "name": "Monitor",
        "sort_order": 2,
        "is_active": True,
        "category_labels": ["Monitors"],
        "groups": [],
    },
    {
        "code": "camera",
        "name": "Camera",
        "sort_order": 3,
        "is_active": True,
        "category_labels": ["Electronics", "Cameras"],
        "groups": [],
    },
]

MEDIA_SEED: list[dict] = []
_UPLOADERS = ["Admin", "Sadia Rahman", "Rahim Hossain", "Karim Ali"]

for i in range(24):
    is_video = i % 5 == 0
    is_doc = i % 7 == 0 and not is_video
    folder = "Products" if i % 3 == 0 else "Banners" if i % 3 == 1 else "Blog"
    is_banner = not is_doc and not is_video and folder == "Banners"
    base_name = (
        f"document-{i + 1}.pdf"
        if is_doc
        else f"clip-{i + 1}.mp4"
        if is_video
        else f"banner-{i + 1}.jpg"
        if is_banner
        else f"asset-{i + 1}.jpg"
    )
    title = base_name.rsplit(".", 1)[0].replace("-", " ").replace("_", " ")
    media_type = "document" if is_doc else "video" if is_video else "image"
    url = (
        "https://placehold.co/480x480/f5f5f5/666?text=PDF"
        if is_doc
        else f"https://picsum.photos/seed/mediavid{i}/480/480"
        if is_video
        else f"https://picsum.photos/seed/banner{i}/800/200"
        if is_banner
        else f"https://picsum.photos/seed/media{i}/480/480"
    )
    mime = (
        "application/pdf"
        if is_doc
        else "video/mp4"
        if is_video
        else "image/jpeg"
    )
    MEDIA_SEED.append(
        {
            "name": base_name,
            "title": title,
            "folder": "Documents" if is_doc else folder,
            "url": url,
            "media_type": media_type,
            "mime_type": mime,
            "size_kb": 120 + i * 18,
            "alt": title,
            "uploaded_by": _UPLOADERS[i % len(_UPLOADERS)],
            "title_linked_to_name": True,
            "alt_linked_to_name": True,
        },
    )

WAREHOUSE_SEED: list[dict] = [
    {
        "id": "wh_dhaka",
        "code": "DHK-HQ",
        "name": "Dhaka HQ",
        "type": "Main warehouse",
        "address": "Gulshan-2, Dhaka",
        "locations_count": 24,
        "is_active": True,
        "sort_order": 0,
    },
    {
        "id": "wh_ctg",
        "code": "CTG-01",
        "name": "Chittagong",
        "type": "Regional",
        "address": "Agrabad, Chittagong",
        "locations_count": 12,
        "is_active": True,
        "sort_order": 1,
    },
    {
        "id": "wh_fc",
        "code": "ONL-FC",
        "name": "Online Fulfillment Center",
        "type": "Ecommerce FC",
        "address": "Savar EPZ",
        "locations_count": 18,
        "is_active": True,
        "sort_order": 2,
    },
]
