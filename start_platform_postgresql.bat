@echo off
echo ========================================
echo    INICIANDO PLATAFORMA E-LEARNING
echo    CON POSTGRESQL
echo ========================================
echo.

echo 🐳 Verificando PostgreSQL...
docker-compose ps

echo.
echo 🚀 Iniciando Backend con PostgreSQL...
start "Backend PostgreSQL" cmd /k "cd backend\backend-app && set FLASK_ENV=production && set DATABASE_URL=postgresql://elearning_user:password_seguro@localhost:5432/elearning_narino && call venv\Scripts\activate.bat && python src\main.py"

echo.
echo ⏳ Esperando que el backend esté listo...
timeout /t 5 /nobreak >nul

echo.
echo 🌐 Iniciando Frontend...
start "Frontend" cmd /k "cd frontend\frontend-app && pnpm dev"

echo.
echo ✅ Plataforma iniciada correctamente!
echo.
echo 📊 Acceso a servicios:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo    pgAdmin:  http://localhost:5050
echo.
echo 🗄️ Base de datos PostgreSQL:
echo    Host: localhost:5432
echo    Database: elearning_narino
echo    User: elearning_user
echo.
pause 