import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models import db
from src.routes.user import user_bp
from src.routes.admin import admin_bp
from src.routes.content import content_bp
from src.routes.resources import resources_bp
from src.routes.instructor import instructor_bp
from src.routes.student import student_bp
from src.config import config

# Determinar el entorno
env = os.getenv('FLASK_ENV', 'development').strip()
if env not in config:
    print(f"❌ Entorno '{env}' no válido. Entornos disponibles: {list(config.keys())}")
    print(f"   Usando entorno por defecto: 'development'")
    env = 'development'
app_config = config[env]

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# Aplicar configuración
app.config.from_object(app_config)

# Configurar CORS para permitir comunicación con el frontend
CORS(app, 
     supports_credentials=True,
     origins=['http://localhost:5173', 'http://127.0.0.1:5173', 'http://192.168.0.28:5173'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization'])

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(content_bp, url_prefix='/api/content')
app.register_blueprint(resources_bp, url_prefix='/api/resources')
app.register_blueprint(instructor_bp, url_prefix='/api/instructor')
app.register_blueprint(student_bp, url_prefix='/api/student')

# Configurar base de datos directamente para producción
if os.getenv('FLASK_ENV', '').strip() == 'production':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://elearning_user:password_seguro@localhost:5432/elearning_narino'

# Inicializar base de datos
db.init_app(app)
with app.app_context():
    db.create_all()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
