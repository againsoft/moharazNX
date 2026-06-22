from __future__ import annotations

ADMIN_USER = {
    "id": "user_admin",
    "email": "admin@moharaznx.com",
    "username": "admin",
    "name": "MoharazNX Admin",
    "role": "admin",
    "password": "admin123",
}

STAFF_USER = {
    "id": "user_staff",
    "email": "staff@moharaznx.com",
    "username": "staff",
    "name": "MoharazNX Staff",
    "role": "staff",
    "password": "staff123",
}

VIEWER_USER = {
    "id": "user_viewer",
    "email": "viewer@moharaznx.com",
    "username": "viewer",
    "name": "MoharazNX Viewer",
    "role": "viewer",
    "password": "viewer123",
}

AUTH_USERS_SEED = [ADMIN_USER, STAFF_USER, VIEWER_USER]
