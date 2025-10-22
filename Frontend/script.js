const API_BASE = 'http://localhost:5000/api';

// Utility functions
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');

    // Reset edit forms when switching sections
    resetEditForms();
}

function resetEditForms() {
    // Reset farm edit form
    document.getElementById('edit-farm-form').style.display = 'none';
    document.getElementById('edit-farm-select').value = '';

    // Reset land edit form
    document.getElementById('edit-land-form').style.display = 'none';
    document.getElementById('edit-land-select').value = '';
}

function fetchData(endpoint) {
    return fetch(`${API_BASE}${endpoint}`)
        .then(response => response.json());
}

function postData(endpoint, data) {
    return fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }).then(response => response.json());
}

// Load data functions
async function loadFarms() {
    const farms = await fetchData('/fincas');
    const landSelect = document.getElementById('land-farm');
    const animalSelect = document.getElementById('animal-farm');
    const analyticsSelect = document.getElementById('analytics-farm');
    const editSelect = document.getElementById('edit-farm-select');
    const purchaseSelect = document.getElementById('purchase-farm');
    const saleSelect = document.getElementById('sale-farm');
    const list = document.getElementById('farms-list');

    landSelect.innerHTML = '<option value="">Select Farm</option>';
    animalSelect.innerHTML = '<option value="">Select Farm</option>';
    analyticsSelect.innerHTML = '<option value="">Select Farm</option>';
    editSelect.innerHTML = '<option value="">Select Farm to Edit</option>';
    purchaseSelect.innerHTML = '<option value="">Seleccionar Finca</option>';
    saleSelect.innerHTML = '<option value="">Select Farm</option>';
    list.innerHTML = '';

    farms.forEach(farm => {
        landSelect.innerHTML += `<option value="${farm.FincaID}">${farm.Nombre}</option>`;
        animalSelect.innerHTML += `<option value="${farm.FincaID}">${farm.Nombre}</option>`;
        analyticsSelect.innerHTML += `<option value="${farm.FincaID}">${farm.Nombre}</option>`;
        editSelect.innerHTML += `<option value="${farm.FincaID}">${farm.Nombre}</option>`;
        purchaseSelect.innerHTML += `<option value="${farm.FincaID}">${farm.Nombre}</option>`;
        saleSelect.innerHTML += `<option value="${farm.FincaID}">${farm.Nombre}</option>`;
        list.innerHTML += `<li>${farm.Nombre} (${farm.Depto}, ${farm.Municipio}) - ${farm.Uso_Suelo} <button onclick="editFarm(${farm.FincaID})" class="edit-btn">Edit</button> <button onclick="deleteFarm(${farm.FincaID})" class="delete-btn">Delete</button></li>`;
    });
}

async function loadSuppliesForIngredients() {
    const insumos = await fetchData('/insumos');
    const ingredientSelect = document.getElementById('ration-ingredient-supply');

    ingredientSelect.innerHTML = '<option value="">Seleccionar Suministro</option>';

    // Only show supplies with category "Suministros Alimentarios"
    insumos.filter(insumo => insumo.Categoria === 'Suministros Alimentarios').forEach(insumo => {
        ingredientSelect.innerHTML += `<option value="${insumo.InsumoID}" data-price="${insumo.Precio_Unit || 0}">${insumo.Nombre} (${insumo.Categoria}) - $${insumo.Precio_Unit || 'N/A'}</option>`;
    });
}

async function loadMovementAnimals() {
    const bovinos = await fetchData('/bovinos');
    const movementSelect = document.getElementById('movement-animal');

    movementSelect.innerHTML = '<option value="">Seleccionar Animal</option>';

    bovinos.forEach(bovino => {
        const display = `${bovino.BovinoID} - ${bovino.Raza || 'Unknown'} - ${bovino.Estado}`;
        movementSelect.innerHTML += `<option value="${bovino.BovinoID}">${display}</option>`;
    });

    // Also populate edit movement animal dropdown if it exists
    const editMovementSelect = document.getElementById('edit-movement-animal');
    if (editMovementSelect) {
        editMovementSelect.innerHTML = '<option value="">Seleccionar Animal</option>';
        bovinos.forEach(bovino => {
            const display = `${bovino.BovinoID} - ${bovino.Raza || 'Unknown'} - ${bovino.Estado}`;
            editMovementSelect.innerHTML += `<option value="${bovino.BovinoID}">${display}</option>`;
        });
    }
}

async function loadMovementFarms() {
    const farms = await fetchData('/fincas');
    const originFarmSelect = document.getElementById('movement-origin-farm');
    const destFarmSelect = document.getElementById('movement-dest-farm');

    originFarmSelect.innerHTML = '<option value="">Seleccionar Finca Origen</option>';
    destFarmSelect.innerHTML = '<option value="">Seleccionar Finca Destino</option>';

    farms.forEach(farm => {
        originFarmSelect.innerHTML += `<option value="${farm.FincaID}">${farm.Nombre}</option>`;
        destFarmSelect.innerHTML += `<option value="${farm.FincaID}">${farm.Nombre}</option>`;
    });

    // Add event listeners for farm selection changes
    originFarmSelect.addEventListener('change', updateOriginLandOptions);
    destFarmSelect.addEventListener('change', updateDestLandOptions);
}

// Note: loadMovementLands is now handled dynamically by updateOriginLandOptions and updateDestLandOptions
// based on selected farms to ensure lands are properly associated with their farms

async function loadHealthAnimals() {
    const bovinos = await fetchData('/bovinos');
    const healthSelect = document.getElementById('health-animal');

    healthSelect.innerHTML = '<option value="">Seleccionar Animal</option>';

    bovinos.forEach(bovino => {
        const display = `${bovino.BovinoID} - ${bovino.Raza || 'Unknown'} - ${bovino.Estado}`;
        healthSelect.innerHTML += `<option value="${bovino.BovinoID}">${display}</option>`;
    });
}

async function loadLands() {
    const lotes = await fetchData('/lotes');
    const select = document.getElementById('animal-land');
    const resourceSelect = document.getElementById('resource-land');
    const analyticsSelect = document.getElementById('analytics-land');
    const editSelect = document.getElementById('edit-land-select');
    const list = document.getElementById('lands-list');

    select.innerHTML = '<option value="">Select Land</option>';
    resourceSelect.innerHTML = '<option value="">Select Land</option>';
    analyticsSelect.innerHTML = '<option value="">Select Land</option>';
    editSelect.innerHTML = '<option value="">Select Land to Edit</option>';
    list.innerHTML = '';

    lotes.forEach(lote => {
        select.innerHTML += `<option value="${lote.LoteID}">${lote.Nombre_Lote}</option>`;
        resourceSelect.innerHTML += `<option value="${lote.LoteID}">${lote.Nombre_Lote}</option>`;
        analyticsSelect.innerHTML += `<option value="${lote.LoteID}">${lote.Nombre_Lote}</option>`;
        editSelect.innerHTML += `<option value="${lote.LoteID}">${lote.Nombre_Lote}</option>`;
        list.innerHTML += `<li>${lote.Nombre_Lote} (${lote.Area_ha} ha, ${lote.Actividad_Ganado || 'No activity'}) <button onclick="editLand(${lote.LoteID})" class="edit-btn">Edit</button> <button onclick="deleteLand(${lote.LoteID})" class="delete-btn">Delete</button></li>`;
    });
}

async function loadAnimals() {
    const bovinos = await fetchData('/bovinos');
    const lotes = await fetchData('/lotes');
    const weightSelect = document.getElementById('weight-animal');
    const emissionSelect = document.getElementById('emission-animal');
    const financeSelect = document.getElementById('finance-animal');
    const analyticsSelect = document.getElementById('analytics-animal');
    const slaughterSelect = document.getElementById('slaughter-animal');
    const list = document.getElementById('animals-list');
    const editSelect = document.getElementById('edit-animal-select');

    weightSelect.innerHTML = '<option value="">Select Animal</option>';
    emissionSelect.innerHTML = '<option value="">Select Animal</option>';
    financeSelect.innerHTML = '<option value="">Select Animal</option>';
    analyticsSelect.innerHTML = '<option value="">Select Animal</option>';
    slaughterSelect.innerHTML = '<option value="">Seleccionar Animal</option>';
    list.innerHTML = '';
    editSelect.innerHTML = '<option value="">Seleccionar Animal para Editar</option>';

    bovinos.forEach(bovino => {
        // Get the land's activity for this animal
        const lote = lotes.find(l => l.LoteID == bovino.LoteID);
        const actividadProductiva = lote ? lote.Actividad_Ganado : 'N/A';

        const display = `${bovino.BovinoID} - ${bovino.Raza || 'Unknown'} - ${actividadProductiva} (Born: ${bovino.Fecha_Nac || 'N/A'})`;
        weightSelect.innerHTML += `<option value="${bovino.BovinoID}">${display}</option>`;
        emissionSelect.innerHTML += `<option value="${bovino.BovinoID}">${display}</option>`;
        financeSelect.innerHTML += `<option value="${bovino.BovinoID}">${display}</option>`;
        analyticsSelect.innerHTML += `<option value="${bovino.BovinoID}">${display}</option>`;
        slaughterSelect.innerHTML += `<option value="${bovino.BovinoID}">${display}</option>`;
        list.innerHTML += `<li>${bovino.BovinoID} - ${bovino.Raza || 'Unknown'} - ${actividadProductiva} <button onclick="deleteAnimal('${bovino.BovinoID}')">Delete</button></li>`;
        editSelect.innerHTML += `<option value="${bovino.BovinoID}">${bovino.BovinoID} - ${bovino.Raza || 'Unknown'}</option>`;
    });

    // Also reload movement animals since they depend on bovinos
    loadMovementAnimals();
}

// Form handlers
document.getElementById('farm-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const Nombre = document.getElementById('farm-name').value;
    const Depto = document.getElementById('farm-depto').value;
    const Municipio = document.getElementById('farm-municipio').value;
    const Area_ha = parseFloat(document.getElementById('farm-area').value);
    const Propietario = document.getElementById('farm-propietario').value;
    const Uso_Suelo = document.getElementById('farm-uso').value;
    const Lat = parseFloat(document.getElementById('farm-lat').value);
    const Lon = parseFloat(document.getElementById('farm-lon').value);
    const Fecha_Registro = document.getElementById('farm-fecha').value;

    await postData('/fincas', { Nombre, Depto, Municipio, Area_ha, Propietario, Uso_Suelo, Lat, Lon, Fecha_Registro });
    document.getElementById('farm-form').reset();
    loadFarms();
});

document.getElementById('land-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const FincaID = parseInt(document.getElementById('land-farm').value);
    const Nombre_Lote = document.getElementById('land-name').value;
    const Area_ha = parseFloat(document.getElementById('land-area').value);
    const Actividad_Ganado = document.getElementById('land-actividad').value;
    const Observaciones = document.getElementById('land-obs').value;

    // Validate that land area doesn't exceed farm area
    try {
        const farm = await fetchData(`/fincas/${FincaID}`);
        const existingLands = await fetchData('/lotes');
        const totalUsedArea = existingLands
            .filter(land => land.FincaID === FincaID)
            .reduce((sum, land) => sum + (land.Area_ha || 0), 0);

        if (totalUsedArea + Area_ha > farm.Area_ha) {
            alert(`Error: La suma de áreas de terrenos (${(totalUsedArea + Area_ha).toFixed(2)} ha) no puede superar el área total de la finca (${farm.Area_ha} ha). Área disponible: ${(farm.Area_ha - totalUsedArea).toFixed(2)} ha.`);
            return;
        }

        await postData('/lotes', { FincaID, Nombre_Lote, Area_ha, Actividad_Ganado, Observaciones });
        document.getElementById('land-form').reset();
        loadLands();
    } catch (error) {
        console.error('Error validating land area:', error);
        alert('Error al validar el área del terreno. valor excede el valor de la finca ya empleado. Por favor, inténtelo de nuevo.');
    }
});

document.getElementById('animal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const BovinoID = document.getElementById('animal-id').value; // Keep as string for XXXX-X format
    const FincaID = parseInt(document.getElementById('animal-farm').value);
    const LoteID = parseInt(document.getElementById('animal-land').value);
    const Sexo = document.getElementById('animal-sexo').value;
    const Raza = document.getElementById('animal-raza').value;
    const Fecha_Nac = document.getElementById('animal-birth').value;
    const Estado = document.getElementById('animal-estado').value;
    const MadreID = document.getElementById('animal-madre').value || null; // Keep as string for XXXX-X format
    const PadreID = document.getElementById('animal-padre').value || null; // Keep as string for XXXX-X format
    const Origen = document.getElementById('animal-origen').value;
    const Propósito = document.getElementById('animal-proposito').value;

    await postData('/bovinos', { BovinoID, FincaID, LoteID, Sexo, Raza, Fecha_Nac, Estado, MadreID, PadreID, Origen, Propósito });
    document.getElementById('animal-form').reset();
    loadAnimals();
    loadHealthAnimals(); // Reload health animals dropdown
    loadMovementAnimals(); // Reload movement animals dropdown
});

document.getElementById('health-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('BovinoID', document.getElementById('health-animal').value);
    formData.append('Tipo_Prueba', document.getElementById('health-test-type').value);
    formData.append('Estado_Salud', document.getElementById('health-status').value);
    formData.append('Resultado', document.getElementById('health-result').value);
    formData.append('Fecha_Muestra', document.getElementById('health-sample-date').value);
    formData.append('Laboratorio', document.getElementById('health-laboratory').value);
    formData.append('Costo_Examen', document.getElementById('health-cost').value);
    formData.append('Observaciones', document.getElementById('health-observations').value);

    // Handle file upload
    const fileInput = document.getElementById('health-certificate');
    if (fileInput.files[0]) {
        formData.append('archivo_certificado', fileInput.files[0]);
    }

    try {
        const response = await fetch(`${API_BASE}/registros_sanitarios`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            document.getElementById('health-form').reset();
            loadHealthRecords();
        } else {
            console.error('Error submitting form:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

document.getElementById('movement-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const BovinoID = document.getElementById('movement-animal').value;
    const Tipo_Mov = document.getElementById('movement-type').value;
    const Fecha = document.getElementById('movement-date').value;
    const Finca_Origen = document.getElementById('movement-origin-farm').value || null;
    const Lote_Origen = document.getElementById('movement-origin-land').value || null;
    const Finca_Destino = document.getElementById('movement-dest-farm').value || null;
    const Lote_Destino = document.getElementById('movement-dest-land').value || null;
    const Motivo = document.getElementById('movement-motive').value;

    await postData('/movimientos_animales', { BovinoID, Tipo_Mov, Fecha, Finca_Origen, Lote_Origen, Finca_Destino, Lote_Destino, Motivo });
    document.getElementById('movement-form').reset();
    // Reset field visibility
    document.getElementById('origin-fields').style.display = 'none';
    document.getElementById('destination-fields').style.display = 'none';
    loadMovements();
});

function toggleMovementFields() {
    const movementType = document.getElementById('movement-type').value;
    const originFields = document.getElementById('origin-fields');
    const destinationFields = document.getElementById('destination-fields');

    if (movementType === 'Interno') {
        originFields.style.display = 'block';
        destinationFields.style.display = 'block';
        // For internal movements, filter lands by selected farm
        updateOriginLandOptions();
        updateDestLandOptions();
    } else if (movementType === 'Importación') {
        originFields.style.display = 'none';
        destinationFields.style.display = 'block';
        // For imports, only show destination land options
        updateDestLandOptions();
    } else if (movementType === 'Exportación') {
        originFields.style.display = 'block';
        destinationFields.style.display = 'none';
        // For exports, only show origin land options
        updateOriginLandOptions();
    } else {
        originFields.style.display = 'none';
        destinationFields.style.display = 'none';
    }
}

function updateOriginLandOptions() {
    const selectedFarm = document.getElementById('movement-origin-farm').value;
    const landSelect = document.getElementById('movement-origin-land');

    if (!selectedFarm) {
        landSelect.innerHTML = '<option value="">Primero seleccionar Finca Origen</option>';
        return;
    }

    // Filter lands by selected farm
    fetchData('/lotes').then(lands => {
        landSelect.innerHTML = '<option value="">Seleccionar Lote Origen</option>';
        lands.filter(land => land.FincaID == selectedFarm).forEach(land => {
            landSelect.innerHTML += `<option value="${land.LoteID}">${land.Nombre_Lote}</option>`;
        });
    });
}

function updateDestLandOptions() {
    const selectedFarm = document.getElementById('movement-dest-farm').value;
    const landSelect = document.getElementById('movement-dest-land');

    if (!selectedFarm) {
        landSelect.innerHTML = '<option value="">Primero seleccionar Finca Destino</option>';
        return;
    }

    // Filter lands by selected farm
    fetchData('/lotes').then(lands => {
        landSelect.innerHTML = '<option value="">Seleccionar Lote Destino</option>';
        lands.filter(land => land.FincaID == selectedFarm).forEach(land => {
            landSelect.innerHTML += `<option value="${land.LoteID}">${land.Nombre_Lote}</option>`;
        });
    });
}

async function loadMovements() {
    const movimientos = await fetchData('/movimientos_animales');
    const list = document.getElementById('movements-list');
    const editSelect = document.getElementById('edit-movement-select');

    list.innerHTML = '';
    editSelect.innerHTML = '<option value="">Seleccionar Movimiento para Editar</option>';

    movimientos.forEach(movimiento => {
        list.innerHTML += `<li>Movimiento ${movimiento.MovID} - Animal ${movimiento.BovinoID} - ${movimiento.Tipo_Mov} (${movimiento.Fecha || 'Sin fecha'}) <button onclick="deleteMovement('${movimiento.MovID}')">Eliminar</button></li>`;
        editSelect.innerHTML += `<option value="${movimiento.MovID}">${movimiento.MovID} - ${movimiento.BovinoID}</option>`;
    });
}

async function deleteMovement(id) {
    await fetch(`${API_BASE}/movimientos_animales/${id}`, { method: 'DELETE' });
    loadMovements();
}

async function loadHealthRecords() {
    const registros = await fetchData('/registros_sanitarios');
    const list = document.getElementById('health-records-list');
    const editSelect = document.getElementById('edit-health-select');

    list.innerHTML = '';
    editSelect.innerHTML = '<option value="">Seleccionar Registro para Editar</option>';

    registros.forEach(registro => {
        let fileLink = '';
        if (registro.Archivo_Certificado) {
            const filename = registro.Archivo_Certificado.split('\\').pop();
            fileLink = ` <a href="http://localhost:5000/uploads/${filename}" target="_blank" style="color: #007bff;">Ver Certificado</a>`;
        }

        const costoFormatted = registro.Costo_Examen ? 'COP$' + parseFloat(registro.Costo_Examen).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : 'N/A';
        list.innerHTML += `<li>Registro ${registro.RegistroID} - Animal ${registro.BovinoID} - ${registro.Tipo_Prueba} - ${registro.Estado_Salud} - ${costoFormatted} (${registro.Fecha_Muestra || 'Sin fecha'})${fileLink} <button onclick="deleteHealthRecord('${registro.RegistroID}')">Eliminar</button></li>`;
        editSelect.innerHTML += `<option value="${registro.RegistroID}">${registro.RegistroID} - ${registro.BovinoID}</option>`;
    });
}

async function deleteHealthRecord(id) {
    await fetch(`${API_BASE}/registros_sanitarios/${id}`, { method: 'DELETE' });
    loadHealthRecords();
}

document.getElementById('weight-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const animal_id = document.getElementById('weight-animal').value;
    const weight_kg = document.getElementById('weight-value').value;
    const measured_at = document.getElementById('weight-date').value;

    await postData('/weight_logs', {
        animal_id: animal_id,
        weight_kg: parseFloat(weight_kg),
        measured_at: measured_at || new Date().toISOString()
    });
    document.getElementById('weight-form').reset();
});

document.getElementById('emission-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const animal_id = document.getElementById('emission-animal').value;
    const co2_emissions = document.getElementById('co2-value').value;
    const methane_emissions = document.getElementById('methane-value').value;
    const logged_at = document.getElementById('emission-date').value;

    await postData('/emission_logs', {
        animal_id: animal_id,
        co2_emissions: parseFloat(co2_emissions),
        methane_emissions: parseFloat(methane_emissions),
        logged_at: logged_at || new Date().toISOString()
    });
    document.getElementById('emission-form').reset();
});

document.getElementById('finance-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const animal_id = document.getElementById('finance-animal').value;
    const cost_feed = document.getElementById('feed-cost').value;
    const cost_medical = document.getElementById('medical-cost').value;
    const revenue_sale = document.getElementById('sale-revenue').value;
    const logged_at = document.getElementById('finance-date').value;

    await postData('/finance_logs', {
        animal_id: animal_id,
        cost_feed: parseFloat(cost_feed),
        cost_medical: parseFloat(cost_medical),
        revenue_sale: parseFloat(revenue_sale),
        logged_at: logged_at || new Date().toISOString()
    });
    document.getElementById('finance-form').reset();
});

document.getElementById('resource-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const land_id = document.getElementById('resource-land').value;
    const feed_available = document.getElementById('feed-available').value;
    const water_available = document.getElementById('water-available').value;
    const logged_at = document.getElementById('resource-date').value;

    await postData('/resource_logs', {
        land_id: parseInt(land_id),
        feed_available: parseFloat(feed_available),
        water_available: parseFloat(water_available),
        logged_at: logged_at || new Date().toISOString()
    });
    document.getElementById('resource-form').reset();
});


document.getElementById('slaughter-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const BovinoID = document.getElementById('slaughter-animal').value;
    const Fecha_Sacrificio = document.getElementById('slaughter-date').value;
    const Peso_Canal = parseFloat(document.getElementById('slaughter-carcass-weight').value);
    const Observaciones = document.getElementById('slaughter-observations').value;

    await postData('/pesajes_canales', { BovinoID, Fecha_Sacrificio, Peso_Canal, Observaciones });
    document.getElementById('slaughter-form').reset();
    loadSlaughterWeights();
});

async function loadSlaughterWeights() {
    const pesajes = await fetchData('/pesajes_canales');
    const list = document.getElementById('slaughter-weights-list');
    const editSelect = document.getElementById('edit-slaughter-select');

    list.innerHTML = '';
    editSelect.innerHTML = '<option value="">Seleccionar Registro para Editar</option>';

    pesajes.forEach(pesaje => {
        list.innerHTML += `<li>Pesaje ${pesaje.CanalID} - Animal ${pesaje.BovinoID} - ${pesaje.Peso_Canal}kg carne (${pesaje.Fecha_Sacrificio || 'Sin fecha'}) <button onclick="deleteSlaughterWeight('${pesaje.CanalID}')">Eliminar</button></li>`;
        editSelect.innerHTML += `<option value="${pesaje.CanalID}">${pesaje.CanalID} - ${pesaje.BovinoID}</option>`;
    });
}

async function deleteSlaughterWeight(id) {
    await fetch(`${API_BASE}/pesajes_canales/${id}`, { method: 'DELETE' });
    loadSlaughterWeights();
}

async function loadSuppliers() {
    const proveedores = await fetchData('/proveedores');
    const list = document.getElementById('suppliers-list');
    const supplySelect = document.getElementById('supply-supplier');
    const editSelect = document.getElementById('edit-supplier-select');
    const purchaseSelect = document.getElementById('purchase-supplier');

    list.innerHTML = '';
    supplySelect.innerHTML = '<option value="">Seleccionar Proveedor</option>';
    editSelect.innerHTML = '<option value="">Seleccionar Proveedor para Editar</option>';
    purchaseSelect.innerHTML = '<option value="">Seleccionar Proveedor</option>';

    proveedores.forEach(proveedor => {
        list.innerHTML += `<li>${proveedor.Nombre} - ${proveedor.Correo} - ${proveedor.Telefono} <button onclick="deleteSupplier('${proveedor.ProveedorID}')">Eliminar</button></li>`;
        supplySelect.innerHTML += `<option value="${proveedor.ProveedorID}">${proveedor.Nombre}</option>`;
        editSelect.innerHTML += `<option value="${proveedor.ProveedorID}">${proveedor.Nombre}</option>`;
        purchaseSelect.innerHTML += `<option value="${proveedor.ProveedorID}">${proveedor.Nombre}</option>`;
    });
}

async function loadSupplies() {
    const insumos = await fetchData('/insumos');
    const list = document.getElementById('supplies-list');
    const editSelect = document.getElementById('edit-supply-select');
    const purchaseSelect = document.getElementById('purchase-supply');

    list.innerHTML = '';
    editSelect.innerHTML = '<option value="">Seleccionar Suministro para Editar</option>';
    purchaseSelect.innerHTML = '<option value="">Seleccionar Suministro</option>';

    insumos.forEach(insumo => {
        list.innerHTML += `<li>${insumo.Nombre} (${insumo.Categoria}) - ${insumo.Unidad} - $${insumo.Precio_Unit || 'N/A'} <button onclick="deleteSupply('${insumo.InsumoID}')">Eliminar</button></li>`;
        editSelect.innerHTML += `<option value="${insumo.InsumoID}">${insumo.Nombre} (${insumo.Categoria})</option>`;
        purchaseSelect.innerHTML += `<option value="${insumo.InsumoID}" data-price="${insumo.Precio_Unit || 0}">${insumo.Nombre} (${insumo.Categoria}) - $${insumo.Precio_Unit || 'N/A'}</option>`;
    });
}

async function loadPurchases() {
    const compras = await fetchData('/compras');
    const list = document.getElementById('purchases-list');
    const editSelect = document.getElementById('edit-purchase-select');

    list.innerHTML = '';
    editSelect.innerHTML = '<option value="">Seleccionar Compra para Editar</option>';

    compras.forEach(compra => {
        list.innerHTML += `<li>Compra ${compra.CompraID} - ${compra.Cantidad} unidades - $${compra.Total} ${compra.Moneda} (${compra.Fecha || 'Sin fecha'}) <button onclick="deletePurchase('${compra.CompraID}')">Eliminar</button></li>`;
        editSelect.innerHTML += `<option value="${compra.CompraID}">${compra.CompraID} - ${compra.Total} ${compra.Moneda}</option>`;
    });
}

async function loadSales() {
    const ventas = await fetchData('/ventas');
    const list = document.getElementById('sales-list');
    const editSelect = document.getElementById('edit-sale-select');

    list.innerHTML = '';
    editSelect.innerHTML = '<option value="">Seleccionar Venta para Editar</option>';

    ventas.forEach(venta => {
        const totalFormatted = 'COP$' + parseFloat(venta.Total).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        list.innerHTML += `<li>${venta.Cliente} - ${venta.Tipo_Venta} - ${totalFormatted} (${venta.Fecha || 'Sin fecha'}) <button onclick="deleteSale('${venta.VentaID}')">Eliminar</button></li>`;
        editSelect.innerHTML += `<option value="${venta.VentaID}">${venta.VentaID} - ${venta.Cliente}</option>`;
    });
}

async function deleteSupply(id) {
    await fetch(`${API_BASE}/insumos/${id}`, { method: 'DELETE' });
    loadSupplies();
}

async function deletePurchase(id) {
    await fetch(`${API_BASE}/compras/${id}`, { method: 'DELETE' });
    loadPurchases();
}

async function deleteSale(id) {
    await fetch(`${API_BASE}/ventas/${id}`, { method: 'DELETE' });
    loadSales();
}

// Edit functions for all sections
async function loadEditAnimalForm() {
    const animalId = document.getElementById('edit-animal-select').value;
    if (!animalId) {
        document.getElementById('edit-animal-form').style.display = 'none';
        return;
    }

    const animal = await fetchData(`/bovinos/${animalId}`);
    const farms = await fetchData('/fincas');
    const lands = await fetchData('/lotes');

    // Populate farm dropdown
    const farmSelect = document.getElementById('edit-animal-farm');
    farmSelect.innerHTML = '<option value="">Select Farm</option>';
    farms.forEach(farm => {
        farmSelect.innerHTML += `<option value="${farm.FincaID}" ${farm.FincaID == animal.FincaID ? 'selected' : ''}>${farm.Nombre}</option>`;
    });

    // Populate land dropdown
    const landSelect = document.getElementById('edit-animal-land');
    landSelect.innerHTML = '<option value="">Select Land</option>';
    lands.forEach(land => {
        landSelect.innerHTML += `<option value="${land.LoteID}" ${land.LoteID == animal.LoteID ? 'selected' : ''}>${land.Nombre_Lote}</option>`;
    });

    // Fill form fields
    document.getElementById('edit-animal-id').value = animal.BovinoID;
    document.getElementById('edit-animal-sexo').value = animal.Sexo || '';
    document.getElementById('edit-animal-raza').value = animal.Raza || '';
    document.getElementById('edit-animal-birth').value = animal.Fecha_Nac ? new Date(animal.Fecha_Nac).toISOString().slice(0, 16) : '';
    document.getElementById('edit-animal-estado').value = animal.Estado || '';
    document.getElementById('edit-animal-madre').value = animal.MadreID || '';
    document.getElementById('edit-animal-padre').value = animal.PadreID || '';
    document.getElementById('edit-animal-origen').value = animal.Origen || '';
    document.getElementById('edit-animal-proposito').value = animal.Propósito || '';

    document.getElementById('edit-animal-form').style.display = 'block';
}

async function updateAnimal(e) {
    e.preventDefault();
    const animalId = document.getElementById('edit-animal-select').value;

    const data = {
        BovinoID: document.getElementById('edit-animal-id').value,
        FincaID: parseInt(document.getElementById('edit-animal-farm').value),
        LoteID: parseInt(document.getElementById('edit-animal-land').value),
        Sexo: document.getElementById('edit-animal-sexo').value,
        Raza: document.getElementById('edit-animal-raza').value,
        Fecha_Nac: document.getElementById('edit-animal-birth').value,
        Estado: document.getElementById('edit-animal-estado').value,
        MadreID: document.getElementById('edit-animal-madre').value,
        PadreID: document.getElementById('edit-animal-padre').value,
        Origen: document.getElementById('edit-animal-origen').value,
        Propósito: document.getElementById('edit-animal-proposito').value
    };

    await fetch(`${API_BASE}/bovinos/${animalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    loadAnimals();
    cancelEditAnimal();
}

function cancelEditAnimal() {
    document.getElementById('edit-animal-select').value = '';
    document.getElementById('edit-animal-form').style.display = 'none';
}

// Health record edit functions
async function loadEditHealthForm() {
    const recordId = document.getElementById('edit-health-select').value;
    if (!recordId) {
        document.getElementById('edit-health-form').style.display = 'none';
        return;
    }

    const record = await fetchData(`/registros_sanitarios/${recordId}`);
    const animals = await fetchData('/bovinos');

    // Populate animal dropdown
    const animalSelect = document.getElementById('edit-health-animal');
    animalSelect.innerHTML = '<option value="">Seleccionar Animal</option>';
    animals.forEach(animal => {
        animalSelect.innerHTML += `<option value="${animal.BovinoID}" ${animal.BovinoID == record.BovinoID ? 'selected' : ''}>${animal.BovinoID} - ${animal.Raza || 'Unknown'}</option>`;
    });

    // Fill form fields
    document.getElementById('edit-health-test-type').value = record.Tipo_Prueba || '';
    document.getElementById('edit-health-status').value = record.Estado_Salud || '';
    document.getElementById('edit-health-result').value = record.Resultado || '';
    document.getElementById('edit-health-sample-date').value = record.Fecha_Muestra ? new Date(record.Fecha_Muestra).toISOString().slice(0, 16) : '';
    document.getElementById('edit-health-laboratory').value = record.Laboratorio || '';
    document.getElementById('edit-health-cost').value = record.Costo_Examen || '';
    document.getElementById('edit-health-observations').value = record.Observaciones || '';

    document.getElementById('edit-health-form').style.display = 'block';
}

async function updateHealthRecord(e) {
    e.preventDefault();
    const recordId = document.getElementById('edit-health-select').value;

    const data = {
        BovinoID: document.getElementById('edit-health-animal').value,
        Tipo_Prueba: document.getElementById('edit-health-test-type').value,
        Estado_Salud: document.getElementById('edit-health-status').value,
        Resultado: document.getElementById('edit-health-result').value,
        Fecha_Muestra: document.getElementById('edit-health-sample-date').value,
        Laboratorio: document.getElementById('edit-health-laboratory').value,
        Costo_Examen: document.getElementById('edit-health-cost').value,
        Observaciones: document.getElementById('edit-health-observations').value
    };

    await fetch(`${API_BASE}/registros_sanitarios/${recordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    loadHealthRecords();
    cancelEditHealth();
}

function cancelEditHealth() {
    document.getElementById('edit-health-select').value = '';
    document.getElementById('edit-health-form').style.display = 'none';
}

// Movement edit functions
async function loadEditMovementForm() {
    const movementId = document.getElementById('edit-movement-select').value;
    if (!movementId) {
        document.getElementById('edit-movement-form').style.display = 'none';
        return;
    }

    const movement = await fetchData(`/movimientos_animales/${movementId}`);
    const animals = await fetchData('/bovinos');
    const farms = await fetchData('/fincas');
    const lands = await fetchData('/lotes');

    // Populate animal dropdown
    const animalSelect = document.getElementById('edit-movement-animal');
    animalSelect.innerHTML = '<option value="">Seleccionar Animal</option>';
    animals.forEach(animal => {
        animalSelect.innerHTML += `<option value="${animal.BovinoID}" ${animal.BovinoID == movement.BovinoID ? 'selected' : ''}>${animal.BovinoID} - ${animal.Raza || 'Unknown'}</option>`;
    });

    // Fill form fields
    document.getElementById('edit-movement-type').value = movement.Tipo_Mov || '';
    document.getElementById('edit-movement-date').value = movement.Fecha ? new Date(movement.Fecha).toISOString().slice(0, 16) : '';
    document.getElementById('edit-movement-motive').value = movement.Motivo || '';

    // Populate origin/destination fields based on movement type
    toggleEditMovementFields();

    document.getElementById('edit-movement-form').style.display = 'block';
}

function toggleEditMovementFields() {
    const movementType = document.getElementById('edit-movement-type').value;
    const originFields = document.getElementById('edit-origin-fields');
    const destFields = document.getElementById('edit-destination-fields');

    if (movementType === 'Interno' || movementType === 'Exportación') {
        originFields.style.display = 'block';
    } else {
        originFields.style.display = 'none';
    }

    if (movementType === 'Interno' || movementType === 'Importación') {
        destFields.style.display = 'block';
    } else {
        destFields.style.display = 'none';
    }
}

async function updateMovement(e) {
    e.preventDefault();
    const movementId = document.getElementById('edit-movement-select').value;

    const data = {
        BovinoID: document.getElementById('edit-movement-animal').value,
        Tipo_Mov: document.getElementById('edit-movement-type').value,
        Fecha: document.getElementById('edit-movement-date').value,
        Finca_Origen: document.getElementById('edit-movement-origin-farm').value || null,
        Lote_Origen: document.getElementById('edit-movement-origin-land').value || null,
        Finca_Destino: document.getElementById('edit-movement-dest-farm').value || null,
        Lote_Destino: document.getElementById('edit-movement-dest-land').value || null,
        Motivo: document.getElementById('edit-movement-motive').value
    };

    await fetch(`${API_BASE}/movimientos_animales/${movementId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    loadMovements();
    cancelEditMovement();
}

function cancelEditMovement() {
    document.getElementById('edit-movement-select').value = '';
    document.getElementById('edit-movement-form').style.display = 'none';
}

// Slaughter weight edit functions
async function loadEditSlaughterForm() {
    const slaughterId = document.getElementById('edit-slaughter-select').value;
    if (!slaughterId) {
        document.getElementById('edit-slaughter-form').style.display = 'none';
        return;
    }

    const record = await fetchData(`/pesajes_canales/${slaughterId}`);
    const animals = await fetchData('/bovinos');

    // Populate animal dropdown
    const animalSelect = document.getElementById('edit-slaughter-animal');
    animalSelect.innerHTML = '<option value="">Seleccionar Animal</option>';
    animals.forEach(animal => {
        animalSelect.innerHTML += `<option value="${animal.BovinoID}" ${animal.BovinoID == record.BovinoID ? 'selected' : ''}>${animal.BovinoID} - ${animal.Raza || 'Unknown'}</option>`;
    });

    // Fill form fields
    document.getElementById('edit-slaughter-date').value = record.Fecha_Sacrificio ? new Date(record.Fecha_Sacrificio).toISOString().slice(0, 16) : '';
    document.getElementById('edit-slaughter-carcass-weight').value = record.Peso_Canal || '';
    document.getElementById('edit-slaughter-observations').value = record.Observaciones || '';

    document.getElementById('edit-slaughter-form').style.display = 'block';
}

async function updateSlaughterWeight(e) {
    e.preventDefault();
    const slaughterId = document.getElementById('edit-slaughter-select').value;

    const data = {
        BovinoID: document.getElementById('edit-slaughter-animal').value,
        Fecha_Sacrificio: document.getElementById('edit-slaughter-date').value,
        Peso_Canal: parseFloat(document.getElementById('edit-slaughter-carcass-weight').value) || null,
        Observaciones: document.getElementById('edit-slaughter-observations').value
    };

    await fetch(`${API_BASE}/pesajes_canales/${slaughterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    loadSlaughterWeights();
    cancelEditSlaughter();
}

function cancelEditSlaughter() {
    document.getElementById('edit-slaughter-select').value = '';
    document.getElementById('edit-slaughter-form').style.display = 'none';
}

// Supplier edit functions
async function loadEditSupplierForm() {
    const supplierId = document.getElementById('edit-supplier-select').value;
    if (!supplierId) {
        document.getElementById('edit-supplier-form').style.display = 'none';
        return;
    }

    const supplier = await fetchData(`/proveedores/${supplierId}`);

    // Fill form fields
    document.getElementById('edit-supplier-name').value = supplier.Nombre || '';
    document.getElementById('edit-supplier-nit').value = supplier.NIT || '';
    document.getElementById('edit-supplier-contact').value = supplier.Contacto || '';
    document.getElementById('edit-supplier-phone').value = supplier.Telefono || '';
    document.getElementById('edit-supplier-email').value = supplier.Correo || '';
    document.getElementById('edit-supplier-city').value = supplier.Ciudad || '';
    document.getElementById('edit-supplier-address').value = supplier.Direccion || '';

    document.getElementById('edit-supplier-form').style.display = 'block';
}

async function updateSupplier(e) {
    e.preventDefault();
    const supplierId = document.getElementById('edit-supplier-select').value;

    const data = {
        Nombre: document.getElementById('edit-supplier-name').value,
        NIT: document.getElementById('edit-supplier-nit').value,
        Contacto: document.getElementById('edit-supplier-contact').value,
        Telefono: document.getElementById('edit-supplier-phone').value,
        Correo: document.getElementById('edit-supplier-email').value,
        Ciudad: document.getElementById('edit-supplier-city').value,
        Direccion: document.getElementById('edit-supplier-address').value
    };

    await fetch(`${API_BASE}/proveedores/${supplierId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    loadSuppliers();
    cancelEditSupplier();
}

function cancelEditSupplier() {
    document.getElementById('edit-supplier-select').value = '';
    document.getElementById('edit-supplier-form').style.display = 'none';
}

// Supply edit functions
async function loadEditSupplyForm() {
    const supplyId = document.getElementById('edit-supply-select').value;
    if (!supplyId) {
        document.getElementById('edit-supply-form').style.display = 'none';
        return;
    }

    const supply = await fetchData(`/insumos/${supplyId}`);
    const suppliers = await fetchData('/proveedores');

    // Populate supplier dropdown
    const supplierSelect = document.getElementById('edit-supply-supplier');
    supplierSelect.innerHTML = '<option value="">Seleccionar Proveedor</option>';
    suppliers.forEach(supplier => {
        supplierSelect.innerHTML += `<option value="${supplier.ProveedorID}" ${supplier.ProveedorID == supply.ProveedorID ? 'selected' : ''}>${supplier.Nombre}</option>`;
    });

    // Fill form fields
    document.getElementById('edit-supply-category').value = supply.Categoria || '';
    document.getElementById('edit-supply-name').value = supply.Nombre || '';
    document.getElementById('edit-supply-price').value = supply.Precio_Unit || '';
    document.getElementById('edit-supply-supplement').checked = supply.Es_Suplemento === 'Yes';
    document.getElementById('edit-supply-medicine').checked = supply.Es_Medicamento === 'Yes';
    document.getElementById('edit-supply-observations').value = supply.Observaciones || '';

    // Update unit field based on category
    updateEditSupplyUnit();

    document.getElementById('edit-supply-form').style.display = 'block';
}

function updateEditSupplyUnit() {
    const category = document.getElementById('edit-supply-category').value;
    const unitContainer = document.getElementById('edit-unit-container');

    switch(category) {
        case 'Agua':
            unitContainer.innerHTML = '<input type="text" id="edit-supply-unit" value="m³" readonly>';
            break;
        case 'Luz':
            unitContainer.innerHTML = '<input type="text" id="edit-supply-unit" value="kWh" readonly>';
            break;
        case 'Medicamento':
            unitContainer.innerHTML = '<input type="text" id="edit-supply-unit" value="unidades" readonly>';
            break;
        case 'Suministros Alimentarios':
            unitContainer.innerHTML = `
                <select id="edit-supply-unit" required>
                    <option value="">Seleccionar Unidad</option>
                    <option value="kg">kg</option>
                    <option value="ton">ton</option>
                </select>
            `;
            // Set current value if it exists
            setTimeout(() => {
                const currentUnit = document.getElementById('edit-supply-unit');
                if (currentUnit && currentUnit.tagName === 'SELECT') {
                    currentUnit.value = document.querySelector('#edit-supply-unit').value || '';
                }
            }, 0);
            break;
        default:
            unitContainer.innerHTML = '<input type="text" id="edit-supply-unit" placeholder="Unidad" readonly>';
    }
}

async function updateSupply(e) {
    e.preventDefault();
    const supplyId = document.getElementById('edit-supply-select').value;

    const data = {
        ProveedorID: document.getElementById('edit-supply-supplier').value,
        Categoria: document.getElementById('edit-supply-category').value,
        Nombre: document.getElementById('edit-supply-name').value,
        Unidad: document.getElementById('edit-supply-unit').value,
        Precio_Unit: parseFloat(document.getElementById('edit-supply-price').value) || null,
        Es_Suplemento: document.getElementById('edit-supply-supplement').checked ? 'Yes' : 'No',
        Es_Medicamento: document.getElementById('edit-supply-medicine').checked ? 'Yes' : 'No',
        Observaciones: document.getElementById('edit-supply-observations').value
    };

    await fetch(`${API_BASE}/insumos/${supplyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    loadSupplies();
    cancelEditSupply();
}

function cancelEditSupply() {
    document.getElementById('edit-supply-select').value = '';
    document.getElementById('edit-supply-form').style.display = 'none';
}

function updateSupplyUnit() {
    const category = document.getElementById('supply-category').value;
    const unitInput = document.getElementById('supply-unit');

    switch(category) {
        case 'Agua':
            unitInput.value = 'm³';
            break;
        case 'Luz':
            unitInput.value = 'kWh';
            break;
        case 'Medicamento':
            unitInput.value = 'unidades';
            break;
        case 'Suministros Alimentarios':
            // For feed supplies, show a select dropdown instead of readonly input
            const unitContainer = document.getElementById('unit-container');
            unitContainer.innerHTML = `
                <select id="supply-unit" required>
                    <option value="">Seleccionar Unidad</option>
                    <option value="kg">kg</option>
                    <option value="ton">ton</option>
                </select>
            `;
            break;
        default:
            unitInput.value = '';
    }
}

document.getElementById('supplier-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const Nombre = document.getElementById('supplier-name').value;
    const NIT = document.getElementById('supplier-nit').value;
    const Contacto = document.getElementById('supplier-contact').value;
    const Telefono = document.getElementById('supplier-phone').value;
    const Correo = document.getElementById('supplier-email').value;
    const Ciudad = document.getElementById('supplier-city').value;
    const Direccion = document.getElementById('supplier-address').value;

    console.log('Sending supplier data:', { Nombre, NIT, Contacto, Telefono, Correo, Ciudad, Direccion }); // Debug log

    try {
        const result = await postData('/proveedores', { Nombre, NIT, Contacto, Telefono, Correo, Ciudad, Direccion });
        console.log('Supplier creation result:', result); // Debug log
        document.getElementById('supplier-form').reset();
        loadSuppliers();
    } catch (error) {
        console.error('Error creating supplier:', error);
        alert('Error al crear el proveedor. Por favor, inténtelo de nuevo.');
    }
});

document.getElementById('supply-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const ProveedorID = document.getElementById('supply-supplier').value;
    const Categoria = document.getElementById('supply-category').value;
    const Nombre = document.getElementById('supply-name').value;
    const Unidad = document.getElementById('supply-unit').value;
    const Precio_Unit = parseFloat(document.getElementById('supply-price').value);
    const Es_Suplemento = document.getElementById('supply-supplement').checked ? 'Yes' : 'No';
    const Es_Medicamento = document.getElementById('supply-medicine').checked ? 'Yes' : 'No';
    const Observaciones = document.getElementById('supply-observations').value;

    console.log('Sending supply data:', { ProveedorID, Categoria, Nombre, Unidad, Precio_Unit, Es_Suplemento, Es_Medicamento, Observaciones }); // Debug log

    try {
        const result = await postData('/insumos', { ProveedorID, Categoria, Nombre, Unidad, Precio_Unit, Es_Suplemento, Es_Medicamento, Observaciones });
        console.log('Supply creation result:', result); // Debug log
        document.getElementById('supply-form').reset();
        // Reset the unit container back to readonly input
        document.getElementById('unit-container').innerHTML = '<input type="text" id="supply-unit" placeholder="Unidad" readonly>';
        loadSupplies();
    } catch (error) {
        console.error('Error creating supply:', error);
        alert('Error al crear el suministro. Por favor, inténtelo de nuevo.');
    }
});

document.getElementById('purchase-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const ProveedorID = document.getElementById('purchase-supplier').value;
    const FincaID = parseInt(document.getElementById('purchase-farm').value);
    const InsumoID = document.getElementById('purchase-supply').value;
    const Fecha = document.getElementById('purchase-date').value;
    const Cantidad = parseFloat(document.getElementById('purchase-quantity').value);
    const Precio_Unitario = parseFloat(document.getElementById('purchase-unit-price').value);
    const Moneda = document.getElementById('purchase-currency').value;
    const Observaciones = document.getElementById('purchase-observations').value;

    // Calculate totals according to Colombian tax rules
    // Subtotal = (quantity * unit_price) * 0.81 (base imponible)
    // Total = quantity * unit_price (total bruto)
    // Taxes = total - subtotal (IVA 19%)
    const baseAmount = Cantidad * Precio_Unitario;
    const Subtotal = baseAmount * 0.81;
    const Total = baseAmount;
    const Impuestos = Total - Subtotal;

    console.log('Sending purchase data:', { ProveedorID, FincaID, InsumoID, Fecha, Cantidad, Precio_Unitario, Impuestos, Subtotal, Total, Moneda, Observaciones }); // Debug log

    try {
        const result = await postData('/compras', { ProveedorID, FincaID, InsumoID, Fecha, Cantidad, Precio_Unitario, Impuestos, Subtotal, Total, Moneda, Observaciones });
        console.log('Purchase creation result:', result); // Debug log
        document.getElementById('purchase-form').reset();
        loadPurchases();
    } catch (error) {
        console.error('Error creating purchase:', error);
        alert('Error al crear la compra. Por favor, inténtelo de nuevo.');
    }
});

// Function to update unit price when supply is selected and calculate totals
function updatePurchaseCalculations() {
    const quantity = parseFloat(document.getElementById('purchase-quantity').value) || 0;
    const unitPrice = parseFloat(document.getElementById('purchase-unit-price').value) || 0;

    // Calculate totals according to Colombian tax rules
    const baseAmount = quantity * unitPrice;
    const subtotal = baseAmount * 0.81; // Base imponible
    const total = baseAmount; // Total bruto
    const taxes = total - subtotal; // IVA 19%

    document.getElementById('purchase-subtotal').value = subtotal.toFixed(2);
    document.getElementById('purchase-taxes').value = taxes.toFixed(2);
    document.getElementById('purchase-total').value = total.toFixed(2);
}

document.getElementById('purchase-supply').addEventListener('change', function(e) {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const price = selectedOption.getAttribute('data-price');
    if (price && price !== '0') {
        document.getElementById('purchase-unit-price').value = price;
        updatePurchaseCalculations();
    }
});

document.getElementById('purchase-quantity').addEventListener('input', updatePurchaseCalculations);
document.getElementById('purchase-unit-price').addEventListener('input', updatePurchaseCalculations);

// Function to update sale calculations
function updateSaleCalculations() {
    // Get selected animals and calculate total weight
    const selectedCheckboxes = document.querySelectorAll('#slaughtered-animals-list input[type="checkbox"]:checked');
    let totalWeight = 0;

    selectedCheckboxes.forEach(checkbox => {
        const label = document.querySelector(`label[for="${checkbox.id}"]`);
        const weightMatch = label.textContent.match(/(\d+(?:\.\d+)?)kg carne/);
        if (weightMatch) {
            totalWeight += parseFloat(weightMatch[1]);
        }
    });

    // Constants
    const pricePerKg = 8928; // COP per kg
    const profitMargin = 1.1; // 10% profit margin

    // Calculate total: (price/kg) * (1.19) * profit_margin * total_weight
    const total = pricePerKg * 1.19 * profitMargin * totalWeight;

    // Calculate according to Colombian tax rules
    const subtotal = total * 0.81; // Subtotal = total * 0.81
    const taxes = total * 0.19; // Impuestos = total * 0.19
    const profits = total - (subtotal + taxes); // Profits = total - (subtotal + taxes)

    document.getElementById('sale-total').value = 'COP$' + total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    document.getElementById('sale-subtotal').value = 'COP$' + subtotal.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    document.getElementById('sale-taxes').value = 'COP$' + taxes.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

document.getElementById('sale-farm').addEventListener('change', updateSaleCalculations);

async function loadSlaughteredAnimals() {
    const selectedFarm = document.getElementById('sale-farm').value;
    if (!selectedFarm) {
        document.getElementById('animal-selection').style.display = 'none';
        return;
    }

    try {
        const slaughterWeights = await fetchData('/pesajes_canales');
        const animals = await fetchData('/bovinos');

        // Filter slaughter weights by selected farm
        const farmSlaughterWeights = slaughterWeights.filter(sw => {
            const animal = animals.find(a => a.BovinoID === sw.BovinoID);
            return animal && animal.FincaID == selectedFarm;
        });

        const list = document.getElementById('slaughtered-animals-list');
        list.innerHTML = '';

        if (farmSlaughterWeights.length === 0) {
            list.innerHTML = '<p>No hay animales sacrificados en esta finca.</p>';
        } else {
            farmSlaughterWeights.forEach(sw => {
                const animal = animals.find(a => a.BovinoID === sw.BovinoID);
                const animalDisplay = animal ? `${sw.BovinoID} - ${animal.Raza || 'Unknown'} - ${sw.Peso_Canal}kg carne` : sw.BovinoID;
                list.innerHTML += `
                    <div style="margin: 5px 0;">
                        <input type="checkbox" id="animal-${sw.CanalID}" value="${sw.CanalID}" onchange="updateSelectedAnimals()">
                        <label for="animal-${sw.CanalID}">${animalDisplay}</label>
                    </div>
                `;
            });
        }

        document.getElementById('animal-selection').style.display = 'block';
    } catch (error) {
        console.error('Error loading slaughtered animals:', error);
    }
}

function updateSelectedAnimals() {
    const selectedCheckboxes = document.querySelectorAll('#slaughtered-animals-list input[type="checkbox"]:checked');
    const selectedList = document.getElementById('selected-animals-list');

    selectedList.innerHTML = '';
    selectedCheckboxes.forEach(checkbox => {
        const label = document.querySelector(`label[for="${checkbox.id}"]`);
        selectedList.innerHTML += `<div>${label.textContent}</div>`;
    });

    // Update calculations when selection changes
    updateSaleCalculations();
}

document.getElementById('sale-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const Cliente = document.getElementById('sale-client').value;
    const Tipo_Venta = document.getElementById('sale-type').value;
    const FincaID = parseInt(document.getElementById('sale-farm').value);
    const Fecha = document.getElementById('sale-date').value;
    const Total = parseFloat(document.getElementById('sale-total').value.replace('COP$', '').replace(/\./g, '').replace(',', '.'));
    const Observaciones = document.getElementById('sale-observations').value;

    // Get selected animals
    const selectedAnimals = Array.from(document.querySelectorAll('#slaughtered-animals-list input[type="checkbox"]:checked')).map(cb => cb.value);

    console.log('Sending sale data:', { Cliente, Tipo_Venta, FincaID, Fecha, Total, Observaciones, AnimalesSeleccionados: selectedAnimals }); // Debug log

    try {
        const result = await postData('/ventas', { Cliente, Tipo_Venta, FincaID, Fecha, Total, Observaciones, AnimalesSeleccionados: selectedAnimals });
        console.log('Sale creation result:', result); // Debug log
        document.getElementById('sale-form').reset();
        // Reset calculated fields
        document.getElementById('sale-subtotal').value = '';
        document.getElementById('sale-taxes').value = '';
        // Reset animal selection
        document.getElementById('animal-selection').style.display = 'none';
        document.getElementById('selected-animals-list').innerHTML = '';
        loadSales();
    } catch (error) {
        console.error('Error creating sale:', error);
        alert('Error al crear la venta. Por favor, inténtelo de nuevo.');
    }
});

document.getElementById('ration-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const Nombre_Racion = document.getElementById('ration-name').value;
    const Tipo = document.getElementById('ration-type').value;
    const Objetivo = document.getElementById('ration-objective').value;
    const Observaciones = document.getElementById('ration-observations').value;

    console.log('Sending ration data:', { Nombre_Racion, Tipo, Objetivo, Observaciones }); // Debug log

    try {
        const result = await postData('/alimentacion', { Nombre_Racion, Tipo, Objetivo, Observaciones });
        console.log('Ration creation result:', result); // Debug log
        document.getElementById('ration-form').reset();
        loadRations();
        loadSuppliesForIngredients(); // Reload supplies for ingredients dropdown
    } catch (error) {
        console.error('Error creating ration:', error);
        alert('Error al crear la ración. Por favor, inténtelo de nuevo.');
    }
});

document.getElementById('ration-ingredient-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const IngRacionID = document.getElementById('ration-ingredient-id').value;
    const RacionID = document.getElementById('ration-ingredient-ration').value;
    const InsumoID = document.getElementById('ration-ingredient-supply').value;
    const PorcentajeMS = parseFloat(document.getElementById('ration-ingredient-percentage').value);

    // Calculate estimated cost: unit price * percentage MS
    const selectedSupply = document.getElementById('ration-ingredient-supply');
    const selectedOption = selectedSupply.options[selectedSupply.selectedIndex];
    const unitPrice = parseFloat(selectedOption.getAttribute('data-price')) || 0;
    const Costo_Estimado = unitPrice * (PorcentajeMS / 100);

    // Ensure cost field is read-only and cannot be modified
    const costField = document.getElementById('ration-ingredient-cost');
    costField.readOnly = true;
    costField.value = Costo_Estimado.toFixed(2);

    console.log('Sending ration ingredient data:', { IngRacionID, RacionID, InsumoID, PorcentajeMS, Costo_Estimado }); // Debug log

    try {
        const result = await postData('/ingredientes_racion', { IngRacionID, RacionID, InsumoID, PorcentajeMS, Costo_Estimado });
        console.log('Ration ingredient creation result:', result); // Debug log
        document.getElementById('ration-ingredient-form').reset();
        loadRationIngredients();
    } catch (error) {
        console.error('Error creating ration ingredient:', error);
        // Check if it's a percentage validation error
        if (error.message && error.message.includes('porcentaje')) {
            alert(error.message);
        } else {
            alert('Error al crear el ingrediente de ración. Por favor, inténtelo de nuevo.');
        }
    }
});

async function deleteSupplier(id) {
    await fetch(`${API_BASE}/proveedores/${id}`, { method: 'DELETE' });
    loadSuppliers();
}

// Delete functions
async function deleteFarm(id) {
    await fetch(`${API_BASE}/fincas/${id}`, { method: 'DELETE' });
    loadFarms();
}

async function deleteLand(id) {
    await fetch(`${API_BASE}/lotes/${id}`, { method: 'DELETE' });
    loadLands();
}

async function deleteAnimal(id) {
    await fetch(`${API_BASE}/bovinos/${id}`, { method: 'DELETE' });
    loadAnimals();
}

// Analytics
document.getElementById('analytics-farm').addEventListener('change', async (e) => {
    const farmId = e.target.value;
    if (farmId) {
        const analytics = await fetchData(`/analytics/farm/${farmId}`);
        document.getElementById('farm-analytics').innerHTML = `
            <p>Status: ${analytics.status}</p>
            <p>Total Lands: ${analytics.total_lands}</p>
            <p>Total Animals: ${analytics.total_animals}</p>
        `;
    } else {
        document.getElementById('farm-analytics').innerHTML = '';
    }
});

document.getElementById('analytics-land').addEventListener('change', async (e) => {
    const landId = e.target.value;
    if (landId) {
        const analytics = await fetchData(`/analytics/land/${landId}`);
        document.getElementById('land-analytics').innerHTML = `
            <p>Status: ${analytics.status}</p>
            <p>Animal Count: ${analytics.animal_count}</p>
            <p>Low Resources: ${analytics.low_resources.join(', ') || 'None'}</p>
            <p>Latest Feed: ${analytics.latest_feed || 'N/A'}</p>
            <p>Latest Water: ${analytics.latest_water || 'N/A'}</p>
        `;
    } else {
        document.getElementById('land-analytics').innerHTML = '';
    }
});

document.getElementById('analytics-animal').addEventListener('change', async (e) => {
    const animalId = e.target.value;
    if (animalId) {
        const analytics = await fetchData(`/analytics/animal/${animalId}`);
        document.getElementById('animal-analytics').innerHTML = `
            <p>Status: ${analytics.status}</p>
            <p>Latest Weight: ${analytics.latest_weight || 'N/A'} kg</p>
            <p>Total Emissions: ${analytics.total_emissions.toFixed(2)}</p>
            <p>Total Costs: ${analytics.total_costs.toFixed(2)}</p>
            <p>Total Revenue: ${analytics.total_revenue.toFixed(2)}</p>
            <p>Energy Consumption: ${analytics.energy_consumption.toFixed(2)}</p>
        `;
    } else {
        document.getElementById('animal-analytics').innerHTML = '';
    }
});

// Edit farm functions
async function editFarm(id) {
    const farm = await fetchData(`/fincas/${id}`);
    document.getElementById('edit-farm-select').value = id;
    document.getElementById('edit-farm-name').value = farm.Nombre || '';
    document.getElementById('edit-farm-depto').value = farm.Depto || '';
    document.getElementById('edit-farm-municipio').value = farm.Municipio || '';
    document.getElementById('edit-farm-area').value = farm.Area_ha || '';
    document.getElementById('edit-farm-propietario').value = farm.Propietario || '';
    document.getElementById('edit-farm-uso').value = farm.Uso_Suelo || '';
    document.getElementById('edit-farm-lat').value = farm.Lat || '';
    document.getElementById('edit-farm-lon').value = farm.Lon || '';
    document.getElementById('edit-farm-fecha').value = farm.Fecha_Registro ? new Date(farm.Fecha_Registro).toISOString().slice(0, 16) : '';
    document.getElementById('edit-farm-form').style.display = 'flex';
}

function cancelEditFarm() {
    document.getElementById('edit-farm-form').style.display = 'none';
    document.getElementById('edit-farm-select').value = '';
}

document.getElementById('edit-farm-select').addEventListener('change', async (e) => {
    const farmId = e.target.value;
    if (farmId) {
        await editFarm(farmId);
    } else {
        cancelEditFarm();
    }
});

document.getElementById('edit-farm-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const farmId = document.getElementById('edit-farm-select').value;
    const Nombre = document.getElementById('edit-farm-name').value;
    const Depto = document.getElementById('edit-farm-depto').value;
    const Municipio = document.getElementById('edit-farm-municipio').value;
    const Area_ha = parseFloat(document.getElementById('edit-farm-area').value);
    const Propietario = document.getElementById('edit-farm-propietario').value;
    const Uso_Suelo = document.getElementById('edit-farm-uso').value;
    const Lat = parseFloat(document.getElementById('edit-farm-lat').value);
    const Lon = parseFloat(document.getElementById('edit-farm-lon').value);
    const Fecha_Registro = document.getElementById('edit-farm-fecha').value;

    await fetch(`${API_BASE}/fincas/${farmId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Nombre, Depto, Municipio, Area_ha, Propietario, Uso_Suelo, Lat, Lon, Fecha_Registro }),
    });

    cancelEditFarm();
    loadFarms();
});

// Function to update land activity options based on selected farm
function updateLandActivityOptions() {
    const farmSelect = document.getElementById('land-farm');
    const activitySelect = document.getElementById('land-actividad');
    const selectedFarmId = farmSelect.value;

    if (!selectedFarmId) {
        activitySelect.innerHTML = '<option value="">Select Actividad Ganado</option>';
        return;
    }

    // Get farm data to check its Uso_Suelo
    fetchData(`/fincas/${selectedFarmId}`).then(farm => {
        activitySelect.innerHTML = '<option value="">Select Actividad Ganado</option>';

        if (farm.Uso_Suelo === 'Recuperación') {
            // Only show Recuperación option
            activitySelect.innerHTML += '<option value="Recuperación">Recuperación</option>';
        } else {
            // Show Cría, Levante, Ceba options for Carne farms
            activitySelect.innerHTML += `
                <option value="Cría">Cría</option>
                <option value="Levante">Levante</option>
                <option value="Ceba">Ceba</option>
            `;
        }
    });
}

// Add event listener for farm selection change
document.getElementById('land-farm').addEventListener('change', updateLandActivityOptions);

// Edit land functions
async function editLand(id) {
    const lote = await fetchData(`/lotes/${id}`);
    document.getElementById('edit-land-select').value = id;
    document.getElementById('edit-land-farm').value = lote.FincaID || '';
    document.getElementById('edit-land-name').value = lote.Nombre_Lote || '';
    document.getElementById('edit-land-area').value = lote.Area_ha || '';
    document.getElementById('edit-land-actividad').value = lote.Actividad_Ganado || '';
    document.getElementById('edit-land-obs').value = lote.Observaciones || '';
    document.getElementById('edit-land-form').style.display = 'flex';

    // Load farms for the edit form
    const farms = await fetchData('/fincas');
    const farmSelect = document.getElementById('edit-land-farm');
    farmSelect.innerHTML = '<option value="">Select Farm</option>';
    farms.forEach(farm => {
        farmSelect.innerHTML += `<option value="${farm.FincaID}">${farm.Nombre}</option>`;
    });
}

function cancelEditLand() {
    document.getElementById('edit-land-form').style.display = 'none';
    document.getElementById('edit-land-select').value = '';
}

document.getElementById('edit-land-select').addEventListener('change', async (e) => {
    const landId = e.target.value;
    if (landId) {
        await editLand(landId);
    } else {
        cancelEditLand();
    }
});

document.getElementById('edit-land-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const landId = document.getElementById('edit-land-select').value;
    const FincaID = parseInt(document.getElementById('edit-land-farm').value);
    const Nombre_Lote = document.getElementById('edit-land-name').value;
    const Area_ha = parseFloat(document.getElementById('edit-land-area').value);
    const Actividad_Ganado = document.getElementById('edit-land-actividad').value;
    const Observaciones = document.getElementById('edit-land-obs').value;

    // Validate that land area doesn't exceed farm area
    try {
        const farm = await fetchData(`/fincas/${FincaID}`);
        const existingLands = await fetchData('/lotes');
        const totalUsedArea = existingLands
            .filter(land => land.FincaID === FincaID && land.LoteID !== parseInt(landId))
            .reduce((sum, land) => sum + (land.Area_ha || 0), 0);

        if (totalUsedArea + Area_ha > farm.Area_ha) {
            alert(`Error: La suma de áreas de terrenos (${(totalUsedArea + Area_ha).toFixed(2)} ha) no puede superar el área total de la finca (${farm.Area_ha} ha). Área disponible: ${(farm.Area_ha - totalUsedArea).toFixed(2)} ha.`);
            return;
        }

        await fetch(`${API_BASE}/lotes/${landId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ FincaID, Nombre_Lote, Area_ha, Actividad_Ganado, Observaciones }),
        });

        cancelEditLand();
        loadLands();
    } catch (error) {
        console.error('Error updating land:', error);
        alert('Error al actualizar el terreno. Por favor, inténtelo de nuevo.');
    }
});

// Function to update edit land activity options based on selected farm
function updateEditLandActivityOptions() {
    const farmSelect = document.getElementById('edit-land-farm');
    const activitySelect = document.getElementById('edit-land-actividad');
    const selectedFarmId = farmSelect.value;

    if (!selectedFarmId) {
        activitySelect.innerHTML = '<option value="">Select Actividad Ganado</option>';
        return;
    }

    // Get farm data to check its Uso_Suelo
    fetchData(`/fincas/${selectedFarmId}`).then(farm => {
        activitySelect.innerHTML = '<option value="">Select Actividad Ganado</option>';

        if (farm.Uso_Suelo === 'Recuperación') {
            // Only show Recuperación option
            activitySelect.innerHTML += '<option value="Recuperación">Recuperación</option>';
        } else {
            // Show Cría, Levante, Ceba options for Carne farms
            activitySelect.innerHTML += `
                <option value="Cría">Cría</option>
                <option value="Levante">Levante</option>
                <option value="Ceba">Ceba</option>
            `;
        }
    });
}

// Add event listener for edit land farm selection change
document.getElementById('edit-land-farm').addEventListener('change', updateEditLandActivityOptions);

// Load animal rations
async function loadAnimalRations() {
    try {
        const animalRations = await fetchData('/racion_animal');
        const rations = await fetchData('/alimentacion');
        const bovinos = await fetchData('/bovinos');
        const list = document.getElementById('animal-rations-list');

        list.innerHTML = '';

        animalRations.forEach(animalRation => {
            // Get ration name
            const ration = rations.find(r => r.RacionID === animalRation.RacionID);
            const rationName = ration ? ration.Nombre_Racion : animalRation.RacionID;

            // Get animal info
            const bovino = bovinos.find(b => b.BovinoID === animalRation.BovinoID);
            const animalInfo = bovino ? `${bovino.BovinoID} - ${bovino.Raza || 'Unknown'}` : animalRation.BovinoID;

            list.innerHTML += `<li>Asignación ${animalRation.RacionAnimalID} - Ración: ${rationName} - Animal: ${animalInfo} - Fecha de inicio de este tipo de alimentación: ${animalRation.Fecha_Inicio || 'No especificada'} - Fecha estimada de finalización de la misma: ${animalRation.Fecha_Fin || 'No especificada'} <button onclick="deleteAnimalRation('${animalRation.RacionAnimalID}')">Eliminar</button></li>`;
        });
    } catch (error) {
        console.log('Animal rations endpoint not available yet');
    }
}

// Load animals for animal rations form
async function loadAnimalRationsAnimals() {
    const bovinos = await fetchData('/bovinos');
    const animalSelect = document.getElementById('animal-ration-animal');

    animalSelect.innerHTML = '<option value="">Seleccionar Animal</option>';

    bovinos.forEach(bovino => {
        const display = `${bovino.BovinoID} - ${bovino.Raza || 'Unknown'} - ${bovino.Estado}`;
        animalSelect.innerHTML += `<option value="${bovino.BovinoID}">${display}</option>`;
    });
}

// Delete animal ration function
async function deleteAnimalRation(id) {
    await fetch(`${API_BASE}/racion_animal/${id}`, { method: 'DELETE' });
    loadAnimalRations();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadFarms();
    loadLands();
    loadAnimals();
    loadHealthAnimals();
    loadHealthRecords();
    loadMovementAnimals();
    loadMovementFarms();
    loadMovements();
    loadSlaughterWeights();
    loadSuppliers();
    loadSupplies();
    loadPurchases();
    loadSales();
    loadRations();
    loadSuppliesForIngredients();
    loadRationIngredients();
    loadAnimalRations();

    // Initialize edit forms
    initializeEditForms();

    // Initialize animal ration form
    document.getElementById('animal-ration-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const RacionID = document.getElementById('animal-ration-ration').value;
        const BovinoID = document.getElementById('animal-ration-animal').value;
        const Fecha_Inicio = document.getElementById('animal-ration-start').value;
        const Fecha_Fin = document.getElementById('animal-ration-end').value;
        const Observaciones = document.getElementById('animal-ration-observations').value;

        console.log('Sending animal ration data:', { RacionID, BovinoID, Fecha_Inicio, Fecha_Fin, Observaciones }); // Debug log

        try {
            const result = await postData('/racion_animal', { RacionID, BovinoID, Fecha_Inicio, Fecha_Fin, Observaciones });
            console.log('Animal ration creation result:', result); // Debug log
            document.getElementById('animal-ration-form').reset();
            loadAnimalRations();
        } catch (error) {
            console.error('Error creating animal ration:', error);
            alert('Error al asignar ración a animal. Por favor, inténtelo de nuevo.');
        }
    });

    // Populate animal select dropdown in animal rations form
    loadAnimalRationsAnimals();
});

// Load rations
async function loadRations() {
    try {
        const rations = await fetchData('/alimentacion');
        const list = document.getElementById('rations-list');
        const editSelect = document.getElementById('edit-ration-select');
        const ingredientSelect = document.getElementById('ration-ingredient-ration');
        const animalRationSelect = document.getElementById('animal-ration-ration');

        list.innerHTML = '';
        editSelect.innerHTML = '<option value="">Seleccionar Ración para Editar</option>';
        ingredientSelect.innerHTML = '<option value="">Seleccionar Ración</option>';
        animalRationSelect.innerHTML = '<option value="">Seleccionar Ración</option>';

        rations.forEach(ration => {
            list.innerHTML += `<li>Ración ${ration.RacionID} - ${ration.Nombre_Racion} - ${ration.Tipo} - ${ration.Objetivo || 'Sin objetivo'} <button onclick="deleteRation('${ration.RacionID}')">Eliminar</button></li>`;
            editSelect.innerHTML += `<option value="${ration.RacionID}">${ration.RacionID} - ${ration.Nombre_Racion}</option>`;
            ingredientSelect.innerHTML += `<option value="${ration.RacionID}">${ration.RacionID} - ${ration.Nombre_Racion}</option>`;
            animalRationSelect.innerHTML += `<option value="${ration.RacionID}">${ration.RacionID} - ${ration.Nombre_Racion}</option>`;
        });
    } catch (error) {
        console.log('Rations endpoint not available yet');
    }
}

// Delete ration function
async function deleteRation(id) {
    await fetch(`${API_BASE}/alimentacion/${id}`, { method: 'DELETE' });
    loadRations();
    loadSuppliesForIngredients(); // Reload supplies for ingredients dropdown
}

// Load ration ingredients
async function loadRationIngredients() {
    try {
        const ingredients = await fetchData('/ingredientes_racion');
        const list = document.getElementById('ration-ingredients-list');

        list.innerHTML = '';

        ingredients.forEach(ingredient => {
            list.innerHTML += `<li>Ingrediente ${ingredient.IngRacionID} - Ración ${ingredient.RacionID} - Suministro ${ingredient.InsumoID} - ${ingredient.PorcentajeMS}% MS - Costo Estimado: $${ingredient.Costo_Estimado?.toFixed(2) || '0.00'} (solo visualización) <button onclick="deleteRationIngredient('${ingredient.IngRacionID}')">Eliminar</button></li>`;
        });
    } catch (error) {
        console.log('Ration ingredients endpoint not available yet');
    }
}

// Delete ration ingredient function
async function deleteRationIngredient(id) {
    await fetch(`${API_BASE}/ingredientes_racion/${id}`, { method: 'DELETE' });
    loadRationIngredients();
}

// Load purchases endpoint (if it exists)
async function loadPurchases() {
    try {
        const compras = await fetchData('/compras');
        const list = document.getElementById('purchases-list');
        const editSelect = document.getElementById('edit-purchase-select');

        list.innerHTML = '';
        editSelect.innerHTML = '<option value="">Seleccionar Compra para Editar</option>';

        compras.forEach(compra => {
            list.innerHTML += `<li>Compra ${compra.CompraID} - ${compra.Cantidad} unidades - $${compra.Total} ${compra.Moneda} (${compra.Fecha || 'Sin fecha'}) <button onclick="deletePurchase('${compra.CompraID}')">Eliminar</button></li>`;
            editSelect.innerHTML += `<option value="${compra.CompraID}">${compra.CompraID} - ${compra.Total} ${compra.Moneda}</option>`;
        });
    } catch (error) {
        console.log('Purchases endpoint not available yet');
    }
}

// Edit sale functions
async function loadEditSaleForm() {
    const saleId = document.getElementById('edit-sale-select').value;
    if (!saleId) {
        document.getElementById('edit-sale-form').style.display = 'none';
        return;
    }

    const sale = await fetchData(`/ventas/${saleId}`);
    const farms = await fetchData('/fincas');

    // Populate farm dropdown
    const farmSelect = document.getElementById('edit-sale-farm');
    farmSelect.innerHTML = '<option value="">Seleccionar Finca</option>';
    farms.forEach(farm => {
        farmSelect.innerHTML += `<option value="${farm.FincaID}" ${farm.FincaID == sale.FincaID ? 'selected' : ''}>${farm.Nombre}</option>`;
    });

    // Fill form fields
    document.getElementById('edit-sale-client').value = sale.Cliente || '';
    document.getElementById('edit-sale-type').value = sale.Tipo_Venta || '';
    document.getElementById('edit-sale-date').value = sale.Fecha ? new Date(sale.Fecha).toISOString().slice(0, 16) : '';
    document.getElementById('edit-sale-total').value = sale.Total || '';
    document.getElementById('edit-sale-subtotal').value = sale.Subtotal || '';
    document.getElementById('edit-sale-taxes').value = sale.Impuestos || '';
    document.getElementById('edit-sale-observations').value = sale.Observaciones || '';

    document.getElementById('edit-sale-form').style.display = 'block';
}

async function updateSale(e) {
    e.preventDefault();
    const saleId = document.getElementById('edit-sale-select').value;

    const data = {
        Cliente: document.getElementById('edit-sale-client').value,
        Tipo_Venta: document.getElementById('edit-sale-type').value,
        FincaID: parseInt(document.getElementById('edit-sale-farm').value),
        Fecha: document.getElementById('edit-sale-date').value,
        Total: parseFloat(document.getElementById('edit-sale-total').value),
        Observaciones: document.getElementById('edit-sale-observations').value
    };

    await fetch(`${API_BASE}/ventas/${saleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    loadSales();
    cancelEditSale();
}

function cancelEditSale() {
    document.getElementById('edit-sale-select').value = '';
    document.getElementById('edit-sale-form').style.display = 'none';
}

// Function to update edit sale calculations
function updateEditSaleCalculations() {
    const total = parseFloat(document.getElementById('edit-sale-total').value) || 0;

    // Calculate according to Colombian tax rules
    const subtotal = total * 0.81; // Subtotal = total * 0.81
    const taxes = total * 0.19; // Impuestos = total * 0.19

    document.getElementById('edit-sale-subtotal').value = subtotal.toFixed(2);
    document.getElementById('edit-sale-taxes').value = taxes.toFixed(2);
}

document.getElementById('edit-sale-total').addEventListener('input', updateEditSaleCalculations);

// Ration edit functions
async function loadEditRationForm() {
    const rationId = document.getElementById('edit-ration-select').value;
    if (!rationId) {
        document.getElementById('edit-ration-form').style.display = 'none';
        return;
    }

    const ration = await fetchData(`/alimentacion/${rationId}`);

    // Fill form fields
    document.getElementById('edit-ration-name').value = ration.Nombre_Racion || '';
    document.getElementById('edit-ration-type').value = ration.Tipo || '';
    document.getElementById('edit-ration-objective').value = ration.Objetivo || '';
    document.getElementById('edit-ration-observations').value = ration.Observaciones || '';

    document.getElementById('edit-ration-form').style.display = 'block';
}

async function updateRation(e) {
    e.preventDefault();
    const rationId = document.getElementById('edit-ration-select').value;

    const data = {
        Nombre_Racion: document.getElementById('edit-ration-name').value,
        Tipo: document.getElementById('edit-ration-type').value,
        Objetivo: document.getElementById('edit-ration-objective').value,
        Observaciones: document.getElementById('edit-ration-observations').value
    };

    await fetch(`${API_BASE}/alimentacion/${rationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    loadRations();
    cancelEditRation();
}

function cancelEditRation() {
    document.getElementById('edit-ration-select').value = '';
    document.getElementById('edit-ration-form').style.display = 'none';
}

// Load purchases endpoint (if it exists)
async function loadPurchases() {
    try {
        const compras = await fetchData('/compras');
        const list = document.getElementById('purchases-list');
        const editSelect = document.getElementById('edit-purchase-select');

        list.innerHTML = '';
        editSelect.innerHTML = '<option value="">Seleccionar Compra para Editar</option>';

        compras.forEach(compra => {
            list.innerHTML += `<li>Compra ${compra.CompraID} - ${compra.Cantidad} unidades - $${compra.Total} ${compra.Moneda} (${compra.Fecha || 'Sin fecha'}) <button onclick="deletePurchase('${compra.CompraID}')">Eliminar</button></li>`;
            editSelect.innerHTML += `<option value="${compra.CompraID}">${compra.CompraID} - ${compra.Total} ${compra.Moneda}</option>`;
        });
    } catch (error) {
        console.log('Purchases endpoint not available yet');
    }
}

function initializeEditForms() {
    // Animal edit form
    document.getElementById('edit-animal-select').addEventListener('change', loadEditAnimalForm);
    document.getElementById('edit-animal-form').addEventListener('submit', updateAnimal);

    // Health record edit form
    document.getElementById('edit-health-select').addEventListener('change', loadEditHealthForm);
    document.getElementById('edit-health-form').addEventListener('submit', updateHealthRecord);

    // Movement edit form
    document.getElementById('edit-movement-select').addEventListener('change', loadEditMovementForm);
    document.getElementById('edit-movement-form').addEventListener('submit', updateMovement);

    // Slaughter weight edit form
    document.getElementById('edit-slaughter-select').addEventListener('change', loadEditSlaughterForm);
    document.getElementById('edit-slaughter-form').addEventListener('submit', updateSlaughterWeight);

    // Supplier edit form
    document.getElementById('edit-supplier-select').addEventListener('change', loadEditSupplierForm);
    document.getElementById('edit-supplier-form').addEventListener('submit', updateSupplier);

    // Supply edit form
    document.getElementById('edit-supply-select').addEventListener('change', loadEditSupplyForm);
    document.getElementById('edit-supply-form').addEventListener('submit', updateSupply);

    // Sale edit form
    document.getElementById('edit-sale-select').addEventListener('change', loadEditSaleForm);
    document.getElementById('edit-sale-form').addEventListener('submit', updateSale);

    // Ration edit form
    document.getElementById('edit-ration-select').addEventListener('change', loadEditRationForm);
    document.getElementById('edit-ration-form').addEventListener('submit', updateRation);
}