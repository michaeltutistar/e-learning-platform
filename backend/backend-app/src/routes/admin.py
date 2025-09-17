from flask import Blueprint, jsonify, request, session, send_file
from src.models import db, User, Curso, Inscripcion, LogActividad
from datetime import datetime, timedelta
import csv
import io
import tempfile

admin_bp = Blueprint('admin', __name__)

def require_admin(f):
    """Decorador para requerir rol de administrador"""
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'No autorizado'}), 401
        
        user = User.query.get(session['user_id'])
        if not user or user.rol != 'admin':
            return jsonify({'error': 'Acceso denegado. Se requiere rol de administrador'}), 403
        
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

@admin_bp.route('/dashboard/metrics', methods=['GET'])
@require_admin
def get_dashboard_metrics():
    """Obtener métricas generales del dashboard"""
    try:
        # Total de usuarios registrados
        total_usuarios = User.query.count()
        
        # Usuarios por estado
        usuarios_activos = User.query.filter_by(estado_cuenta='activa').count()
        usuarios_inactivos = User.query.filter_by(estado_cuenta='inactiva').count()
        usuarios_suspendidos = User.query.filter_by(estado_cuenta='suspendida').count()
        
        # Usuarios por rol
        estudiantes = User.query.filter_by(rol='estudiante').count()
        instructores = User.query.filter_by(rol='instructor').count()
        admins = User.query.filter_by(rol='admin').count()
        
        # Cursos activos
        cursos_activos = Curso.query.filter_by(estado='activo').count()
        total_cursos = Curso.query.count()
        
        # Inscripciones (simulado por ahora)
        total_inscripciones = 0
        inscripciones_activas = 0
        
        # Usuarios registrados en los últimos 30 días
        fecha_limite = datetime.utcnow() - timedelta(days=30)
        nuevos_usuarios = User.query.filter(User.fecha_creacion >= fecha_limite).count()
        
        # Actividad reciente (simulado por ahora)
        actividad_reciente = 0
        
        return jsonify({
            'usuarios': {
                'total': total_usuarios,
                'activos': usuarios_activos,
                'inactivos': usuarios_inactivos,
                'suspendidos': usuarios_suspendidos,
                'nuevos_30_dias': nuevos_usuarios
            },
            'roles': {
                'estudiantes': estudiantes,
                'instructores': instructores,
                'administradores': admins
            },
            'cursos': {
                'total': total_cursos,
                'activos': cursos_activos
            },
            'inscripciones': {
                'total': total_inscripciones,
                'activas': inscripciones_activas
            },
            'actividad': {
                'ultimos_7_dias': actividad_reciente
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener métricas: {str(e)}'}), 500

@admin_bp.route('/users', methods=['GET'])
@require_admin
def get_users():
    """Obtener lista de usuarios con filtros"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        estado = request.args.get('estado')
        rol = request.args.get('rol')
        search = request.args.get('search')
        
        query = User.query
        
        # Aplicar filtros
        if estado:
            query = query.filter_by(estado_cuenta=estado)
        if rol:
            query = query.filter_by(rol=rol)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (User.nombre.ilike(search_term)) |
                (User.apellido.ilike(search_term)) |
                (User.email.ilike(search_term)) |
                (User.numero_documento.ilike(search_term))
            )
        
        # Ordenar por fecha de creación (más recientes primero)
        query = query.order_by(User.fecha_creacion.desc())
        
        # Paginación
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        users = pagination.items
        
        return jsonify({
            'users': [user.to_dict() for user in users],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener usuarios: {str(e)}'}), 500

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@require_admin
def update_user(user_id):
    """Actualizar usuario (estado, rol, etc.)"""
    try:
        user = User.query.get_or_404(user_id)
        data = request.json
        
        # Campos permitidos para actualización
        if 'estado_cuenta' in data:
            user.estado_cuenta = data['estado_cuenta']
        if 'rol' in data:
            user.rol = data['rol']
        if 'nombre' in data:
            user.nombre = data['nombre']
        if 'apellido' in data:
            user.apellido = data['apellido']
        
        user.fecha_actualizacion = datetime.utcnow()
        
        # Registrar actividad (temporalmente comentado por problemas de mapeo)
        # log = LogActividad(
        #     usuario_id=session['user_id'],
        #     accion='actualizar_usuario',
        #     detalles=f'Usuario {user.email} actualizado por administrador'
        # )
        # db.session.add(log)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Usuario actualizado exitosamente',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al actualizar usuario: {str(e)}'}), 500

@admin_bp.route('/users/bulk-update', methods=['POST'])
@require_admin
def bulk_update_users():
    """Actualización masiva de usuarios"""
    try:
        data = request.json
        user_ids = data.get('user_ids', [])
        updates = data.get('updates', {})
        
        if not user_ids:
            return jsonify({'error': 'No se proporcionaron IDs de usuarios'}), 400
        
        users = User.query.filter(User.id.in_(user_ids)).all()
        
        for user in users:
            if 'estado_cuenta' in updates:
                user.estado_cuenta = updates['estado_cuenta']
            if 'rol' in updates:
                user.rol = updates['rol']
            
            user.fecha_actualizacion = datetime.utcnow()
        
        # Registrar actividad (temporalmente comentado por problemas de mapeo)
        # log = LogActividad(
        #     usuario_id=session['user_id'],
        #     accion='actualizacion_masiva_usuarios',
        #     detalles=f'Actualización masiva de {len(users)} usuarios'
        # )
        # db.session.add(log)
        
        db.session.commit()
        
        return jsonify({
            'message': f'{len(users)} usuarios actualizados exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error en actualización masiva: {str(e)}'}), 500

@admin_bp.route('/users/import', methods=['POST'])
@require_admin
def import_users():
    """Importar usuarios desde CSV"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No se proporcionó archivo'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No se seleccionó archivo'}), 400
        
        if not file.filename.endswith('.csv'):
            return jsonify({'error': 'El archivo debe ser CSV'}), 400
        
        # Leer CSV
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.DictReader(stream)
        
        imported_count = 0
        errors = []
        
        for row_num, row in enumerate(csv_reader, 2):  # Empezar en 2 porque la fila 1 es header
            try:
                # Validar campos requeridos
                required_fields = ['nombre', 'apellido', 'email', 'password', 'tipo_documento', 'numero_documento']
                for field in required_fields:
                    if not row.get(field):
                        errors.append(f"Fila {row_num}: Campo '{field}' es requerido")
                        continue
                
                # Verificar si el email ya existe
                if User.query.filter_by(email=row['email']).first():
                    errors.append(f"Fila {row_num}: Email '{row['email']}' ya existe")
                    continue
                
                # Crear usuario
                user = User(
                    nombre=row['nombre'],
                    apellido=row['apellido'],
                    email=row['email'],
                    tipo_documento=row['tipo_documento'],
                    numero_documento=row['numero_documento'],
                    rol=row.get('rol', 'estudiante'),
                    estado_cuenta=row.get('estado_cuenta', 'inactiva')
                )
                user.set_password(row['password'])
                
                db.session.add(user)
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Fila {row_num}: Error - {str(e)}")
        
        if imported_count > 0:
            # Registrar actividad (temporalmente comentado por problemas de mapeo)
            # log = LogActividad(
            #     usuario_id=session['user_id'],
            #     accion='importar_usuarios',
            #     detalles=f'Importados {imported_count} usuarios desde CSV'
            # )
            # db.session.add(log)
            
            db.session.commit()
        
        return jsonify({
            'message': f'Importación completada',
            'imported_count': imported_count,
            'errors': errors
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error en importación: {str(e)}'}), 500

@admin_bp.route('/users/export', methods=['GET'])
@require_admin
def export_users():
    """Exportar usuarios a CSV"""
    try:
        users = User.query.all()
        
        # Crear CSV en memoria
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow([
            'ID', 'Nombre', 'Apellido', 'Email', 'Tipo Documento', 
            'Número Documento', 'Rol', 'Estado Cuenta', 'Fecha Creación', 'Convocatoria'
        ])
        
        # Datos
        for user in users:
            writer.writerow([
                user.id,
                user.nombre,
                user.apellido,
                user.email,
                user.tipo_documento,
                user.numero_documento,
                user.rol,
                user.estado_cuenta,
                user.fecha_creacion.strftime('%Y-%m-%d %H:%M:%S') if user.fecha_creacion else '',
                user.convocatoria or ''
            ])
        
        # Registrar actividad (temporalmente comentado por problemas de mapeo)
        # log = LogActividad(
        #     usuario_id=session['user_id'],
        #     accion='exportar_usuarios',
        #     detalles=f'Exportados {len(users)} usuarios a CSV'
        # )
        # db.session.add(log)
        # db.session.commit()
        
        output.seek(0)
        return output.getvalue(), 200, {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename=usuarios.csv'
        }
        
    except Exception as e:
        return jsonify({'error': f'Error en exportación: {str(e)}'}), 500

@admin_bp.route('/logs', methods=['GET'])
@require_admin
def get_logs():
    """Obtener logs de actividad"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        usuario_id = request.args.get('usuario_id', type=int)
        accion = request.args.get('accion')
        
        # Por ahora retornamos logs vacíos para evitar errores
        logs = []
        
        return jsonify({
            'logs': logs,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': 0,
                'pages': 1,
                'has_next': False,
                'has_prev': False
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener logs: {str(e)}'}), 500 

@admin_bp.route('/courses', methods=['GET'])
@require_admin
def get_courses():
    """Obtener lista de cursos con filtros"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        estado = request.args.get('estado')
        instructor_id = request.args.get('instructor_id', type=int)
        search = request.args.get('search')
        
        query = Curso.query
        
        # Aplicar filtros
        if estado:
            query = query.filter_by(estado=estado)
        if instructor_id:
            query = query.filter_by(instructor_id=instructor_id)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Curso.titulo.ilike(search_term)) |
                (Curso.descripcion.ilike(search_term)) |
                (Curso.categoria.ilike(search_term))
            )
        
        # Ordenar por fecha de creación (más recientes primero)
        query = query.order_by(Curso.fecha_creacion.desc())
        
        # Paginación
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        courses = pagination.items
        
        # Obtener información de instructores para los cursos
        course_dicts = []
        for course in courses:
            course_dict = course.to_dict()
            if course.instructor_id:
                instructor = User.query.get(course.instructor_id)
                if instructor:
                    course_dict['instructor_nombre'] = f"{instructor.nombre} {instructor.apellido}"
                else:
                    course_dict['instructor_nombre'] = 'Instructor no encontrado'
            else:
                course_dict['instructor_nombre'] = 'Sin asignar'
            
            # Obtener total de inscripciones
            total_inscripciones = Inscripcion.query.filter_by(curso_id=course.id).count()
            course_dict['total_inscripciones'] = total_inscripciones
            
            course_dicts.append(course_dict)
        
        return jsonify({
            'courses': course_dicts,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener cursos: {str(e)}'}), 500

@admin_bp.route('/courses', methods=['POST'])
@require_admin
def create_course():
    """Crear nuevo curso"""
    try:
        data = request.json
        
        # Validar campos obligatorios
        if not data.get('titulo'):
            return jsonify({'error': 'El título del curso es obligatorio'}), 400
        
        # Procesar instructor_id
        instructor_id = data.get('instructor_id')
        if instructor_id == '' or instructor_id is None:
            instructor_id = None
        else:
            try:
                instructor_id = int(instructor_id)
            except (ValueError, TypeError):
                return jsonify({'error': 'ID de instructor inválido'}), 400
        
        # Crear nuevo curso
        curso = Curso(
            titulo=data['titulo'],
            descripcion=data.get('descripcion', ''),
            instructor_id=instructor_id,
            estado=data.get('estado', 'activo'),
            fecha_apertura=datetime.fromisoformat(data['fecha_apertura']) if data.get('fecha_apertura') else None,
            fecha_cierre=datetime.fromisoformat(data['fecha_cierre']) if data.get('fecha_cierre') else None,
            duracion_horas=data.get('duracion_horas', 0),
            nivel=data.get('nivel', 'básico'),
            categoria=data.get('categoria'),
            imagen_url=data.get('imagen_url'),
            max_estudiantes=data.get('max_estudiantes', 0)
        )
        
        db.session.add(curso)
        db.session.commit()
        
        # Obtener información del curso creado con instructor
        course_dict = curso.to_dict()
        if curso.instructor_id:
            instructor = User.query.get(curso.instructor_id)
            if instructor:
                course_dict['instructor_nombre'] = f"{instructor.nombre} {instructor.apellido}"
            else:
                course_dict['instructor_nombre'] = 'Instructor no encontrado'
        else:
            course_dict['instructor_nombre'] = 'Sin asignar'
        
        return jsonify({
            'message': 'Curso creado exitosamente',
            'course': course_dict
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al crear curso: {str(e)}'}), 500

@admin_bp.route('/courses/<int:course_id>', methods=['GET'])
@require_admin
def get_course(course_id):
    """Obtener curso específico"""
    try:
        curso = Curso.query.get_or_404(course_id)
        course_dict = curso.to_dict()
        
        # Obtener información del instructor
        if curso.instructor_id:
            instructor = User.query.get(curso.instructor_id)
            if instructor:
                course_dict['instructor_nombre'] = f"{instructor.nombre} {instructor.apellido}"
            else:
                course_dict['instructor_nombre'] = 'Instructor no encontrado'
        else:
            course_dict['instructor_nombre'] = 'Sin asignar'
        
        # Obtener total de inscripciones
        total_inscripciones = Inscripcion.query.filter_by(curso_id=curso.id).count()
        course_dict['total_inscripciones'] = total_inscripciones
        
        return jsonify(course_dict), 200
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener curso: {str(e)}'}), 500

@admin_bp.route('/courses/<int:course_id>', methods=['PUT'])
@require_admin
def update_course(course_id):
    """Actualizar curso"""
    try:
        curso = Curso.query.get_or_404(course_id)
        data = request.json
        
        # Actualizar campos
        if 'titulo' in data:
            curso.titulo = data['titulo']
        if 'descripcion' in data:
            curso.descripcion = data['descripcion']
        if 'instructor_id' in data:
            # Procesar instructor_id
            instructor_id = data['instructor_id']
            if instructor_id == '' or instructor_id is None:
                curso.instructor_id = None
            else:
                try:
                    curso.instructor_id = int(instructor_id)
                except (ValueError, TypeError):
                    return jsonify({'error': 'ID de instructor inválido'}), 400
        if 'estado' in data:
            curso.estado = data['estado']
        if 'fecha_apertura' in data:
            curso.fecha_apertura = datetime.fromisoformat(data['fecha_apertura']) if data['fecha_apertura'] else None
        if 'fecha_cierre' in data:
            curso.fecha_cierre = datetime.fromisoformat(data['fecha_cierre']) if data['fecha_cierre'] else None
        if 'duracion_horas' in data:
            curso.duracion_horas = data['duracion_horas']
        if 'nivel' in data:
            curso.nivel = data['nivel']
        if 'categoria' in data:
            curso.categoria = data['categoria']
        if 'imagen_url' in data:
            curso.imagen_url = data['imagen_url']
        if 'max_estudiantes' in data:
            curso.max_estudiantes = data['max_estudiantes']
        
        curso.fecha_actualizacion = datetime.utcnow()
        
        db.session.commit()
        
        # Obtener información actualizada del curso con instructor
        course_dict = curso.to_dict()
        if curso.instructor_id:
            instructor = User.query.get(curso.instructor_id)
            if instructor:
                course_dict['instructor_nombre'] = f"{instructor.nombre} {instructor.apellido}"
            else:
                course_dict['instructor_nombre'] = 'Instructor no encontrado'
        else:
            course_dict['instructor_nombre'] = 'Sin asignar'
        
        return jsonify({
            'message': 'Curso actualizado exitosamente',
            'course': course_dict
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al actualizar curso: {str(e)}'}), 500

@admin_bp.route('/courses/<int:course_id>', methods=['DELETE'])
@require_admin
def delete_course(course_id):
    """Eliminar curso"""
    try:
        curso = Curso.query.get_or_404(course_id)
        
        # Verificar si hay inscripciones
        if curso.inscripciones.count() > 0:
            return jsonify({'error': 'No se puede eliminar un curso que tiene estudiantes inscritos'}), 400
        
        db.session.delete(curso)
        db.session.commit()
        
        return jsonify({'message': 'Curso eliminado exitosamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al eliminar curso: {str(e)}'}), 500

@admin_bp.route('/instructors', methods=['GET'])
@require_admin
def get_instructors():
    """Obtener lista de instructores"""
    try:
        instructores = User.query.filter_by(rol='instructor').all()
        return jsonify([{
            'id': user.id,
            'nombre': f"{user.nombre} {user.apellido}",
            'email': user.email,
            'estado_cuenta': user.estado_cuenta
        } for user in instructores]), 200
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener instructores: {str(e)}'}), 500 

@admin_bp.route('/users/<int:user_id>/documento', methods=['GET'])
@require_admin
def download_user_documento(user_id):
    """Descargar/ver documento de identidad PDF del usuario"""
    try:
        user = User.query.get_or_404(user_id)
        if not user.documento_pdf:
            return jsonify({'error': 'El usuario no tiene documento PDF cargado'}), 404
        
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        tmp.write(user.documento_pdf)
        tmp.flush()
        tmp.seek(0)
        
        filename = user.documento_pdf_nombre or 'documento.pdf'
        return send_file(tmp.name, mimetype='application/pdf', as_attachment=False, download_name=filename)
    except Exception as e:
        return jsonify({'error': f'Error al descargar documento: {str(e)}'}), 500

@admin_bp.route('/users/<int:user_id>/requisitos', methods=['GET'])
@require_admin
def download_user_requisitos(user_id):
    """Descargar/ver requisitos PDF del usuario"""
    try:
        user = User.query.get_or_404(user_id)
        if not user.requisitos_pdf:
            return jsonify({'error': 'El usuario no tiene requisitos PDF cargados'}), 404
        
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        tmp.write(user.requisitos_pdf)
        tmp.flush()
        tmp.seek(0)
        
        filename = user.requisitos_pdf_nombre or 'requisitos.pdf'
        return send_file(tmp.name, mimetype='application/pdf', as_attachment=False, download_name=filename)
    except Exception as e:
        return jsonify({'error': f'Error al descargar requisitos: {str(e)}'}), 500 