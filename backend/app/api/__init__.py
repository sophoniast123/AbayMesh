"""API v1 route handlers."""

from fastapi import APIRouter

from app.api import data_sources, organizations

api_router = APIRouter()
api_router.include_router(organizations.router)
api_router.include_router(data_sources.router)
