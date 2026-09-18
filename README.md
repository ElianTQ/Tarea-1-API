Instituto Tecnológico de Costa Rica

Tarea 1 – API

Materia:
  Bases de Datos - GR 60

Profesor:
  Cristian Paz Campos Aguero

Estudiante:
  Elian J. Trejos Quirós - 2024143262

II Semestre, 2026

---

# API REST AdventureWorks - Node.js + SQL Server

### Nombre y carné de los integrantes:
Elian J. Trejos Quirós - 2024143262

### Estado del proyecto:
Bueno - Terminado

### Enlace del video:
https://youtu.be/jPgNuHGRa7Y

---

## Introducción

API REST hecha en Node.js + Express que se conecta a SQL Server (base de datos AdventureWorks)
a través de Stored Procedures. Todo el acceso a datos pasa por procedimientos almacenados,
la API nunca ejecuta SQL directo.

SQL Server corre en un contenedor Docker dentro de Ubuntu (WSL2 sobre Windows).

- **Tabla usada para el CRUD:** `Purchasing.ShipMethod`
- **Consulta con JOIN:** `Purchasing.PurchaseOrderHeader` + `Purchasing.Vendor` + `Purchasing.ShipMethod`

## Requisitos

- Windows con WSL2 (Ubuntu)
- Docker Desktop con integración WSL2
- Node.js v20 (vía nvm)
- Postman

## Instalación

### 1. WSL2 y Ubuntu

```powershell
wsl --install -d Ubuntu
```

### 2. Docker Desktop

Descargar desde https://www.docker.com/products/docker-desktop/, instalar con la opción
"Per-user installation" (usa WSL2 automáticamente). Luego en Settings → Resources →
WSL Integration, activar la distro Ubuntu.

```bash
docker --version
docker ps
```

### 3. Node.js dentro de Ubuntu

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

### 4. Contenedor de SQL Server

```bash
docker pull mcr.microsoft.com/mssql/server:2022-latest

docker run -e "ACCEPT_EULA=Y" \
   -e "MSSQL_SA_PASSWORD=ExamplePassword" \
   -p 1433:1433 \
   --name sqlserver_aw \
   --hostname sqlserver_aw \
   -d mcr.microsoft.com/mssql/server:2022-latest
```

> Se usa el `sqlcmd` que ya viene dentro del contenedor (`/opt/mssql-tools18/bin/sqlcmd`) en
> vez de instalarlo en Ubuntu directamente, porque al momento de hacer este proyecto
> Microsoft aún no tenía soporte oficial para versiones muy recientes de Ubuntu.

### 5. Descargar y restaurar AdventureWorks

```bash
cd ~
wget https://github.com/Microsoft/sql-server-samples/releases/download/adventureworks/AdventureWorks2019.bak

docker cp AdventureWorks2019.bak sqlserver_aw:/var/opt/mssql/data/AdventureWorks2019.bak

docker exec -it sqlserver_aw /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "ExamplePassword" -C -Q \
  "RESTORE FILELISTONLY FROM DISK = '/var/opt/mssql/data/AdventureWorks2019.bak'"
```

Con los nombres lógicos que salgan ahí, restaurar:

```bash
docker exec -it sqlserver_aw /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "ExamplePassword" -C -Q \
  "RESTORE DATABASE AdventureWorks FROM DISK = '/var/opt/mssql/data/AdventureWorks2019.bak' WITH MOVE 'AdventureWorks2019' TO '/var/opt/mssql/data/AdventureWorks.mdf', MOVE 'AdventureWorks2019_log' TO '/var/opt/mssql/data/AdventureWorks_log.ldf'"
```

### 6. Crear los Stored Procedures

```bash
cd ~/Tarea-1-API
docker cp "Script sql/01_stored_procedures.sql" sqlserver_aw:/tmp/01_stored_procedures.sql

docker exec -it sqlserver_aw /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "ExamplePassword" -C -i /tmp/01_stored_procedures.sql
```

Esto crea:

| Procedimiento | Función |
|---|---|
| `usp_ShipMethod_SelectAll` | SELECT simple |
| `usp_PurchaseOrder_SelectWithVendorAndShip` | SELECT con JOIN |
| `usp_ShipMethod_Insert` | INSERT |
| `usp_ShipMethod_Update` | UPDATE |
| `usp_ShipMethod_Delete` | DELETE |

### 7. Instalar dependencias y configurar el proyecto

```bash
cd ~/Tarea-1-API/proyectos/adventureworks-api
npm install
cp .env.example .env
```

Editar `.env` con la contraseña real del paso 4:

```
PORT=3000
DB_USER=sa
DB_PASSWORD=ExamplePassword
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=AdventureWorks
DB_ENCRYPT=false
DB_TRUST_SERVER_CERT=true
```

### 8. Levantar la API

```bash
npm start
```

Queda corriendo en `http://localhost:3000`, accesible también desde Windows (Postman,
navegador) gracias a que `localhost` se comparte entre WSL2 y Windows.

## Endpoints

- **GET** `/api/shipmethods` — Lista los métodos de envío (`usp_ShipMethod_SelectAll`)
- **GET** `/api/purchase-orders-with-vendor` — Órdenes de compra con proveedor y método de envío, JOIN de 3 tablas (`usp_PurchaseOrder_SelectWithVendorAndShip`)
- **POST** `/api/shipmethods` — Crea un método de envío (`usp_ShipMethod_Insert`)
- **PUT** `/api/shipmethods/:id` — Actualiza un método de envío (`usp_ShipMethod_Update`)
- **DELETE** `/api/shipmethods/:id` — Elimina un método de envío (`usp_ShipMethod_Delete`)

## Datos de prueba

**GET simple**
```
GET http://localhost:3000/api/shipmethods
```

**GET con JOIN**
```
GET http://localhost:3000/api/purchase-orders-with-vendor
```

**POST (crear)**
```
POST http://localhost:3000/api/shipmethods
```
```json
{
  "name": "Same Day Delivery",
  "shipBase": 15.50,
  "shipRate": 3.25
}
```

**PUT (actualizar)** — usar el ID devuelto por el POST
```
PUT http://localhost:3000/api/shipmethods/ID
```
```json
{
  "name": "Same Day Delivery Express",
  "shipBase": 18.00,
  "shipRate": 4.00
}
```

**DELETE**
```
DELETE http://localhost:3000/api/shipmethods/ID
```

## Estructura del proyecto

```
Tarea-1-API/
├── Script sql/
│   └── 01_stored_procedures.sql
├── proyectos/
│   └── adventureworks-api/
│       ├── src/
│       │   ├── config/db.js
│       │   ├── db/pool.js
│       │   ├── controllers/shipMethodController.js
│       │   ├── routes/shipMethodRoutes.js
│       │   └── server.js
│       ├── .env.example
│       ├── .gitignore
│       ├── package.json
│       └── package-lock.json
├── codigo/
└── README.md
```

## Notas

- SQL Server corre en Docker sobre WSL2, cumpliendo el requisito de usar una distribución Linux.
- Todo el CRUD y las consultas pasan por Stored Procedures, la API solo los invoca.
- Las pruebas se hicieron con Postman desde Windows, aprovechando que localhost es compartido con WSL2.
