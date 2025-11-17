#!/bin/bash

# Script para probar la autenticación de Estoy Bien

echo "========================================="
echo "  Probando Autenticación - Estoy Bien"
echo "========================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:5000/api"

echo -e "${BLUE}ℹ${NC} Verificando que el backend esté corriendo..."
echo ""

# Test de salud
HEALTH=$(curl -s http://localhost:5000/health 2>/dev/null)
if [ $? -ne 0 ]; then
    echo -e "${RED}✗${NC} El backend no está corriendo"
    echo ""
    echo "Inicia el backend con:"
    echo "  cd backend && npm run dev"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓${NC} Backend corriendo correctamente"
echo ""

# Test 1: Registrar usuario
echo "========================================="
echo "Test 1: Registrar nuevo usuario"
echo "========================================="
echo ""

RANDOM_NUM=$RANDOM
EMAIL="test${RANDOM_NUM}@example.com"

echo -e "${BLUE}ℹ${NC} Email: ${EMAIL}"
echo -e "${BLUE}ℹ${NC} Password: password123"
echo ""

REGISTER_RESPONSE=$(curl -s -X POST ${API_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Usuario de Prueba ${RANDOM_NUM}\",
    \"email\": \"${EMAIL}\",
    \"phone\": \"+34 600 000 ${RANDOM_NUM}\",
    \"password\": \"password123\",
    \"confirmPassword\": \"password123\"
  }")

echo "Respuesta:"
echo "$REGISTER_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$REGISTER_RESPONSE"
echo ""

# Extraer token
TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗${NC} Error al registrar usuario"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓${NC} Usuario registrado correctamente"
echo ""

# Test 2: Login
echo "========================================="
echo "Test 2: Login con credenciales"
echo "========================================="
echo ""

LOGIN_RESPONSE=$(curl -s -X POST ${API_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${EMAIL}\",
    \"password\": \"password123\"
  }")

echo "Respuesta:"
echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

NEW_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$NEW_TOKEN" ]; then
    echo -e "${RED}✗${NC} Error al hacer login"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓${NC} Login exitoso"
echo ""

# Test 3: Obtener perfil
echo "========================================="
echo "Test 3: Obtener perfil del usuario"
echo "========================================="
echo ""

PROFILE_RESPONSE=$(curl -s -X GET ${API_URL}/auth/me \
  -H "Authorization: Bearer ${NEW_TOKEN}")

echo "Respuesta:"
echo "$PROFILE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$PROFILE_RESPONSE"
echo ""

if echo "$PROFILE_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓${NC} Perfil obtenido correctamente"
else
    echo -e "${RED}✗${NC} Error al obtener perfil"
    exit 1
fi

echo ""
echo "========================================="
echo -e "${GREEN}✓ Todos los tests pasaron correctamente${NC}"
echo "========================================="
echo ""
echo "Credenciales de prueba creadas:"
echo "  Email: ${EMAIL}"
echo "  Password: password123"
echo ""
echo "Ahora puedes:"
echo "  1. Ir a: http://localhost:8000/estoy-bien-login.html"
echo "  2. Usar estas credenciales para login"
echo "  3. O crear nuevos usuarios desde: http://localhost:8000/estoy-bien-register.html"
echo ""
