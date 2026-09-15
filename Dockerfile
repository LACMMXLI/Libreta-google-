# Etapa 1: Construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Construir aplicación web de producción
RUN npm run build

# Etapa 2: Servidor de producción ligero
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Instalar 'serve' globalmente para servir los archivos estáticos
RUN npm install -g serve

# Copiar artefactos de la etapa de construcción
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
