FROM nginx:alpine

# Nginx-Konfiguration kopieren
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ALLE Frontend-Dateien kopieren (inkl. favicon.svg und logo.svg!)
COPY . /usr/share/nginx/html

# Port für Nginx
EXPOSE 80

# Nginx starten
CMD ["nginx", "-g", "daemon off;"]