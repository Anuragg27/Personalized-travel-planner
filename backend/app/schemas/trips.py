from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, model_validator


class TripPreferenceRequest(BaseModel):
    origin: str = Field(
        min_length=2,
        max_length=100,
        description="Starting location for the trip",
    )

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

    vibe: Literal[
        "relaxed",
        "adventure",
        "luxury",
        "budget",
        "balanced",
    ] = "balanced"

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date < self.start_date:
            raise ValueError(
                "End date must be on or after the start date"
            )
        return self


class TripUpdateRequest(BaseModel):
    origin: str = Field(min_length=2, max_length=100)
    destination: str = Field(min_length=2, max_length=100)
    start_date: date
    end_date: date

    budget: float = Field(gt=0)
    travelers: int = Field(ge=1, le=20)

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date < self.start_date:
            raise ValueError(
                "End date must be on or after the start date"
            )
        return self