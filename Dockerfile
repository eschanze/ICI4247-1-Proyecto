# Etapa de construcción (Build)
FROM node:20-alpine AS build

WORKDIR /app

# Instalamos dependencias
COPY package*.json ./
RUN npm ci

# Copiamos el código fuente y construimos la app
COPY . .

# Pasamos la URL de la API relativa para que Nginx la enrute al backend
ARG VITE_GOOGLE_MAPS_API_KEY
ENV VITE_API_URL=/api
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY

RUN npm run build

# Etapa de servicio con Nginx
FROM nginx:alpine

# Copiamos los archivos estáticos generados por Vite
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos nuestra configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80
EXPOSE 80

# Iniciamos Nginx
CMD ["nginx", "-g", "daemon off;"]
