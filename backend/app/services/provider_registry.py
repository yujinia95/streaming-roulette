from .tmdb_client import TMDBClient

# If a provider's TMDB display name changes (e.g. a rebrand like
# HBO Max -> Max), update that entry's value here to match the new name.
CURATED_PROVIDERS = {
    "netflix"       : "Netflix",
    "disney-plus"   : "Disney Plus",
    "prime-video"   : "Amazon Prime Video",
    "max"           : "Max",
    "apple-tv-plus" : "Apple TV Plus"
}


class ProviderRegistry:
    """Looks up TMDB's numeric provider id for a curated provider key."""

    def __init__(self, tmdb_client: TMDBClient):
        """
        Create a registry backed by a TMDBClient.

        Args:
            tmdb_client: Client used to fetch the live provider list.
        """
        self._tmdb_client                      = tmdb_client
        self._cache: dict[str, dict[str, int]] = {}


    def resolve(self, media_type: str, provider_key: str) -> int:
        """
        Get the TMDB provider id for a curated provider key.

        Args:
            media_type   : Either "movie" or "tv" (provider lists can differ).
            provider_key : One of CURATED_PROVIDERS' keys, e.g. "netflix".

        Returns:
            The matching TMDB provider id.

        Raises:
            ValueError: If provider_key is unknown or not found on TMDB.
        """
        if provider_key not in CURATED_PROVIDERS:
            raise ValueError(f"Unknown provider: {provider_key}")

        if media_type not in self._cache:
            self._cache[media_type] = self._build_lookup(media_type)

        provider_name = CURATED_PROVIDERS[provider_key]
        provider_id   = self._cache[media_type].get(provider_name)
        if provider_id is None:
            raise ValueError(f"Provider '{provider_name}' not found on TMDB")
        return provider_id


    def _build_lookup(self, media_type: str) -> dict[str, int]:
        """Fetch and cache a name -> id lookup for one media type."""
        providers = self._tmdb_client.get_watch_providers(media_type)
        lookup    = {provider["provider_name"]: provider["provider_id"] for provider in providers}
        return lookup

