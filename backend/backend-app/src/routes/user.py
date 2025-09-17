from flask import Blueprint, jsonify, request, session
from src.models import db, User
import re
from datetime import datetime
import base64

user_bp = Blueprint('user', __name__)

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    # Al menos 8 caracteres, incluir letras y números
    if len(password) < 8:
        return False
    if not re.search(r'[a-zA-Z]', password):
        return False
    if not re.search(r'[0-9]', password):
        return False
    return True

@user_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        
        # Validar campos obligatorios
        required_fields = ['nombre', 'apellido', 'email', 'tipo_documento', 'numero_documento', 'password', 'confirm_password', 'convocatoria']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'El campo {field} es obligatorio'}), 400
        
        # Validar formato de email
        if not validate_email(data['email']):
            return jsonify({'error': 'Formato de email inválido'}), 400
        
        # Validar contraseña
        if not validate_password(data['password']):
            return jsonify({'error': 'La contraseña debe tener al menos 8 caracteres, incluir letras y números'}), 400
        
        # Validar que las contraseñas coincidan
        if data['password'] != data['confirm_password']:
            return jsonify({'error': 'Las contraseñas no coinciden'}), 400
        
        # Validar convocatoria (solo '1' o '2')
        if data.get('convocatoria') not in ['1', '2']:
            return jsonify({'error': 'La convocatoria seleccionada no es válida'}), 400
        
        # Verificar si el email ya existe
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'El email ya está registrado'}), 400
        
        # Verificar si el número de documento ya existe
        existing_doc = User.query.filter_by(numero_documento=data['numero_documento']).first()
        if existing_doc:
            return jsonify({'error': 'El número de documento ya está registrado'}), 400
        
        # Procesar archivos PDF si están presentes
        documento_pdf = None
        documento_pdf_nombre = None
        requisitos_pdf = None
        requisitos_pdf_nombre = None
        
        if data.get('documento_pdf'):
            try:
                documento_pdf = base64.b64decode(data['documento_pdf'])
                documento_pdf_nombre = data.get('documento_pdf_nombre', 'documento.pdf')
            except Exception as e:
                return jsonify({'error': 'Error al procesar el archivo del documento'}), 400
        
        if data.get('requisitos_pdf'):
            try:
                requisitos_pdf = base64.b64decode(data['requisitos_pdf'])
                requisitos_pdf_nombre = data.get('requisitos_pdf_nombre', 'requisitos.pdf')
            except Exception as e:
                return jsonify({'error': 'Error al procesar el archivo de requisitos'}), 400
        
        # Crear nuevo usuario
        user = User(
            nombre=data['nombre'],
            apellido=data['apellido'],
            email=data['email'],
            tipo_documento=data['tipo_documento'],
            numero_documento=data['numero_documento'],
            documento_pdf=documento_pdf,
            documento_pdf_nombre=documento_pdf_nombre,
            requisitos_pdf=requisitos_pdf,
            requisitos_pdf_nombre=requisitos_pdf_nombre,
            convocatoria=data.get('convocatoria')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'Usuario registrado exitosamente. Tu cuenta está pendiente de activación por el administrador.',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500

@user_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        
        # Validar campos obligatorios
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email y contraseña son obligatorios'}), 400
        
        # Buscar usuario por email
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Credenciales inválidas'}), 401
        
        # Verificar estado de la cuenta
        if user.estado_cuenta == 'inactiva':
            return jsonify({'error': 'Tu cuenta está inactiva. Contacta al administrador para activarla.'}), 401
        elif user.estado_cuenta == 'suspendida':
            return jsonify({'error': 'Tu cuenta está suspendida. Contacta al administrador.'}), 401
        
        # Crear sesión
        session['user_id'] = user.id
        session['user_email'] = user.email
        
        return jsonify({
            'message': 'Inicio de sesión exitoso',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor'}), 500

@user_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Sesión cerrada exitosamente'}), 200

@user_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.json
        
        if not data.get('email'):
            return jsonify({'error': 'Email es obligatorio'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user:
            # Por seguridad, no revelar si el email existe o no
            return jsonify({'message': 'Si el email existe, se enviará un enlace de recuperación'}), 200
        
        # Generar token de recuperación
        token = user.generate_reset_token()
        db.session.commit()
        
        # Aquí normalmente se enviaría un email con el token
        # Para propósitos de desarrollo, devolvemos el token
        return jsonify({
            'message': 'Token de recuperación generado',
            'token': token  # En producción, esto se enviaría por email
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500

@user_bp.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.json
        
        required_fields = ['token', 'new_password', 'confirm_password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'El campo {field} es obligatorio'}), 400
        
        # Validar nueva contraseña
        if not validate_password(data['new_password']):
            return jsonify({'error': 'La contraseña debe tener al menos 8 caracteres, incluir letras y números'}), 400
        
        # Validar que las contraseñas coincidan
        if data['new_password'] != data['confirm_password']:
            return jsonify({'error': 'Las contraseñas no coinciden'}), 400
        
        # Buscar usuario por token
        user = User.query.filter_by(token_reset=data['token']).first()
        
        if not user or not user.token_reset_expira or user.token_reset_expira < datetime.utcnow():
            return jsonify({'error': 'Token inválido o expirado'}), 400
        
        # Actualizar contraseña
        user.set_password(data['new_password'])
        user.token_reset = None
        user.token_reset_expira = None
        
        db.session.commit()
        
        return jsonify({'message': 'Contraseña actualizada exitosamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500

@user_bp.route('/profile', methods=['GET'])
def get_profile():
    if 'user_id' not in session:
        return jsonify({'error': 'No autorizado'}), 401
    
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    return jsonify(user.to_dict()), 200

@user_bp.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return '', 204
