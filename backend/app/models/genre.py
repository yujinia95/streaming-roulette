"""Data model representing a single TMDB genre."""
from dataclasses import dataclass


@dataclass
class Genre:
    """
    A single selectable genre.

    Attributes:
        id   : TMDB genre id.
        name : Human-readable genre name.
    """
    id   : int
    name : str


    def to_dict(self) -> dict:
        """Serialize this genre to a plain dict for a JSON response."""
        genre_dict = {
            "id"   : self.id,
            "name" : self.name
        }
        return genre_dict