<<<<<<< HEAD
# Livestock Management System

A comprehensive web-based system for managing livestock operations, including farm management, animal tracking, health records, financial management, and analytics.

## Features

- **Farm Management**: Manage multiple farms, lots, and land areas
- **Animal Tracking**: Complete CRUD operations for livestock with detailed records
- **Health Records**: Track veterinary visits, vaccinations, and health status
- **Movement Tracking**: Record animal movements between farms and lots
- **Slaughter Management**: Track meat production and yields
- **Supplier Management**: Manage suppliers and purchase records
- **Financial Tracking**: Monitor costs, revenues, and profitability
- **Nutrition Management**: Create and assign feed rations to animals
- **Analytics Dashboard**: View performance metrics and insights
- **File Upload Support**: Upload certificates and documents

## Technology Stack

- **Backend**: Python Flask with SQLAlchemy
- **Database**: SQLite
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **File Handling**: Werkzeug for secure file uploads

## Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jpcc51/thesis-repo.git
   cd thesis-repo
   ```

2. **Create and activate virtual environment:**
   ```bash
   cd Backend
   python -m venv .venv
   # On Windows:
   .venv\Scripts\activate
   # On macOS/Linux:
   source .venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application:**
   ```bash
   python app.py
   ```

5. **Access the application:**
   Open your browser and navigate to: http://localhost:5000

## Database

The application uses SQLite database which is automatically created when you first run the app. The database includes the following main tables:

- `fincas` - Farm information
- `lotes` - Land lots within farms
- `bovinos` - Livestock animals
- `registros_sanitarios` - Health records
- `movimientos_animales` - Animal movements
- `pesajes_canales` - Slaughter weights
- `proveedores` - Suppliers
- `insumos` - Supplies and inputs
- `compras` - Purchase records
- `ventas` - Sales records
- `alimentacion` - Feed rations
- And more...

## Project Structure

```
thesis-repo/
├── Backend/
│   ├── app.py                 # Main Flask application
│   ├── create_db.py          # Database creation script
│   ├── requirements.txt       # Python dependencies
│   ├── livestock.db          # SQLite database (auto-generated)
│   ├── uploads/              # Uploaded files directory
│   └── .venv/                # Virtual environment (not in repo)
├── Frontend/
│   ├── index.html            # Main HTML page
│   ├── script.js             # Frontend JavaScript
│   └── styles.css            # CSS styles
├── .gitignore               # Git ignore rules
├── README.md                # This file
└── architecture_plan.md     # System architecture documentation
```

## API Endpoints

The application provides RESTful API endpoints for all data operations:

- `GET/POST /api/fincas` - Farm management
- `GET/POST /api/lotes` - Land lot management
- `GET/POST /api/bovinos` - Animal management
- `GET/POST /api/registros_sanitarios` - Health records
- `GET/POST /api/movimientos_animales` - Animal movements
- `GET/POST /api/pesajes_canales` - Slaughter records
- `GET/POST /api/proveedores` - Supplier management
- `GET/POST /api/insumos` - Supply management
- `GET/POST /api/compras` - Purchase management
- `GET/POST /api/ventas` - Sales management
- `GET/POST /api/alimentacion` - Feed ration management
- And more...

## Usage

1. **Start the Application**: Run `python app.py` in the Backend directory
2. **Access Dashboard**: Open http://localhost:5000
3. **Navigate Sections**: Use the sidebar to access different modules
4. **Add Data**: Use the "Add New" forms in each section
5. **View Data**: Lists show all records with edit/delete options
6. **Upload Files**: Health records support certificate uploads

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of a thesis work. Please contact the author for usage permissions.

## Author

Juan Pablo - Thesis Project 2025
=======
# thesis-repo
>>>>>>> 899f9cbe41f9b0b906c11cef119d0ff42c2dad84
