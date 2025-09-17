from datetime import datetime
from . import db

class Curso(db.Model):
    __tablename__ = 'curso'
    
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text)
    instructor_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    estado = db.Column(db.String(20), default='activo')
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    fecha_apertura = db.Column(db.DateTime, nullable=True)
    fecha_cierre = db.Column(db.DateTime, nullable=True)
    duracion_horas = db.Column(db.Integer, default=0)
    nivel = db.Column(db.String(50), default='básico')  # básico, intermedio, avanzado
    categoria = db.Column(db.String(100), nullable=True)
    imagen_url = db.Column(db.String(500), nullable=True)
    max_estudiantes = db.Column(db.Integer, default=0)  # 0 = sin límite
    convocatoria = db.Column(db.String(20), nullable=True)
    
    # Relaciones (temporalmente comentadas para evitar importaciones circulares)
    # instructor = db.relationship('User', backref='cursos_instructor', foreign_keys=[instructor_id])
    # inscripciones = db.relationship('Inscripcion', backref='curso', lazy='dynamic', foreign_keys='Inscripcion.curso_id')
    
    def __repr__(self):
        return f'<Curso {self.titulo}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'descripcion': self.descripcion,
            'instructor_id': self.instructor_id,
            'instructor_nombre': None,  # Se obtendrá por consulta separada
            'estado': self.estado,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'fecha_actualizacion': self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None,
            'fecha_apertura': self.fecha_apertura.isoformat() if self.fecha_apertura else None,
            'fecha_cierre': self.fecha_cierre.isoformat() if self.fecha_cierre else None,
            'duracion_horas': self.duracion_horas,
            'nivel': self.nivel,
            'categoria': self.categoria,
            'imagen_url': self.imagen_url,
            'max_estudiantes': self.max_estudiantes,
            'total_inscripciones': 0  # Se obtendrá por consulta separada
        } 