# Despliegue en Coolify con Docker y PostgreSQL

Esta aplicación está lista para desplegarse en **Coolify** de manera directa mediante Docker Compose o Dockerfile.

## Opción 1: Despliegue con Docker Compose (App + PostgreSQL)

1. En tu panel de Coolify, crea un nuevo recurso tipo **Docker Compose**.
2. Conecta tu repositorio de GitHub o pega el contenido de `docker-compose.yml`.
3. Configura las variables de entorno opcionales:
   ```env
   POSTGRES_USER=libreta_user
   POSTGRES_PASSWORD=tu_password_seguro
   POSTGRES_DB=libreta_db
   ```
4. Asigna tu dominio o subdominio en Coolify apuntando al puerto `3000`.
5. Presiona **Deploy**.

## Opción 2: Despliegue como Aplicación Web (Dockerfile)

1. Crea un nuevo recurso en Coolify tipo **Application**.
2. Selecciona el repositorio de GitHub.
3. Tipo de construcción: **Dockerfile** (puerto `3000`).
4. Si requieres base de datos independiente, crea un servicio **PostgreSQL** en Coolify y conecta la variable `DATABASE_URL`.
5. Ejecuta el script inicial de `database/schema.sql`.

## Estructura de Datos (PostgreSQL)

El archivo `database/schema.sql` crea automáticamente:
- `empleados`: ID, nombre, día de corte semanal (`lunes`, `miércoles`, `viernes`, etc.), color.
- `hojas_diarias`: Cada fecha con su estado y notas de auditoría.
- `movimientos`: Cada consumo vinculado a su empleado y hoja diaria con hora, concepto e importe.
- `conceptos_rapidos`: Catálogo de botones rápidos y precios.
- `vista_totales_diarios`: Vista agrupada para consultas de reportes.
