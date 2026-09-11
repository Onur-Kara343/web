
# Pulse

Pulse ist eine statische Webanwendung mit HTML, CSS und Vanilla JavaScript.

## Start mit Docker

```bash
docker compose up --build
```

Die Anwendung ist danach unter <http://localhost:8080> erreichbar.

```bash
docker compose down
```

## Projektstruktur

- `frontend/`: statische Anwendung
- `Dockerfile`: Nginx-Produktionsimage
- `docker-compose.yml`: lokaler Start auf Port `8080`
