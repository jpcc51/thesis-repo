from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///livestock.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# File upload configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create uploads directory if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

db = SQLAlchemy(app)

@app.route("/")
def hello_world():
    return send_from_directory("../Frontend", "index.html")

@app.route("/<path:filename>")
def serve_frontend(filename):
    return send_from_directory("../Frontend", filename)

# Database models
class Fincas(db.Model):
    __tablename__ = 'fincas'
    FincaID = db.Column(db.Integer, primary_key=True)
    Nombre = db.Column(db.String(100))
    Depto = db.Column(db.String(50))
    Municipio = db.Column(db.String(50))
    Vereda = db.Column(db.String(50))
    Area_ha = db.Column(db.Float)
    Propietario = db.Column(db.String(100))
    Uso_Suelo = db.Column(db.String(100))
    Lat = db.Column(db.Float)
    Lon = db.Column(db.Float)
    Fecha_Registro = db.Column(db.DateTime)

class Lotes(db.Model):
    __tablename__ = 'lotes'
    LoteID = db.Column(db.Integer, primary_key=True)
    FincaID = db.Column(db.Integer, db.ForeignKey('fincas.FincaID'), nullable=False)
    Nombre_Lote = db.Column(db.String(100))
    Area_ha = db.Column(db.Float)
    Actividad_Ganado = db.Column(db.String(100))  # Current livestock activity
    Observaciones = db.Column(db.Text)

class Bovinos(db.Model):
    __tablename__ = 'bovinos'
    BovinoID = db.Column(db.String(50), primary_key=True)
    FincaID = db.Column(db.Integer, db.ForeignKey('fincas.FincaID'), nullable=False)
    LoteID = db.Column(db.Integer, db.ForeignKey('lotes.LoteID'), nullable=False)
    Sexo = db.Column(db.String(10))
    Raza = db.Column(db.String(50))
    Fecha_Nac = db.Column(db.DateTime)
    Estado = db.Column(db.String(50))
    MadreID = db.Column(db.String(50), db.ForeignKey('bovinos.BovinoID'))
    PadreID = db.Column(db.String(50), db.ForeignKey('bovinos.BovinoID'))
    Origen = db.Column(db.String(100))
    Propósito = db.Column(db.String(100))

class Registros_Sanitarios(db.Model):
    __tablename__ = 'registros_sanitarios'
    RegistroID = db.Column(db.String(50), primary_key=True)
    BovinoID = db.Column(db.String(50), db.ForeignKey('bovinos.BovinoID'), nullable=False)
    Tipo_Prueba = db.Column(db.String(100))
    Estado_Salud = db.Column(db.String(20))  # Sano or Enfermo
    Resultado = db.Column(db.Text)  # Changed to Text for explanatory content
    Fecha_Muestra = db.Column(db.DateTime)
    Laboratorio = db.Column(db.String(100))
    Costo_Examen = db.Column(db.Float)  # Cost of the exam/vaccination
    Observaciones = db.Column(db.Text)
    Archivo_Certificado = db.Column(db.String(200))  # File path for uploaded certificate

class Movimientos_Animales(db.Model):
    __tablename__ = 'movimientos_animales'
    MovID = db.Column(db.String(50), primary_key=True)
    BovinoID = db.Column(db.String(50), db.ForeignKey('bovinos.BovinoID'), nullable=False)
    Tipo_Mov = db.Column(db.String(50))
    Fecha = db.Column(db.DateTime)
    Finca_Origen = db.Column(db.String(50))
    Lote_Origen = db.Column(db.String(50))
    Finca_Destino = db.Column(db.String(50))
    Lote_Destino = db.Column(db.String(50))
    Motivo = db.Column(db.String(100))


class Pesajes_Canales(db.Model):
    __tablename__ = 'pesajes_canales'
    CanalID = db.Column(db.String(50), primary_key=True)
    BovinoID = db.Column(db.String(50), db.ForeignKey('bovinos.BovinoID'), nullable=False)
    Fecha_Sacrificio = db.Column(db.DateTime)
    Peso_Vivo = db.Column(db.Float)
    Peso_Canal = db.Column(db.Float)
    Rendimiento = db.Column(db.Float)
    Planta = db.Column(db.String(100))
    Observaciones = db.Column(db.Text)

class Proveedores(db.Model):
    __tablename__ = 'proveedores'
    ProveedorID = db.Column(db.String(50), primary_key=True)
    Nombre = db.Column(db.String(100))
    NIT = db.Column(db.String(20))
    Contacto = db.Column(db.String(100))
    Telefono = db.Column(db.String(20))
    Correo = db.Column(db.String(100))
    Ciudad = db.Column(db.String(50))
    Direccion = db.Column(db.String(200))

class Insumos(db.Model):
    __tablename__ = 'insumos'
    InsumoID = db.Column(db.String(50), primary_key=True)
    ProveedorID = db.Column(db.String(50), db.ForeignKey('proveedores.ProveedorID'), nullable=False)
    Categoria = db.Column(db.String(50))
    Nombre = db.Column(db.String(100))
    Unidad = db.Column(db.String(20))
    Precio_Unit = db.Column(db.Float)
    Es_Suplemento = db.Column(db.String(5))  # Yes/No
    Es_Medicamento = db.Column(db.String(5))
    Observaciones = db.Column(db.Text)

class Compras(db.Model):
    __tablename__ = 'compras'
    CompraID = db.Column(db.String(50), primary_key=True)
    ProveedorID = db.Column(db.String(50), db.ForeignKey('proveedores.ProveedorID'), nullable=False)
    FincaID = db.Column(db.Integer, db.ForeignKey('fincas.FincaID'), nullable=False)
    InsumoID = db.Column(db.String(50), db.ForeignKey('insumos.InsumoID'), nullable=False)
    Fecha = db.Column(db.DateTime)
    Cantidad = db.Column(db.Float)
    Precio_Unitario = db.Column(db.Float)
    Moneda = db.Column(db.String(10))
    Subtotal = db.Column(db.Float)
    Impuestos = db.Column(db.Float)
    Total = db.Column(db.Float)
    Observaciones = db.Column(db.Text)

class Ventas(db.Model):
    __tablename__ = 'ventas'
    VentaID = db.Column(db.String(50), primary_key=True)
    Cliente = db.Column(db.String(100))
    Tipo_Venta = db.Column(db.String(50))
    FincaID = db.Column(db.Integer, db.ForeignKey('fincas.FincaID'), nullable=False)
    Fecha = db.Column(db.DateTime)
    Subtotal = db.Column(db.Float)
    Impuestos = db.Column(db.Float)
    Total = db.Column(db.Float)
    Destino = db.Column(db.String(100))
    Observaciones = db.Column(db.Text)

class Alimentacion(db.Model):
    __tablename__ = 'alimentacion'
    RacionID = db.Column(db.String(50), primary_key=True)
    Nombre_Racion = db.Column(db.String(100))
    Tipo = db.Column(db.String(50))
    Objetivo = db.Column(db.String(100))
    Observaciones = db.Column(db.Text)

class Ingredientes_Racion(db.Model):
    __tablename__ = 'ingredientes_racion'
    IngRacionID = db.Column(db.String(50), primary_key=True)
    RacionID = db.Column(db.String(50), db.ForeignKey('alimentacion.RacionID'), nullable=False)
    InsumoID = db.Column(db.String(50), db.ForeignKey('insumos.InsumoID'), nullable=False)
    PorcentajeMS = db.Column(db.Float)
    Costo_Estimado = db.Column(db.Float)

# Ingredientes_Racion API endpoints
@app.route('/api/ingredientes_racion', methods=['GET'])
def get_ingredientes_racion():
    ingredientes = Ingredientes_Racion.query.all()
    return jsonify([{
        'IngRacionID': i.IngRacionID,
        'RacionID': i.RacionID,
        'InsumoID': i.InsumoID,
        'PorcentajeMS': i.PorcentajeMS,
        'Costo_Estimado': i.Costo_Estimado
    } for i in ingredientes])

@app.route('/api/ingredientes_racion', methods=['POST'])
def create_ingrediente_racion():
    data = request.get_json()

    # Validate that the sum of PorcentajeMS for this ration doesn't exceed 100%
    # Calculate current total percentage for the ration (excluding the new ingredient)
    current_total = db.session.query(db.func.sum(Ingredientes_Racion.PorcentajeMS)).filter_by(RacionID=data['RacionID']).scalar() or 0
    new_percentage = data.get('PorcentajeMS', 0)

    if current_total + new_percentage > 100:
        return jsonify({
            'error': f'La suma de porcentajes MS para esta ración no puede superar 100%. '
                    f'Porcentaje actual: {current_total}%, Nuevo porcentaje: {new_percentage}%, '
                    f'Total sería: {current_total + new_percentage}%'
        }), 400

    # Auto-generate IngRacionID
    max_id = db.session.query(db.func.max(db.func.cast(db.func.substr(Ingredientes_Racion.IngRacionID, 4), db.Integer))).scalar() or 0
    next_id = max_id + 1
    ing_racion_id = f"ING{next_id:03d}"

    ingrediente = Ingredientes_Racion(
        IngRacionID=ing_racion_id,
        RacionID=data['RacionID'],
        InsumoID=data['InsumoID'],
        PorcentajeMS=data.get('PorcentajeMS'),
        Costo_Estimado=data.get('Costo_Estimado')
    )
    db.session.add(ingrediente)
    db.session.commit()
    return jsonify({'IngRacionID': ingrediente.IngRacionID}), 201

@app.route('/api/ingredientes_racion/<string:id>', methods=['GET'])
def get_ingrediente_racion(id):
    ingrediente = Ingredientes_Racion.query.get_or_404(id)
    return jsonify({
        'IngRacionID': ingrediente.IngRacionID,
        'RacionID': ingrediente.RacionID,
        'InsumoID': ingrediente.InsumoID,
        'PorcentajeMS': ingrediente.PorcentajeMS,
        'Costo_Estimado': ingrediente.Costo_Estimado
    })

@app.route('/api/ingredientes_racion/<string:id>', methods=['PUT'])
def update_ingrediente_racion(id):
    ingrediente = Ingredientes_Racion.query.get_or_404(id)
    data = request.get_json()
    ingrediente.RacionID = data.get('RacionID', ingrediente.RacionID)
    ingrediente.InsumoID = data.get('InsumoID', ingrediente.InsumoID)
    ingrediente.PorcentajeMS = data.get('PorcentajeMS', ingrediente.PorcentajeMS)
    ingrediente.Costo_Estimado = data.get('Costo_Estimado', ingrediente.Costo_Estimado)
    db.session.commit()
    return jsonify({'message': 'Ingrediente Racion updated'})

@app.route('/api/ingredientes_racion/<string:id>', methods=['DELETE'])
def delete_ingrediente_racion(id):
    ingrediente = Ingredientes_Racion.query.get_or_404(id)
    db.session.delete(ingrediente)
    db.session.commit()
    return jsonify({'message': 'Ingrediente Racion deleted'})

class Racion_Animal(db.Model):
    __tablename__ = 'racion_animal'
    RacionAnimalID = db.Column(db.String(50), primary_key=True)
    RacionID = db.Column(db.String(50), db.ForeignKey('alimentacion.RacionID'), nullable=False)
    BovinoID = db.Column(db.String(50), db.ForeignKey('bovinos.BovinoID'), nullable=False)
    Fecha_Inicio = db.Column(db.DateTime)  # Fecha de inicio de este tipo de alimentación
    Fecha_Fin = db.Column(db.DateTime)  # Fecha estimada de finalización de la misma
    Observaciones = db.Column(db.Text)

class Energia_Sostenibilidad(db.Model):
    __tablename__ = 'energia_sostenibilidad'
    EnergiaID = db.Column(db.String(50), primary_key=True)
    FincaID = db.Column(db.Integer, db.ForeignKey('fincas.FincaID'), nullable=False)
    Fecha = db.Column(db.DateTime)
    Tipo_Fuente = db.Column(db.String(50))
    Generacion_kWh = db.Column(db.Float)
    Consumo_kWh = db.Column(db.Float)
    Emisiones_ev_CO2e_kg = db.Column(db.Float)
    Observaciones = db.Column(db.Text)

class Documentos_Exportacion(db.Model):
    __tablename__ = 'documentos_exportacion'
    DocExpID = db.Column(db.String(50), primary_key=True)
    FincaID = db.Column(db.Integer, db.ForeignKey('fincas.FincaID'), nullable=False)
    LoteID = db.Column(db.Integer, db.ForeignKey('lotes.LoteID'), nullable=False)
    BovinoID = db.Column(db.String(50), db.ForeignKey('bovinos.BovinoID'), nullable=False)
    Pais_Destino = db.Column(db.String(50))
    Puerto_Embarque = db.Column(db.String(100))
    Fecha_Embarque = db.Column(db.DateTime)
    Observaciones = db.Column(db.Text)

class Certificados(db.Model):
    __tablename__ = 'certificados'
    CertID = db.Column(db.String(50), primary_key=True)
    DocExpID = db.Column(db.String(50), db.ForeignKey('documentos_exportacion.DocExpID'), nullable=False)
    Tipo_Cert = db.Column(db.String(50))
    Codigo = db.Column(db.String(50))
    Fecha_Emision = db.Column(db.DateTime)
    Fecha_Vencimiento = db.Column(db.DateTime)
    Entidad = db.Column(db.String(100))
    Estado = db.Column(db.String(50))
    Observaciones = db.Column(db.Text)

class Usuarios(db.Model):
    __tablename__ = 'usuarios'
    UsuarioID = db.Column(db.String(50), primary_key=True)
    Nombre = db.Column(db.String(100))
    Rol = db.Column(db.String(50))
    Correo = db.Column(db.String(100))
    Telefono = db.Column(db.String(20))
    Organizacion = db.Column(db.String(100))
    Activo = db.Column(db.String(5))  # Yes/No

class Usuario_Finca(db.Model):
    __tablename__ = 'usuario_finca'
    UsuarioFincaID = db.Column(db.String(50), primary_key=True)
    UsuarioID = db.Column(db.String(50), db.ForeignKey('usuarios.UsuarioID'), nullable=False)
    FincaID = db.Column(db.Integer, db.ForeignKey('fincas.FincaID'), nullable=False)
    Rol_En_Finca = db.Column(db.String(50))
    Fecha_Asignacion = db.Column(db.DateTime)

# Additional models for logs (previously missing)
class WeightLog(db.Model):
    __tablename__ = 'weight_logs'
    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.String(50), db.ForeignKey('bovinos.BovinoID'), nullable=False)
    weight_kg = db.Column(db.Float, nullable=False)
    measured_at = db.Column(db.DateTime, default=datetime.utcnow)

class EmissionLog(db.Model):
    __tablename__ = 'emission_logs'
    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.String(50), db.ForeignKey('bovinos.BovinoID'), nullable=False)
    co2_emissions = db.Column(db.Float, default=0)
    methane_emissions = db.Column(db.Float, default=0)
    logged_at = db.Column(db.DateTime, default=datetime.utcnow)

# Helper functions for file handling
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Create database tables
with app.app_context():
    db.create_all()

# API Endpoints

# Registros Sanitarios
@app.route('/api/registros_sanitarios', methods=['GET'])
def get_registros_sanitarios():
    registros = Registros_Sanitarios.query.all()
    return jsonify([{
        'RegistroID': r.RegistroID,
        'BovinoID': r.BovinoID,
        'Tipo_Prueba': r.Tipo_Prueba,
        'Estado_Salud': r.Estado_Salud,
        'Resultado': r.Resultado,
        'Fecha_Muestra': r.Fecha_Muestra.isoformat() if r.Fecha_Muestra else None,
        'Laboratorio': r.Laboratorio,
        'Costo_Examen': r.Costo_Examen,
        'Observaciones': r.Observaciones,
        'Archivo_Certificado': r.Archivo_Certificado
    } for r in registros])

@app.route('/api/registros_sanitarios', methods=['POST'])
def create_registro_sanitario():
    # Handle file upload
    file_path = None
    if 'archivo_certificado' in request.files:
        file = request.files['archivo_certificado']
        if file and file.filename != '' and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Add timestamp to avoid conflicts
            import time
            timestamp = str(int(time.time()))
            filename = f"{timestamp}_{filename}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)

    # Get form data (multipart/form-data instead of JSON)
    registro_id = request.form.get('RegistroID')
    if not registro_id:
        # Generate RegistroID as string (e.g., "RS001", "RS002", etc.)
        max_id = db.session.query(db.func.max(db.func.cast(db.func.substr(Registros_Sanitarios.RegistroID, 3), db.Integer))).scalar() or 0
        next_id = max_id + 1
        registro_id = f"RS{next_id:03d}"

    registro = Registros_Sanitarios(
        RegistroID=registro_id,
        BovinoID=request.form.get('BovinoID'),
        Tipo_Prueba=request.form.get('Tipo_Prueba'),
        Estado_Salud=request.form.get('Estado_Salud'),
        Resultado=request.form.get('Resultado'),
        Fecha_Muestra=datetime.fromisoformat(request.form.get('Fecha_Muestra')) if request.form.get('Fecha_Muestra') else None,
        Laboratorio=request.form.get('Laboratorio'),
        Costo_Examen=float(request.form.get('Costo_Examen')) if request.form.get('Costo_Examen') else None,
        Observaciones=request.form.get('Observaciones'),
        Archivo_Certificado=file_path
    )
    db.session.add(registro)
    db.session.commit()
    return jsonify({'RegistroID': registro.RegistroID}), 201

@app.route('/api/registros_sanitarios/<string:id>', methods=['GET'])
def get_registro_sanitario(id):
    registro = Registros_Sanitarios.query.get_or_404(id)
    return jsonify({
        'RegistroID': registro.RegistroID,
        'BovinoID': registro.BovinoID,
        'Tipo_Prueba': registro.Tipo_Prueba,
        'Estado_Salud': registro.Estado_Salud,
        'Resultado': registro.Resultado,
        'Fecha_Muestra': registro.Fecha_Muestra.isoformat() if registro.Fecha_Muestra else None,
        'Laboratorio': registro.Laboratorio,
        'Costo_Examen': registro.Costo_Examen,
        'Observaciones': registro.Observaciones,
        'Archivo_Certificado': registro.Archivo_Certificado
    })

@app.route('/api/registros_sanitarios/<string:id>', methods=['PUT'])
def update_registro_sanitario(id):
    registro = Registros_Sanitarios.query.get_or_404(id)
    data = request.get_json()
    registro.Tipo_Prueba = data.get('Tipo_Prueba', registro.Tipo_Prueba)
    registro.Estado_Salud = data.get('Estado_Salud', registro.Estado_Salud)
    registro.Resultado = data.get('Resultado', registro.Resultado)
    registro.Fecha_Muestra = datetime.fromisoformat(data['Fecha_Muestra']) if data.get('Fecha_Muestra') else registro.Fecha_Muestra
    registro.Laboratorio = data.get('Laboratorio', registro.Laboratorio)
    registro.Costo_Examen = data.get('Costo_Examen', registro.Costo_Examen)
    registro.Observaciones = data.get('Observaciones', registro.Observaciones)
    registro.Archivo_Certificado = data.get('Archivo_Certificado', registro.Archivo_Certificado)
    db.session.commit()
    return jsonify({'message': 'Registro Sanitario updated'})

@app.route('/api/registros_sanitarios/<string:id>', methods=['DELETE'])
def delete_registro_sanitario(id):
    registro = Registros_Sanitarios.query.get_or_404(id)
    db.session.delete(registro)
    db.session.commit()
    return jsonify({'message': 'Registro Sanitario deleted'})

# Fincas
@app.route('/api/fincas', methods=['GET'])
def get_fincas():
    fincas = Fincas.query.all()
    print("Fetched fincas:", len(fincas))  # Debug log
    return jsonify([{
        'FincaID': f.FincaID,
        'Nombre': f.Nombre,
        'Depto': f.Depto,
        'Municipio': f.Municipio,
        'Vereda': f.Vereda,
        'Area_ha': f.Area_ha,
        'Propietario': f.Propietario,
        'Uso_Suelo': f.Uso_Suelo,
        'Lat': f.Lat,
        'Lon': f.Lon,
        'Fecha_Registro': f.Fecha_Registro.isoformat() if f.Fecha_Registro else None
    } for f in fincas])

@app.route('/api/fincas', methods=['POST'])
def create_finca():
    data = request.get_json()
    print("Received data:", data)  # Debug log
    try:
        # Auto-increment FincaID starting from 1
        max_id = db.session.query(db.func.max(Fincas.FincaID)).scalar() or 0
        next_id = max_id + 1

        finca = Fincas(
            FincaID=next_id,
            Nombre=data.get('Nombre'),
            Depto=data.get('Depto'),
            Municipio=data.get('Municipio'),
            Area_ha=data.get('Area_ha'),
            Propietario=data.get('Propietario'),
            Uso_Suelo=data.get('Uso_Suelo'),
            Lat=data.get('Lat'),
            Lon=data.get('Lon'),
            Fecha_Registro=datetime.fromisoformat(data['Fecha_Registro']) if data.get('Fecha_Registro') else None
        )
        db.session.add(finca)
        db.session.commit()
        print("Finca created successfully:", finca.FincaID)  # Debug log
        return jsonify({'FincaID': finca.FincaID}), 201
    except Exception as e:
        print("Error creating finca:", str(e))  # Debug log
        return jsonify({'error': str(e)}), 400

@app.route('/api/fincas/<int:id>', methods=['GET'])
def get_finca(id):
    finca = Fincas.query.get_or_404(id)
    return jsonify({
        'FincaID': finca.FincaID,
        'Nombre': finca.Nombre,
        'Depto': finca.Depto,
        'Municipio': finca.Municipio,
        'Vereda': finca.Vereda,
        'Area_ha': finca.Area_ha,
        'Propietario': finca.Propietario,
        'Uso_Suelo': finca.Uso_Suelo,
        'Lat': finca.Lat,
        'Lon': finca.Lon,
        'Fecha_Registro': finca.Fecha_Registro.isoformat() if finca.Fecha_Registro else None
    })

@app.route('/api/fincas/<int:id>', methods=['PUT'])
def update_finca(id):
    finca = Fincas.query.get_or_404(id)
    data = request.get_json()
    finca.Nombre = data.get('Nombre', finca.Nombre)
    finca.Depto = data.get('Depto', finca.Depto)
    finca.Municipio = data.get('Municipio', finca.Municipio)
    finca.Vereda = data.get('Vereda', finca.Vereda)
    finca.Area_ha = data.get('Area_ha', finca.Area_ha)
    finca.Propietario = data.get('Propietario', finca.Propietario)
    finca.Uso_Suelo = data.get('Uso_Suelo', finca.Uso_Suelo)
    finca.Lat = data.get('Lat', finca.Lat)
    finca.Lon = data.get('Lon', finca.Lon)
    finca.Fecha_Registro = datetime.fromisoformat(data['Fecha_Registro']) if data.get('Fecha_Registro') else finca.Fecha_Registro
    db.session.commit()
    return jsonify({'message': 'Finca updated'})

@app.route('/api/fincas/<int:id>', methods=['DELETE'])
def delete_finca(id):
    finca = Fincas.query.get_or_404(id)
    db.session.delete(finca)
    db.session.commit()
    return jsonify({'message': 'Finca deleted'})

# Lotes
@app.route('/api/lotes', methods=['GET'])
def get_lotes():
    lotes = Lotes.query.all()
    return jsonify([{
        'LoteID': l.LoteID,
        'FincaID': l.FincaID,
        'Nombre_Lote': l.Nombre_Lote,
        'Area_ha': l.Area_ha,
        'Actividad_Ganado': l.Actividad_Ganado,
        'Observaciones': l.Observaciones
    } for l in lotes])

@app.route('/api/lotes', methods=['POST'])
def create_lote():
    data = request.get_json()
    # Auto-increment LoteID
    max_id = db.session.query(db.func.max(Lotes.LoteID)).scalar() or 0
    next_id = max_id + 1

    lote = Lotes(
        LoteID=next_id,
        FincaID=data['FincaID'],
        Nombre_Lote=data.get('Nombre_Lote'),
        Area_ha=data.get('Area_ha'),
        Actividad_Ganado=data.get('Actividad_Ganado'),
        Observaciones=data.get('Observaciones')
    )
    db.session.add(lote)
    db.session.commit()
    return jsonify({'LoteID': lote.LoteID}), 201

@app.route('/api/lotes/<int:id>', methods=['GET'])
def get_lote(id):
    lote = Lotes.query.get_or_404(id)
    return jsonify({
        'LoteID': lote.LoteID,
        'FincaID': lote.FincaID,
        'Nombre_Lote': lote.Nombre_Lote,
        'Area_ha': lote.Area_ha,
        'Actividad_Ganado': lote.Actividad_Ganado,
        'Observaciones': lote.Observaciones
    })

@app.route('/api/lotes/<int:id>', methods=['PUT'])
def update_lote(id):
    lote = Lotes.query.get_or_404(id)
    data = request.get_json()
    lote.Nombre_Lote = data.get('Nombre_Lote', lote.Nombre_Lote)
    lote.Area_ha = data.get('Area_ha', lote.Area_ha)
    lote.Actividad_Ganado = data.get('Actividad_Ganado', lote.Actividad_Ganado)
    lote.Observaciones = data.get('Observaciones', lote.Observaciones)
    db.session.commit()
    return jsonify({'message': 'Lote updated'})

@app.route('/api/lotes/<int:id>', methods=['DELETE'])
def delete_lote(id):
    lote = Lotes.query.get_or_404(id)
    db.session.delete(lote)
    db.session.commit()
    return jsonify({'message': 'Lote deleted'})

# Bovinos
@app.route('/api/bovinos', methods=['GET'])
def get_bovinos():
    bovinos = Bovinos.query.all()
    return jsonify([{
        'BovinoID': b.BovinoID,
        'FincaID': b.FincaID,
        'LoteID': b.LoteID,
        'Sexo': b.Sexo,
        'Raza': b.Raza,
        'Fecha_Nac': b.Fecha_Nac.isoformat() if b.Fecha_Nac else None,
        'Estado': b.Estado,
        'MadreID': b.MadreID,
        'PadreID': b.PadreID,
        'Origen': b.Origen,
        'Propósito': b.Propósito
    } for b in bovinos])

@app.route('/api/bovinos', methods=['POST'])
def create_bovino():
    data = request.get_json()
    bovino = Bovinos(
        BovinoID=data['BovinoID'],
        FincaID=data['FincaID'],
        LoteID=data['LoteID'],
        Sexo=data.get('Sexo'),
        Raza=data.get('Raza'),
        Fecha_Nac=datetime.fromisoformat(data['Fecha_Nac']) if data.get('Fecha_Nac') else None,
        Estado=data.get('Estado'),
        MadreID=data.get('MadreID'),
        PadreID=data.get('PadreID'),
        Origen=data.get('Origen'),
        Propósito=data.get('Propósito')
    )
    db.session.add(bovino)
    db.session.commit()
    return jsonify({'BovinoID': bovino.BovinoID}), 201

@app.route('/api/bovinos/<string:id>', methods=['GET'])
def get_bovino(id):
    bovino = Bovinos.query.get_or_404(id)
    return jsonify({
        'BovinoID': bovino.BovinoID,
        'FincaID': bovino.FincaID,
        'LoteID': bovino.LoteID,
        'Sexo': bovino.Sexo,
        'Raza': bovino.Raza,
        'Fecha_Nac': bovino.Fecha_Nac.isoformat() if bovino.Fecha_Nac else None,
        'Estado': bovino.Estado,
        'MadreID': bovino.MadreID,
        'PadreID': bovino.PadreID,
        'Origen': bovino.Origen,
        'Propósito': bovino.Propósito
    })

@app.route('/api/bovinos/<string:id>', methods=['PUT'])
def update_bovino(id):
    bovino = Bovinos.query.get_or_404(id)
    data = request.get_json()
    bovino.Sexo = data.get('Sexo', bovino.Sexo)
    bovino.Raza = data.get('Raza', bovino.Raza)
    bovino.Fecha_Nac = datetime.fromisoformat(data['Fecha_Nac']) if data.get('Fecha_Nac') else bovino.Fecha_Nac
    bovino.Estado = data.get('Estado', bovino.Estado)
    bovino.MadreID = data.get('MadreID', bovino.MadreID)
    bovino.PadreID = data.get('PadreID', bovino.PadreID)
    bovino.Origen = data.get('Origen', bovino.Origen)
    bovino.Propósito = data.get('Propósito', bovino.Propósito)
    db.session.commit()
    return jsonify({'message': 'Bovino updated'})

@app.route('/api/bovinos/<string:id>', methods=['DELETE'])
def delete_bovino(id):
    bovino = Bovinos.query.get_or_404(id)
    db.session.delete(bovino)
    db.session.commit()
    return jsonify({'message': 'Bovino deleted'})

# Movimientos Animales
@app.route('/api/movimientos_animales', methods=['GET'])
def get_movimientos_animales():
    movimientos = Movimientos_Animales.query.all()
    return jsonify([{
        'MovID': m.MovID,
        'BovinoID': m.BovinoID,
        'Tipo_Mov': m.Tipo_Mov,
        'Fecha': m.Fecha.isoformat() if m.Fecha else None,
        'Finca_Origen': m.Finca_Origen,
        'Lote_Origen': m.Lote_Origen,
        'Finca_Destino': m.Finca_Destino,
        'Lote_Destino': m.Lote_Destino,
        'Motivo': m.Motivo
    } for m in movimientos])

@app.route('/api/movimientos_animales', methods=['POST'])
def create_movimiento_animal():
    data = request.get_json()
    # Auto-generate MovID
    max_id = db.session.query(db.func.max(db.func.cast(db.func.substr(Movimientos_Animales.MovID, 4), db.Integer))).scalar() or 0
    next_id = max_id + 1
    mov_id = f"MOV{next_id:03d}"

    movimiento = Movimientos_Animales(
        MovID=mov_id,
        BovinoID=data['BovinoID'],
        Tipo_Mov=data.get('Tipo_Mov'),
        Fecha=datetime.fromisoformat(data['Fecha']) if data.get('Fecha') else None,
        Finca_Origen=data.get('Finca_Origen'),
        Lote_Origen=data.get('Lote_Origen'),
        Finca_Destino=data.get('Finca_Destino'),
        Lote_Destino=data.get('Lote_Destino'),
        Motivo=data.get('Motivo')
    )
    db.session.add(movimiento)
    db.session.commit()
    return jsonify({'MovID': movimiento.MovID}), 201

@app.route('/api/movimientos_animales/<string:id>', methods=['GET'])
def get_movimiento_animal(id):
    movimiento = Movimientos_Animales.query.get_or_404(id)
    return jsonify({
        'MovID': movimiento.MovID,
        'BovinoID': movimiento.BovinoID,
        'Tipo_Mov': movimiento.Tipo_Mov,
        'Fecha': movimiento.Fecha.isoformat() if movimiento.Fecha else None,
        'Finca_Origen': movimiento.Finca_Origen,
        'Lote_Origen': movimiento.Lote_Origen,
        'Finca_Destino': movimiento.Finca_Destino,
        'Lote_Destino': movimiento.Lote_Destino,
        'Motivo': movimiento.Motivo
    })

@app.route('/api/movimientos_animales/<string:id>', methods=['PUT'])
def update_movimiento_animal(id):
    movimiento = Movimientos_Animales.query.get_or_404(id)
    data = request.get_json()
    movimiento.Tipo_Mov = data.get('Tipo_Mov', movimiento.Tipo_Mov)
    movimiento.Fecha = datetime.fromisoformat(data['Fecha']) if data.get('Fecha') else movimiento.Fecha
    movimiento.Finca_Origen = data.get('Finca_Origen', movimiento.Finca_Origen)
    movimiento.Lote_Origen = data.get('Lote_Origen', movimiento.Lote_Origen)
    movimiento.Finca_Destino = data.get('Finca_Destino', movimiento.Finca_Destino)
    movimiento.Lote_Destino = data.get('Lote_Destino', movimiento.Lote_Destino)
    movimiento.Motivo = data.get('Motivo', movimiento.Motivo)
    db.session.commit()
    return jsonify({'message': 'Movimiento Animal updated'})

@app.route('/api/movimientos_animales/<string:id>', methods=['DELETE'])
def delete_movimiento_animal(id):
    movimiento = Movimientos_Animales.query.get_or_404(id)
    db.session.delete(movimiento)
    db.session.commit()
    return jsonify({'message': 'Movimiento Animal deleted'})

# Pesajes Canales
@app.route('/api/pesajes_canales', methods=['GET'])
def get_pesajes_canales():
    pesajes = Pesajes_Canales.query.all()
    return jsonify([{
        'CanalID': p.CanalID,
        'BovinoID': p.BovinoID,
        'Fecha_Sacrificio': p.Fecha_Sacrificio.isoformat() if p.Fecha_Sacrificio else None,
        'Peso_Vivo': p.Peso_Vivo,
        'Peso_Canal': p.Peso_Canal,
        'Rendimiento': p.Rendimiento,
        'Planta': p.Planta,
        'Observaciones': p.Observaciones
    } for p in pesajes])

@app.route('/api/pesajes_canales', methods=['POST'])
def create_pesaje_canal():
    data = request.get_json()
    # Auto-generate CanalID
    max_id = db.session.query(db.func.max(db.func.cast(db.func.substr(Pesajes_Canales.CanalID, 4), db.Integer))).scalar() or 0
    next_id = max_id + 1
    canal_id = f"CAN{next_id:03d}"

    pesaje = Pesajes_Canales(
        CanalID=canal_id,
        BovinoID=data['BovinoID'],
        Fecha_Sacrificio=datetime.fromisoformat(data['Fecha_Sacrificio']) if data.get('Fecha_Sacrificio') else None,
        Peso_Vivo=data.get('Peso_Vivo'),
        Peso_Canal=data.get('Peso_Canal'),
        Rendimiento=data.get('Rendimiento'),
        Planta=data.get('Planta'),
        Observaciones=data.get('Observaciones')
    )
    db.session.add(pesaje)
    db.session.commit()
    return jsonify({'CanalID': pesaje.CanalID}), 201

@app.route('/api/pesajes_canales/<string:id>', methods=['GET'])
def get_pesaje_canal(id):
    pesaje = Pesajes_Canales.query.get_or_404(id)
    return jsonify({
        'CanalID': pesaje.CanalID,
        'BovinoID': pesaje.BovinoID,
        'Fecha_Sacrificio': pesaje.Fecha_Sacrificio.isoformat() if pesaje.Fecha_Sacrificio else None,
        'Peso_Vivo': pesaje.Peso_Vivo,
        'Peso_Canal': pesaje.Peso_Canal,
        'Rendimiento': pesaje.Rendimiento,
        'Planta': pesaje.Planta,
        'Observaciones': pesaje.Observaciones
    })

@app.route('/api/pesajes_canales/<string:id>', methods=['PUT'])
def update_pesaje_canal(id):
    pesaje = Pesajes_Canales.query.get_or_404(id)
    data = request.get_json()
    pesaje.Fecha_Sacrificio = datetime.fromisoformat(data['Fecha_Sacrificio']) if data.get('Fecha_Sacrificio') else pesaje.Fecha_Sacrificio
    pesaje.Peso_Vivo = data.get('Peso_Vivo', pesaje.Peso_Vivo)
    pesaje.Peso_Canal = data.get('Peso_Canal', pesaje.Peso_Canal)
    pesaje.Rendimiento = data.get('Rendimiento', pesaje.Rendimiento)
    pesaje.Planta = data.get('Planta', pesaje.Planta)
    pesaje.Observaciones = data.get('Observaciones', pesaje.Observaciones)
    db.session.commit()
    return jsonify({'message': 'Pesaje Canal updated'})

@app.route('/api/pesajes_canales/<string:id>', methods=['DELETE'])
def delete_pesaje_canal(id):
    pesaje = Pesajes_Canales.query.get_or_404(id)
    db.session.delete(pesaje)
    db.session.commit()
    return jsonify({'message': 'Pesaje Canal deleted'})

# Weight Logs
@app.route('/api/weight_logs', methods=['GET'])
def get_weight_logs():
    logs = WeightLog.query.all()
    return jsonify([{
        'id': w.id,
        'animal_id': w.animal_id,
        'weight_kg': w.weight_kg,
        'measured_at': w.measured_at.isoformat()
    } for w in logs])

@app.route('/api/weight_logs', methods=['POST'])
def create_weight_log():
    data = request.get_json()
    log = WeightLog(
        animal_id=data['animal_id'],
        weight_kg=data['weight_kg'],
        measured_at=datetime.fromisoformat(data['measured_at']) if data.get('measured_at') else datetime.utcnow()
    )
    db.session.add(log)
    db.session.commit()
    return jsonify({'id': log.id}), 201

# Proveedores
@app.route('/api/proveedores', methods=['GET'])
def get_proveedores():
    proveedores = Proveedores.query.all()
    return jsonify([{
        'ProveedorID': p.ProveedorID,
        'Nombre': p.Nombre,
        'NIT': p.NIT,
        'Contacto': p.Contacto,
        'Telefono': p.Telefono,
        'Correo': p.Correo,
        'Ciudad': p.Ciudad,
        'Direccion': p.Direccion
    } for p in proveedores])

@app.route('/api/proveedores', methods=['POST'])
def create_proveedor():
    data = request.get_json()
    # Auto-generate ProveedorID
    max_id = db.session.query(db.func.max(db.func.cast(db.func.substr(Proveedores.ProveedorID, 4), db.Integer))).scalar() or 0
    next_id = max_id + 1
    proveedor_id = f"PRO{next_id:03d}"

    proveedor = Proveedores(
        ProveedorID=proveedor_id,
        Nombre=data['Nombre'],
        NIT=data.get('NIT'),
        Contacto=data.get('Contacto'),
        Telefono=data.get('Telefono'),
        Correo=data.get('Correo'),
        Ciudad=data.get('Ciudad'),
        Direccion=data.get('Direccion')
    )
    db.session.add(proveedor)
    db.session.commit()
    return jsonify({'ProveedorID': proveedor.ProveedorID}), 201

@app.route('/api/proveedores/<string:id>', methods=['GET'])
def get_proveedor(id):
    proveedor = Proveedores.query.get_or_404(id)
    return jsonify({
        'ProveedorID': proveedor.ProveedorID,
        'Nombre': proveedor.Nombre,
        'NIT': proveedor.NIT,
        'Contacto': proveedor.Contacto,
        'Telefono': proveedor.Telefono,
        'Correo': proveedor.Correo,
        'Ciudad': proveedor.Ciudad,
        'Direccion': proveedor.Direccion
    })

@app.route('/api/proveedores/<string:id>', methods=['PUT'])
def update_proveedor(id):
    proveedor = Proveedores.query.get_or_404(id)
    data = request.get_json()
    proveedor.Nombre = data.get('Nombre', proveedor.Nombre)
    proveedor.NIT = data.get('NIT', proveedor.NIT)
    proveedor.Contacto = data.get('Contacto', proveedor.Contacto)
    proveedor.Telefono = data.get('Telefono', proveedor.Telefono)
    proveedor.Correo = data.get('Correo', proveedor.Correo)
    proveedor.Ciudad = data.get('Ciudad', proveedor.Ciudad)
    proveedor.Direccion = data.get('Direccion', proveedor.Direccion)
    db.session.commit()
    return jsonify({'message': 'Proveedor updated'})

@app.route('/api/proveedores/<string:id>', methods=['DELETE'])
def delete_proveedor(id):
    proveedor = Proveedores.query.get_or_404(id)
    db.session.delete(proveedor)
    db.session.commit()
    return jsonify({'message': 'Proveedor deleted'})

# Insumos
@app.route('/api/insumos', methods=['GET'])
def get_insumos():
    insumos = Insumos.query.all()
    return jsonify([{
        'InsumoID': i.InsumoID,
        'ProveedorID': i.ProveedorID,
        'Categoria': i.Categoria,
        'Nombre': i.Nombre,
        'Unidad': i.Unidad,
        'Precio_Unit': i.Precio_Unit,
        'Es_Suplemento': i.Es_Suplemento,
        'Es_Medicamento': i.Es_Medicamento,
        'Observaciones': i.Observaciones
    } for i in insumos])

@app.route('/api/insumos', methods=['POST'])
def create_insumo():
    data = request.get_json()
    # Auto-generate InsumoID
    max_id = db.session.query(db.func.max(db.func.cast(db.func.substr(Insumos.InsumoID, 4), db.Integer))).scalar() or 0
    next_id = max_id + 1
    insumo_id = f"INS{next_id:03d}"

    insumo = Insumos(
        InsumoID=insumo_id,
        ProveedorID=data['ProveedorID'],
        Categoria=data.get('Categoria'),
        Nombre=data.get('Nombre'),
        Unidad=data.get('Unidad'),
        Precio_Unit=data.get('Precio_Unit'),
        Es_Suplemento=data.get('Es_Suplemento'),
        Es_Medicamento=data.get('Es_Medicamento'),
        Observaciones=data.get('Observaciones')
    )
    db.session.add(insumo)
    db.session.commit()
    return jsonify({'InsumoID': insumo.InsumoID}), 201

@app.route('/api/insumos/<string:id>', methods=['GET'])
def get_insumo(id):
    insumo = Insumos.query.get_or_404(id)
    return jsonify({
        'InsumoID': insumo.InsumoID,
        'ProveedorID': insumo.ProveedorID,
        'Categoria': insumo.Categoria,
        'Nombre': insumo.Nombre,
        'Unidad': insumo.Unidad,
        'Precio_Unit': insumo.Precio_Unit,
        'Es_Suplemento': insumo.Es_Suplemento,
        'Es_Medicamento': insumo.Es_Medicamento,
        'Observaciones': insumo.Observaciones
    })

@app.route('/api/insumos/<string:id>', methods=['PUT'])
def update_insumo(id):
    insumo = Insumos.query.get_or_404(id)
    data = request.get_json()
    insumo.ProveedorID = data.get('ProveedorID', insumo.ProveedorID)
    insumo.Categoria = data.get('Categoria', insumo.Categoria)
    insumo.Nombre = data.get('Nombre', insumo.Nombre)
    insumo.Unidad = data.get('Unidad', insumo.Unidad)
    insumo.Precio_Unit = data.get('Precio_Unit', insumo.Precio_Unit)
    insumo.Es_Suplemento = data.get('Es_Suplemento', insumo.Es_Suplemento)
    insumo.Es_Medicamento = data.get('Es_Medicamento', insumo.Es_Medicamento)
    insumo.Observaciones = data.get('Observaciones', insumo.Observaciones)
    db.session.commit()
    return jsonify({'message': 'Insumo updated'})

@app.route('/api/insumos/<string:id>', methods=['DELETE'])
def delete_insumo(id):
    insumo = Insumos.query.get_or_404(id)
    db.session.delete(insumo)
    db.session.commit()
    return jsonify({'message': 'Insumo deleted'})

# Emission Logs
@app.route('/api/emission_logs', methods=['GET'])
def get_emission_logs():
    logs = EmissionLog.query.all()
    return jsonify([{
        'id': e.id,
        'animal_id': e.animal_id,
        'co2_emissions': e.co2_emissions,
        'methane_emissions': e.methane_emissions,
        'logged_at': e.logged_at.isoformat()
    } for e in logs])

@app.route('/api/emission_logs', methods=['POST'])
def create_emission_log():
    data = request.get_json()
    log = EmissionLog(
        animal_id=data['animal_id'],
        co2_emissions=data.get('co2_emissions', 0),
        methane_emissions=data.get('methane_emissions', 0),
        logged_at=datetime.fromisoformat(data['logged_at']) if data.get('logged_at') else datetime.utcnow()
    )
    db.session.add(log)
    db.session.commit()
    return jsonify({'id': log.id}), 201

# Finance Logs
@app.route('/api/finance_logs', methods=['GET'])
def get_finance_logs():
    logs = FinanceLog.query.all()
    return jsonify([{
        'id': f.id,
        'animal_id': f.animal_id,
        'cost_feed': f.cost_feed,
        'cost_medical': f.cost_medical,
        'revenue_sale': f.revenue_sale,
        'logged_at': f.logged_at.isoformat()
    } for f in logs])

@app.route('/api/finance_logs', methods=['POST'])
def create_finance_log():
    data = request.get_json()
    log = FinanceLog(
        animal_id=data['animal_id'],
        cost_feed=data.get('cost_feed', 0),
        cost_medical=data.get('cost_medical', 0),
        revenue_sale=data.get('revenue_sale', 0),
        logged_at=datetime.fromisoformat(data['logged_at']) if data.get('logged_at') else datetime.utcnow()
    )
    db.session.add(log)
    db.session.commit()
    return jsonify({'id': log.id}), 201

# Resource Logs
@app.route('/api/resource_logs', methods=['GET'])
def get_resource_logs():
    logs = ResourceLog.query.all()
    return jsonify([{
        'id': r.id,
        'land_id': r.land_id,
        'feed_available': r.feed_available,
        'water_available': r.water_available,
        'logged_at': r.logged_at.isoformat()
    } for r in logs])

@app.route('/api/resource_logs', methods=['POST'])
def create_resource_log():
    data = request.get_json()
    log = ResourceLog(
        land_id=data['land_id'],
        feed_available=data.get('feed_available', 0),
        water_available=data.get('water_available', 0),
        logged_at=datetime.fromisoformat(data['logged_at']) if data.get('logged_at') else datetime.utcnow()
    )
    db.session.add(log)
    db.session.commit()
    return jsonify({'id': log.id}), 201

# Compras
@app.route('/api/compras', methods=['GET'])
def get_compras():
    compras = Compras.query.all()
    return jsonify([{
        'CompraID': c.CompraID,
        'ProveedorID': c.ProveedorID,
        'FincaID': c.FincaID,
        'InsumoID': c.InsumoID,
        'Fecha': c.Fecha.isoformat() if c.Fecha else None,
        'Cantidad': c.Cantidad,
        'Precio_Unitario': c.Precio_Unitario,
        'Moneda': c.Moneda,
        'Subtotal': c.Subtotal,
        'Impuestos': c.Impuestos,
        'Total': c.Total,
        'Observaciones': c.Observaciones
    } for c in compras])

@app.route('/api/compras', methods=['POST'])
def create_compra():
    data = request.get_json()
    # Auto-generate CompraID
    max_id = db.session.query(db.func.max(db.func.cast(db.func.substr(Compras.CompraID, 4), db.Integer))).scalar() or 0
    next_id = max_id + 1
    compra_id = f"COM{next_id:03d}"

    compra = Compras(
        CompraID=compra_id,
        ProveedorID=data['ProveedorID'],
        FincaID=data['FincaID'],
        InsumoID=data['InsumoID'],
        Fecha=datetime.fromisoformat(data['Fecha']) if data.get('Fecha') else None,
        Cantidad=data.get('Cantidad'),
        Precio_Unitario=data.get('Precio_Unitario'),
        Moneda=data.get('Moneda'),
        Subtotal=data.get('Subtotal'),
        Impuestos=data.get('Impuestos'),
        Total=data.get('Total'),
        Observaciones=data.get('Observaciones')
    )
    db.session.add(compra)
    db.session.commit()
    return jsonify({'CompraID': compra.CompraID}), 201

@app.route('/api/compras/<string:id>', methods=['GET'])
def get_compra(id):
    compra = Compras.query.get_or_404(id)
    return jsonify({
        'CompraID': compra.CompraID,
        'ProveedorID': compra.ProveedorID,
        'FincaID': compra.FincaID,
        'InsumoID': compra.InsumoID,
        'Fecha': compra.Fecha.isoformat() if compra.Fecha else None,
        'Cantidad': compra.Cantidad,
        'Precio_Unitario': compra.Precio_Unitario,
        'Moneda': compra.Moneda,
        'Subtotal': compra.Subtotal,
        'Impuestos': compra.Impuestos,
        'Total': compra.Total,
        'Observaciones': compra.Observaciones
    })

@app.route('/api/compras/<string:id>', methods=['PUT'])
def update_compra(id):
    compra = Compras.query.get_or_404(id)
    data = request.get_json()
    compra.ProveedorID = data.get('ProveedorID', compra.ProveedorID)
    compra.FincaID = data.get('FincaID', compra.FincaID)
    compra.InsumoID = data.get('InsumoID', compra.InsumoID)
    compra.Fecha = datetime.fromisoformat(data['Fecha']) if data.get('Fecha') else compra.Fecha
    compra.Cantidad = data.get('Cantidad', compra.Cantidad)
    compra.Precio_Unitario = data.get('Precio_Unitario', compra.Precio_Unitario)
    compra.Moneda = data.get('Moneda', compra.Moneda)
    compra.Subtotal = data.get('Subtotal', compra.Subtotal)
    compra.Impuestos = data.get('Impuestos', compra.Impuestos)
    compra.Total = data.get('Total', compra.Total)
    compra.Observaciones = data.get('Observaciones', compra.Observaciones)
    db.session.commit()
    return jsonify({'message': 'Compra updated'})

@app.route('/api/compras/<string:id>', methods=['DELETE'])
def delete_compra(id):
    compra = Compras.query.get_or_404(id)
    db.session.delete(compra)
    db.session.commit()
    return jsonify({'message': 'Compra deleted'})

# Analytics
@app.route('/api/analytics/animal/<string:id>', methods=['GET'])
def get_animal_analytics(id):
    # Retrieve the animal record from the Bovinos table
    animal = Bovinos.query.get_or_404(id)

    # Get the most recent weight log for this animal, ordered by measurement date descending
    latest_weight = WeightLog.query.filter_by(animal_id=id).order_by(WeightLog.measured_at.desc()).first()

    # Calculate total emissions by summing CO2 and methane emissions from all emission logs for this animal
    # This aggregates all historical emission data to provide a cumulative environmental impact metric
    total_emissions = db.session.query(db.func.sum(EmissionLog.co2_emissions + EmissionLog.methane_emissions)).filter_by(animal_id=id).scalar() or 0

    # Calculate total costs by summing feed and medical costs from all finance logs for this animal
    # This provides a comprehensive view of operational expenses per animal
    total_costs = db.session.query(db.func.sum(FinanceLog.cost_feed + FinanceLog.cost_medical)).filter_by(animal_id=id).scalar() or 0

    # Calculate total revenue from sales for this animal
    # This tracks financial returns from animal-related transactions
    total_revenue = db.session.query(db.func.sum(FinanceLog.revenue_sale)).filter_by(animal_id=id).scalar() or 0

    # Get carcass data for meat production analytics
    # This retrieves slaughter information to calculate meat yield and quality metrics
    carcass_data = Pesajes_Canales.query.filter_by(BovinoID=id).first()

    # Determine animal health status based on latest weight and health records
    # Status logic: Check health records first, then weight as secondary indicator
    # Priority: Health records > Weight threshold > Default healthy
    status = 'healthy'
    latest_health = Registros_Sanitarios.query.filter_by(BovinoID=id).order_by(Registros_Sanitarios.Fecha_Muestra.desc()).first()
    if latest_health and latest_health.Estado_Salud == 'Enfermo':
        status = 'sick'
    elif latest_weight and latest_weight.weight_kg < 100:  # arbitrary threshold based on typical cattle weights
        status = 'underweight'

    # Calculate estimated energy consumption
    # Formula: energy_consumption = weight_kg * 0.5 (arbitrary multiplier for demonstration)
    # This represents daily energy requirements in some unit (e.g., MJ or kcal)
    # In a real system, this would use breed-specific metabolic formulas
    energy_consumption = (latest_weight.weight_kg if latest_weight else 0) * 0.5

    # Calculate meat yield if animal has been slaughtered
    # This shows the efficiency of converting live weight to usable meat
    meat_yield = None
    if carcass_data:
        meat_yield = {
            'carcass_weight_kg': carcass_data.Peso_Canal,
            'live_weight_kg': carcass_data.Peso_Vivo,
            'yield_percentage': carcass_data.Rendimiento,
            'slaughter_date': carcass_data.Fecha_Sacrificio.isoformat() if carcass_data.Fecha_Sacrificio else None
        }

    return jsonify({
        'animal_id': id,
        'status': status,
        'latest_weight': latest_weight.weight_kg if latest_weight else None,
        'total_emissions': total_emissions,
        'total_costs': total_costs,
        'total_revenue': total_revenue,
        'energy_consumption': energy_consumption,
        'meat_yield': meat_yield
    })

@app.route('/api/analytics/land/<int:id>', methods=['GET'])
def get_land_analytics(id):
    # Retrieve the land record from the Lotes table
    land = Lotes.query.get_or_404(id)

    # Get the most recent resource log for this land, ordered by logged date descending
    latest_resources = ResourceLog.query.filter_by(land_id=id).order_by(ResourceLog.logged_at.desc()).first()

    # Count total animals currently assigned to this land
    # This provides a headcount for land utilization and capacity planning
    animal_count = Bovinos.query.filter_by(LoteID=id).count()

    # Check for low resource conditions based on predefined thresholds
    # Feed threshold: < 100 units (could be kg, tons, etc.)
    # Water threshold: < 50 units (could be liters, cubic meters, etc.)
    # These thresholds are configurable and should be adjusted based on farm requirements
    low_resources = []
    if latest_resources:
        if latest_resources.feed_available < 100:  # arbitrary threshold for feed availability
            low_resources.append('feed')
        if latest_resources.water_available < 50:  # arbitrary threshold for water availability
            low_resources.append('water')

    # Determine land status based on resource availability
    # Status logic: 'good' if no low resources detected, 'low_resources' if any resource is below threshold
    # This helps prioritize land management and resource allocation
    status = 'good' if not low_resources else 'low_resources'

    # Calculate total meat production from this land's animals
    # This aggregates slaughter data for all animals currently or previously on this land
    total_meat_from_land = db.session.query(db.func.sum(Pesajes_Canales.Peso_Canal)).filter(
        Pesajes_Canales.BovinoID.in_(
            db.session.query(Bovinos.BovinoID).filter_by(LoteID=id)
        )
    ).scalar() or 0

    # Calculate average daily weight gain for animals on this land
    # This uses weight logs to show growth performance and feed efficiency
    weight_gains = db.session.query(
        WeightLog.animal_id,
        db.func.avg(WeightLog.weight_kg).label('avg_weight')
    ).filter(
        WeightLog.animal_id.in_(
            db.session.query(Bovinos.BovinoID).filter_by(LoteID=id)
        )
    ).group_by(WeightLog.animal_id).all()

    avg_daily_gain = 0
    if weight_gains:
        # Simplified calculation - in production would use time-series analysis
        avg_daily_gain = sum(wg.avg_weight for wg in weight_gains) / len(weight_gains) / 30  # rough monthly average

    return jsonify({
        'land_id': id,
        'status': status,
        'low_resources': low_resources,
        'animal_count': animal_count,
        'latest_feed': latest_resources.feed_available if latest_resources else None,
        'latest_water': latest_resources.water_available if latest_resources else None,
        'total_meat_produced_kg': total_meat_from_land,
        'avg_daily_weight_gain_kg': avg_daily_gain
    })

@app.route('/api/analytics/farm/<int:id>', methods=['GET'])
def get_farm_analytics(id):
    # Retrieve the farm record from the Fincas table
    farm = Fincas.query.get_or_404(id)

    # Get all lands (lotes) associated with this farm
    lands = Lotes.query.filter_by(FincaID=id).all()

    # Calculate analytics for each land by calling the land analytics function
    # This aggregates data from all lands within the farm for comprehensive farm-level insights
    land_analytics = []
    for land in lands:
        # Note: get_land_analytics returns a Flask Response object, so we need to get the JSON data
        # In a real implementation, this would be refactored to return data instead of Response
        land_data = get_land_analytics(land.LoteID).get_json()
        land_analytics.append(land_data)

    # Calculate total animals across all lands in the farm
    # This provides a farm-wide headcount for capacity and productivity analysis
    total_animals = sum(la['animal_count'] for la in land_analytics)

    # Check if any land has low resources
    # This creates a farm-level alert if any land within the farm needs attention
    low_resources_farms = any(la['low_resources'] for la in land_analytics)

    # Determine farm status based on land conditions
    # Status logic: 'good' if all lands are good, 'attention_needed' if any land has issues
    # This helps prioritize farm management and resource allocation at the enterprise level
    status = 'good' if not low_resources_farms else 'attention_needed'

    # Calculate total meat production from channel weights
    # This aggregates all slaughter data to show total meat output in kg
    total_meat_production = db.session.query(db.func.sum(Pesajes_Canales.Peso_Canal)).filter(
        Pesajes_Canales.BovinoID.in_(
            db.session.query(Bovinos.BovinoID).filter_by(FincaID=id)
        )
    ).scalar() or 0

    # Calculate average carcass yield percentage
    # This shows efficiency of meat conversion from live weight to carcass weight
    avg_yield = db.session.query(db.func.avg(Pesajes_Canales.Rendimiento)).filter(
        Pesajes_Canales.BovinoID.in_(
            db.session.query(Bovinos.BovinoID).filter_by(FincaID=id)
        )
    ).scalar() or 0

    return jsonify({
        'farm_id': id,
        'status': status,
        'total_lands': len(lands),
        'total_animals': total_animals,
        'total_meat_production_kg': total_meat_production,
        'average_carcass_yield_percent': avg_yield,
        'lands_status': land_analytics
    })

# File serving endpoint
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Alimentacion
@app.route('/api/alimentacion', methods=['GET'])
def get_alimentacion():
    rations = Alimentacion.query.all()
    return jsonify([{
        'RacionID': r.RacionID,
        'Nombre_Racion': r.Nombre_Racion,
        'Tipo': r.Tipo,
        'Objetivo': r.Objetivo,
        'Observaciones': r.Observaciones
    } for r in rations])

@app.route('/api/alimentacion', methods=['POST'])
def create_alimentacion():
    data = request.get_json()
    # Auto-generate RacionID as "Alim-001", "Alim-002", etc.
    max_id = db.session.query(db.func.max(db.func.cast(db.func.substr(Alimentacion.RacionID, 6), db.Integer))).scalar() or 0
    next_id = max_id + 1
    racion_id = f"Alim-{next_id:03d}"

    alimentacion = Alimentacion(
        RacionID=racion_id,
        Nombre_Racion=data['Nombre_Racion'],
        Tipo=data.get('Tipo'),
        Objetivo=data.get('Objetivo'),
        Observaciones=data.get('Observaciones')
    )
    db.session.add(alimentacion)
    db.session.commit()
    return jsonify({'RacionID': alimentacion.RacionID}), 201

@app.route('/api/alimentacion/<string:id>', methods=['GET'])
def get_alimentacion_by_id(id):
    ration = Alimentacion.query.get_or_404(id)
    return jsonify({
        'RacionID': ration.RacionID,
        'Nombre_Racion': ration.Nombre_Racion,
        'Tipo': ration.Tipo,
        'Objetivo': ration.Objetivo,
        'Observaciones': ration.Observaciones
    })

@app.route('/api/alimentacion/<string:id>', methods=['PUT'])
def update_alimentacion(id):
    ration = Alimentacion.query.get_or_404(id)
    data = request.get_json()
    ration.Nombre_Racion = data.get('Nombre_Racion', ration.Nombre_Racion)
    ration.Tipo = data.get('Tipo', ration.Tipo)
    ration.Objetivo = data.get('Objetivo', ration.Objetivo)
    ration.Observaciones = data.get('Observaciones', ration.Observaciones)
    db.session.commit()
    return jsonify({'message': 'Alimentacion updated'})

@app.route('/api/alimentacion/<string:id>', methods=['DELETE'])
def delete_alimentacion(id):
    ration = Alimentacion.query.get_or_404(id)
    db.session.delete(ration)
    db.session.commit()
    return jsonify({'message': 'Alimentacion deleted'})

# Ventas
@app.route('/api/ventas', methods=['GET'])
def get_ventas():
    ventas = Ventas.query.all()
    return jsonify([{
        'VentaID': v.VentaID,
        'Cliente': v.Cliente,
        'Tipo_Venta': v.Tipo_Venta,
        'FincaID': v.FincaID,
        'Fecha': v.Fecha.isoformat() if v.Fecha else None,
        'Subtotal': v.Subtotal,
        'Impuestos': v.Impuestos,
        'Total': v.Total,
        'Observaciones': v.Observaciones
    } for v in ventas])

@app.route('/api/ventas', methods=['POST'])
def create_venta():
    data = request.get_json()
    # Auto-generate VentaID as "Ve-001", "Ve-002", etc.
    max_id = db.session.query(db.func.max(db.func.cast(db.func.substr(Ventas.VentaID, 4), db.Integer))).scalar() or 0
    next_id = max_id + 1
    venta_id = f"Ve-{next_id:03d}"

    # Calculate subtotal and taxes automatically
    total_str = data.get('Total', '0')
    if total_str is None:
        total_str = '0'
    total = float(total_str)
    subtotal = total * 0.81  # Subtotal = total * 0.81
    impuestos = total * 0.19  # Impuestos = total * 0.19

    venta = Ventas(
        VentaID=venta_id,
        Cliente=data.get('Cliente'),
        Tipo_Venta=data.get('Tipo_Venta'),
        FincaID=data['FincaID'],
        Fecha=datetime.fromisoformat(data['Fecha']) if data.get('Fecha') else None,
        Subtotal=subtotal,
        Impuestos=impuestos,
        Total=total,
        Observaciones=data.get('Observaciones')
    )
    db.session.add(venta)
    db.session.commit()
    return jsonify({'VentaID': venta.VentaID}), 201

@app.route('/api/ventas/<string:id>', methods=['GET'])
def get_venta(id):
    venta = Ventas.query.get_or_404(id)
    return jsonify({
        'VentaID': venta.VentaID,
        'Cliente': venta.Cliente,
        'Tipo_Venta': venta.Tipo_Venta,
        'FincaID': venta.FincaID,
        'Fecha': venta.Fecha.isoformat() if venta.Fecha else None,
        'Subtotal': venta.Subtotal,
        'Impuestos': venta.Impuestos,
        'Total': venta.Total,
        'Observaciones': venta.Observaciones
    })

@app.route('/api/ventas/<string:id>', methods=['PUT'])
def update_venta(id):
    venta = Ventas.query.get_or_404(id)
    data = request.get_json()
    venta.Cliente = data.get('Cliente', venta.Cliente)
    venta.Tipo_Venta = data.get('Tipo_Venta', venta.Tipo_Venta)
    venta.FincaID = data.get('FincaID', venta.FincaID)
    venta.Fecha = datetime.fromisoformat(data['Fecha']) if data.get('Fecha') else venta.Fecha
    venta.Subtotal = data.get('Subtotal', venta.Subtotal)
    venta.Impuestos = data.get('Impuestos', venta.Impuestos)
    venta.Total = data.get('Total', venta.Total)
    venta.Observaciones = data.get('Observaciones', venta.Observaciones)
    db.session.commit()
    return jsonify({'message': 'Venta updated'})

@app.route('/api/ventas/<string:id>', methods=['DELETE'])
def delete_venta(id):
    venta = Ventas.query.get_or_404(id)
    db.session.delete(venta)
    db.session.commit()
    return jsonify({'message': 'Venta deleted'})

class FinanceLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.String(50), db.ForeignKey('bovinos.BovinoID'), nullable=False)
    cost_feed = db.Column(db.Float, default=0)
    cost_medical = db.Column(db.Float, default=0)
    revenue_sale = db.Column(db.Float, default=0)
    logged_at = db.Column(db.DateTime, default=datetime.utcnow)

class ResourceLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    land_id = db.Column(db.Integer, db.ForeignKey('lotes.LoteID'), nullable=False)
    feed_available = db.Column(db.Float, default=0)
    water_available = db.Column(db.Float, default=0)
    logged_at = db.Column(db.DateTime, default=datetime.utcnow)

# Racion Animal API endpoints
@app.route('/api/racion_animal', methods=['GET'])
def get_racion_animal():
    racion_animal = Racion_Animal.query.all()
    return jsonify([{
        'RacionAnimalID': ra.RacionAnimalID,
        'RacionID': ra.RacionID,
        'BovinoID': ra.BovinoID,
        'Fecha_Inicio': ra.Fecha_Inicio.isoformat() if ra.Fecha_Inicio else None,
        'Fecha_Fin': ra.Fecha_Fin.isoformat() if ra.Fecha_Fin else None,
        'Observaciones': ra.Observaciones
    } for ra in racion_animal])

@app.route('/api/racion_animal', methods=['POST'])
def create_racion_animal():
    data = request.get_json()

    # Auto-generate RacionAnimalID as "animalalim-001", "animalalim-002", etc.
    max_id = db.session.query(db.func.max(db.func.cast(db.func.substr(Racion_Animal.RacionAnimalID, 12), db.Integer))).scalar() or 0
    next_id = max_id + 1
    racion_animal_id = f"animalalim-{next_id:03d}"

    racion_animal = Racion_Animal(
        RacionAnimalID=racion_animal_id,
        RacionID=data['RacionID'],
        BovinoID=data['BovinoID'],
        Fecha_Inicio=datetime.fromisoformat(data['Fecha_Inicio']) if data.get('Fecha_Inicio') else None,
        Fecha_Fin=datetime.fromisoformat(data['Fecha_Fin']) if data.get('Fecha_Fin') else None,
        Observaciones=data.get('Observaciones')
    )
    db.session.add(racion_animal)
    db.session.commit()
    return jsonify({'RacionAnimalID': racion_animal.RacionAnimalID}), 201

@app.route('/api/racion_animal/<string:id>', methods=['GET'])
def get_racion_animal_by_id(id):
    racion_animal = Racion_Animal.query.get_or_404(id)
    return jsonify({
        'RacionAnimalID': racion_animal.RacionAnimalID,
        'RacionID': racion_animal.RacionID,
        'BovinoID': racion_animal.BovinoID,
        'Fecha_Inicio': racion_animal.Fecha_Inicio.isoformat() if racion_animal.Fecha_Inicio else None,
        'Fecha_Fin': racion_animal.Fecha_Fin.isoformat() if racion_animal.Fecha_Fin else None,
        'Observaciones': racion_animal.Observaciones
    })

@app.route('/api/racion_animal/<string:id>', methods=['PUT'])
def update_racion_animal(id):
    racion_animal = Racion_Animal.query.get_or_404(id)
    data = request.get_json()
    racion_animal.RacionID = data.get('RacionID', racion_animal.RacionID)
    racion_animal.BovinoID = data.get('BovinoID', racion_animal.BovinoID)
    racion_animal.Fecha_Inicio = datetime.fromisoformat(data['Fecha_Inicio']) if data.get('Fecha_Inicio') else racion_animal.Fecha_Inicio
    racion_animal.Fecha_Fin = datetime.fromisoformat(data['Fecha_Fin']) if data.get('Fecha_Fin') else racion_animal.Fecha_Fin
    racion_animal.Observaciones = data.get('Observaciones', racion_animal.Observaciones)
    db.session.commit()
    return jsonify({'message': 'Racion Animal updated'})

@app.route('/api/racion_animal/<string:id>', methods=['DELETE'])
def delete_racion_animal(id):
    racion_animal = Racion_Animal.query.get_or_404(id)
    db.session.delete(racion_animal)
    db.session.commit()
    return jsonify({'message': 'Racion Animal deleted'})

if __name__ == '__main__':
    app.run(debug=True)

"""
    GET = READ ONLY
    POST = CREATE
    PATCH = UPDATE (SOLO 1 ELEMENTO)
    DELETE =
    PUT = REPLACE (COMPLETO)
    """