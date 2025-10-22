# Livestock Logistic Page Architecture Plan

## Overview
This project builds a logistic page for managing livestock (cows) with focus on mass (weight), emissions, and finances. The hierarchical structure is Farm > Land > Animal.

## Technology Stack
- Backend: Flask (Python) with SQLAlchemy and SQLite
- Frontend: Plain HTML, CSS, JavaScript

## Database Schema (Updated from relaciones_ganaderia.xlsx)

```mermaid
erDiagram
    Fincas ||--o{ Lotes : "has"
    Fincas ||--o{ Bovinos : "contains"
    Fincas ||--o{ Compras : "buys for"
    Fincas ||--o{ Ventas : "sells from"
    Fincas ||--o{ Energia_Sostenibilidad : "has"
    Fincas ||--o{ Documentos_Exportacion : "issues"
    Fincas ||--o{ Usuario_Finca : "manages"
    Lotes ||--o{ Bovinos : "contains"
    Lotes ||--o{ Documentos_Exportacion : "related to"
    Bovinos ||--o{ Bovinos : "parent of (MadreID/PadreID)"
    Bovinos ||--o{ Registros_Sanitarios : "has"
    Bovinos ||--o{ Movimientos_Animales : "involved in"
    Bovinos ||--o{ Produccion_Leche : "produces"
    Bovinos ||--o{ Pesajes_Canales : "has"
    Bovinos ||--o{ Racion_Animal : "assigned"
    Bovinos ||--o{ Documentos_Exportacion : "related to"
    Proveedores ||--o{ Insumos : "supplies"
    Proveedores ||--o{ Compras : "sells to"
    Insumos ||--o{ Ingredientes_Racion : "used in"
    Alimentacion ||--o{ Ingredientes_Racion : "composed of"
    Alimentacion ||--o{ Racion_Animal : "assigned to"
    Compras ||--o{ Compras_Detalle : "details"  // Assumed table
    Ventas ||--o{ Ventas_Detalle : "details"  // Assumed table
    Documentos_Exportacion ||--o{ Certificados : "has"
    Usuarios ||--o{ Usuario_Finca : "associated with"

    Fincas {
        string FincaID PK
        string Nombre
        string Depto
        string Municipio
        string Vereda
        float Area_ha
        string Propietario
        string Uso_Suelo
        float Lat
        float Lon
        datetime Fecha_Registro
    }

    Lotes {
        string LoteID PK
        string FincaID FK
        string Nombre_Lote
        float Area_ha
        string Cobertura
        string Sistema
        float Lat
        float Lon
        string Observaciones
    }

    Bovinos {
        string BovinoID PK
        string Caravana
        string FincaID FK
        string LoteID FK
        string Sexo
        string Raza
        datetime Fecha_Nac
        string Estado
        string MadreID FK "self-ref"
        string PadreID FK "self-ref"
        string Origen
        string Propósito
    }

    Registros_Sanitarios {
        string RegistroID PK
        string BovinoID FK
        string Tipo_Prueba
        string Resultado
        datetime Fecha_Muestra
        string Laboratorio
        string Observaciones
    }

    Movimientos_Animales {
        string MovID PK
        string BovinoID FK
        string Tipo_Mov
        datetime Fecha
        string Finca_Origen
        string Lote_Origen
        string Finca_Destino
        string Lote_Destino
        string Motivo
    }

    Produccion_Leche {
        string ProdLecheID PK
        string BovinoID FK
        datetime Fecha
        string Turno
        float Litros
        float Calidad_Grasa
        float Proteina
        float UFC
        string Observaciones
    }

    Pesajes_Canales {
        string CanalID PK
        string BovinoID FK
        datetime Fecha_Sacrificio
        float Peso_Vivo
        float Peso_Canal
        float Rendimiento
        string Planta
        string Observaciones
    }

    Proveedores {
        string ProveedorID PK
        string Nombre
        string NIT
        string Contacto
        string Telefono
        string Correo
        string Ciudad
        string Direccion
    }

    Insumos {
        string InsumoID PK
        string ProveedorID FK
        string Categoria
        string Nombre
        string Unidad
        float Precio_Unit
        string Es_Suplemento
        string Es_Medicamento
        string Observaciones
    }

    Compras {
        string CompraID PK
        string ProveedorID FK
        string FincaID FK
        datetime Fecha
        string Moneda
        float Subtotal
        float Impuestos
        float Total
        string Observaciones
    }

    Ventas {
        string VentaID PK
        string Cliente
        string Tipo_Venta
        string FincaID FK
        datetime Fecha
        string Moneda
        float Subtotal
        float Impuestos
        float Total
        string Destino
        string Observaciones
    }

    Alimentacion {
        string RacionID PK
        string Nombre_Racion
        string Tipo
        string Objetivo
        string Observaciones
    }

    Ingredientes_Racion {
        string IngRacionID PK
        string RacionID FK
        string InsumoID FK
        float PorcentajeMS
        float Costo_Estimado
    }

    Racion_Animal {
        string RacionAnimalID PK
        string RacionID FK
        string BovinoID FK
        datetime Fecha_Inicio
        datetime Fecha_Fin
        string Observaciones
    }

    Energia_Sostenibilidad {
        string EnergiaID PK
        string FincaID FK
        datetime Fecha
        string Tipo_Fuente
        float Generacion_kWh
        float Consumo_kWh
        float Emisiones_ev_CO2e_kg
        string Observaciones
    }

    Documentos_Exportacion {
        string DocExpID PK
        string FincaID FK
        string LoteID FK
        string BovinoID FK
        string Pais_Destino
        string Puerto_Embarque
        datetime Fecha_Embarque
        string Observaciones
    }

    Certificados {
        string CertID PK
        string DocExpID FK
        string Tipo_Cert
        string Codigo
        datetime Fecha_Emision
        datetime Fecha_Vencimiento
        string Entidad
        string Estado
        string Observaciones
    }

    Usuarios {
        string UsuarioID PK
        string Nombre
        string Rol
        string Correo
        string Telefono
        string Organizacion
        string Activo
    }

    Usuario_Finca {
        string UsuarioFincaID PK
        string UsuarioID FK
        string FincaID FK
        string Rol_En_Finca
        datetime Fecha_Asignacion
    }
```

## Analytics
- **Low Resources**: Alert when feed_available < threshold or water_available < threshold
- **Status**:
  - Animal: Based on weight trends, health logs
  - Land: Based on resource levels, animal productivity
  - Farm: Aggregate of lands

## Calculations
- **Energy**: Placeholder - energy = weight * 0.5 + feed_amount * 2 (needs user confirmation)
- **Emissions**: Placeholder - emissions = methane_factor * weight + co2_factor * activity (needs user confirmation)

## API Endpoints
- GET/POST/PUT/DELETE /farms
- GET/POST/PUT/DELETE /lands
- GET/POST/PUT/DELETE /animals
- GET/POST /weight_logs
- GET/POST /emission_logs
- GET/POST /finance_logs
- GET/POST /resource_logs
- GET /analytics/{entity_type}/{id}

## Frontend Structure
- Single page with sections:
  - Farm Management
  - Land Management
  - Animal Management
  - Data Input Tables
  - Analytics Dashboard

## Workflow
1. User creates farm
2. Adds lands to farm
3. Adds animals to lands
4. Inputs data via tables
5. Views analytics and calculations