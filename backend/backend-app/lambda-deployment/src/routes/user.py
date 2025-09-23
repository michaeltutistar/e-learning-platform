from flask import Blueprint, jsonify, request, session  # pyright: ignore[reportMissingImports]
from src.models import db, User
from src.models import CuposConfig, MunicipioCupo
from src.models import LogActividad, Notificacion
from src.constants.municipios import LISTA_MUNICIPIOS
from werkzeug.security import generate_password_hash  # pyright: ignore[reportMissingImports]
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
        required_fields = ['nombre', 'apellido', 'email', 'tipo_documento', 'numero_documento', 'password', 'confirm_password', 'convocatoria', 'fecha_nacimiento', 'sexo', 'estado_civil', 'telefono', 'direccion', 'municipio', 'emprendimiento_nombre', 'emprendimiento_sector', 'tipo_persona', 'emprendimiento_formalizado', 'financiado_estado', 'declara_veraz', 'declara_no_beneficiario', 'acepta_terminos', 'doc_terminos_pdf', 'doc_uso_imagen_pdf', 'doc_plan_negocio_xls', 'doc_vecindad_pdf']
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

        # Validar municipio
        if data.get('municipio') not in LISTA_MUNICIPIOS:
            return jsonify({'error': 'El municipio seleccionado no es válido'}), 400

        # Validar sector económico
        sectores_validos = {'agroindustria', 'industria_comercio', 'turismo_servicios'}
        sector_val = (data.get('emprendimiento_sector') or '').strip().lower()
        if sector_val not in sectores_validos:
            return jsonify({'error': 'Sector económico inválido'}), 400

        # Validar tipo de persona
        tipos_validos = {'natural', 'juridica'}
        tipo_persona_val = (data.get('tipo_persona') or '').strip().lower()
        if tipo_persona_val not in tipos_validos:
            return jsonify({'error': 'Tipo de persona inválido'}), 400

        # Validar fecha de nacimiento y rango de edad (18-32)
        try:
            fecha_nac = datetime.fromisoformat(data['fecha_nacimiento']).date()
        except Exception:
            return jsonify({'error': 'La fecha de nacimiento debe tener formato ISO (YYYY-MM-DD)'}), 400

        hoy = datetime.utcnow().date()
        edad = (hoy - fecha_nac).days // 365
        if edad < 18 or edad > 32:
            return jsonify({'error': 'La edad debe estar entre 18 y 32 años'}), 400
        
        # Verificar si el email ya existe
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'El email ya está registrado'}), 400
        
        # Verificar si el número de documento ya existe
        existing_doc = User.query.filter_by(numero_documento=data['numero_documento']).first()
        if existing_doc:
            return jsonify({'error': 'El número de documento ya está registrado'}), 400
        
        # Procesar documentos específicos obligatorios
        doc_terminos_pdf = None
        doc_terminos_pdf_nombre = None
        doc_uso_imagen_pdf = None
        doc_uso_imagen_pdf_nombre = None
        doc_plan_negocio_xls = None
        doc_plan_negocio_nombre = None
        doc_vecindad_pdf = None
        doc_vecindad_pdf_nombre = None
        video_url = data.get('video_url', None)  # Opcional por ahora
        
        # Validar y decodificar TDR (PDF obligatorio)
        if data.get('doc_terminos_pdf'):
            try:
                doc_terminos_pdf = base64.b64decode(data['doc_terminos_pdf'])
                doc_terminos_pdf_nombre = data.get('doc_terminos_pdf_nombre', 'terminos.pdf')
                # Validar tamaño (20MB máximo)
                if len(doc_terminos_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'El archivo de términos de referencia no puede superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar el archivo de términos de referencia'}), 400
        
        # Validar y decodificar Uso de Imagen (PDF obligatorio)
        if data.get('doc_uso_imagen_pdf'):
            try:
                doc_uso_imagen_pdf = base64.b64decode(data['doc_uso_imagen_pdf'])
                doc_uso_imagen_pdf_nombre = data.get('doc_uso_imagen_pdf_nombre', 'uso_imagen.pdf')
                if len(doc_uso_imagen_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'El archivo de autorización de uso de imagen no puede superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar el archivo de autorización de uso de imagen'}), 400
        
        # Validar y decodificar Plan de Negocio (Excel obligatorio)
        if data.get('doc_plan_negocio_xls'):
            try:
                doc_plan_negocio_xls = base64.b64decode(data['doc_plan_negocio_xls'])
                doc_plan_negocio_nombre = data.get('doc_plan_negocio_nombre', 'plan_negocio.xlsx')
                if len(doc_plan_negocio_xls) > 20 * 1024 * 1024:
                    return jsonify({'error': 'El archivo del plan de negocio no puede superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar el archivo del plan de negocio'}), 400
        
        # Validar y decodificar Vecindad (PDF obligatorio)
        if data.get('doc_vecindad_pdf'):
            try:
                doc_vecindad_pdf = base64.b64decode(data['doc_vecindad_pdf'])
                doc_vecindad_pdf_nombre = data.get('doc_vecindad_pdf_nombre', 'vecindad.pdf')
                if len(doc_vecindad_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'El certificado de vecindad no puede superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar el certificado de vecindad'}), 400
        
        # Validar y procesar documentos condicionales según tipo de persona
        rut_pdf = None
        rut_pdf_nombre = None
        cedula_pdf = None
        cedula_pdf_nombre = None
        cedula_representante_pdf = None
        cedula_representante_pdf_nombre = None
        cert_existencia_pdf = None
        cert_existencia_pdf_nombre = None
        
        if tipo_persona_val == 'natural':
            # Persona Natural: RUT + Cédula obligatorios
            if not data.get('rut_pdf'):
                return jsonify({'error': 'Debe adjuntar el RUT actualizado 2025 (obligatorio para Persona Natural)'}), 400
            if not data.get('cedula_pdf'):
                return jsonify({'error': 'Debe adjuntar la cédula de ciudadanía (obligatorio para Persona Natural)'}), 400
            
            # Procesar RUT
            try:
                rut_pdf = base64.b64decode(data['rut_pdf'])
                rut_pdf_nombre = data.get('rut_pdf_nombre', 'rut.pdf')
                if len(rut_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'El archivo del RUT no puede superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar el archivo del RUT'}), 400
            
            # Procesar Cédula
            try:
                cedula_pdf = base64.b64decode(data['cedula_pdf'])
                cedula_pdf_nombre = data.get('cedula_pdf_nombre', 'cedula.pdf')
                if len(cedula_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'El archivo de la cédula no puede superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar el archivo de la cédula'}), 400
                
        elif tipo_persona_val == 'juridica':
            # Persona Jurídica: RUT + Cédula representante + Certificado existencia obligatorios
            if not data.get('rut_pdf'):
                return jsonify({'error': 'Debe adjuntar el RUT actualizado 2025 (obligatorio para Persona Jurídica)'}), 400
            if not data.get('cedula_representante_pdf'):
                return jsonify({'error': 'Debe adjuntar la cédula del representante legal (obligatorio para Persona Jurídica)'}), 400
            if not data.get('cert_existencia_pdf'):
                return jsonify({'error': 'Debe adjuntar el certificado de existencia y representación legal no mayor a 30 días (obligatorio para Persona Jurídica)'}), 400
            
            # Procesar RUT
            try:
                rut_pdf = base64.b64decode(data['rut_pdf'])
                rut_pdf_nombre = data.get('rut_pdf_nombre', 'rut.pdf')
                if len(rut_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'El archivo del RUT no puede superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar el archivo del RUT'}), 400
            
            # Procesar Cédula representante
            try:
                cedula_representante_pdf = base64.b64decode(data['cedula_representante_pdf'])
                cedula_representante_pdf_nombre = data.get('cedula_representante_pdf_nombre', 'cedula_representante.pdf')
                if len(cedula_representante_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'El archivo de la cédula del representante no puede superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar el archivo de la cédula del representante'}), 400
            
            # Procesar Certificado de existencia
            try:
                cert_existencia_pdf = base64.b64decode(data['cert_existencia_pdf'])
                cert_existencia_pdf_nombre = data.get('cert_existencia_pdf_nombre', 'certificado_existencia.pdf')
                if len(cert_existencia_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'El certificado de existencia no puede superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar el certificado de existencia'}), 400
        
        # Procesar documentación diferencial (opcional/subsanable)
        ruv_pdf = None
        ruv_pdf_nombre = None
        sisben_pdf = None
        sisben_pdf_nombre = None
        grupo_etnico_pdf = None
        grupo_etnico_pdf_nombre = None
        arn_pdf = None
        arn_pdf_nombre = None
        discapacidad_pdf = None
        discapacidad_pdf_nombre = None
        
        docs_diferenciales_cargados = []
        docs_diferenciales_pendientes = []
        
        # RUV (opcional)
        if data.get('ruv_pdf'):
            try:
                ruv_pdf = base64.b64decode(data['ruv_pdf'])
                ruv_pdf_nombre = data.get('ruv_pdf_nombre', 'ruv.pdf')
                if len(ruv_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'El certificado RUV no puede superar 20MB'}), 400
                docs_diferenciales_cargados.append('RUV')
            except Exception as e:
                return jsonify({'error': 'Error al procesar el certificado RUV'}), 400
        else:
            docs_diferenciales_pendientes.append('RUV')
        
        # SISBEN (opcional)
        if data.get('sisben_pdf'):
            try:
                sisben_pdf = base64.b64decode(data['sisben_pdf'])
                sisben_pdf_nombre = data.get('sisben_pdf_nombre', 'sisben.pdf')
                if len(sisben_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'La copia del SISBEN no puede superar 20MB'}), 400
                docs_diferenciales_cargados.append('SISBEN')
            except Exception as e:
                return jsonify({'error': 'Error al procesar la copia del SISBEN'}), 400
        else:
            docs_diferenciales_pendientes.append('SISBEN')
        
        # Grupo étnico (opcional)
        if data.get('grupo_etnico_pdf'):
            try:
                grupo_etnico_pdf = base64.b64decode(data['grupo_etnico_pdf'])
                grupo_etnico_pdf_nombre = data.get('grupo_etnico_pdf_nombre', 'grupo_etnico.pdf')
                if len(grupo_etnico_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'El certificado de grupo étnico no puede superar 20MB'}), 400
                docs_diferenciales_cargados.append('Grupo Étnico')
            except Exception as e:
                return jsonify({'error': 'Error al procesar el certificado de grupo étnico'}), 400
        else:
            docs_diferenciales_pendientes.append('Grupo Étnico')
        
        # ARN (opcional)
        if data.get('arn_pdf'):
            try:
                arn_pdf = base64.b64decode(data['arn_pdf'])
                arn_pdf_nombre = data.get('arn_pdf_nombre', 'arn.pdf')
                if len(arn_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'El certificado ARN no puede superar 20MB'}), 400
                docs_diferenciales_cargados.append('ARN')
            except Exception as e:
                return jsonify({'error': 'Error al procesar el certificado ARN'}), 400
        else:
            docs_diferenciales_pendientes.append('ARN')
        
        # Discapacidad (opcional)
        if data.get('discapacidad_pdf'):
            try:
                discapacidad_pdf = base64.b64decode(data['discapacidad_pdf'])
                discapacidad_pdf_nombre = data.get('discapacidad_pdf_nombre', 'discapacidad.pdf')
                if len(discapacidad_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'El certificado de discapacidad no puede superar 20MB'}), 400
                docs_diferenciales_cargados.append('Discapacidad')
            except Exception as e:
                return jsonify({'error': 'Error al procesar el certificado de discapacidad'}), 400
        else:
            docs_diferenciales_pendientes.append('Discapacidad')
        
        # Validar documentación de control (OBLIGATORIA - bloquea registro si falta)
        docs_control_obligatorios = [
            'antecedentes_fiscales_pdf',
            'antecedentes_disciplinarios_pdf', 
            'antecedentes_judiciales_pdf',
            'redam_pdf',
            'inhabilidades_sexuales_pdf',
            'declaracion_capacidad_legal_pdf'
        ]
        
        docs_control_faltantes = []
        for doc_field in docs_control_obligatorios:
            if not data.get(doc_field):
                docs_control_faltantes.append(doc_field)
        
        if docs_control_faltantes:
            docs_nombres = {
                'antecedentes_fiscales_pdf': 'Antecedentes fiscales (Contraloría)',
                'antecedentes_disciplinarios_pdf': 'Antecedentes disciplinarios (Procuraduría)',
                'antecedentes_judiciales_pdf': 'Antecedentes judiciales (Policía Nacional)',
                'redam_pdf': 'Certificado REDAM',
                'inhabilidades_sexuales_pdf': 'Consulta de inhabilidades por delitos sexuales',
                'declaracion_capacidad_legal_pdf': 'Declaración juramentada de capacidad legal'
            }
            faltantes_nombres = [docs_nombres[doc] for doc in docs_control_faltantes]
            return jsonify({
                'error': f'Debe adjuntar todos los certificados de control. Sin ellos, la inscripción no será válida. Faltan: {", ".join(faltantes_nombres)}'
            }), 400
        
        # Procesar documentos de control obligatorios
        antecedentes_fiscales_pdf = None
        antecedentes_fiscales_pdf_nombre = None
        antecedentes_disciplinarios_pdf = None
        antecedentes_disciplinarios_pdf_nombre = None
        antecedentes_judiciales_pdf = None
        antecedentes_judiciales_pdf_nombre = None
        redam_pdf = None
        redam_pdf_nombre = None
        inhabilidades_sexuales_pdf = None
        inhabilidades_sexuales_pdf_nombre = None
        declaracion_capacidad_legal_pdf = None
        declaracion_capacidad_legal_pdf_nombre = None
        
        # Procesar cada documento de control
        try:
            antecedentes_fiscales_pdf = base64.b64decode(data['antecedentes_fiscales_pdf'])
            antecedentes_fiscales_pdf_nombre = data.get('antecedentes_fiscales_pdf_nombre', 'antecedentes_fiscales.pdf')
            if len(antecedentes_fiscales_pdf) > 20 * 1024 * 1024:
                return jsonify({'error': 'Los antecedentes fiscales no pueden superar 20MB'}), 400
        except Exception as e:
            return jsonify({'error': 'Error al procesar los antecedentes fiscales'}), 400
        
        try:
            antecedentes_disciplinarios_pdf = base64.b64decode(data['antecedentes_disciplinarios_pdf'])
            antecedentes_disciplinarios_pdf_nombre = data.get('antecedentes_disciplinarios_pdf_nombre', 'antecedentes_disciplinarios.pdf')
            if len(antecedentes_disciplinarios_pdf) > 20 * 1024 * 1024:
                return jsonify({'error': 'Los antecedentes disciplinarios no pueden superar 20MB'}), 400
        except Exception as e:
            return jsonify({'error': 'Error al procesar los antecedentes disciplinarios'}), 400
        
        try:
            antecedentes_judiciales_pdf = base64.b64decode(data['antecedentes_judiciales_pdf'])
            antecedentes_judiciales_pdf_nombre = data.get('antecedentes_judiciales_pdf_nombre', 'antecedentes_judiciales.pdf')
            if len(antecedentes_judiciales_pdf) > 20 * 1024 * 1024:
                return jsonify({'error': 'Los antecedentes judiciales no pueden superar 20MB'}), 400
        except Exception as e:
            return jsonify({'error': 'Error al procesar los antecedentes judiciales'}), 400
        
        try:
            redam_pdf = base64.b64decode(data['redam_pdf'])
            redam_pdf_nombre = data.get('redam_pdf_nombre', 'redam.pdf')
            if len(redam_pdf) > 20 * 1024 * 1024:
                return jsonify({'error': 'El certificado REDAM no puede superar 20MB'}), 400
        except Exception as e:
            return jsonify({'error': 'Error al procesar el certificado REDAM'}), 400
        
        try:
            inhabilidades_sexuales_pdf = base64.b64decode(data['inhabilidades_sexuales_pdf'])
            inhabilidades_sexuales_pdf_nombre = data.get('inhabilidades_sexuales_pdf_nombre', 'inhabilidades_sexuales.pdf')
            if len(inhabilidades_sexuales_pdf) > 20 * 1024 * 1024:
                return jsonify({'error': 'La consulta de inhabilidades sexuales no puede superar 20MB'}), 400
        except Exception as e:
            return jsonify({'error': 'Error al procesar la consulta de inhabilidades sexuales'}), 400
        
        try:
            declaracion_capacidad_legal_pdf = base64.b64decode(data['declaracion_capacidad_legal_pdf'])
            declaracion_capacidad_legal_pdf_nombre = data.get('declaracion_capacidad_legal_pdf_nombre', 'declaracion_capacidad.pdf')
            if len(declaracion_capacidad_legal_pdf) > 20 * 1024 * 1024:
                return jsonify({'error': 'La declaración de capacidad legal no puede superar 20MB'}), 400
        except Exception as e:
            return jsonify({'error': 'Error al procesar la declaración de capacidad legal'}), 400
        
        # Validación condicional de certificación de funcionamiento
        emprendimiento_formalizado = data.get('emprendimiento_formalizado')
        if emprendimiento_formalizado is None:
            return jsonify({'error': 'Debe especificar si el emprendimiento está formalizado'}), 400
        
        # Procesar documentos de funcionamiento según formalización
        matricula_mercantil_pdf = None
        matricula_mercantil_pdf_nombre = None
        facturas_6meses_pdf = None
        facturas_6meses_pdf_nombre = None
        publicaciones_redes_pdf = None
        publicaciones_redes_pdf_nombre = None
        registro_ventas_pdf = None
        registro_ventas_pdf_nombre = None
        
        if emprendimiento_formalizado:
            # Emprendimiento formalizado - requiere matrícula mercantil y facturas
            if not data.get('matricula_mercantil_pdf'):
                return jsonify({'error': 'Para emprendimientos formalizados, la matrícula mercantil es obligatoria'}), 400
            if not data.get('facturas_6meses_pdf'):
                return jsonify({'error': 'Para emprendimientos formalizados, las facturas de los últimos 6 meses son obligatorias'}), 400
            
            try:
                matricula_mercantil_pdf = base64.b64decode(data['matricula_mercantil_pdf'])
                matricula_mercantil_pdf_nombre = data.get('matricula_mercantil_pdf_nombre', 'matricula_mercantil.pdf')
                if len(matricula_mercantil_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'La matrícula mercantil no puede superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar la matrícula mercantil'}), 400
            
            try:
                facturas_6meses_pdf = base64.b64decode(data['facturas_6meses_pdf'])
                facturas_6meses_pdf_nombre = data.get('facturas_6meses_pdf_nombre', 'facturas_6meses.pdf')
                if len(facturas_6meses_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'Las facturas de los últimos 6 meses no pueden superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar las facturas de los últimos 6 meses'}), 400
                
        else:
            # Emprendimiento informal - requiere publicaciones de redes y registro de ventas
            if not data.get('publicaciones_redes_pdf'):
                return jsonify({'error': 'Para emprendimientos informales, las publicaciones de redes sociales son obligatorias'}), 400
            if not data.get('registro_ventas_pdf'):
                return jsonify({'error': 'Para emprendimientos informales, el registro de ventas de los últimos 6 meses es obligatorio'}), 400
            
            try:
                publicaciones_redes_pdf = base64.b64decode(data['publicaciones_redes_pdf'])
                publicaciones_redes_pdf_nombre = data.get('publicaciones_redes_pdf_nombre', 'publicaciones_redes.pdf')
                if len(publicaciones_redes_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'Las publicaciones de redes sociales no pueden superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar las publicaciones de redes sociales'}), 400
            
            try:
                registro_ventas_pdf = base64.b64decode(data['registro_ventas_pdf'])
                registro_ventas_pdf_nombre = data.get('registro_ventas_pdf_nombre', 'registro_ventas.pdf')
                if len(registro_ventas_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'El registro de ventas no puede superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar el registro de ventas'}), 400
        
        # Validación condicional de financiación de otras fuentes
        financiado_estado = data.get('financiado_estado')
        if financiado_estado is None:
            return jsonify({'error': 'Debe especificar si el emprendimiento ha sido financiado por otros programas del Estado'}), 400
        
        # Procesar fuentes de financiación
        financiado_regalias = data.get('financiado_regalias', False)
        financiado_camara_comercio = data.get('financiado_camara_comercio', False)
        financiado_incubadoras = data.get('financiado_incubadoras', False)
        financiado_otro = data.get('financiado_otro', False)
        financiado_otro_texto = data.get('financiado_otro_texto', None)
        
        if financiado_estado:
            # Si ha sido financiado, debe especificar al menos una fuente
            if not any([financiado_regalias, financiado_camara_comercio, financiado_incubadoras, financiado_otro]):
                return jsonify({'error': 'Si el emprendimiento ha sido financiado por otros programas del Estado, debe especificar al menos una fuente de financiación'}), 400
            
            # Si marcó "otro", debe proporcionar el texto
            if financiado_otro and not financiado_otro_texto:
                return jsonify({'error': 'Si selecciona "Otro" como fuente de financiación, debe especificar cuál'}), 400
        else:
            # Si no ha sido financiado, resetear todas las fuentes a False
            financiado_regalias = False
            financiado_camara_comercio = False
            financiado_incubadoras = False
            financiado_otro = False
            financiado_otro_texto = None
        
        # Validación de declaraciones y aceptaciones (obligatorias para cumplimiento legal)
        declara_veraz = data.get('declara_veraz', False)
        declara_no_beneficiario = data.get('declara_no_beneficiario', False)
        acepta_terminos = data.get('acepta_terminos', False)
        
        # Validar que todas las declaraciones sean verdaderas
        if not declara_veraz or not declara_no_beneficiario or not acepta_terminos:
            return jsonify({'error': 'Las declaraciones y aceptaciones son obligatorias para inscribirse. Debe aceptar que la información es veraz, que no ha sido beneficiario de recursos públicos para este emprendimiento, y los términos y condiciones de la convocatoria.'}), 400
        
        # Fecha de aceptación para trazabilidad legal
        fecha_aceptacion_terminos = datetime.utcnow()
        
        # Lógica de cupos (modo abierto/bloqueado con lista de espera)
        modo = 'abierto'
        cupo_global_max = None
        cfg = CuposConfig.query.order_by(CuposConfig.id.desc()).first()
        if cfg:
            modo = (cfg.modo or 'abierto').strip()
            cupo_global_max = cfg.cupo_global_max

        estado_cuenta = 'inactiva'

        if modo == 'bloqueado':
            # Transacción: bloquear fila de municipio y contar
            with db.session.begin_nested():
                muni_row = (
                    db.session.query(MunicipioCupo)
                    .filter(MunicipioCupo.municipio_slug == data['municipio'])
                    .with_for_update()
                    .first()
                )

                # Conteos actuales (confirmados/pedientes activación)
                q_base = db.session.query(User).filter(
                    User.convocatoria == data['convocatoria']
                )
                total_confirmados = q_base.filter(User.estado_cuenta.in_(['activa', 'inactiva'])).count()
                muni_confirmados = q_base.filter(
                    User.municipio == data['municipio'],
                    User.estado_cuenta.in_(['activa', 'inactiva'])
                ).count()

                municipio_lleno = bool(muni_row) and muni_confirmados >= int(muni_row.cupo_max)
                global_lleno = cupo_global_max is not None and total_confirmados >= int(cupo_global_max)

                if municipio_lleno or global_lleno:
                    estado_cuenta = 'lista_espera'
                else:
                    estado_cuenta = 'inactiva'

        # Crear nuevo usuario
        user = User(
            nombre=data['nombre'],
            apellido=data['apellido'],
            email=data['email'],
            tipo_documento=data['tipo_documento'],
            numero_documento=data['numero_documento'],
            telefono=data.get('telefono'),
            fecha_nacimiento=fecha_nac,
            sexo=data.get('sexo'),
            estado_civil=data.get('estado_civil'),
            direccion=data.get('direccion'),
            municipio=data.get('municipio'),
            emprendimiento_nombre=data.get('emprendimiento_nombre'),
            emprendimiento_sector=sector_val,
            tipo_persona=tipo_persona_val,
            doc_terminos_pdf=doc_terminos_pdf,
            doc_terminos_pdf_nombre=doc_terminos_pdf_nombre,
            doc_uso_imagen_pdf=doc_uso_imagen_pdf,
            doc_uso_imagen_pdf_nombre=doc_uso_imagen_pdf_nombre,
            doc_plan_negocio_xls=doc_plan_negocio_xls,
            doc_plan_negocio_nombre=doc_plan_negocio_nombre,
            doc_vecindad_pdf=doc_vecindad_pdf,
            doc_vecindad_pdf_nombre=doc_vecindad_pdf_nombre,
            video_url=video_url,
            rut_pdf=rut_pdf,
            rut_pdf_nombre=rut_pdf_nombre,
            cedula_pdf=cedula_pdf,
            cedula_pdf_nombre=cedula_pdf_nombre,
            cedula_representante_pdf=cedula_representante_pdf,
            cedula_representante_pdf_nombre=cedula_representante_pdf_nombre,
            cert_existencia_pdf=cert_existencia_pdf,
            cert_existencia_pdf_nombre=cert_existencia_pdf_nombre,
            ruv_pdf=ruv_pdf,
            ruv_pdf_nombre=ruv_pdf_nombre,
            sisben_pdf=sisben_pdf,
            sisben_pdf_nombre=sisben_pdf_nombre,
            grupo_etnico_pdf=grupo_etnico_pdf,
            grupo_etnico_pdf_nombre=grupo_etnico_pdf_nombre,
            arn_pdf=arn_pdf,
            arn_pdf_nombre=arn_pdf_nombre,
            discapacidad_pdf=discapacidad_pdf,
            discapacidad_pdf_nombre=discapacidad_pdf_nombre,
            antecedentes_fiscales_pdf=antecedentes_fiscales_pdf,
            antecedentes_fiscales_pdf_nombre=antecedentes_fiscales_pdf_nombre,
            antecedentes_disciplinarios_pdf=antecedentes_disciplinarios_pdf,
            antecedentes_disciplinarios_pdf_nombre=antecedentes_disciplinarios_pdf_nombre,
            antecedentes_judiciales_pdf=antecedentes_judiciales_pdf,
            antecedentes_judiciales_pdf_nombre=antecedentes_judiciales_pdf_nombre,
            redam_pdf=redam_pdf,
            redam_pdf_nombre=redam_pdf_nombre,
            inhabilidades_sexuales_pdf=inhabilidades_sexuales_pdf,
            inhabilidades_sexuales_pdf_nombre=inhabilidades_sexuales_pdf_nombre,
            declaracion_capacidad_legal_pdf=declaracion_capacidad_legal_pdf,
            declaracion_capacidad_legal_pdf_nombre=declaracion_capacidad_legal_pdf_nombre,
            estado_control='completo',  # Todos los documentos de control están cargados
            resultado_certificados='pendiente',  # Pendiente de revisión administrativa
            # Certificación de funcionamiento
            emprendimiento_formalizado=emprendimiento_formalizado,
            matricula_mercantil_pdf=matricula_mercantil_pdf,
            matricula_mercantil_pdf_nombre=matricula_mercantil_pdf_nombre,
            facturas_6meses_pdf=facturas_6meses_pdf,
            facturas_6meses_pdf_nombre=facturas_6meses_pdf_nombre,
            publicaciones_redes_pdf=publicaciones_redes_pdf,
            publicaciones_redes_pdf_nombre=publicaciones_redes_pdf_nombre,
            registro_ventas_pdf=registro_ventas_pdf,
            registro_ventas_pdf_nombre=registro_ventas_pdf_nombre,
            # Financiación de otras fuentes
            financiado_estado=financiado_estado,
            financiado_regalias=financiado_regalias,
            financiado_camara_comercio=financiado_camara_comercio,
            financiado_incubadoras=financiado_incubadoras,
            financiado_otro=financiado_otro,
            financiado_otro_texto=financiado_otro_texto,
            # Declaraciones y aceptaciones
            declara_veraz=declara_veraz,
            declara_no_beneficiario=declara_no_beneficiario,
            acepta_terminos=acepta_terminos,
            fecha_aceptacion_terminos=fecha_aceptacion_terminos,
            # Estado de inscripción (formulario completo enviado)
            estado_inscripcion='enviada',
            paso_actual=8,
            formulario_enviado=True,
            fecha_ultimo_guardado=datetime.utcnow(),
            convocatoria=data.get('convocatoria'),
            estado_cuenta=estado_cuenta
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()

        # Log de registro con estado de documentos diferenciales, control y funcionamiento
        try:
            detalles_log = f"Registro {'lista_espera' if estado_cuenta=='lista_espera' else 'confirmado'} en {user.municipio} (conv {user.convocatoria})"
            detalles_log += f". Control: {user.estado_control} (todos los certificados de control cargados)"
            
            # Información de funcionamiento
            tipo_funcionamiento = "formalizado" if emprendimiento_formalizado else "informal"
            docs_funcionamiento = []
            if emprendimiento_formalizado:
                if matricula_mercantil_pdf:
                    docs_funcionamiento.append("matrícula mercantil")
                if facturas_6meses_pdf:
                    docs_funcionamiento.append("facturas 6 meses")
            else:
                if publicaciones_redes_pdf:
                    docs_funcionamiento.append("publicaciones redes")
                if registro_ventas_pdf:
                    docs_funcionamiento.append("registro ventas")
            
            detalles_log += f". Funcionamiento: {tipo_funcionamiento} ({', '.join(docs_funcionamiento)})"
            
            # Información de financiación
            financiacion_info = "No financiado"
            if financiado_estado:
                fuentes_financiacion = []
                if financiado_regalias:
                    fuentes_financiacion.append("Regalías")
                if financiado_camara_comercio:
                    fuentes_financiacion.append("Cámara de Comercio")
                if financiado_incubadoras:
                    fuentes_financiacion.append("Incubadoras")
                if financiado_otro:
                    fuentes_financiacion.append(f"Otro ({financiado_otro_texto})")
                financiacion_info = f"Financiado por: {', '.join(fuentes_financiacion)}"
            
            detalles_log += f". Financiación: {financiacion_info}"
            
            # Información de declaraciones (para trazabilidad legal)
            declaraciones_info = f"Declaraciones aceptadas: Veraz={declara_veraz}, No beneficiario={declara_no_beneficiario}, Términos={acepta_terminos} el {fecha_aceptacion_terminos.strftime('%Y-%m-%d %H:%M:%S')}"
            detalles_log += f". {declaraciones_info}"
            
            if docs_diferenciales_cargados:
                detalles_log += f". Docs diferenciales cargados: {', '.join(docs_diferenciales_cargados)}"
            if docs_diferenciales_pendientes:
                detalles_log += f". Docs diferenciales pendientes/subsanables: {', '.join(docs_diferenciales_pendientes)}"
            
            db.session.add(LogActividad(
                usuario_id=user.id,
                accion='register',
                detalles=detalles_log
            ))
            db.session.commit()
        except Exception:
            db.session.rollback()
        
        return jsonify({
            'message': 'Usuario registrado exitosamente. Tu cuenta está pendiente de activación por el administrador.',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500

@user_bp.route('/save-partial', methods=['POST'])
def save_partial():
    """Guardar progreso parcial del formulario de inscripción"""
    try:
        data = request.json
        user_id = data.get('user_id')
        paso = data.get('paso', 1)
        
        if not user_id:
            return jsonify({'error': 'ID de usuario requerido'}), 400
        
        user = User.query.get_or_404(user_id)
        
        # Verificar que el formulario no haya sido enviado
        if user.formulario_enviado:
            return jsonify({'error': 'El formulario ya ha sido enviado y no se puede modificar'}), 400
        
        # Actualizar campos según el paso
        if paso >= 1:  # Datos generales
            if data.get('nombre'): user.nombre = data['nombre']
            if data.get('apellido'): user.apellido = data['apellido']
            if data.get('email'): user.email = data['email']
            if data.get('tipo_documento'): user.tipo_documento = data['tipo_documento']
            if data.get('numero_documento'): user.numero_documento = data['numero_documento']
            if data.get('telefono'): user.telefono = data['telefono']
            if data.get('fecha_nacimiento'): 
                user.fecha_nacimiento = datetime.strptime(data['fecha_nacimiento'], '%Y-%m-%d').date()
            if data.get('sexo'): user.sexo = data['sexo']
            if data.get('estado_civil'): user.estado_civil = data['estado_civil']
            if data.get('direccion'): user.direccion = data['direccion']
            if data.get('municipio'): user.municipio = data['municipio']
            if data.get('emprendimiento_nombre'): user.emprendimiento_nombre = data['emprendimiento_nombre']
            if data.get('emprendimiento_sector'): user.emprendimiento_sector = data['emprendimiento_sector']
            if data.get('tipo_persona'): user.tipo_persona = data['tipo_persona']
            if data.get('convocatoria'): user.convocatoria = data['convocatoria']
        
        if paso >= 6:  # Funcionamiento
            if 'emprendimiento_formalizado' in data:
                user.emprendimiento_formalizado = data['emprendimiento_formalizado']
        
        if paso >= 7:  # Financiación
            if 'financiado_estado' in data:
                user.financiado_estado = data['financiado_estado']
                user.financiado_regalias = data.get('financiado_regalias', False)
                user.financiado_camara_comercio = data.get('financiado_camara_comercio', False)
                user.financiado_incubadoras = data.get('financiado_incubadoras', False)
                user.financiado_otro = data.get('financiado_otro', False)
                user.financiado_otro_texto = data.get('financiado_otro_texto', '')
        
        if paso >= 8:  # Declaraciones
            if 'declara_veraz' in data:
                user.declara_veraz = data['declara_veraz']
            if 'declara_no_beneficiario' in data:
                user.declara_no_beneficiario = data['declara_no_beneficiario']
            if 'acepta_terminos' in data:
                user.acepta_terminos = data['acepta_terminos']
        
        # Actualizar progreso
        user.paso_actual = max(user.paso_actual, paso)
        user.fecha_ultimo_guardado = datetime.utcnow()
        
        # Determinar estado de inscripción
        if paso == 8 and user.declara_veraz and user.declara_no_beneficiario and user.acepta_terminos:
            user.estado_inscripcion = 'completada'
        else:
            user.estado_inscripcion = 'en_progreso'
        
        db.session.commit()
        
        # Log de guardado parcial
        db.session.add(LogActividad(
            usuario_id=user.id,
            accion='guardado_parcial',
            detalles=f"Guardado parcial paso {paso}. Estado: {user.estado_inscripcion}"
        ))
        db.session.commit()
        
        return jsonify({
            'message': 'Progreso guardado exitosamente',
            'paso_actual': user.paso_actual,
            'estado_inscripcion': user.estado_inscripcion
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al guardar progreso: {str(e)}'}), 500

@user_bp.route('/get-partial/<int:user_id>', methods=['GET'])
def get_partial(user_id):
    """Obtener progreso parcial del usuario"""
    try:
        user = User.query.get_or_404(user_id)
        
        return jsonify({
            'user_data': user.to_dict(),
            'paso_actual': user.paso_actual,
            'estado_inscripcion': user.estado_inscripcion,
            'formulario_enviado': user.formulario_enviado,
            'fecha_ultimo_guardado': user.fecha_ultimo_guardado.isoformat() if user.fecha_ultimo_guardado else None
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener progreso: {str(e)}'}), 500

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
        print(f"❌ Error en login: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

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

@user_bp.route('/register-initial', methods=['POST'])
def register_initial():
    """Crear usuario inicial con datos básicos del primer paso"""
    try:
        data = request.json
        
        # Validar campos básicos obligatorios
        required_fields = [
            'nombre', 'apellido', 'email', 'tipo_documento', 'numero_documento', 
            'fecha_nacimiento', 'sexo', 'estado_civil', 'telefono', 'direccion', 
            'municipio', 'emprendimiento_nombre', 'emprendimiento_sector', 
            'tipo_persona', 'password', 'confirm_password'
        ]
        
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'El campo {field} es obligatorio'}), 400
        
        # Validar email único
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'El correo electrónico ya está registrado'}), 400
        
        # Validar documento único
        existing_doc = User.query.filter_by(numero_documento=data['numero_documento']).first()
        if existing_doc:
            return jsonify({'error': 'El número de documento ya está registrado'}), 400
        
        # Validar email
        if not validate_email(data['email']):
            return jsonify({'error': 'El formato del correo electrónico no es válido'}), 400
        
        # Validar contraseña
        if not validate_password(data['password']):
            return jsonify({'error': 'La contraseña debe tener al menos 8 caracteres, incluir letras y números'}), 400
        
        if data['password'] != data['confirm_password']:
            return jsonify({'error': 'Las contraseñas no coinciden'}), 400
        
        # Validar edad (18-32)
        try:
            birth_date = datetime.strptime(data['fecha_nacimiento'], '%Y-%m-%d').date()
            today = datetime.now().date()
            age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
            if age < 18 or age > 32:
                return jsonify({'error': 'Debe tener entre 18 y 32 años para participar'}), 400
        except ValueError:
            return jsonify({'error': 'Fecha de nacimiento inválida'}), 400
        
        # Validar municipio
        if data['municipio'] not in LISTA_MUNICIPIOS:
            return jsonify({'error': 'Municipio no válido'}), 400
        
        # Validar otros campos
        if data['sexo'] not in ['masculino', 'femenino', 'otro']:
            return jsonify({'error': 'Sexo no válido'}), 400
        
        if data['estado_civil'] not in ['soltero', 'casado', 'union_libre', 'separado', 'divorciado', 'viudo']:
            return jsonify({'error': 'Estado civil no válido'}), 400
        
        if data['emprendimiento_sector'] not in ['agroindustria', 'industria_comercio', 'turismo_servicios']:
            return jsonify({'error': 'Sector económico no válido'}), 400
        
        if data['tipo_persona'] not in ['natural', 'juridica']:
            return jsonify({'error': 'Tipo de persona no válido'}), 400
        
        # Crear usuario inicial
        user = User(
            nombre=data['nombre'],
            apellido=data['apellido'],
            email=data['email'],
            tipo_documento=data['tipo_documento'],
            numero_documento=data['numero_documento'],
            fecha_nacimiento=birth_date,
            sexo=data['sexo'],
            estado_civil=data['estado_civil'],
            telefono=data['telefono'],
            direccion=data['direccion'],
            municipio=data['municipio'],
            emprendimiento_nombre=data['emprendimiento_nombre'],
            emprendimiento_sector=data['emprendimiento_sector'],
            tipo_persona=data['tipo_persona'],
            password_hash=generate_password_hash(data['password']),
            convocatoria=data.get('convocatoria', '2025'),
            estado_inscripcion='en_progreso',
            paso_actual=1,
            formulario_enviado=False,
            fecha_ultimo_guardado=datetime.utcnow(),
            estado_cuenta='inactiva',  # Se activará cuando complete todo
            rol='usuario'
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Log de actividad
        db.session.add(LogActividad(
            usuario_id=user.id,
            accion='registro_inicial',
            detalles=f"Usuario creado con datos básicos. Estado: en_progreso, Paso: 1"
        ))
        db.session.commit()
        
        return jsonify({
            'message': 'Usuario creado exitosamente. Puede continuar completando el formulario.',
            'user_id': user.id,
            'paso_actual': 1,
            'estado_inscripcion': 'en_progreso'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al crear usuario: {str(e)}'}), 500

# ===== ENDPOINTS PARA GESTIÓN DE FASES =====

@user_bp.route('/fases/estado', methods=['GET'])
def get_phase_status():
    """Obtener el estado actual de fases de un usuario"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'No autorizado'}), 401
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        return jsonify({
            'fase_actual': getattr(user, 'fase_actual', 'inscripcion'),
            'fecha_entrada_fase': user.fecha_entrada_fase.isoformat() if hasattr(user, 'fecha_entrada_fase') and user.fecha_entrada_fase else None,
            'fase_completada': getattr(user, 'fase_completada', False),
            'estado_inscripcion': user.estado_inscripcion,
            'formulario_enviado': user.formulario_enviado
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener estado de fase: {str(e)}'}), 500

@user_bp.route('/fases/avanzar', methods=['POST'])
def advance_phase():
    """Avanzar a la siguiente fase del proyecto"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'No autorizado'}), 401
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        data = request.json
        nueva_fase = data.get('nueva_fase')
        
        # Validar fase válida
        fases_validas = ['inscripcion', 'formacion', 'entrega_activos']
        if nueva_fase not in fases_validas:
            return jsonify({'error': 'Fase no válida'}), 400
        
        # Verificar que el usuario puede avanzar
        fase_actual = getattr(user, 'fase_actual', 'inscripcion')
        
        # Solo permitir avanzar si está en la fase anterior
        if fase_actual == 'inscripcion' and nueva_fase != 'formacion':
            return jsonify({'error': 'Debe completar la inscripción antes de avanzar'}), 400
        elif fase_actual == 'formacion' and nueva_fase != 'entrega_activos':
            return jsonify({'error': 'Debe completar la formación antes de avanzar'}), 400
        elif fase_actual == 'entrega_activos':
            return jsonify({'error': 'Ya está en la fase final'}), 400
        
        # Actualizar fase
        user.fase_actual = nueva_fase
        user.fecha_entrada_fase = datetime.utcnow()
        user.fase_completada = False
        
        db.session.commit()
        
        # Crear notificación de cambio de fase
        mensajes = {
            'inscripcion': 'Tu emprendimiento ha pasado a la fase de Inscripción y Selección',
            'formacion': 'Tu emprendimiento ha pasado a la fase de Formación',
            'entrega_activos': 'Tu emprendimiento ha pasado a la fase de Entrega de Activos Productivos'
        }
        
        mensaje = mensajes.get(nueva_fase, f'Tu emprendimiento ha pasado a la fase: {nueva_fase}')
        
        notificacion = Notificacion(
            user_id=user.id,
            mensaje=mensaje,
            fase_nueva=nueva_fase
        )
        db.session.add(notificacion)
        
        # Log de actividad
        db.session.add(LogActividad(
            usuario_id=user.id,
            accion='cambio_fase',
            detalles=f"Usuario avanzó de {fase_actual} a {nueva_fase}"
        ))
        db.session.commit()
        
        return jsonify({
            'message': f'Fase actualizada a {nueva_fase}',
            'fase_actual': nueva_fase,
            'fecha_entrada_fase': user.fecha_entrada_fase.isoformat()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al avanzar fase: {str(e)}'}), 500

@user_bp.route('/fases/completar', methods=['POST'])
def complete_phase():
    """Marcar la fase actual como completada"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'No autorizado'}), 401
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Marcar fase como completada
        user.fase_completada = True
        
        db.session.commit()
        
        # Log de actividad
        fase_actual = getattr(user, 'fase_actual', 'inscripcion')
        db.session.add(LogActividad(
            usuario_id=user.id,
            accion='fase_completada',
            detalles=f"Usuario completó la fase {fase_actual}"
        ))
        db.session.commit()
        
        return jsonify({
            'message': f'Fase {fase_actual} completada exitosamente',
            'fase_completada': True
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al completar fase: {str(e)}'}), 500

@user_bp.route('/fases/historial', methods=['GET'])
def get_phase_history():
    """Obtener el historial de cambios de fase de un usuario"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'No autorizado'}), 401
        
        # Buscar logs de cambios de fase
        logs = LogActividad.query.filter_by(
            usuario_id=user_id,
            accion='cambio_fase'
        ).order_by(LogActividad.fecha.desc()).all()
        
        historial = []
        for log in logs:
            historial.append({
                'fecha': log.fecha.isoformat(),
                'detalles': log.detalles,
                'accion': log.accion
            })
        
        return jsonify({
            'historial': historial,
            'total_cambios': len(historial)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener historial: {str(e)}'}), 500
