from flask          import Flask
from flask_cors     import CORS
from .config        import Config
from .routes.genres import genres_bp
from .routes.wheel  import wheel_bp
from .routes.stats  import stats_bp


def create_app() -> Flask:
    """Build and configure the Flask application.

    Returns:
        A fully configured Flask app with CORS enabled and all
        API blueprints registered.
    """
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={r"/api/*": {"origins": app.config["FRONTEND_ORIGIN"]}})

    app.register_blueprint(genres_bp)
    app.register_blueprint(wheel_bp)
    app.register_blueprint(stats_bp)

    return app
