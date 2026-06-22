from __future__ import annotations

from datetime import date
from decimal import Decimal

COUPON_SEED: list[dict] = [
    {"id": "cpn_summer15", "code": "SUMMER15", "name": "Summer 15% off", "discount_type": "percent", "discount_value": Decimal("15"), "discount_label": "15% off", "status": "active", "redemptions": 142, "redemption_limit": 500, "starts_at": date(2026, 6, 1), "ends_at": date(2026, 6, 30)},
    {"id": "cpn_flat500", "code": "FLAT500", "name": "৳500 off orders ৳3K+", "discount_type": "fixed", "discount_value": Decimal("500"), "discount_label": "৳500 fixed", "status": "active", "redemptions": 89, "redemption_limit": None, "starts_at": date(2026, 6, 1), "ends_at": date(2026, 6, 30), "min_order_amount": Decimal("3000")},
    {"id": "cpn_vip20", "code": "VIP20", "name": "VIP exclusive 20%", "discount_type": "percent", "discount_value": Decimal("20"), "discount_label": "20% off", "status": "active", "redemptions": 34, "redemption_limit": 100, "starts_at": date(2026, 6, 1), "ends_at": date(2026, 12, 31)},
    {"id": "cpn_flash", "code": "FLASH24", "name": "Flash Friday", "discount_type": "percent", "discount_value": Decimal("10"), "discount_label": "10% off", "status": "expired", "redemptions": 210, "redemption_limit": None, "starts_at": date(2026, 6, 7), "ends_at": date(2026, 6, 7)},
    {"id": "cpn_welcome", "code": "WELCOME10", "name": "New customer 10%", "discount_type": "percent", "discount_value": Decimal("10"), "discount_label": "10% off", "status": "active", "redemptions": 56, "redemption_limit": 1000, "starts_at": date(2026, 1, 1), "ends_at": date(2026, 12, 31)},
    {"id": "cpn_b2b", "code": "B2B5000", "name": "Wholesale ৳5000 off", "discount_type": "fixed", "discount_value": Decimal("5000"), "discount_label": "৳5000 fixed", "status": "scheduled", "redemptions": 0, "redemption_limit": 50, "starts_at": date(2026, 7, 1), "ends_at": date(2026, 9, 30), "min_order_amount": Decimal("50000")},
]
