from datetime import date
from typing import Literal
from pydantic import BaseModel, Field, model_validator
class TripPreferenceRequest(BaseModel):
    destination: str = Field(
        min_length=2,
        max_length=100,
        description="Preferred travel destination",
    )
    start_date: date
    end_date: date
    budget: float = Field(
        gt=0,
        description="Total trip budget",
    )
    travelers: int = Field(
        ge=1,
        le=20,
        description="Number of travelers",
    )
    interests: list[str] = Field(
        min_length=1,
        description="Preferred travel activities",
    )
    dietary_needs: str = Field(
        default="No restrictions",
        max_length=200,
    )
    travel_pace: Literal["relaxed", "moderate", "fast"] = "moderate"
    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date < self.start_date:
            raise ValueError(
                "End date must be on or after the start date"
            )
        return self