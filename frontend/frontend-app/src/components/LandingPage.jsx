import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, Award, Clock, CheckCircle, Star } from 'lucide-react'
import logoGobernacion from '../assets/logo-gobernacion.png'
import logoGov from '../assets/logo-gov.png'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img src={logoGobernacion} alt="Gobernación de Nariño" className="h-12" />
              <img src={logoGov} alt="GOV.CO" className="h-8" />
            </div>
            <nav className="hidden md:flex space-x-6 items-center">
              <a href="#inicio" className="nav-3d" data-label="Inicio">
                <span>Inicio</span><span>Inicio</span><span>Inicio</span><span>Inicio</span>
              </a>
              <a href="#caracteristicas" className="nav-3d" data-label="Características">
                <span>Características</span><span>Características</span><span>Características</span><span>Características</span>
              </a>
              <a href="#beneficios" className="nav-3d" data-label="Beneficios">
                <span>Beneficios</span><span>Beneficios</span><span>Beneficios</span><span>Beneficios</span>
              </a>
              <a href="#contacto" className="nav-3d" data-label="Contacto">
                <span>Contacto</span><span>Contacto</span><span>Contacto</span><span>Contacto</span>
              </a>
            </nav>
            <div className="flex space-x-4">
              <Link to="/login">
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="hero-diagonals bg-gradient-to-br from-yellow-400 via-yellow-300 to-green-500 py-16">
        <div className="diag"></div>
        <div className="diag diag2"></div>
        <div className="diag diag3"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10">
          <Carousel className="max-w-4xl mx-auto" autoPlay={true} autoPlayInterval={6000}>
            <CarouselContent>
              <CarouselItem>
                <div className="text-center">
                  <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
                    Plataforma E-Learning
                    <span className="block text-green-700">Gobernación de Nariño</span>
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
                    Fortalece tus conocimientos y habilidades con nuestra plataforma educativa digital. 
                    Accede a una gran variedad de cursos de calidad diseñados para el desarrollo integral de los nariñenses.
                    Aprende a tu ritmo con tutores expertos y materiales actualizados.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/register">
                      <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg">
                        Comenzar Ahora
                      </Button>
                    </Link>
                    <Button size="lg" variant="outline" className="border-gray-700 text-gray-700 hover:bg-gray-50 px-8 py-3 text-lg">
                      Conocer Más
                    </Button>
                  </div>
                </div>
              </CarouselItem>

              <CarouselItem>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="order-2 md:order-1 text-center md:text-left">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                      Primera Convocatoria 2025
                      <span className="block text-green-700">Curso de Inteligencia Artificial</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl">
                      Inscríbete a nuestra primera cohorte del curso de IA. Cupos limitados para estudiantes de Nariño.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 md:justify-start justify-center">
                      <Link to="/register">
                        <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg">
                          Inscríbete
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="order-1 md:order-2 flex justify-center">
                    <img src="../public/convocatoria1.PNG" alt="Convocatoria IA" width="500" height="500" className="rounded-lg shadow object-cover" />
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="order-2 md:order-1 text-center md:text-left">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                      Segunda Convocatoria 2025
                      <span className="block text-green-700">Programación Básica con Python</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl">
                      Aprende los fundamentos de programación con Python desde cero. Inscripciones abiertas.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 md:justify-start justify-center">
                      <Link to="/register">
                        <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg">
                          Inscríbete
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="order-1 md:order-2 flex justify-center">
                    <img src="../public/convocatoria2.PNG" alt="Convocatoria Programación Python" width="500" height="500" className="rounded-lg shadow object-cover" />
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
          </div>
        </div>
      </section>

      {/* Características Principales */}
      <section id="caracteristicas" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Características de la Plataforma
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre las herramientas y funcionalidades que hacen de nuestra plataforma 
              la mejor opción para tu formación académica.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow fx-card" onMouseMove={(e)=>{
              const r=e.currentTarget.getBoundingClientRect();
              const x=e.clientX - r.left; const y=e.clientY - r.top;
              const rx=-(y - r.height/2)/20; const ry=(x - r.width/2)/20;
              e.currentTarget.style.setProperty('--rx', rx+'deg');
              e.currentTarget.style.setProperty('--ry', ry+'deg');
              e.currentTarget.style.setProperty('--mx', x+'px');
              e.currentTarget.style.setProperty('--my', y+'px');
            }} onMouseLeave={(e)=>{
              e.currentTarget.style.setProperty('--rx','0deg');
              e.currentTarget.style.setProperty('--ry','0deg');
              e.currentTarget.style.setProperty('--mx','-1000px');
              e.currentTarget.style.setProperty('--my','-1000px');
            }}>
              <CardHeader>
                <BookOpen className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle className="text-xl text-gray-800">Cursos Especializados</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Accede a una amplia variedad de cursos diseñados específicamente para 
                  las necesidades del departamento de Nariño.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow fx-card" onMouseMove={(e)=>{
              const r=e.currentTarget.getBoundingClientRect();
              const x=e.clientX - r.left; const y=e.clientY - r.top;
              const rx=-(y - r.height/2)/20; const ry=(x - r.width/2)/20;
              e.currentTarget.style.setProperty('--rx', rx+'deg');
              e.currentTarget.style.setProperty('--ry', ry+'deg');
              e.currentTarget.style.setProperty('--mx', x+'px');
              e.currentTarget.style.setProperty('--my', y+'px');
            }} onMouseLeave={(e)=>{
              e.currentTarget.style.setProperty('--rx','0deg');
              e.currentTarget.style.setProperty('--ry','0deg');
              e.currentTarget.style.setProperty('--mx','-1000px');
              e.currentTarget.style.setProperty('--my','-1000px');
            }}>
              <CardHeader>
                <Users className="h-12 w-12 text-yellow-500 mb-4" />
                <CardTitle className="text-xl text-gray-800">Aprendizaje Colaborativo</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Conecta con otros estudiantes y participa en foros de discusión 
                  para enriquecer tu experiencia de aprendizaje.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow fx-card" onMouseMove={(e)=>{
              const r=e.currentTarget.getBoundingClientRect();
              const x=e.clientX - r.left; const y=e.clientY - r.top;
              const rx=-(y - r.height/2)/20; const ry=(x - r.width/2)/20;
              e.currentTarget.style.setProperty('--rx', rx+'deg');
              e.currentTarget.style.setProperty('--ry', ry+'deg');
              e.currentTarget.style.setProperty('--mx', x+'px');
              e.currentTarget.style.setProperty('--my', y+'px');
            }} onMouseLeave={(e)=>{
              e.currentTarget.style.setProperty('--rx','0deg');
              e.currentTarget.style.setProperty('--ry','0deg');
              e.currentTarget.style.setProperty('--mx','-1000px');
              e.currentTarget.style.setProperty('--my','-1000px');
            }}>
              <CardHeader>
                <Award className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle className="text-xl text-gray-800">Certificaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Obtén certificados oficiales al completar exitosamente 
                  los cursos y programas de formación.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow fx-card" onMouseMove={(e)=>{
              const r=e.currentTarget.getBoundingClientRect();
              const x=e.clientX - r.left; const y=e.clientY - r.top;
              const rx=-(y - r.height/2)/20; const ry=(x - r.width/2)/20;
              e.currentTarget.style.setProperty('--rx', rx+'deg');
              e.currentTarget.style.setProperty('--ry', ry+'deg');
              e.currentTarget.style.setProperty('--mx', x+'px');
              e.currentTarget.style.setProperty('--my', y+'px');
            }} onMouseLeave={(e)=>{
              e.currentTarget.style.setProperty('--rx','0deg');
              e.currentTarget.style.setProperty('--ry','0deg');
              e.currentTarget.style.setProperty('--mx','-1000px');
              e.currentTarget.style.setProperty('--my','-1000px');
            }}>
              <CardHeader>
                <Clock className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle className="text-xl text-gray-800">Flexibilidad Horaria</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Estudia a tu propio ritmo con acceso 24/7 a todos los 
                  materiales y recursos educativos.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow fx-card" onMouseMove={(e)=>{
              const r=e.currentTarget.getBoundingClientRect();
              const x=e.clientX - r.left; const y=e.clientY - r.top;
              const rx=-(y - r.height/2)/20; const ry=(x - r.width/2)/20;
              e.currentTarget.style.setProperty('--rx', rx+'deg');
              e.currentTarget.style.setProperty('--ry', ry+'deg');
              e.currentTarget.style.setProperty('--mx', x+'px');
              e.currentTarget.style.setProperty('--my', y+'px');
            }} onMouseLeave={(e)=>{
              e.currentTarget.style.setProperty('--rx','0deg');
              e.currentTarget.style.setProperty('--ry','0deg');
              e.currentTarget.style.setProperty('--mx','-1000px');
              e.currentTarget.style.setProperty('--my','-1000px');
            }}>
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle className="text-xl text-gray-800">Seguimiento de Progreso</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Monitorea tu avance con herramientas de seguimiento 
                  detalladas y reportes de progreso.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow fx-card" onMouseMove={(e)=>{
              const r=e.currentTarget.getBoundingClientRect();
              const x=e.clientX - r.left; const y=e.clientY - r.top;
              const rx=-(y - r.height/2)/20; const ry=(x - r.width/2)/20;
              e.currentTarget.style.setProperty('--rx', rx+'deg');
              e.currentTarget.style.setProperty('--ry', ry+'deg');
              e.currentTarget.style.setProperty('--mx', x+'px');
              e.currentTarget.style.setProperty('--my', y+'px');
            }} onMouseLeave={(e)=>{
              e.currentTarget.style.setProperty('--rx','0deg');
              e.currentTarget.style.setProperty('--ry','0deg');
              e.currentTarget.style.setProperty('--mx','-1000px');
              e.currentTarget.style.setProperty('--my','-1000px');
            }}>
              <CardHeader>
                <Star className="h-12 w-12 text-yellow-500 mb-4" />
                <CardTitle className="text-xl text-gray-800">Contenido de Calidad</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Materiales educativos desarrollados por expertos y 
                  actualizados constantemente.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Nuestro Impacto en Números
            </h2>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Conoce los resultados que hemos logrado en el fortalecimiento 
              educativo del departamento de Nariño.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">1,500+</div>
              <div className="text-green-100 text-lg">Estudiantes Activos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">50+</div>
              <div className="text-green-100 text-lg">Cursos Disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">95%</div>
              <div className="text-green-100 text-lg">Tasa de Satisfacción</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">1,200+</div>
              <div className="text-green-100 text-lg">Certificados Emitidos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios para Estudiantes */}
      <section id="beneficios" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Beneficios para los Estudiantes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre todas las ventajas que obtienes al formar parte de 
              nuestra comunidad educativa digital.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Acceso Gratuito</h3>
                  <p className="text-gray-600">
                    Todos los cursos y materiales están disponibles sin costo para 
                    los ciudadanos del departamento de Nariño.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Certificación Oficial</h3>
                  <p className="text-gray-600">
                    Recibe certificados avalados por la Gobernación de Nariño 
                    que validen tus nuevas competencias.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Soporte Técnico</h3>
                  <p className="text-gray-600">
                    Cuenta con asistencia técnica especializada para resolver 
                    cualquier duda o inconveniente.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Oportunidades Laborales</h3>
                  <p className="text-gray-600">
                    Accede a bolsas de empleo y oportunidades laborales 
                    exclusivas para graduados de la plataforma.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-yellow-50 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                ¡Únete Hoy Mismo!
              </h3>
              <p className="text-gray-600 mb-6 text-center">
                Comienza tu viaje de aprendizaje y desarrollo profesional 
                con la plataforma educativa más completa de Nariño.
              </p>
              <div className="text-center">
                <Link to="/register">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                    Registrarse Gratis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contacto" className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <img src={logoGobernacion} alt="Gobernación de Nariño" className="h-10" />
              </div>
              <p className="text-gray-300 mb-4">
                Plataforma E-Learning oficial de la Gobernación de Nariño. 
                Comprometidos con la educación y el desarrollo de nuestra región.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-2">
                <li><a href="#inicio" className="text-gray-300 hover:text-white transition-colors">Inicio</a></li>
                <li><a href="#caracteristicas" className="text-gray-300 hover:text-white transition-colors">Características</a></li>
                <li><a href="#beneficios" className="text-gray-300 hover:text-white transition-colors">Beneficios</a></li>
                <li><Link to="/login" className="text-gray-300 hover:text-white transition-colors">Iniciar Sesión</Link></li>
                <li><Link to="/register" className="text-gray-300 hover:text-white transition-colors">Registrarse</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <div className="space-y-2 text-gray-300">
                <p>📧 educacion@narino.gov.co</p>
                <p>📞 (2) 123-4567</p>
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

export default LandingPage

