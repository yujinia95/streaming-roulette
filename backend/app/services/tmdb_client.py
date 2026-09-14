import random
import requests
from ..config import Config

TMDB_BASE_URL       = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"


class TMDBClient:
    """
    Handles all outbound HTTP calls to TMDB.

    Keeping every raw TMDB call in one place so that the rest of the
    app never has to know about TMDB's URL shapes or auth scheme.
    """

    def __init__(self):
        """
        Create a client authenticated with a TMDB API key.

        Args:
            api_key: TMDB v3 API key. Defaults to Config.TMDB_API_KEY.
        """
        self._api_key = Config.TMDB_API_KEY
        self._session = requests.Session()

    
    def _get(self, path: str, params: dict = None) -> dict:
        """
        Issue an authenticated GET request to a TMDB endpoint.

        Args:
            path   : Path under the TMDB base URL, e.g. "/genre/movie/list".
            params : Extra query params to send.

        Returns:
            The parsed JSON response body.
        """
        query         = {"api_key": self._api_key, **(params or {})}
        url           = f"{TMDB_BASE_URL}{path}"
        response      = self._session.get(url, params=query, timeout=10)
        response.raise_for_status()
        response_data = response.json()
        return response_data

    
    def get_genres(self, media_type: str) -> list[dict]:
        """
        Fetch the genre list for movies or TV shows.

        Args:
            media_type: Either "movie" or "tv".

        Returns:
            A list of raw {"id": int, "name": str} dicts from TMDB.
        """
        path   = f"/genre/{media_type}/list"
        data   = self._get(path)
        genres = data.get("genres", [])
        return genres


    def get_watch_providers(self, media_type: str) -> list[dict]:
        """
        Fetch the full list of watch providers TMDB knows about.

        Args:
            media_type: Either "movie" or "tv".

        Returns:
            A list of raw provider dicts, each containing at least
            "provider_id" and "provider_name".
        """
        path      = f"/watch/providers/{media_type}"
        data      = self._get(path)
        providers = data.get("results", [])
        return providers


    def discover(self, media_type, watch_region, provider_id, genre_id) -> dict:
        """
        Discover titles matching provider/region/genre filters.

        Fetches a random page of results (bounded to TMDB's first 20
        pages) so repeated calls with the same filters don't always
        return the exact same titles.

        Args:
            media_type   : Either "movie" or "tv".
            watch_region : ISO 3166-1 country code, e.g. "US".
            provider_id  : TMDB watch-provider id (e.g. Netflix).
            genre_id     : TMDB genre id.

        Returns:
            The raw TMDB discover response (with "results", "total_pages", etc).
        """
        params         = {
            "watch_region"                  : watch_region,
            "with_watch_providers"          : provider_id,
            "with_watch_monetization_types" : "flatrate",
            "with_genres"                   : genre_id,
            "page"                          : 1
        }
        path           = f"/discover/{media_type}"
        first_page     = self._get(path, params)
        total_pages    = max(1, min(first_page.get("total_pages", 1), 20))
        if total_pages == 1:
            return first_page
        params["page"] = random.randint(1, total_pages)
        random_page    = self._get(f"/discover/{media_type}", params)
        return random_page


    @staticmethod
    def build_poster_url(poster_path: str) -> str:
        """
        Build a full poster image URL from TMDB's relative path.

        Args:
            poster_path: The "poster_path" field from a TMDB result.

        Returns:
            A complete, browser-loadable image URL.
        """
        poster_url = f"{TMDB_IMAGE_BASE_URL}{poster_path}"
        return poster_url