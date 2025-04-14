@echo off
rem Script de gestion pour l'Application DGI

:menu
cls
echo ========================================================
echo    Application DGI - OUTIL DE GESTION
echo ========================================================
echo.
echo  1. Démarrer en mode production (avec persistance)
echo  2. Démarrer en mode développement (sans persistance)
echo  3. Redémarrer le backend seulement
echo  4. Redémarrer le frontend seulement
echo  5. Redémarrer tous les services
echo  6. Arrêter tous les services
echo  7. Voir les logs (backend, frontend ou tous)
echo  8. Quitter
echo.
set /p CHOIX="Choisissez une option (1-8): "

if "%CHOIX%"=="1" goto start_prod
if "%CHOIX%"=="2" goto start_dev
if "%CHOIX%"=="3" goto restart_backend
if "%CHOIX%"=="4" goto restart_frontend
if "%CHOIX%"=="5" goto restart_all
if "%CHOIX%"=="6" goto stop_all
if "%CHOIX%"=="7" goto show_logs
if "%CHOIX%"=="8" goto end
goto menu

:start_prod
cls
echo ========================================================
echo    Application DGI - MODE PRODUCTION
echo ========================================================
echo.
echo Ce mode est destiné à une utilisation normale avec persistance des données.
echo.

rem Set environment variables for production
set POSTGRES_DB=dgiapp
set POSTGRES_USER=postgres
set POSTGRES_PASSWORD=postgres
set JWT_SECRET=productionSecretKey
set JWT_EXPIRATION=86400000
set CORS_ALLOWED_ORIGINS=http://localhost:3000
set LOG_LEVEL_SPRING_SECURITY=INFO
set LOG_LEVEL_APP=INFO
set LOG_LEVEL_JWT=INFO
set REACT_APP_BACKEND_PORT=8080

echo Configuration de l'environnement de production:
echo JWT_SECRET: %JWT_SECRET% (configuré)
echo CORS_ALLOWED_ORIGINS: %CORS_ALLOWED_ORIGINS%
echo.

rem Start the application with Docker Compose
docker-compose up -d

echo.
echo Application démarrée en mode production!
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:8080
echo.
pause
goto menu

:start_dev
cls
echo ========================================================
echo    Application DGI - MODE DÉVELOPPEMENT
echo ========================================================
echo.
echo ATTENTION: Ce mode est destiné aux développeurs uniquement.
echo Les données ne seront PAS conservées entre les redémarrages.
echo.
choice /M "Voulez-vous continuer en mode développement"
if %ERRORLEVEL% EQU 2 goto menu

rem Set environment variables for development
set POSTGRES_DB=dgiapp
set POSTGRES_USER=postgres
set POSTGRES_PASSWORD=postgres
set JWT_SECRET=devSecretKeyForTesting
set JWT_EXPIRATION=86400000
set CORS_ALLOWED_ORIGINS=*
set LOG_LEVEL_SPRING_SECURITY=DEBUG
set LOG_LEVEL_APP=DEBUG
set LOG_LEVEL_JWT=DEBUG
set REACT_APP_BACKEND_PORT=8080

echo.
echo Configuration de l'environnement de développement:
echo JWT_SECRET: %JWT_SECRET%
echo CORS_ALLOWED_ORIGINS: %CORS_ALLOWED_ORIGINS%
echo.

rem Start the application with Docker Compose
docker-compose up -d

echo.
echo Application démarrée en mode développement!
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:8080
echo.
pause
goto menu

:restart_backend
cls
echo ========================================================
echo    Application DGI - REDÉMARRAGE BACKEND
echo ========================================================
echo.

echo Arrêt du service backend en cours...
docker-compose stop backend
echo.

echo Démarrage du service backend en cours...
docker-compose up -d backend
echo.

echo Backend redémarré avec succès!
echo - API accessible à http://localhost:8080
echo.

choice /M "Voulez-vous voir les logs du backend"
if %ERRORLEVEL% EQU 1 (
    cls
    echo Logs du backend (Ctrl+C pour revenir au menu):
    echo.
    docker-compose logs -f backend
)
goto menu

:restart_frontend
cls
echo ========================================================
echo    Application DGI - REDÉMARRAGE FRONTEND
echo ========================================================
echo.

echo Arrêt du service frontend en cours...
docker-compose stop frontend
echo.

echo Démarrage du service frontend en cours...
docker-compose up -d frontend
echo.

echo Frontend redémarré avec succès!
echo - Application accessible à http://localhost:3000
echo.

choice /M "Voulez-vous voir les logs du frontend"
if %ERRORLEVEL% EQU 1 (
    cls
    echo Logs du frontend (Ctrl+C pour revenir au menu):
    echo.
    docker-compose logs -f frontend
)
goto menu

:restart_all
cls
echo ========================================================
echo    Application DGI - REDÉMARRAGE COMPLET
echo ========================================================
echo.

echo Arrêt des services en cours...
docker-compose stop
echo.

echo Démarrage des services en cours...
docker-compose up -d
echo.

echo Application redémarrée avec succès!
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:8080
echo.

choice /M "Voulez-vous voir les logs de tous les services"
if %ERRORLEVEL% EQU 1 (
    cls
    echo Logs de tous les services (Ctrl+C pour revenir au menu):
    echo.
    docker-compose logs -f
)
goto menu

:stop_all
cls
echo ========================================================
echo    Application DGI - ARRÊT DES SERVICES
echo ========================================================
echo.

echo Arrêt de tous les services en cours...
docker-compose down
echo.

echo Tous les services ont été arrêtés.
echo.
pause
goto menu

:show_logs
cls
echo ========================================================
echo    Application DGI - VISUALISATION DES LOGS
echo ========================================================
echo.
echo  1. Logs du backend
echo  2. Logs du frontend
echo  3. Logs de tous les services
echo  4. Retour au menu principal
echo.
set /p LOG_CHOICE="Choisissez une option (1-4): "

if "%LOG_CHOICE%"=="1" (
    cls
    echo Logs du backend (Ctrl+C pour revenir au menu):
    echo.
    docker-compose logs -f backend
    goto menu
)
if "%LOG_CHOICE%"=="2" (
    cls
    echo Logs du frontend (Ctrl+C pour revenir au menu):
    echo.
    docker-compose logs -f frontend
    goto menu
)
if "%LOG_CHOICE%"=="3" (
    cls
    echo Logs de tous les services (Ctrl+C pour revenir au menu):
    echo.
    docker-compose logs -f
    goto menu
)
if "%LOG_CHOICE%"=="4" goto menu
goto show_logs

:end
echo.
echo Merci d'avoir utilisé l'outil de gestion DGI. Au revoir!
exit /b 