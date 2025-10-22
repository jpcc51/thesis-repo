import sqlite3

# Create fresh database with all tables
conn = sqlite3.connect('livestock.db')
cursor = conn.cursor()

# Enable foreign key support
cursor.execute('PRAGMA foreign_keys = ON;')

# Create all necessary tables manually
tables_sql = [
    """CREATE TABLE fincas (
        FincaID INTEGER PRIMARY KEY,
        Nombre TEXT,
        Depto TEXT,
        Municipio TEXT,
        Vereda TEXT,
        Area_ha REAL,
        Propietario TEXT,
        Uso_Suelo TEXT,
        Lat REAL,
        Lon REAL,
        Fecha_Registro DATETIME
    )""",
    """CREATE TABLE lotes (
        LoteID INTEGER PRIMARY KEY,
        FincaID INTEGER NOT NULL,
        Nombre_Lote TEXT,
        Area_ha REAL,
        Actividad_Ganado TEXT,
        Observaciones TEXT,
        FOREIGN KEY (FincaID) REFERENCES fincas (FincaID)
    )""",
    """CREATE TABLE bovinos (
        BovinoID TEXT PRIMARY KEY,
        FincaID INTEGER NOT NULL,
        LoteID INTEGER NOT NULL,
        Sexo TEXT,
        Raza TEXT,
        Fecha_Nac DATETIME,
        Estado TEXT,
        MadreID TEXT,
        PadreID TEXT,
        Origen TEXT,
        Propósito TEXT,
        FOREIGN KEY (FincaID) REFERENCES fincas (FincaID),
        FOREIGN KEY (LoteID) REFERENCES lotes (LoteID),
        FOREIGN KEY (MadreID) REFERENCES bovinos (BovinoID),
        FOREIGN KEY (PadreID) REFERENCES bovinos (BovinoID)
    )""",
    """CREATE TABLE registros_sanitarios (
        RegistroID TEXT PRIMARY KEY,
        BovinoID TEXT NOT NULL,
        Tipo_Prueba TEXT,
        Estado_Salud TEXT,
        Resultado TEXT,
        Fecha_Muestra DATETIME,
        Laboratorio TEXT,
        Costo_Examen REAL,
        Observaciones TEXT,
        Archivo_Certificado TEXT,
        FOREIGN KEY (BovinoID) REFERENCES bovinos (BovinoID)
    )""",
    """CREATE TABLE movimientos_animales (
        MovID TEXT PRIMARY KEY,
        BovinoID TEXT NOT NULL,
        Tipo_Mov TEXT,
        Fecha DATETIME,
        Finca_Origen TEXT,
        Lote_Origen TEXT,
        Finca_Destino TEXT,
        Lote_Destino TEXT,
        Motivo TEXT,
        FOREIGN KEY (BovinoID) REFERENCES bovinos (BovinoID)
    )""",
    """CREATE TABLE pesajes_canales (
        CanalID TEXT PRIMARY KEY,
        BovinoID TEXT NOT NULL,
        Fecha_Sacrificio DATETIME,
        Peso_Vivo REAL,
        Peso_Canal REAL,
        Rendimiento REAL,
        Planta TEXT,
        Observaciones TEXT,
        FOREIGN KEY (BovinoID) REFERENCES bovinos (BovinoID)
    )""",
    """CREATE TABLE proveedores (
        ProveedorID TEXT PRIMARY KEY,
        Nombre TEXT,
        NIT TEXT,
        Contacto TEXT,
        Telefono TEXT,
        Correo TEXT,
        Ciudad TEXT,
        Direccion TEXT
    )""",
    """CREATE TABLE insumos (
        InsumoID TEXT PRIMARY KEY,
        ProveedorID TEXT NOT NULL,
        Categoria TEXT,
        Nombre TEXT,
        Unidad TEXT,
        Precio_Unit REAL,
        Es_Suplemento TEXT,
        Es_Medicamento TEXT,
        Observaciones TEXT,
        FOREIGN KEY (ProveedorID) REFERENCES proveedores (ProveedorID)
    )""",
    """CREATE TABLE compras (
        CompraID TEXT PRIMARY KEY,
        ProveedorID TEXT NOT NULL,
        FincaID INTEGER NOT NULL,
        InsumoID TEXT NOT NULL,
        Fecha DATETIME,
        Cantidad REAL,
        Precio_Unitario REAL,
        Moneda TEXT,
        Subtotal REAL,
        Impuestos REAL,
        Total REAL,
        Observaciones TEXT,
        FOREIGN KEY (ProveedorID) REFERENCES proveedores (ProveedorID),
        FOREIGN KEY (FincaID) REFERENCES fincas (FincaID),
        FOREIGN KEY (InsumoID) REFERENCES insumos (InsumoID)
    )""",
    """CREATE TABLE ventas (
        VentaID TEXT PRIMARY KEY,
        Cliente TEXT,
        Tipo_Venta TEXT,
        FincaID INTEGER NOT NULL,
        Fecha DATETIME,
        Subtotal REAL,
        Impuestos REAL,
        Total REAL,
        Destino TEXT,
        Observaciones TEXT,
        FOREIGN KEY (FincaID) REFERENCES fincas (FincaID)
    )""",
    """CREATE TABLE alimentacion (
        RacionID TEXT PRIMARY KEY,
        Nombre_Racion TEXT,
        Tipo TEXT,
        Objetivo TEXT,
        Observaciones TEXT
    )""",
    """CREATE TABLE ingredientes_racion (
        IngRacionID TEXT PRIMARY KEY,
        RacionID TEXT NOT NULL,
        InsumoID TEXT NOT NULL,
        PorcentajeMS REAL,
        Costo_Estimado REAL,
        FOREIGN KEY (RacionID) REFERENCES alimentacion (RacionID),
        FOREIGN KEY (InsumoID) REFERENCES insumos (InsumoID)
    )""",
    """CREATE TABLE racion_animal (
        RacionAnimalID TEXT PRIMARY KEY,
        RacionID TEXT NOT NULL,
        BovinoID TEXT NOT NULL,
        Fecha_Inicio DATETIME,
        Fecha_Fin DATETIME,
        Observaciones TEXT,
        FOREIGN KEY (RacionID) REFERENCES alimentacion (RacionID),
        FOREIGN KEY (BovinoID) REFERENCES bovinos (BovinoID)
    )""",
    """CREATE TABLE energia_sostenibilidad (
        EnergiaID TEXT PRIMARY KEY,
        FincaID INTEGER NOT NULL,
        Fecha DATETIME,
        Tipo_Fuente TEXT,
        Generacion_kWh REAL,
        Consumo_kWh REAL,
        Emisiones_ev_CO2e_kg REAL,
        Observaciones TEXT,
        FOREIGN KEY (FincaID) REFERENCES fincas (FincaID)
    )""",
    """CREATE TABLE documentos_exportacion (
        DocExpID TEXT PRIMARY KEY,
        FincaID INTEGER NOT NULL,
        LoteID INTEGER NOT NULL,
        BovinoID TEXT NOT NULL,
        Pais_Destino TEXT,
        Puerto_Embarque TEXT,
        Fecha_Embarque DATETIME,
        Observaciones TEXT,
        FOREIGN KEY (FincaID) REFERENCES fincas (FincaID),
        FOREIGN KEY (LoteID) REFERENCES lotes (LoteID),
        FOREIGN KEY (BovinoID) REFERENCES bovinos (BovinoID)
    )""",
    """CREATE TABLE certificados (
        CertID TEXT PRIMARY KEY,
        DocExpID TEXT NOT NULL,
        Tipo_Cert TEXT,
        Codigo TEXT,
        Fecha_Emision DATETIME,
        Fecha_Vencimiento DATETIME,
        Entidad TEXT,
        Estado TEXT,
        Observaciones TEXT,
        FOREIGN KEY (DocExpID) REFERENCES documentos_exportacion (DocExpID)
    )""",
    """CREATE TABLE usuarios (
        UsuarioID TEXT PRIMARY KEY,
        Nombre TEXT,
        Rol TEXT,
        Correo TEXT,
        Telefono TEXT,
        Organizacion TEXT,
        Activo TEXT
    )""",
    """CREATE TABLE usuario_finca (
        UsuarioFincaID TEXT PRIMARY KEY,
        UsuarioID TEXT NOT NULL,
        FincaID INTEGER NOT NULL,
        Rol_En_Finca TEXT,
        Fecha_Asignacion DATETIME,
        FOREIGN KEY (UsuarioID) REFERENCES usuarios (UsuarioID),
        FOREIGN KEY (FincaID) REFERENCES fincas (FincaID)
    )""",
    """CREATE TABLE weight_logs (
        id INTEGER PRIMARY KEY,
        animal_id TEXT NOT NULL,
        weight_kg REAL NOT NULL,
        measured_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (animal_id) REFERENCES bovinos (BovinoID)
    )""",
    """CREATE TABLE emission_logs (
        id INTEGER PRIMARY KEY,
        animal_id TEXT NOT NULL,
        co2_emissions REAL DEFAULT 0,
        methane_emissions REAL DEFAULT 0,
        logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (animal_id) REFERENCES bovinos (BovinoID)
    )""",
    """CREATE TABLE finance_logs (
        id INTEGER PRIMARY KEY,
        animal_id TEXT NOT NULL,
        cost_feed REAL DEFAULT 0,
        cost_medical REAL DEFAULT 0,
        revenue_sale REAL DEFAULT 0,
        logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (animal_id) REFERENCES bovinos (BovinoID)
    )""",
    """CREATE TABLE resource_logs (
        id INTEGER PRIMARY KEY,
        land_id INTEGER NOT NULL,
        feed_available REAL DEFAULT 0,
        water_available REAL DEFAULT 0,
        logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (land_id) REFERENCES lotes (LoteID)
    )"""
]

for sql in tables_sql:
    cursor.execute(sql)

conn.commit()

# Verify registros_sanitarios table
cursor.execute('PRAGMA table_info(registros_sanitarios)')
columns = cursor.fetchall()
print('Columns in registros_sanitarios:')
for col in columns:
    print(f'  {col[1]}: {col[2]}')
costo_examen_found = any(col[1] == 'Costo_Examen' for col in columns)
print(f'Costo_Examen column found: {costo_examen_found}')

conn.close()
print('All database tables created successfully')