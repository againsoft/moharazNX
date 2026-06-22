from __future__ import annotations

ADMIN_USER = {
    "id": "user_admin",
    "email": "admin@moharaznx.com",
    "name": "MoharazNX Admin",
    "role": "admin",
    "password": "admin123",
}

STAFF_USER = {
    "id": "user_staff",
    "email": "staff@moharaznx.com",
    "name": "MoharazNX Staff",
    "role": "staff",
    "password": "staff123",
}

VIEWER_USER = {
    "id": "user_viewer",
    "email": "viewer@moharaznx.com",
    "name": "MoharazNX Viewer",
    "role": "viewer",
    "password": "viewer123",
}

AUTH_USERS_SEED = [ADMIN_USER, STAFF_USER, VIEWER_USER]
