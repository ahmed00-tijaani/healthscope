import json
import os

import google.generativeai as genai
from google.generativeai.types import GenerationConfig

from schemas.models import TriageRequest, TriageResponse

DEFAULT_GEMINI_MODEL = "gemini-2.5-flash"

TRIAGE_SCHEMA = {
    "type": "object",
    "properties": {
        "triage_level": {
            "type": "string",
            "enum": ["EMERGENCY", "URGENT", "NON_URGENT"],
        },
        "urgency_score": {"type": "integer"},
        "simplified_explanation": {"type": "string"},
        "possible_conditions": {"type": "array", "items": {"type": "string"}},
        "recommended_next_steps": {"type": "array", "items": {"type": "string"}},
        "disclaimer": {"type": "string"},
    },
    "required": [
        "triage_level",
        "urgency_score",
        "simplified_explanation",
        "possible_conditions",
        "recommended_next_steps",
        "disclaimer",
    ],
}


def _build_prompt(request: TriageRequest) -> str:
    if request.symptom_description:
        clinical_input = (
            f"Symptoms: {request.symptom_description.strip()}\n"
            f"Duration: {request.symptom_duration_days} day(s)"
        )
    else:
        clinical_input = f"Lab / medical report:\n{request.raw_lab_report_text.strip()}"

    return f"""You are a compassionate clinical triage assistant for HealthScope.

Patient profile:
- Name: {request.patient_name}
- Age: {request.patient_age}

Clinical input:
{clinical_input}

Assess urgency and explain findings in plain English addressed to the patient by name.
Consider age-appropriate risks. Be clear but not alarmist unless truly emergent.
Always include the disclaimer field exactly as specified in the schema.
Return ONLY valid JSON matching the required schema."""


async def run_triage(request: TriageRequest) -> TriageResponse:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured in the environment.")

    genai.configure(api_key=api_key)
    model_name = os.getenv("GEMINI_MODEL", DEFAULT_GEMINI_MODEL)
    model = genai.GenerativeModel(model_name)

    generation_config = GenerationConfig(
        response_mime_type="application/json",
        response_schema=TRIAGE_SCHEMA,
        temperature=0.3,
    )

    response = model.generate_content(
        _build_prompt(request),
        generation_config=generation_config,
    )

    raw_text = response.text.strip()
    payload = json.loads(raw_text)

    if "disclaimer" not in payload or not payload["disclaimer"]:
        payload["disclaimer"] = "This is an AI prototype and not official medical advice."

    return TriageResponse(**payload)
