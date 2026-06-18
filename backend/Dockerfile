FROM node:20-alpine

WORKDIR /app

# Copiamos primero package.json y package-lock.json para aprovechar el caché de Docker
COPY package*.json ./

# Instalamos las dependencias
RUN npm ci

# Copiamos el resto del código del backend
COPY . .

# Exponemos el puerto
EXPOSE 5000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
