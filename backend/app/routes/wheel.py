from flask                        import Blueprint, current_app, jsonify, request
from ..services.counter_client    import CounterClient
from ..services.provider_registry import ProviderRegistry
from ..services.tmdb_client       import TMDBClient
from ..services.wheel_service     import WheelService

wheel_bp        = Blueprint("wheel", __name__)

_tmdb_client    = TMDBClient()
_wheel_service  = WheelService(_tmdb_client, ProviderRegistry(_tmdb_client))
_counter_client = CounterClient()


@wheel_bp.route("/api/wheel")
def get_wheel():
    """
    Return a random batch of titles matching the selected filters.

    Query params:
        type     : "movie" or "tv" (required)
        country  : ISO country code, e.g. "US" (required)
        genre    : TMDB genre id (required)
        provider : curated provider key, e.g. "netflix" (required)

    Returns:
        JSON {"titles": [...], "lowResults": bool}.
    """
    media_type   = request.args.get("type")
    country      = request.args.get("country")
    genre_id     = request.args.get("genre")
    provider_key = request.args.get("provider")

    missing_required_field = not all([country, genre_id, provider_key])
    if media_type not in ("movie", "tv") or missing_required_field:
        error_response = jsonify({"error": "type, country, genre, and provider are all required"})
        return error_response, 400

    try:
        titles, low_results = _wheel_service.spin(
            media_type, country, int(genre_id), provider_key
        )
        
    except ValueError as exc:
        current_app.logger.warning(f"Wheel request failed: {exc}")
        error_response = jsonify({"error": str(exc)})
        return error_response, 400

    _counter_client.increment()

    title_dicts = [title.to_dict() for title in titles]
    response    = jsonify({"titles": title_dicts, "lowResults": low_results})
    return response