import json
import os
import sys

# Agregar el directorio src al path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "src"))

# Importar la aplicación Flask
from main import app

def lambda_handler(event, context):
    """
    Handler principal para AWS Lambda
    """
    # Configurar variables de entorno para RDS
    os.environ["DATABASE_URL"] = f"postgresql://elearning_user:Elearning2024!@{os.environ.get('RDS_ENDPOINT', 'localhost')}:5432/elearning_narino"
    os.environ["FLASK_ENV"] = "production"
    
    # Procesar el evento de API Gateway
    if "httpMethod" in event:
        # Evento de API Gateway
        from serverless_wsgi import handle_request
        
        # Obtener la respuesta de Flask
        response = handle_request(app, event, context)
        
        # Agregar headers de CORS si no existen
        if isinstance(response, dict):
            if 'headers' not in response:
                response['headers'] = {}
            
            # Agregar headers de CORS
            response['headers'].update({
                'Access-Control-Allow-Origin': 'https://emprendimiento-narino.com',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
            })
        
        return response
    else:
        # Evento directo de Lambda
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "https://emprendimiento-narino.com",
                "Access-Control-Allow-Credentials": "true",
                "Content-Type": "application/json"
            },
            "body": json.dumps({
                "message": "E-Learning API funcionando correctamente",
                "version": "1.0.0"
            })
        }