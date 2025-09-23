import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Download, FileText, Users, Target, Calendar, MapPin, FileSpreadsheet, ChevronDown, ChevronUp, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import logoGobernacion from '../assets/logo-gobernacion.png'
import logoGov from '../assets/logo-gov.png'
import emailjs from '@emailjs/browser'

const TerminosReferencia = () => {
  // Estado para el acordeón del formulario
  const [isFormOpen, setIsFormOpen] = useState(false)
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    celular: '',
    correo: '',
    municipio: '',
    duda: ''
  })

  // Función para manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Función para enviar el formulario con EmailJS
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Mostrar mensaje de carga
      alert('Enviando consulta...')
      
      // Configurar EmailJS con credenciales directas
      emailjs.init('L-mZkum1V3UydsMN0')
      
      // Preparar los parámetros del template
      const templateParams = {
        from_name: formData.nombre,
        from_email: formData.correo,
        cedula: formData.cedula,
        celular: formData.celular,
        municipio: formData.municipio,
        message: formData.duda,
        to_email: 'consorcioprimeronarino@gmail.com',
        reply_to: formData.correo
      }
      
      // Enviar email usando EmailJS
      const response = await emailjs.send(
        'service_8383n0g',
        'template_j0f8bn4',
        templateParams
      )
      
      console.log('Email enviado exitosamente:', response)
      alert('¡Gracias por tu consulta! Tu mensaje ha sido enviado correctamente.')
      
      // Limpiar el formulario
      setFormData({
        nombre: '',
        cedula: '',
        celular: '',
        correo: '',
        municipio: '',
        duda: ''
      })
      setIsFormOpen(false)
      
    } catch (error) {
      console.error('Error al enviar el formulario:', error)
      alert('Hubo un error al enviar tu consulta. Por favor, inténtalo de nuevo o contacta directamente a consorcioprimeronarino@gmail.com')
    }
  }

  // Lista de documentos disponibles
  const documentos = [
    {
      id: 1,
      nombre: "TDR",
      archivo: "1. TDR Ajustados.pdf",
      tipo: "pdf",
      descripcion: "Términos de Referencia del Programa EmprendiPaz"
    },
    {
      id: 2,
      nombre: "Lista de Chequeo",
      archivo: "2. Lista de chequeo.pdf",
      tipo: "pdf",
      descripcion: "Lista de verificación para el proceso de inscripción"
    },
    {
      id: 3,
      nombre: "Certificado de Compromiso",
      archivo: "3. Certificado de Compromiso.pdf",
      tipo: "pdf",
      descripcion: "Formato de certificación de compromiso del participante"
    },
    {
      id: 4,
      nombre: "Autorización de Datos",
      archivo: "4. Autorización.pdf",
      tipo: "pdf",
      descripcion: "Autorización para el uso de datos personales e imagen"
    },
    {
      id: 5,
      nombre: "Certificado de Vecindad",
      archivo: "5.Certificado de Vecindad.pdf",
      tipo: "pdf",
      descripcion: "Formato de certificación de residencia"
    },
    {
      id: 6,
      nombre: "Plan de Negocio",
      archivo: "6. FORMATO PLAN DE NEGOCIO INSCRIPCIÓN.xlsx",
      tipo: "excel",
      descripcion: "Formato para el plan de negocio del emprendimiento"
    },
    {
      id: 7,
      nombre: "Declaración Jurada",
      archivo: "7. DECLARACIÓN JURAMENTADA DE CAPACIDAD LEGAL.pdf",
      tipo: "pdf",
      descripcion: "Declaración jurada de capacidad legal"
    },
    {
      id: 8,
      nombre: "Documento Instructivo",
      archivo: "8. Documento_instructivo_video.pdf",
      tipo: "pdf",
      descripcion: "Instrucciones para el proceso de inscripción"
    }
  ];

  // Función para descargar documentos
  const handleDownloadDocument = (archivo, nombre) => {
    const link = document.createElement('a');
    link.href = `/Terminos/${archivo}`;
    
    // Agregar extensión correcta según el tipo de archivo
    const extension = archivo.includes('.xlsx') ? '.xlsx' : 
                     archivo.includes('.pdf') ? '.pdf' : '';
    link.download = `${nombre}${extension}`;
    
    // Forzar el tipo MIME correcto
    if (archivo.includes('.xlsx')) {
      link.setAttribute('type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    } else if (archivo.includes('.pdf')) {
      link.setAttribute('type', 'application/pdf');
    }
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-center py-4 space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap justify-center lg:justify-start">
              <img src="/emprendipaz.png" alt="EmprendiPaz" className="h-10 sm:h-12" />
              <img src={logoGobernacion} alt="Gobernación de Nariño" className="h-10 sm:h-12" />
              <img src="/fundacion.png" alt="Fundación" className="h-10 sm:h-12" />
              <img src="/consorcio.png" alt="Consorcio" className="h-10 sm:h-12" />
            </div>
            <div className="flex items-center">
              <Link to="/">
                <Button variant="outline" className="flex items-center space-x-2 text-sm sm:text-base">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Volver al Inicio</span>
                  <span className="sm:hidden">Inicio</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Banner */}
      <section className="hero-diagonals bg-gradient-to-br from-yellow-400 via-yellow-300 to-green-500 py-8">
        <div className="diag"></div>
        <div className="diag diag2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-black mb-4">
              Términos de Referencia
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto">
              <span className="text-white font-semibold drop-shadow-md" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>
                Programa EmprendiPaz - Jóvenes Emprendedores de Nariño
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Principal */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Video Informativo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <video
                    className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                    controls
                    preload="metadata"
                    poster="/video-poster.jpg"
                  >
                    <source src="/Terminos/video_terminos.mp4" type="video/mp4" />
                    Tu navegador no soporta el elemento de video.
                  </video>
                </div>
              </CardContent>
            </Card>

            {/* Botón de contacto y formulario */}
            <Card className="shadow-lg mt-6">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Button
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg flex items-center space-x-2 mx-auto"
                    size="lg"
                  >
                    <Mail className="h-5 w-5" />
                    <span>¿Tienes dudas? Escríbenos</span>
                    {isFormOpen ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </Button>
                </div>

                {/* Formulario en acordeón */}
                {isFormOpen && (
                  <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre completo *
                          </label>
                          <Input
                            id="nombre"
                            name="nombre"
                            type="text"
                            required
                            value={formData.nombre}
                            onChange={handleInputChange}
                            placeholder="Ingresa tu nombre completo"
                          />
                        </div>
                        <div>
                          <label htmlFor="cedula" className="block text-sm font-medium text-gray-700 mb-1">
                            Cédula *
                          </label>
                          <Input
                            id="cedula"
                            name="cedula"
                            type="text"
                            required
                            value={formData.cedula}
                            onChange={handleInputChange}
                            placeholder="Ingresa tu número de cédula"
                          />
                        </div>
                        <div>
                          <label htmlFor="celular" className="block text-sm font-medium text-gray-700 mb-1">
                            Celular *
                          </label>
                          <Input
                            id="celular"
                            name="celular"
                            type="tel"
                            required
                            value={formData.celular}
                            onChange={handleInputChange}
                            placeholder="Ingresa tu número de celular"
                          />
                        </div>
                        <div>
                          <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">
                            Correo electrónico *
                          </label>
                          <Input
                            id="correo"
                            name="correo"
                            type="email"
                            required
                            value={formData.correo}
                            onChange={handleInputChange}
                            placeholder="Ingresa tu correo electrónico"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label htmlFor="municipio" className="block text-sm font-medium text-gray-700 mb-1">
                            Municipio *
                          </label>
                          <Input
                            id="municipio"
                            name="municipio"
                            type="text"
                            required
                            value={formData.municipio}
                            onChange={handleInputChange}
                            placeholder="Ingresa tu municipio"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label htmlFor="duda" className="block text-sm font-medium text-gray-700 mb-1">
                            Tu duda o consulta *
                          </label>
                          <textarea
                            id="duda"
                            name="duda"
                            required
                            rows={4}
                            value={formData.duda}
                            onChange={handleInputChange}
                            placeholder="Describe tu duda o consulta aquí..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      </div>
                      <div className="flex justify-center pt-4">
                        <Button
                          type="submit"
                          className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
                        >
                          Enviar Consulta
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            <Card className="shadow-lg bg-gradient-to-br from-green-50 to-yellow-50">
              <CardHeader>
                <CardTitle className="text-xl text-center">Documentos del Programa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 text-center text-sm">
                  Descarga todos los documentos necesarios para participar en el Programa EmprendiPaz
                </p>
                <div className="space-y-3">
                  {documentos.map((doc) => (
                    <div key={doc.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex-shrink-0 mt-1">
                            {doc.tipo === 'excel' ? (
                              <FileSpreadsheet className="h-5 w-5 text-green-600" />
                            ) : (
                              <FileText className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-gray-900 truncate">
                              {doc.nombre}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {doc.descripcion}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleDownloadDocument(doc.archivo, doc.nombre)}
                          size="sm"
                          variant="outline"
                          className="flex-shrink-0 ml-2 h-8 px-3"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          <span className="text-xs">Descargar</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <img src="/emprendipaz.png" alt="EmprendiPaz" className="h-12" />
              </div>
              <p className="text-gray-300 mb-4">
                Este proyecto lo desarrolla la Gobernacion de nariño, con principios
                de transparencia, equidad y acompañamiento a los jóvenes emprendedores del departamento.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Inicio</Link></li>
                <li><a href="#caracteristicas" className="text-gray-300 hover:text-white transition-colors">Fases</a></li>
                <li><a href="#beneficios" className="text-gray-300 hover:text-white transition-colors">Cobertura</a></li>
                <li><Link to="/login" className="text-gray-300 hover:text-white transition-colors">Iniciar Sesión</Link></li>
                {(() => {
                  // Fecha objetivo: 30 de septiembre a las 8:00 AM
                  const targetDate = new Date('2025-09-30T08:00:00')
                  const now = new Date()
                  const disabled = now < targetDate
                  return (
                    <li>
                      <div
                        className={`transition-colors ${
                          disabled 
                            ? "text-gray-500 cursor-not-allowed" 
                            : "text-gray-300 hover:text-white"
                        }`}
                        title={disabled ? "Disponible a partir del 30 de septiembre a las 8:00 AM" : ""}
                      >
                        {disabled ? "Registrarse" : (
                          <Link to="/register" className="text-gray-300 hover:text-white transition-colors">
                            Registrarse
                          </Link>
                        )}
                      </div>
                    </li>
                  )
                })()}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <div className="space-y-2 text-gray-300">
                <p>📧 consorcioprimeronarino@gmail.com </p>
                <p>📍 Pasto, Nariño, Colombia</p>
                <p>🌐 www.narino.gov.co</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300">
              © 2025 Gobernación de Nariño. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default TerminosReferencia
