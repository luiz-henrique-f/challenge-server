#!/bin/bash
set -e

# Cria a rede se não existir
docker network inspect shared_network >/dev/null 2>&1 || \
docker network create shared_network

# Sobe os dois compose
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.search.yml up -d

echo "✅ Todos os containers foram iniciados!"
