import os
from typing import Optional

import httpx

from schemas.models import Hospital

PLACES_LEGACY_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
PLACES_NEW_URL = "https://places.googleapis.com/v1/places:searchNearby"
GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"
DEFAULT_LAT = 5.6037
DEFAULT_LNG = -0.1870
DEFAULT_LOCATION_LABEL = "Accra"


def _parse_legacy_results(data: dict) -> list[Hospital]:
    hospitals: list[Hospital] = []
    for place in data.get("results", [])[:3]:
        opening = place.get("opening_hours") or {}
        geometry = place.get("geometry") or {}
        location = geometry.get("location") or {}
        hospitals.append(
            Hospital(
                name=place.get("name", "Unknown Hospital"),
                open_now=opening.get("open_now"),
                rating=place.get("rating"),
                vicinity=place.get("vicinity", "Address unavailable"),
                latitude=location.get("lat"),
                longitude=location.get("lng"),
            )
        )
    return hospitals


def _parse_new_results(data: dict) -> list[Hospital]:
    hospitals: list[Hospital] = []
    for place in data.get("places", [])[:3]:
        display_name = place.get("displayName") or {}
        hours = place.get("currentOpeningHours") or {}
        location = place.get("location") or {}
        hospitals.append(
            Hospital(
                name=display_name.get("text", "Unknown Hospital"),
                open_now=hours.get("openNow"),
                rating=place.get("rating"),
                vicinity=place.get("formattedAddress", "Address unavailable"),
                latitude=location.get("latitude"),
                longitude=location.get("longitude"),
            )
        )
    return hospitals


async def _fetch_places_new(
    client: httpx.AsyncClient,
    api_key: str,
    lat: float,
    lng: float,
) -> list[Hospital]:
    response = await client.post(
        PLACES_NEW_URL,
        headers={
            "Content-Type": "application/json",
            "X-Goog-Api-Key": api_key,
            "X-Goog-FieldMask": (
                "places.displayName,places.formattedAddress,"
                "places.rating,places.currentOpeningHours,places.location"
            ),
        },
        json={
            "includedTypes": ["hospital"],
            "maxResultCount": 3,
            "locationRestriction": {
                "circle": {
                    "center": {"latitude": lat, "longitude": lng},
                    "radius": 5000,
                }
            },
        },
    )
    response.raise_for_status()
    data = response.json()

    if "error" in data:
        message = data["error"].get("message", "Unknown Places API error")
        raise ValueError(f"Google Places API error: {message}")

    return _parse_new_results(data)


async def _fetch_places_legacy(
    client: httpx.AsyncClient,
    api_key: str,
    lat: float,
    lng: float,
) -> list[Hospital]:
    response = await client.get(
        PLACES_LEGACY_URL,
        params={
            "location": f"{lat},{lng}",
            "radius": 5000,
            "type": "hospital",
            "key": api_key,
        },
    )
    response.raise_for_status()
    data = response.json()

    if data.get("status") not in ("OK", "ZERO_RESULTS"):
        message = data.get("error_message", data.get("status", "Unknown Places API error"))
        raise ValueError(f"Google Places API error: {message}")

    return _parse_legacy_results(data)


def _label_from_vicinity(vicinity: str) -> Optional[str]:
    parts = [part.strip() for part in vicinity.split(",") if part.strip()]
    if len(parts) >= 2:
        return parts[-2]
    if parts:
        return parts[0]
    return None


def _label_from_geocode_result(result: dict) -> Optional[str]:
    components = result.get("address_components", [])
    priority_types = (
        "locality",
        "administrative_area_level_2",
        "administrative_area_level_1",
        "sublocality",
    )
    for target_type in priority_types:
        for component in components:
            if target_type in component.get("types", []):
                return component.get("long_name")
    return None


async def _resolve_location_label(
    client: httpx.AsyncClient,
    api_key: str,
    lat: float,
    lng: float,
    hospitals: list[Hospital],
) -> str:
    try:
        response = await client.get(
            GEOCODE_URL,
            params={"latlng": f"{lat},{lng}", "key": api_key},
        )
        response.raise_for_status()
        data = response.json()
        if data.get("status") == "OK" and data.get("results"):
            label = _label_from_geocode_result(data["results"][0])
            if label:
                return label
    except Exception:
        pass

    for hospital in hospitals:
        label = _label_from_vicinity(hospital.vicinity)
        if label:
            return label

    return DEFAULT_LOCATION_LABEL


async def fetch_nearby_hospitals(
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
) -> tuple[list[Hospital], dict[str, float], str]:
    api_key = os.getenv("GOOGLE_PLACES_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_PLACES_API_KEY is not configured in the environment.")

    lat = latitude if latitude is not None else DEFAULT_LAT
    lng = longitude if longitude is not None else DEFAULT_LNG

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            hospitals = await _fetch_places_new(client, api_key, lat, lng)
        except ValueError:
            raise
        except Exception:
            hospitals = await _fetch_places_legacy(client, api_key, lat, lng)

        location_label = await _resolve_location_label(
            client, api_key, lat, lng, hospitals
        )

    return hospitals, {"latitude": lat, "longitude": lng}, location_label
