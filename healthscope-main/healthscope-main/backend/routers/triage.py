from fastapi import APIRouter, HTTPException

from schemas.models import TriageRequest, TriageResponse
from services.gemini_service import run_triage

router = APIRouter(prefix="/api", tags=["triage"])


@router.post("/triage-and-explain", response_model=TriageResponse)
async def triage_and_explain(request: TriageRequest):
    try:
        return await run_triage(request)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Triage service unavailable: {exc}",
        ) from exc
