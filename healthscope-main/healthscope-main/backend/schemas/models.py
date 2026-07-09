from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, model_validator


class TriageLevel(str, Enum):
    EMERGENCY = "EMERGENCY"
    URGENT = "URGENT"
    NON_URGENT = "NON_URGENT"


class TriageRequest(BaseModel):
    patient_name: str = Field(..., min_length=1)
    patient_age: int = Field(..., ge=0, le=150)
    symptom_duration_days: Optional[int] = Field(None, ge=0)
    symptom_description: Optional[str] = None
    raw_lab_report_text: Optional[str] = None

    @model_validator(mode="after")
    def validate_input_mode(self):
        has_symptoms = bool(self.symptom_description and self.symptom_description.strip())
        has_lab = bool(self.raw_lab_report_text and self.raw_lab_report_text.strip())

        if has_symptoms == has_lab:
            raise ValueError(
                "Provide either symptom_description or raw_lab_report_text, not both."
            )

        if has_symptoms and self.symptom_duration_days is None:
            raise ValueError("symptom_duration_days is required when describing symptoms.")

        return self


class TriageResponse(BaseModel):
    triage_level: TriageLevel
    urgency_score: int = Field(..., ge=1, le=100)
    simplified_explanation: str
    possible_conditions: list[str]
    recommended_next_steps: list[str]
    disclaimer: str = "This is an AI prototype and not official medical advice."


class NearbyHospitalsRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class Hospital(BaseModel):
    name: str
    open_now: Optional[bool] = None
    rating: Optional[float] = None
    vicinity: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class NearbyHospitalsResponse(BaseModel):
    hospitals: list[Hospital]
    location_used: dict[str, float]
    location_label: str = "Accra"
