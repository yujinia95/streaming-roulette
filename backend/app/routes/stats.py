from flask                     import Blueprint, jsonify
from ..services.counter_client import CounterClient

stats_bp        = Blueprint("stats", __name__)
_counter_client = CounterClient()


@stats_bp.route("/api/stats/spins")
def get_spin_count():
    """
    Return the current total spin count.

    Returns:
        JSON {"total": int}.
    """
    total    = _counter_client.get()
    response = jsonify({"total": total})
    return response