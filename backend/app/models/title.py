"""Data model representing a single movie/TV title on the wheel."""
from dataclasses import dataclass


@dataclass
class Title:
    """
    A single spin-able title shown on the wheel and in the result popup.

    Attributes:
        id         : TMDB id of the title.
        title      : Display name (movie title or TV show name).
        year       : Release year (or first-air year), if known.
        poster_url : Fully-qualified URL to the poster image.
        overview   : Short synopsis/description text.
        rating     : TMDB average vote (0-10), rounded to 1 decimal.
    """
    id         : int
    title      : str
    year       : str | None
    poster_url : str
    overview   : str
    rating     : float


    def to_dict(self) -> dict:
        """
        Serialize this title object to a plain dict for a JSON response.

        Keys are camelCase here (posterUrl) because this dict goes
        straight to the frontend, which follows JS/camelCase convention.
        """
        title_dict = {
            "id"        : self.id,
            "title"     : self.title,
            "year"      : self.year,
            "posterUrl" : self.poster_url,
            "overview"  : self.overview,
            "rating"    : self.rating
        }
        return title_dict