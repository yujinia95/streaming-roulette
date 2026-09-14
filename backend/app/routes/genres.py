from flask                  import Blueprint, jsonify, request
from ..models.genre         import Genre
from ..services.tmdb_client import TMDBClient

genres_bp    = Blueprint("genres", __name__)
_tmdb_client = TMDBClient()


@genres_bp.route("/api/genres")
def get_genres():
    """
    Return the genre list for the requested media type.

    Query params:
        type: "movie" or "tv" (required).

    Returns:
        JSON array of {id, name} genre objects.
    """
    media_type = request.args.get("type")
    if media_type not in ("movie", "tv"):
        error_response = jsonify({"error": "type must be 'movie' or 'tv'"})
        return error_response, 400
    
    raw_genres  = _tmdb_client.get_genres(media_type)
    genre_dicts = [Genre(id=genre["id"], name=genre["name"]).to_dict() for genre in raw_genres]
    response    = jsonify(genre_dicts)
    return response
                                   