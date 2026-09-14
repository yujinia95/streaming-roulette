import random

from ..models.title     import Title
from .provider_registry import ProviderRegistry
from .tmdb_client       import TMDBClient

MAX_TITLES         = 8
MIN_USABLE_RESULTS = 3


class WheelService:
    """Turns a (type, country, genre, provider) selection into wheel titles."""

    def __init__(self, tmdb_client: TMDBClient, provider_registry: ProviderRegistry):
        """
        Create a service backed by a TMDBClient and ProviderRegistry.

        Args:
            tmdb_client       : Client used to query TMDB's discover endpoint.
            provider_registry : Resolves a provider key to a TMDB provider id.
        """
        self._tmdb_client       = tmdb_client
        self._provider_registry = provider_registry


    def spin(self, media_type: str, country: str, genre_id: int, provider_key: str) -> tuple[list[Title], bool]:
        """
        Fetch a random batch of up to MAX_TITLES usable titles.

        Args:
            media_type   : Either "movie" or "tv".
            country      : ISO 3166-1 country code, e.g. "US".
            genre_id     : TMDB genre id to filter by.
            provider_key : Curated provider key, e.g. "netflix".

        Returns:
            A tuple of (titles, low_results) where low_results is True
            when fewer than MIN_USABLE_RESULTS usable titles were found.
        """
        provider_id = self._provider_registry.resolve(media_type, provider_key)
        data        = self._tmdb_client.discover(media_type, country, provider_id, genre_id)
        raw_results = data.get("results", [])
        usable      = [result for result in raw_results if result.get("poster_path") and result.get("overview")]
        random.shuffle(usable)
        chosen      = usable[:MAX_TITLES]
        titles      = [self._to_title(raw_result, media_type) for raw_result in chosen]
        low_results = len(titles) < MIN_USABLE_RESULTS
        return titles, low_results


    def _to_title(self, raw: dict, media_type: str) -> Title:
        """Convert one raw TMDB discover result into a Title model."""
        name_key   = "title" if media_type == "movie" else "name"
        date_key   = "release_date" if media_type == "movie" else "first_air_date"
        date_value = raw.get(date_key) or ""
        year       = date_value[:4] if date_value else None
        title_obj  = Title(
            id         = raw["id"],
            title      = raw.get(name_key, "Untitled"),
            year       = year,
            poster_url = TMDBClient.build_poster_url(raw["poster_path"]),
            overview   = raw.get("overview", ""),
            rating     = round(raw.get("vote_average", 0), 1)
        )
        return title_obj