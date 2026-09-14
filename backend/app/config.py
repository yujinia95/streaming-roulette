"""Application configuration loaded from environment variables."""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """
    Holds all environment-derived settings the app needs.

    Attributes:
        TMDB_API_KEY: API key used to authenticate with TMDB.
        FRONTEND_ORIGIN: Origin allowed to call this API via CORS.
        COUNTER_NAMESPACE: Namespace used on the free hit-counter API.
        COUNTER_KEY: Key (counter name) used on the free hit-counter API.
    """
    TMDB_API_KEY          = os.environ.get("TMDB_API_KEY", "")
    FRONTEND_ORIGIN_LOCAL = os.environ.get("FRONTEND_ORIGIN_LOCAL", "*")
    COUNTER_NAMESPACE     = os.environ["COUNTER_NAMESPACE"]
    COUNTER_KEY           = os.environ["COUNTER_KEY"]