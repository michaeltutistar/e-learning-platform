import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Eye, EyeOff, ArrowLeft, Upload, FileText, X, Save, ChevronLeft, ChevronRight } from 'lucide-react'
import logoGobernacion from '../assets/logo-gobernacion.png'
import { MUNICIPIOS_POR_SUBREGION } from '@/constants/municipios'

const RegisterPageMultiStep = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [userId, setUserId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  // Estados del formulario (igual que el original)
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    tipo_documento: '',
    numero_documento: '',
    fecha_nacimiento: '',
    sexo: '',
    estado_civil: '',
    telefono: '',
    direccion: '',
    municipio: '',
    emprendimiento_nombre: '',
    emprendimiento_sector: '',
    tipo_persona: '',
    emprendimiento_formalizado: null,
    financiado_estado: null,
    financiado_regalias: false,
    financiado_camara_comercio: false,
    financiado_incubadoras: false,
    financiado_otro: false,
    financiado_otro_texto: '',
    declara_veraz: false,
    declara_no_beneficiario: false,
    acepta_terminos: false,
    password: '',
    confirm_password: '',
    convocatoria: '2025'
  })

  // Estados de documentos (igual que el original)
  const [docTerminosPdf, setDocTerminosPdf] = useState(null)
  const [docUsoImagenPdf, setDocUsoImagenPdf] = useState(null)
  const [docPlanNegocioXls, setDocPlanNegocioXls] = useState(null)
  const [docVecindadPdf, setDocVecindadPdf] = useState(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [rutPdf, setRutPdf] = useState(null)
  const [cedulaPdf, setCedulaPdf] = useState(null)
  const [cedulaRepresentantePdf, setCedulaRepresentantePdf] = useState(null)
  const [certExistenciaPdf, setCertExistenciaPdf] = useState(null)
  const [ruvPdf, setRuvPdf] = useState(null)
  const [sisbenPdf, setSisbenPdf] = useState(null)
  const [grupoEtnicoPdf, setGrupoEtnicoPdf] = useState(null)
  const [arnPdf, setArnPdf] = useState(null)
  const [discapacidadPdf, setDiscapacidadPdf] = useState(null)
  const [antecedentesFiscalesPdf, setAntecedentesFiscalesPdf] = useState(null)
  const [antecedentesDisciplinariosPdf, setAntecedentesDisciplinariosPdf] = useState(null)
  const [antecedentesJudicialesPdf, setAntecedentesJudicialesPdf] = useState(null)
  const [redamPdf, setRedamPdf] = useState(null)
  const [inhabSexualesPdf, setInhabSexualesPdf] = useState(null)
  const [declaracionCapacidadPdf, setDeclaracionCapacidadPdf] = useState(null)
  const [matriculaMercantilPdf, setMatriculaMercantilPdf] = useState(null)
  const [facturas6mesesPdf, setFacturas6mesesPdf] = useState(null)
  const [publicacionesRedesPdf, setPublicacionesRedesPdf] = useState(null)
  const [registroVentasPdf, setRegistroVentasPdf] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Definición de pasos
  const steps = [
    { number: 1, title: 'Datos Generales', description: 'Información personal y del emprendimiento' },
    { number: 2, title: 'Documentos Obligatorios', description: 'TDR, Uso de imagen, Plan de negocio, Vecindad' },
    { number: 3, title: 'Documentos por Tipo', description: 'Según persona natural o jurídica' },
    { number: 4, title: 'Documentos Diferenciales', description: 'RUV, SISBEN, Grupo étnico (opcionales)' },
    { number: 5, title: 'Documentos de Control', description: 'Antecedentes y certificados obligatorios' },
    { number: 6, title: 'Funcionamiento', description: 'Certificación de funcionamiento del emprendimiento' },
    { number: 7, title: 'Financiación', description: 'Financiación de otras fuentes estatales' },
    { number: 8, title: 'Declaraciones', description: 'Declaraciones y aceptación de términos' }
  ]

  const progressPercentage = (currentStep / steps.length) * 100

  // Funciones de utilidad (copiadas del original)
  const validateEmail = (email) => {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return pattern.test(email)
  }

  const validatePassword = (password) => {
    if (password.length < 8) return false
    if (!/[a-zA-Z]/.test(password)) return false
    if (!/[0-9]/.test(password)) return false
    return true
  }

  const calcAge = (isoDate) => {
    try {
      const dob = new Date(isoDate)
      if (Number.isNaN(dob.getTime())) return null
      const today = new Date()
      let age = today.getFullYear() - dob.getFullYear()
      const monthDiff = today.getMonth() - dob.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--
      }
      return age
    } catch (error) {
      return null
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileChange = (file, setter, fieldName, allowedTypes = ['application/pdf'], maxSize = 20 * 1024 * 1024) => {
    if (!file) return
    
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, [fieldName]: `Tipo de archivo no válido. Se requiere: ${allowedTypes.join(', ')}` }))
      return
    }
    
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, [fieldName]: `El archivo no puede superar ${Math.round(maxSize / (1024 * 1024))}MB` }))
      return
    }
    
    setter(file)
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }))
    }
  }

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.onerror = error => reject(error)
      reader.readAsDataURL(file)
    })
  }

  const renderDocumentUpload = (fieldName, label, file, setter, validationName, isOptional = false, allowedTypes = ['application/pdf']) => {
    return (
      <div className="space-y-2">
        <Label htmlFor={fieldName}>{label} {!isOptional && '*'}</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          {file ? (
            <div className="flex items-center justify-between bg-green-50 p-2 rounded">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm text-green-700 font-medium">✔️ {file.name}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setter(null)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <div className="mt-2">
                <label
                  htmlFor={fieldName}
                  className="cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500"
                >
                  <span>Subir archivo</span>
                  <input
                    id={fieldName}
                    name={fieldName}
                    type="file"
                    className="sr-only"
                    accept={allowedTypes.join(',')}
                    onChange={(e) => handleFileChange(e.target.files[0], setter, validationName, allowedTypes)}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {allowedTypes.includes('application/pdf') && 'PDF'} 
                {allowedTypes.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') && ' Excel'} 
                (máx. 20MB)
              </p>
              {!file && !isOptional && (
                <p className="text-sm text-red-600 mt-1">❌ Falta documento obligatorio</p>
              )}
              {!file && isOptional && (
                <p className="text-sm text-yellow-600 mt-1">⚠️ Documento no cargado (subsanable)</p>
              )}
            </div>
          )}
        </div>
        {errors[validationName] && (
          <p className="text-sm text-red-600">{errors[validationName]}</p>
        )}
      </div>
    )
  }

  // Validación por pasos
  const validateCurrentStep = () => {
    const newErrors = {}

    switch (currentStep) {
      case 1: // Datos Generales
        if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio'
        if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es obligatorio'
        if (!formData.email.trim()) {
          newErrors.email = 'El correo electrónico es obligatorio'
        } else if (!validateEmail(formData.email)) {
          newErrors.email = 'El formato del correo electrónico no es válido'
        }
        if (!formData.tipo_documento.trim()) newErrors.tipo_documento = 'El tipo de documento es obligatorio'
        if (!formData.numero_documento.trim()) newErrors.numero_documento = 'El número de documento es obligatorio'
        if (!formData.fecha_nacimiento) {
          newErrors.fecha_nacimiento = 'La fecha de nacimiento es obligatoria'
        } else {
          const age = calcAge(formData.fecha_nacimiento)
          if (age === null) {
            newErrors.fecha_nacimiento = 'Fecha de nacimiento inválida'
          } else if (age < 18 || age > 32) {
            newErrors.fecha_nacimiento = 'Debe tener entre 18 y 32 años para participar'
          }
        }
        if (!formData.sexo) newErrors.sexo = 'El sexo es obligatorio'
        if (!formData.estado_civil) newErrors.estado_civil = 'El estado civil es obligatorio'
        if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es obligatorio'
        if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es obligatoria'
        if (!formData.municipio) newErrors.municipio = 'El municipio es obligatorio'
        if (!formData.emprendimiento_nombre.trim()) newErrors.emprendimiento_nombre = 'El nombre del emprendimiento es obligatorio'
        if (!formData.emprendimiento_sector) newErrors.emprendimiento_sector = 'El sector económico es obligatorio'
        if (!formData.tipo_persona) newErrors.tipo_persona = 'El tipo de persona es obligatorio'
        if (!formData.password) {
          newErrors.password = 'La contraseña es obligatoria'
        } else if (!validatePassword(formData.password)) {
          newErrors.password = 'La contraseña debe tener al menos 8 caracteres, incluir letras y números'
        }
        if (!formData.confirm_password) {
          newErrors.confirm_password = 'Confirmar contraseña es obligatorio'
        } else if (formData.password !== formData.confirm_password) {
          newErrors.confirm_password = 'Las contraseñas no coinciden'
        }
        break

      case 2: // Documentos Obligatorios
        if (!docTerminosPdf) newErrors.doc_terminos_pdf = 'El documento TDR es obligatorio'
        if (!docUsoImagenPdf) newErrors.doc_uso_imagen_pdf = 'La autorización de uso de imagen es obligatoria'
        if (!docPlanNegocioXls) newErrors.doc_plan_negocio_xls = 'El plan de negocio es obligatorio'
        if (!docVecindadPdf) newErrors.doc_vecindad_pdf = 'El certificado de vecindad es obligatorio'
        break

      case 3: // Documentos por Tipo
        if (!rutPdf) newErrors.rut_pdf = 'El RUT es obligatorio'
        if (formData.tipo_persona === 'natural') {
          if (!cedulaPdf) newErrors.cedula_pdf = 'La cédula es obligatoria para Persona Natural'
        } else if (formData.tipo_persona === 'juridica') {
          if (!cedulaRepresentantePdf) newErrors.cedula_representante_pdf = 'La cédula del representante legal es obligatoria para Persona Jurídica'
          if (!certExistenciaPdf) newErrors.cert_existencia_pdf = 'El certificado de existencia y representación legal es obligatorio para Persona Jurídica'
        }
        break

      case 4: // Documentos Diferenciales (opcionales, no bloquean)
        // No hay validaciones obligatorias en este paso
        break

      case 5: // Documentos de Control
        if (!antecedentesFiscalesPdf) newErrors.antecedentes_fiscales_pdf = 'Los antecedentes fiscales son obligatorios'
        if (!antecedentesDisciplinariosPdf) newErrors.antecedentes_disciplinarios_pdf = 'Los antecedentes disciplinarios son obligatorios'
        if (!antecedentesJudicialesPdf) newErrors.antecedentes_judiciales_pdf = 'Los antecedentes judiciales son obligatorios'
        if (!redamPdf) newErrors.redam_pdf = 'El certificado REDAM es obligatorio'
        if (!inhabSexualesPdf) newErrors.inhabilidades_sexuales_pdf = 'La consulta de inhabilidades sexuales es obligatoria'
        if (!declaracionCapacidadPdf) newErrors.declaracion_capacidad_legal_pdf = 'La declaración de capacidad legal es obligatoria'
        break

      case 6: // Funcionamiento
        if (!formData.emprendimiento_formalizado && formData.emprendimiento_formalizado !== false) {
          newErrors.emprendimiento_formalizado = 'Debe especificar si el emprendimiento está formalizado'
        }
        if (formData.emprendimiento_formalizado === true) {
          if (!matriculaMercantilPdf) newErrors.matricula_mercantil_pdf = 'La matrícula mercantil es obligatoria para emprendimientos formalizados'
          if (!facturas6mesesPdf) newErrors.facturas_6meses_pdf = 'Las facturas de los últimos 6 meses son obligatorias para emprendimientos formalizados'
        } else if (formData.emprendimiento_formalizado === false) {
          if (!publicacionesRedesPdf) newErrors.publicaciones_redes_pdf = 'Las publicaciones de redes sociales son obligatorias para emprendimientos informales'
          if (!registroVentasPdf) newErrors.registro_ventas_pdf = 'El registro de ventas es obligatorio para emprendimientos informales'
        }
        break

      case 7: // Financiación
        if (!formData.financiado_estado && formData.financiado_estado !== false) {
          newErrors.financiado_estado = 'Debe especificar si el emprendimiento ha sido financiado por otros programas del Estado'
        }
        if (formData.financiado_estado === true) {
          if (!formData.financiado_regalias && !formData.financiado_camara_comercio && 
              !formData.financiado_incubadoras && !formData.financiado_otro) {
            newErrors.financiado_fuentes = 'Si el emprendimiento ha sido financiado, debe especificar al menos una fuente de financiación'
          }
          if (formData.financiado_otro && !formData.financiado_otro_texto.trim()) {
            newErrors.financiado_otro_texto = 'Si selecciona "Otro" como fuente de financiación, debe especificar cuál'
          }
        }
        break

      case 8: // Declaraciones
        if (!formData.declara_veraz) newErrors.declara_veraz = 'Debe declarar que la información suministrada es veraz'
        if (!formData.declara_no_beneficiario) newErrors.declara_no_beneficiario = 'Debe declarar que no ha sido beneficiario de recursos públicos para este emprendimiento'
        if (!formData.acepta_terminos) newErrors.acepta_terminos = 'Debe aceptar los términos y condiciones de la convocatoria'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Guardado parcial
  const savePartialProgress = async () => {
    if (!userId) return false

    try {
      setIsSaving(true)
      const response = await fetch('/api/save-partial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          paso: currentStep,
          ...formData
        }),
        credentials: 'include'
      })

      const result = await response.json()
      if (response.ok) {
        setSuccessMessage('✅ Progreso guardado exitosamente')
        setTimeout(() => setSuccessMessage(''), 3000)
        return true
      } else {
        setErrors({ general: result.error || 'Error al guardar progreso' })
        return false
      }
    } catch (err) {
      setErrors({ general: 'Error de conexión al guardar progreso' })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  // Navegación entre pasos
  const nextStep = async () => {
    if (!validateCurrentStep()) {
      return
    }

    // Guardar progreso antes de avanzar
    if (userId) {
      const saved = await savePartialProgress()
      if (!saved) return
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
      setErrors({})
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setErrors({})
    }
  }

  // Registro inicial (crear usuario)
  const createInitialUser = async () => {
    if (!validateCurrentStep()) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/register-initial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      })

      const result = await response.json()
      if (response.ok) {
        setUserId(result.user_id)
        setSuccessMessage('✅ Usuario creado. Puede continuar completando el formulario.')
        setTimeout(() => setSuccessMessage(''), 3000)
        return true
      } else {
        setErrors({ general: result.error || 'Error al crear usuario' })
        return false
      }
    } catch (err) {
      setErrors({ general: 'Error de conexión' })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Envío final del formulario
  const submitCompleteForm = async () => {
    if (!validateCurrentStep()) return

    try {
      setIsLoading(true)
      
      // Preparar todos los documentos
      const submitData = { ...formData }
      
      // Convertir documentos a base64
      if (docTerminosPdf) {
        submitData.doc_terminos_pdf = await convertFileToBase64(docTerminosPdf)
        submitData.doc_terminos_pdf_nombre = docTerminosPdf.name
      }
      if (docUsoImagenPdf) {
        submitData.doc_uso_imagen_pdf = await convertFileToBase64(docUsoImagenPdf)
        submitData.doc_uso_imagen_pdf_nombre = docUsoImagenPdf.name
      }
      if (docPlanNegocioXls) {
        submitData.doc_plan_negocio_xls = await convertFileToBase64(docPlanNegocioXls)
        submitData.doc_plan_negocio_nombre = docPlanNegocioXls.name
      }
      if (docVecindadPdf) {
        submitData.doc_vecindad_pdf = await convertFileToBase64(docVecindadPdf)
        submitData.doc_vecindad_pdf_nombre = docVecindadPdf.name
      }
      
      // Agregar más documentos...
      if (rutPdf) {
        submitData.rut_pdf = await convertFileToBase64(rutPdf)
        submitData.rut_pdf_nombre = rutPdf.name
      }
      if (cedulaPdf) {
        submitData.cedula_pdf = await convertFileToBase64(cedulaPdf)
        submitData.cedula_pdf_nombre = cedulaPdf.name
      }
      // ... etc para todos los documentos

      submitData.video_url = videoUrl

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
        credentials: 'include'
      })

      const result = await response.json()
      if (response.ok) {
        setSuccessMessage('✅ ¡Inscripción completada exitosamente!')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setErrors({ general: result.error || 'Error al completar inscripción' })
      }
    } catch (err) {
      setErrors({ general: 'Error de conexión' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNextStep = async () => {
    if (currentStep === 1 && !userId) {
      // Primer paso: crear usuario inicial
      const created = await createInitialUser()
      if (created) {
        setCurrentStep(2)
      }
    } else if (currentStep === steps.length) {
      // Último paso: envío final
      await submitCompleteForm()
    } else {
      // Pasos intermedios: validar y avanzar
      await nextStep()
    }
  }

  // Renderizado de contenido por paso
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Paso 1: Datos Generales</h2>
              <p className="text-gray-600">Información personal y del emprendimiento</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className={errors.nombre ? 'border-red-500' : ''}
                  placeholder="Ingresa tu nombre"
                  autoComplete="given-name"
                />
                {errors.nombre && <p className="text-sm text-red-600">{errors.nombre}</p>}
              </div>

              {/* Apellido */}
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido *</Label>
                <Input
                  id="apellido"
                  name="apellido"
                  type="text"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  className={errors.apellido ? 'border-red-500' : ''}
                  placeholder="Ingresa tu apellido"
                  autoComplete="family-name"
                />
                {errors.apellido && <p className="text-sm text-red-600">{errors.apellido}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'border-red-500' : ''}
                  placeholder="tu@email.com"
                  autoComplete="email"
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Tipo de documento */}
              <div className="space-y-2">
                <Label>Tipo de Documento *</Label>
                <Select
                  value={formData.tipo_documento}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, tipo_documento: value }))
                    if (errors.tipo_documento) setErrors(prev => ({ ...prev, tipo_documento: '' }))
                  }}
                >
                  <SelectTrigger className={errors.tipo_documento ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cedula">Cédula de Ciudadanía</SelectItem>
                    <SelectItem value="cedula_extranjeria">Cédula de Extranjería</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo_documento && <p className="text-sm text-red-600">{errors.tipo_documento}</p>}
              </div>

              {/* Número de documento */}
              <div className="space-y-2">
                <Label htmlFor="numero_documento">Número de Documento *</Label>
                <Input
                  id="numero_documento"
                  name="numero_documento"
                  type="text"
                  value={formData.numero_documento}
                  onChange={handleInputChange}
                  className={errors.numero_documento ? 'border-red-500' : ''}
                  placeholder="12345678"
                  autoComplete="off"
                />
                {errors.numero_documento && <p className="text-sm text-red-600">{errors.numero_documento}</p>}
              </div>

              {/* Fecha de nacimiento */}
              <div className="space-y-2">
                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
                <Input
                  id="fecha_nacimiento"
                  name="fecha_nacimiento"
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={handleInputChange}
                  className={errors.fecha_nacimiento ? 'border-red-500' : ''}
                  autoComplete="bday"
                />
                {errors.fecha_nacimiento && <p className="text-sm text-red-600">{errors.fecha_nacimiento}</p>}
              </div>

              {/* Sexo */}
              <div className="space-y-2">
                <Label>Sexo *</Label>
                <Select
                  value={formData.sexo}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, sexo: value }))
                    if (errors.sexo) setErrors(prev => ({ ...prev, sexo: '' }))
                  }}
                >
                  <SelectTrigger className={errors.sexo ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona el sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="femenino">Femenino</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                {errors.sexo && <p className="text-sm text-red-600">{errors.sexo}</p>}
              </div>

              {/* Estado civil */}
              <div className="space-y-2">
                <Label>Estado Civil *</Label>
                <Select
                  value={formData.estado_civil}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, estado_civil: value }))
                    if (errors.estado_civil) setErrors(prev => ({ ...prev, estado_civil: '' }))
                  }}
                >
                  <SelectTrigger className={errors.estado_civil ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona el estado civil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soltero">Soltero(a)</SelectItem>
                    <SelectItem value="casado">Casado(a)</SelectItem>
                    <SelectItem value="union_libre">Unión Libre</SelectItem>
                    <SelectItem value="separado">Separado(a)</SelectItem>
                    <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                    <SelectItem value="viudo">Viudo(a)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.estado_civil && <p className="text-sm text-red-600">{errors.estado_civil}</p>}
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono Celular *</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className={errors.telefono ? 'border-red-500' : ''}
                  placeholder="3001234567"
                  autoComplete="tel"
                />
                {errors.telefono && <p className="text-sm text-red-600">{errors.telefono}</p>}
              </div>

              {/* Dirección */}
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección de Residencia *</Label>
                <Input
                  id="direccion"
                  name="direccion"
                  type="text"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className={errors.direccion ? 'border-red-500' : ''}
                  placeholder="Calle 123 # 45-67"
                  autoComplete="street-address"
                />
                {errors.direccion && <p className="text-sm text-red-600">{errors.direccion}</p>}
              </div>

              {/* Municipio */}
              <div className="space-y-2">
                <Label>Municipio de Residencia *</Label>
                <Select
                  value={formData.municipio}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, municipio: value }))
                    if (errors.municipio) setErrors(prev => ({ ...prev, municipio: '' }))
                  }}
                >
                  <SelectTrigger className={errors.municipio ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona el municipio" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MUNICIPIOS_POR_SUBREGION).map(([subregion, municipios]) => [
                      <div key={`${subregion}-header`} className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100">
                        {subregion}
                      </div>,
                      ...municipios.map(municipio => (
                        <SelectItem key={municipio.nombre} value={municipio.nombre}>{municipio.nombre}</SelectItem>
                      ))
                    ]).flat()}
                  </SelectContent>
                </Select>
                {errors.municipio && <p className="text-sm text-red-600">{errors.municipio}</p>}
              </div>

              {/* Emprendimiento: Nombre */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="emprendimiento_nombre">Nombre del Emprendimiento *</Label>
                <Input
                  id="emprendimiento_nombre"
                  name="emprendimiento_nombre"
                  type="text"
                  value={formData.emprendimiento_nombre}
                  onChange={handleInputChange}
                  className={errors.emprendimiento_nombre ? 'border-red-500' : ''}
                  placeholder="Ingresa el nombre del emprendimiento"
                  autoComplete="organization"
                />
                {errors.emprendimiento_nombre && <p className="text-sm text-red-600">{errors.emprendimiento_nombre}</p>}
              </div>

              {/* Emprendimiento: Sector Económico */}
              <div className="space-y-2">
                <Label>Sector Económico *</Label>
                <Select
                  value={formData.emprendimiento_sector}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, emprendimiento_sector: value }))
                    if (errors.emprendimiento_sector) setErrors(prev => ({ ...prev, emprendimiento_sector: '' }))
                  }}
                >
                  <SelectTrigger className={errors.emprendimiento_sector ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona el sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agroindustria">Agroindustria</SelectItem>
                    <SelectItem value="industria_comercio">Industria y Comercio</SelectItem>
                    <SelectItem value="turismo_servicios">Turismo / Servicios</SelectItem>
                  </SelectContent>
                </Select>
                {errors.emprendimiento_sector && <p className="text-sm text-red-600">{errors.emprendimiento_sector}</p>}
              </div>

              {/* Tipo de Persona */}
              <div className="space-y-2">
                <Label>Tipo de Persona *</Label>
                <Select
                  value={formData.tipo_persona}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, tipo_persona: value }))
                    if (errors.tipo_persona) setErrors(prev => ({ ...prev, tipo_persona: '' }))
                  }}
                >
                  <SelectTrigger className={errors.tipo_persona ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona el tipo de persona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="natural">Natural</SelectItem>
                    <SelectItem value="juridica">Jurídica</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo_persona && <p className="text-sm text-red-600">{errors.tipo_persona}</p>}
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                    placeholder="Mínimo 8 caracteres, letras y números"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Confirmar Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirmar Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    className={errors.confirm_password ? 'border-red-500 pr-10' : 'pr-10'}
                    placeholder="Repite tu contraseña"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </button>
                </div>
                {errors.confirm_password && <p className="text-sm text-red-600">{errors.confirm_password}</p>}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Paso 2: Documentos Obligatorios</h2>
              <p className="text-gray-600">Documentos que no son subsanables y son obligatorios para todos</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ <strong>Estos documentos son obligatorios y no subsanables. Sin ellos, la inscripción no será válida.</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* TDR */}
              {renderDocumentUpload(
                'doc_terminos_pdf',
                'Formato de aceptación de términos de referencia (TDR)',
                docTerminosPdf,
                setDocTerminosPdf,
                'doc_terminos_pdf'
              )}

              {/* Uso de Imagen */}
              {renderDocumentUpload(
                'doc_uso_imagen_pdf',
                'Formato de autorización de uso de imagen',
                docUsoImagenPdf,
                setDocUsoImagenPdf,
                'doc_uso_imagen_pdf'
              )}

              {/* Plan de Negocio */}
              {renderDocumentUpload(
                'doc_plan_negocio_xls',
                'Formato de Plan de Negocio (Excel)',
                docPlanNegocioXls,
                setDocPlanNegocioXls,
                'doc_plan_negocio_xls',
                false,
                ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
              )}

              {/* Certificado de Vecindad */}
              {renderDocumentUpload(
                'doc_vecindad_pdf',
                'Certificado de vecindad con anexos',
                docVecindadPdf,
                setDocVecindadPdf,
                'doc_vecindad_pdf'
              )}

              {/* Video (Opcional por ahora) */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="video_url">Video de presentación del emprendimiento (Opcional)</Label>
                <Input
                  id="video_url"
                  name="video_url"
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... o https://drive.google.com/..."
                  autoComplete="url"
                />
                <p className="text-xs text-gray-500">
                  Máximo 5 minutos. Puede ser enlace de YouTube, Google Drive, etc.
                </p>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Paso 3: Documentos según Tipo de Persona</h2>
              <p className="text-gray-600">Documentos que dependen de si es persona natural o jurídica</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-700 font-medium">
                🔄 Los documentos requeridos cambian según el tipo de persona seleccionado en el paso anterior.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* RUT (siempre obligatorio) */}
              {renderDocumentUpload(
                'rut_pdf',
                'RUT actualizado 2025',
                rutPdf,
                setRutPdf,
                'rut_pdf'
              )}

              {/* Documentos condicionales según tipo de persona */}
              {formData.tipo_persona === 'natural' && (
                <>
                  {renderDocumentUpload(
                    'cedula_pdf',
                    'Cédula de ciudadanía (o denuncia de pérdida)',
                    cedulaPdf,
                    setCedulaPdf,
                    'cedula_pdf'
                  )}
                </>
              )}

              {formData.tipo_persona === 'juridica' && (
                <>
                  {renderDocumentUpload(
                    'cedula_representante_pdf',
                    'Cédula del representante legal (o denuncia de pérdida)',
                    cedulaRepresentantePdf,
                    setCedulaRepresentantePdf,
                    'cedula_representante_pdf'
                  )}

                  {renderDocumentUpload(
                    'cert_existencia_pdf',
                    'Certificado de existencia y representación legal (no mayor a 30 días)',
                    certExistenciaPdf,
                    setCertExistenciaPdf,
                    'cert_existencia_pdf'
                  )}
                </>
              )}

              {!formData.tipo_persona && (
                <div className="md:col-span-2 text-center p-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">
                    Seleccione el tipo de persona en el paso anterior para ver los documentos requeridos.
                  </p>
                </div>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Paso 4: Documentos Diferenciales</h2>
              <p className="text-gray-600">Documentos opcionales que son subsanables (no bloquean el envío)</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-700 font-medium">
                ⚠️ <strong>Estos documentos son opcionales.</strong> Si no los tiene ahora, puede subirlos después (subsanables).
                No bloquean el envío de su inscripción.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* RUV */}
              {renderDocumentUpload(
                'ruv_pdf',
                'Certificado del Registro Único de Víctimas (RUV)',
                ruvPdf,
                setRuvPdf,
                'ruv_pdf',
                true
              )}

              {/* SISBEN */}
              {renderDocumentUpload(
                'sisben_pdf',
                'Copia del SISBEN (grupos A, B o C)',
                sisbenPdf,
                setSisbenPdf,
                'sisben_pdf',
                true
              )}

              {/* Grupo Étnico */}
              {renderDocumentUpload(
                'grupo_etnico_pdf',
                'Certificado de pertenencia a grupo étnico',
                grupoEtnicoPdf,
                setGrupoEtnicoPdf,
                'grupo_etnico_pdf',
                true
              )}

              {/* ARN */}
              {renderDocumentUpload(
                'arn_pdf',
                'Certificado de proceso de reincorporación (ARN)',
                arnPdf,
                setArnPdf,
                'arn_pdf',
                true
              )}

              {/* Discapacidad */}
              {renderDocumentUpload(
                'discapacidad_pdf',
                'Certificado de discapacidad',
                discapacidadPdf,
                setDiscapacidadPdf,
                'discapacidad_pdf',
                true
              )}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Paso 5: Documentos de Control</h2>
              <p className="text-gray-600">Certificados obligatorios que determinan la elegibilidad</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700 font-medium">
                🛡️ <strong>Debe adjuntar todos los certificados de control. Sin ellos, la inscripción no será válida.</strong>
              </p>
              <p className="text-xs text-red-600 mt-1">
                Si se evidencian antecedentes, registros en REDAM o inhabilidades, la solicitud será automáticamente rechazada.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Antecedentes Fiscales */}
              {renderDocumentUpload(
                'antecedentes_fiscales_pdf',
                'Antecedentes fiscales (Contraloría)',
                antecedentesFiscalesPdf,
                setAntecedentesFiscalesPdf,
                'antecedentes_fiscales_pdf'
              )}

              {/* Antecedentes Disciplinarios */}
              {renderDocumentUpload(
                'antecedentes_disciplinarios_pdf',
                'Antecedentes disciplinarios (Procuraduría)',
                antecedentesDisciplinariosPdf,
                setAntecedentesDisciplinariosPdf,
                'antecedentes_disciplinarios_pdf'
              )}

              {/* Antecedentes Judiciales */}
              {renderDocumentUpload(
                'antecedentes_judiciales_pdf',
                'Antecedentes judiciales (Policía Nacional)',
                antecedentesJudicialesPdf,
                setAntecedentesJudicialesPdf,
                'antecedentes_judiciales_pdf'
              )}

              {/* REDAM */}
              {renderDocumentUpload(
                'redam_pdf',
                'Certificado REDAM (Registro de Deudores Alimentarios Morosos)',
                redamPdf,
                setRedamPdf,
                'redam_pdf'
              )}

              {/* Inhabilidades Sexuales */}
              {renderDocumentUpload(
                'inhabilidades_sexuales_pdf',
                'Consulta de inhabilidades por delitos sexuales contra menores',
                inhabSexualesPdf,
                setInhabSexualesPdf,
                'inhabilidades_sexuales_pdf'
              )}

              {/* Declaración Capacidad Legal */}
              {renderDocumentUpload(
                'declaracion_capacidad_legal_pdf',
                'Declaración juramentada de capacidad legal',
                declaracionCapacidadPdf,
                setDeclaracionCapacidadPdf,
                'declaracion_capacidad_legal_pdf'
              )}
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Paso 6: Funcionamiento del Emprendimiento</h2>
              <p className="text-gray-600">Certificación de funcionamiento según si está formalizado o no</p>
            </div>

            {/* Pregunta sobre formalización */}
            <div className="space-y-2">
              <Label>¿El emprendimiento está formalizado? *</Label>
              <Select
                value={formData.emprendimiento_formalizado === true ? 'true' : formData.emprendimiento_formalizado === false ? 'false' : ''}
                onValueChange={(value) => {
                  const boolValue = value === 'true' ? true : value === 'false' ? false : null
                  setFormData(prev => ({ ...prev, emprendimiento_formalizado: boolValue }))
                  if (errors.emprendimiento_formalizado) setErrors(prev => ({ ...prev, emprendimiento_formalizado: '' }))
                }}
              >
                <SelectTrigger className={(errors.emprendimiento_formalizado ? 'border-red-500 ' : '') + 'w-full'}>
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Sí (Formalizado)</SelectItem>
                  <SelectItem value="false">No (Informal)</SelectItem>
                </SelectContent>
              </Select>
              {errors.emprendimiento_formalizado && (
                <p className="text-sm text-red-600">{errors.emprendimiento_formalizado}</p>
              )}
            </div>

            {/* Documentos condicionales según formalización */}
            {formData.emprendimiento_formalizado !== null && (
              <div className={`border rounded-lg p-4 mb-4 ${
                formData.emprendimiento_formalizado ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'
              }`}>
                <p className={`text-sm font-medium ${
                  formData.emprendimiento_formalizado ? 'text-blue-700' : 'text-yellow-700'
                }`}>
                  {formData.emprendimiento_formalizado 
                    ? '📊 Emprendimiento Formalizado: Debe adjuntar matrícula mercantil y facturas de los últimos 6 meses.'
                    : '📱 Emprendimiento Informal: Debe adjuntar publicaciones de redes sociales y registro de ventas de los últimos 6 meses.'
                  }
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.emprendimiento_formalizado === true && (
                <>
                  {/* Matrícula Mercantil */}
                  {renderDocumentUpload(
                    'matricula_mercantil_pdf',
                    'Matrícula mercantil',
                    matriculaMercantilPdf,
                    setMatriculaMercantilPdf,
                    'matricula_mercantil_pdf'
                  )}

                  {/* Facturas 6 Meses */}
                  {renderDocumentUpload(
                    'facturas_6meses_pdf',
                    'Facturas de los últimos 6 meses',
                    facturas6mesesPdf,
                    setFacturas6mesesPdf,
                    'facturas_6meses_pdf'
                  )}
                </>
              )}

              {formData.emprendimiento_formalizado === false && (
                <>
                  {/* Publicaciones Redes */}
                  {renderDocumentUpload(
                    'publicaciones_redes_pdf',
                    'Publicaciones de redes sociales de los últimos 6 meses',
                    publicacionesRedesPdf,
                    setPublicacionesRedesPdf,
                    'publicaciones_redes_pdf'
                  )}

                  {/* Registro Ventas */}
                  {renderDocumentUpload(
                    'registro_ventas_pdf',
                    'Registro de ventas de los últimos 6 meses',
                    registroVentasPdf,
                    setRegistroVentasPdf,
                    'registro_ventas_pdf'
                  )}
                </>
              )}

              {formData.emprendimiento_formalizado === null && (
                <div className="md:col-span-2 text-center p-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">
                    Seleccione si el emprendimiento está formalizado para ver los documentos requeridos.
                  </p>
                </div>
              )}
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Paso 7: Financiación de Otras Fuentes</h2>
              <p className="text-gray-600">Declarar si ha recibido financiación estatal previa</p>
            </div>

            {/* Pregunta obligatoria sobre financiación */}
            <div className="space-y-2">
              <Label>¿Su emprendimiento ha sido financiado por otros programas del Estado? *</Label>
              <Select
                value={formData.financiado_estado === true ? 'true' : formData.financiado_estado === false ? 'false' : ''}
                onValueChange={(value) => {
                  const boolValue = value === 'true' ? true : value === 'false' ? false : null
                  setFormData(prev => ({ 
                    ...prev, 
                    financiado_estado: boolValue,
                    // Resetear fuentes si cambia a "No"
                    financiado_regalias: boolValue ? prev.financiado_regalias : false,
                    financiado_camara_comercio: boolValue ? prev.financiado_camara_comercio : false,
                    financiado_incubadoras: boolValue ? prev.financiado_incubadoras : false,
                    financiado_otro: boolValue ? prev.financiado_otro : false,
                    financiado_otro_texto: boolValue ? prev.financiado_otro_texto : ''
                  }))
                  if (errors.financiado_estado) setErrors(prev => ({ ...prev, financiado_estado: '' }))
                }}
              >
                <SelectTrigger className={(errors.financiado_estado ? 'border-red-500 ' : '') + 'w-full'}>
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">No</SelectItem>
                  <SelectItem value="true">Sí</SelectItem>
                </SelectContent>
              </Select>
              {errors.financiado_estado && (
                <p className="text-sm text-red-600">{errors.financiado_estado}</p>
              )}
            </div>

            {/* Fuentes de financiación (solo si respondió "Sí") */}
            {formData.financiado_estado === true && (
              <>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-orange-700 font-medium">
                    📋 Debe marcar al menos una fuente de financiación:
                  </p>
                </div>

                {/* Checkboxes de fuentes */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="financiado_regalias"
                      checked={formData.financiado_regalias}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, financiado_regalias: e.target.checked }))
                        if (errors.financiado_fuentes) setErrors(prev => ({ ...prev, financiado_fuentes: '' }))
                      }}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="financiado_regalias" className="text-sm text-gray-700">
                      Regalías
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="financiado_camara_comercio"
                      checked={formData.financiado_camara_comercio}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, financiado_camara_comercio: e.target.checked }))
                        if (errors.financiado_fuentes) setErrors(prev => ({ ...prev, financiado_fuentes: '' }))
                      }}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="financiado_camara_comercio" className="text-sm text-gray-700">
                      Cámaras de comercio
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="financiado_incubadoras"
                      checked={formData.financiado_incubadoras}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, financiado_incubadoras: e.target.checked }))
                        if (errors.financiado_fuentes) setErrors(prev => ({ ...prev, financiado_fuentes: '' }))
                      }}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="financiado_incubadoras" className="text-sm text-gray-700">
                      Incubadoras de empresas
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="financiado_otro"
                      checked={formData.financiado_otro}
                      onChange={(e) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          financiado_otro: e.target.checked,
                          financiado_otro_texto: e.target.checked ? prev.financiado_otro_texto : ''
                        }))
                        if (errors.financiado_fuentes) setErrors(prev => ({ ...prev, financiado_fuentes: '' }))
                      }}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="financiado_otro" className="text-sm text-gray-700">
                      Otro
                    </label>
                  </div>

                  {/* Campo de texto para "Otro" */}
                  {formData.financiado_otro && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="financiado_otro_texto">Especifique la fuente:</Label>
                      <Input
                        id="financiado_otro_texto"
                        name="financiado_otro_texto"
                        type="text"
                        value={formData.financiado_otro_texto}
                        onChange={handleInputChange}
                        className={errors.financiado_otro_texto ? 'border-red-500' : ''}
                        placeholder="Ingrese la fuente de financiación"
                        autoComplete="off"
                      />
                      {errors.financiado_otro_texto && (
                        <p className="text-sm text-red-600">{errors.financiado_otro_texto}</p>
                      )}
                    </div>
                  )}

                  {errors.financiado_fuentes && (
                    <p className="text-sm text-red-600">{errors.financiado_fuentes}</p>
                  )}
                </div>
              </>
            )}
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Paso 8: Declaraciones y Aceptaciones</h2>
              <p className="text-gray-600">Declaraciones obligatorias para cumplimiento legal</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ <strong>Debe aceptar todas las declaraciones para continuar con la inscripción.</strong>
              </p>
              <p className="text-xs text-red-600 mt-1">
                Estas declaraciones son obligatorias por ley y quedan registradas para trazabilidad legal.
              </p>
            </div>

            {/* Checkboxes de declaraciones obligatorias */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="declara_veraz"
                  checked={formData.declara_veraz}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, declara_veraz: e.target.checked }))
                    if (errors.declara_veraz) setErrors(prev => ({ ...prev, declara_veraz: '' }))
                  }}
                  className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="declara_veraz" className="text-sm text-gray-700 leading-relaxed">
                  <strong>Declaro bajo juramento que la información suministrada es veraz.</strong>
                </label>
              </div>
              {errors.declara_veraz && (
                <p className="text-sm text-red-600 ml-7">{errors.declara_veraz}</p>
              )}

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="declara_no_beneficiario"
                  checked={formData.declara_no_beneficiario}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, declara_no_beneficiario: e.target.checked }))
                    if (errors.declara_no_beneficiario) setErrors(prev => ({ ...prev, declara_no_beneficiario: '' }))
                  }}
                  className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="declara_no_beneficiario" className="text-sm text-gray-700 leading-relaxed">
                  <strong>Declaro que no he sido beneficiario de recursos públicos para el fortalecimiento de este emprendimiento.</strong>
                </label>
              </div>
              {errors.declara_no_beneficiario && (
                <p className="text-sm text-red-600 ml-7">{errors.declara_no_beneficiario}</p>
              )}

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="acepta_terminos"
                  checked={formData.acepta_terminos}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, acepta_terminos: e.target.checked }))
                    if (errors.acepta_terminos) setErrors(prev => ({ ...prev, acepta_terminos: '' }))
                  }}
                  className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="acepta_terminos" className="text-sm text-gray-700 leading-relaxed">
                  <strong>Acepto los términos y condiciones de la convocatoria.</strong>
                </label>
              </div>
              {errors.acepta_terminos && (
                <p className="text-sm text-red-600 ml-7">{errors.acepta_terminos}</p>
              )}
            </div>

            {/* Resumen final */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
              <h3 className="font-semibold text-green-800 mb-2">🎉 ¡Casi terminamos!</h3>
              <p className="text-sm text-green-700">
                Una vez que complete este paso y haga clic en "Finalizar Inscripción", 
                su formulario será enviado y no podrá modificarlo. Asegúrese de que toda 
                la información y documentos estén correctos.
              </p>
            </div>
          </div>
        )

      default:
        return <div>Paso no encontrado</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src={logoGobernacion} alt="Gobernación de Nariño" className="h-12 w-auto" />
              <div className="ml-4">
                <h1 className="text-xl font-bold text-gray-900">Inscripción Emprendedores Jóvenes</h1>
                <p className="text-sm text-gray-600">Convocatoria 2025</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progreso</span>
              <span>Paso {currentStep} de {steps.length} ({Math.round(progressPercentage)}%)</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Lista de pasos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mt-4 text-xs">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`p-2 rounded text-center ${
                  step.number === currentStep
                    ? 'bg-green-100 text-green-800 border-2 border-green-300'
                    : step.number < currentStep
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-gray-50 text-gray-400'
                }`}
              >
                <div className="font-semibold">{step.number}. {step.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-6">
            {/* Mensajes de error y éxito */}
            {errors.general && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="border-green-200 bg-green-50 mb-6">
                <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
              </Alert>
            )}

            {/* Contenido del paso actual */}
            {renderStepContent()}

            {/* Botones de navegación */}
            <div className="flex justify-between items-center pt-8 border-t mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || isLoading}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>

              <div className="flex gap-2">
                {userId && (
                  <Button
                    variant="outline"
                    onClick={savePartialProgress}
                    disabled={isSaving}
                    className="flex items-center"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {isSaving ? 'Guardando...' : 'Guardar'}
                  </Button>
                )}

                <Button
                  onClick={handleNextStep}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 flex items-center"
                >
                  {isLoading ? 'Procesando...' : 
                   currentStep === 1 ? 'Crear Usuario' :
                   currentStep === steps.length ? '✅ Finalizar Inscripción' : 'Siguiente'}
                  {currentStep < steps.length && <ChevronRight className="h-4 w-4 ml-1" />}
                </Button>
              </div>
            </div>

            {/* Información adicional */}
            <div className="text-center text-sm text-gray-500 pt-4 border-t mt-4">
              <p>💡 Su progreso se guarda automáticamente. Puede cerrar y volver después.</p>
              <p>🔒 Una vez enviado el formulario completo, no podrá modificarlo.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RegisterPageMultiStep
