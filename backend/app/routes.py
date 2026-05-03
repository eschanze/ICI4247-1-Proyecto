from flask import Blueprint, jsonify

api_bp = Blueprint("api", __name__)

# Endpoint de prueba para verificar que la API está funcionando correctamente
@api_bp.get("/health")
def health_check():
    return jsonify(
        {
            "service": "no-cables-api",
            "status": "ok",
        }
    )
