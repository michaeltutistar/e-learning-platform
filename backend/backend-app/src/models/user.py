from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import secrets
from . import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    tipo_documento = db.Column(db.String(50), nullable=False)
    numero_documento = db.Column(db.String(20), nullable=False)
    documento_pdf = db.Column(db.LargeBinary, nullable=True)
    documento_pdf_nombre = db.Column(db.String(255), nullable=True)
    requisitos_pdf = db.Column(db.LargeBinary, nullable=True)
    requisitos_pdf_nombre = db.Column(db.String(255), nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.String(20), default='estudiante')
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    estado_cuenta = db.Column(db.String(20), default='inactiva')
    token_reset = db.Column(db.String(100), nullable=True)
    token_reset_expira = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f'<User {self.email}>'

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def generate_reset_token(self):
        self.token_reset = secrets.token_urlsafe(32)
        self.token_reset_expira = datetime.utcnow() + timedelta(hours=1)
        return self.token_reset

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'email': self.email,
            'tipo_documento': self.tipo_documento,
            'numero_documento': self.numero_documento,
            'documento_pdf_nombre': self.documento_pdf_nombre,
            'requisitos_pdf_nombre': self.requisitos_pdf_nombre,
            'rol': self.rol,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'fecha_actualizacion': self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None,
            'estado_cuenta': self.estado_cuenta
        }
