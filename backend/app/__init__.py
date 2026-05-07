from flask import Flask

from .config import get_config
from .routes import api_bp


def create_app(config_name: str | None = None) -> Flask:
    """Crea y configura una instancia de la aplicación Flask."""
    # Patrón factory: permite instanciar la app varias veces con distintas configs
    app = Flask(__name__)
    app.config.from_object(get_config(config_name))
    app.register_blueprint(api_bp, url_prefix="/api")

    return app
