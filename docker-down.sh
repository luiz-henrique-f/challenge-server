#!/bin/bash
set -e

docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.search.yml down

echo "🛑 Todos os containers foram parados!"
