import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, EyeOff, ArrowLeft, Upload, FileText, X } from 'lucide-react'
import logoGobernacion from '../assets/logo-gobernacion.png'

const RegisterPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    tipo_documento: '',
    numero_documento: '',
    password: '',
    confirm_password: ''
  })
  const [documentoPdf, setDocumentoPdf] = useState(null)
  const [requisitosPdf, setRequisitosPdf] = useState(null)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

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

  const handleFileChange = (e, setFile, fileType) => {
    const file = e.target.files[0]
    if (file) {
      // Validar que sea un PDF
      if (file.type !== 'application/pdf') {
        setErrors(prev => ({ ...prev, [fileType]: 'Solo se permiten archivos PDF' }))
        return
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, [fileType]: 'El archivo no puede ser mayor a 5MB' }))
        return
      }
      
      setFile(file)
      setErrors(prev => ({ ...prev, [fileType]: '' }))
    }
  }

  const removeFile = (setFile, fileType) => {
    setFile(null)
    setErrors(prev => ({ ...prev, [fileType]: '' }))
  }

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const base64 = reader.result.split(',')[1] // Remover el prefijo data:application/pdf;base64,
        resolve(base64)
      }
      reader.onerror = error => reject(error)
    })
  }

  const validateForm = () => {
    const newErrors = {}

    // Validar campos obligatorios
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es obligatorio'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'El formato del correo electrónico no es válido'
    }

    if (!formData.tipo_documento.trim()) {
      newErrors.tipo_documento = 'El tipo de documento es obligatorio'
    }

    if (!formData.numero_documento.trim()) {
      newErrors.numero_documento = 'El número de documento es obligatorio'
    }

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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})
    setSuccessMessage('')

    try {
      // Preparar datos del formulario con archivos
      const submitData = { ...formData }
      
      // Convertir archivos a base64 si están presentes
      if (documentoPdf) {
        submitData.documento_pdf = await convertFileToBase64(documentoPdf)
        submitData.documento_pdf_nombre = documentoPdf.name
      }
      
      if (requisitosPdf) {
        submitData.requisitos_pdf = await convertFileToBase64(requisitosPdf)
        submitData.requisitos_pdf_nombre = requisitosPdf.name
      }

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage('¡Registro exitoso! Tu cuenta ha sido creada y está pendiente de activación por el administrador. Una vez activada, podrás iniciar sesión.')
        // Limpiar el formulario después del registro exitoso
        setFormData({
          nombre: '',
          apellido: '',
          email: '',
          tipo_documento: '',
          numero_documento: '',
          password: '',
          confirm_password: ''
        })
        setDocumentoPdf(null)
        setRequisitosPdf(null)
      } else {
        if (data.error) {
          setErrors({ general: data.error })
        }
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión. Por favor, intenta nuevamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header con logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <img src={logoGobernacion} alt="Gobernación de Nariño" className="h-16" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Plataforma E-Learning</h1>
          <p className="text-gray-600">Gobernación de Nariño</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <Link to="/" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <CardTitle className="text-2xl font-bold text-gray-800">Crear Cuenta</CardTitle>
            </div>
            <CardDescription>
              Completa el formulario para registrarte en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Mensaje de éxito */}
              {successMessage && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800 font-medium">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              )}

              {/* Error general */}
              {errors.general && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {errors.general}
                  </AlertDescription>
                </Alert>
              )}

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
                />
                {errors.nombre && (
                  <p className="text-sm text-red-600">{errors.nombre}</p>
                )}
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
                />
                {errors.apellido && (
                  <p className="text-sm text-red-600">{errors.apellido}</p>
                )}
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
                  placeholder="ejemplo@correo.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Tipo de Documento */}
              <div className="space-y-2">
                <Label htmlFor="tipo_documento">Tipo de Documento *</Label>
                <Select
                  value={formData.tipo_documento}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, tipo_documento: value }))
                    if (errors.tipo_documento) {
                      setErrors(prev => ({ ...prev, tipo_documento: '' }))
                    }
                  }}
                >
                  <SelectTrigger className={errors.tipo_documento ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona el tipo de documento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cedula_ciudadania">Cédula de Ciudadanía</SelectItem>
                    <SelectItem value="tarjeta_identidad">Tarjeta de Identidad</SelectItem>
                    <SelectItem value="pasaporte">Pasaporte</SelectItem>
                    <SelectItem value="cedula_extranjeria">Cédula de Extranjería</SelectItem>
                    <SelectItem value="dni">DNI</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo_documento && (
                  <p className="text-sm text-red-600">{errors.tipo_documento}</p>
                )}
              </div>

              {/* Número de Documento */}
              <div className="space-y-2">
                <Label htmlFor="numero_documento">Número de Documento *</Label>
                <Input
                  id="numero_documento"
                  name="numero_documento"
                  type="text"
                  value={formData.numero_documento}
                  onChange={handleInputChange}
                  className={errors.numero_documento ? 'border-red-500' : ''}
                  placeholder="Ingresa tu número de documento"
                />
                {errors.numero_documento && (
                  <p className="text-sm text-red-600">{errors.numero_documento}</p>
                )}
              </div>

              {/* Documento PDF */}
              <div className="space-y-2">
                <Label htmlFor="documento_pdf">Documento de Identidad (PDF) *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
                  {!documentoPdf ? (
                    <div>
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Haz clic para seleccionar o arrastra tu documento PDF
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        Máximo 5MB • Solo archivos PDF
                      </p>
                      <input
                        id="documento_pdf"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange(e, setDocumentoPdf, 'documento_pdf')}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('documento_pdf').click()}
                        className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      >
                        Seleccionar Archivo
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-6 w-6 text-green-600" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">{documentoPdf.name}</p>
                          <p className="text-xs text-gray-500">
                            {(documentoPdf.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(setDocumentoPdf, 'documento_pdf')}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                {errors.documento_pdf && (
                  <p className="text-sm text-red-600">{errors.documento_pdf}</p>
                )}
              </div>

              {/* Requisitos PDF */}
              <div className="space-y-2">
                <Label htmlFor="requisitos_pdf">Requisitos de Inscripción (PDF) *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
                  {!requisitosPdf ? (
                    <div>
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Haz clic para seleccionar o arrastra los requisitos PDF
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        Máximo 5MB • Solo archivos PDF
                      </p>
                      <input
                        id="requisitos_pdf"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange(e, setRequisitosPdf, 'requisitos_pdf')}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('requisitos_pdf').click()}
                        className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      >
                        Seleccionar Archivo
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-6 w-6 text-green-600" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">{requisitosPdf.name}</p>
                          <p className="text-xs text-gray-500">
                            {(requisitosPdf.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(setRequisitosPdf, 'requisitos_pdf')}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                {errors.requisitos_pdf && (
                  <p className="text-sm text-red-600">{errors.requisitos_pdf}</p>
                )}
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
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
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
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="text-sm text-red-600">{errors.confirm_password}</p>
                )}
              </div>

              {/* Botón de registro */}
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Registrando...' : 'Crear Cuenta'}
              </Button>

              {/* Link a login */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  ¿Ya tienes una cuenta?{' '}
                  <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
                    Inicia sesión aquí
                  </Link>
                </p>
              </div>

              {/* Botón adicional para ir al login después del registro exitoso */}
              {successMessage && (
                <div className="text-center pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-green-600 text-green-600 hover:bg-green-50"
                    onClick={() => navigate('/login')}
                  >
                    Ir al Inicio de Sesión
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RegisterPage

