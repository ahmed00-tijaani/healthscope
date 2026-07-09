from fastapi import APIRouter, HTTPException

from schemas.models import NearbyHospitalsRequest, NearbyHospitalsResponse
from services.places_service import fetch_nearby_hospitals

router = APIRouter(prefix="/api", tags=["hospitals"])


@router.post("/nearby-hospitals", response_model=NearbyHospitalsResponse)
async def nearby_hospitals(request: NearbyHospitalsRequest):
    try:
        hospitals, location, location_label = await fetch_nearby_hospitals(
            request.latitude,
            request.longitude,
        )
        return NearbyHospitalsResponse(
            hospitals=hospitals,
            location_used=location,
            location_label=location_label,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Hospital lookup unavailable: {exc}",
        ) from exc
