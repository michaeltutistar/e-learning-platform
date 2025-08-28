from datetime import datetime

class LogActividad:
    """Modelo simplificado para LogActividad"""
    
    def __init__(self, id=None, usuario_id=None, accion=None, detalles=None, fecha=None):
        self.id = id
        self.usuario_id = usuario_id
        self.accion = accion
        self.detalles = detalles
        self.fecha = fecha or datetime.utcnow()
    
    @staticmethod
    def query():
        """Simular query para compatibilidad"""
        return LogActividadQuery()
    
    def to_dict(self):
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'usuario_nombre': None,  # Por ahora None
            'usuario_email': None,   # Por ahora None
            'accion': self.accion,
            'detalles': self.detalles,
            'fecha': self.fecha.isoformat() if self.fecha else None
        }

class LogActividadQuery:
    """Clase para simular queries de LogActividad"""
    
    def filter(self, *args):
        return self
    
    def filter_by(self, **kwargs):
        return self
    
    def order_by(self, *args):
        return self
    
    def paginate(self, page=1, per_page=20, error_out=False):
        return PaginationResult()

class PaginationResult:
    """Resultado de paginación simulado"""
    
    def __init__(self):
        self.items = []
        self.page = 1
        self.per_page = 20
        self.total = 0
        self.pages = 1
        self.has_next = False
        self.has_prev = False
    
    def __repr__(self):
        return f'<LogActividad {self.accion} - {self.usuario_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'usuario_nombre': f"{self.usuario.nombre} {self.usuario.apellido}" if self.usuario else None,
            'usuario_email': self.usuario.email if self.usuario else None,
            'accion': self.accion,
            'detalles': self.detalles,
            'fecha': self.fecha.isoformat() if self.fecha else None
        } 