import requests
from ..config import Config

COUNTER_BASE_URL = "https://abacus.jasoncameron.dev"


class CounterClient:
    """
    Increments and reads a single named counter on a free hosted API.

    Isolated in its own class so the counter provider can be swapped
    later without touching any route or business-logic code.
    """

    def __init__(self):
        """Create a client for the app's configured namespace/key counter."""
        self._namespace = Config.COUNTER_NAMESPACE
        self._key       = Config.COUNTER_KEY


    def increment(self) -> int | None:
        """
        Increment the counter by one.

        Returns:
            The new counter value, or None if the counter API could
            not be reached (a spin must never fail just because this
            best-effort call did).
        """
        try:
            url           = f"{COUNTER_BASE_URL}/hit/{self._namespace}/{self._key}"
            response      = requests.get(url, timeout=5)
            response.raise_for_status()
            response_data = response.json()
            new_value     = response_data.get("value")
            return new_value
        except requests.RequestException:
            return None


    def get(self) -> int:
        """
        Read the current counter value without incrementing it.

        Returns:
            The current counter value, or 0 if it can't be read yet.
        """
        try:
            url           = f"{COUNTER_BASE_URL}/get/{self._namespace}/{self._key}"
            response      = requests.get(url, timeout=5)
            response.raise_for_status()
            response_data = response.json()
            current_value = response_data.get("value", 0)
            return current_value
        except requests.RequestException:
            return 0
