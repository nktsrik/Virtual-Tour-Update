# Virtual Tour Kebun Raya - Backend API

Backend API untuk aplikasi Virtual Tour Kebun Raya yang dibangun dengan Node.js, Express, dan PostgreSQL.

## 🚀 Fitur

- RESTful API untuk Virtual Tour, Info Point, dan Hotspot
- Upload gambar 360° dengan validasi
- Pagination dan pencarian
- Error handling yang komprehensif
- Validasi input dan sanitasi data
- Rate limiting untuk keamanan
- Transaction handling untuk database

## 📋 Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 12
- npm >= 8.0.0

## 🛠️ Installation

1. Clone repository dan masuk ke folder backend:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env
```

4. Edit file `.env` sesuai konfigurasi database Anda:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=virtual_tour_kebun_raya
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:3000
```

5. Jalankan aplikasi:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📚 API Endpoints

### Virtual Tour
- `GET /api/virtual-tour` - Get all virtual tours (with pagination & search)
- `GET /api/virtual-tour/:id` - Get virtual tour by ID
- `POST /api/virtual-tour` - Create new virtual tour
- `PUT /api/virtual-tour/:id` - Update virtual tour
- `DELETE /api/virtual-tour/:id` - Delete virtual tour

### Info Point
- `GET /api/info-point` - Get all info points
- `GET /api/info-point/:id` - Get info point by ID
- `POST /api/info-point` - Create new info point
- `PUT /api/info-point/:id` - Update info point
- `DELETE /api/info-point/:id` - Delete info point

### Hotspot
- `GET /api/hotspot` - Get all hotspots
- `GET /api/hotspot/:id` - Get hotspot by ID
- `POST /api/hotspot` - Create new hotspot
- `PUT /api/hotspot/:id` - Update hotspot
- `DELETE /api/hotspot/:id` - Delete hotspot

## 📝 Request Examples

### Create Virtual Tour
```bash
curl -X POST http://localhost:5000/api/virtual-tour \
  -F "nama=Virtual Tour Taman Bunga" \
  -F "deskripsi=Taman bunga yang indah" \
  -F "image=@path/to/360image.jpg" \
  -F "lokasi_id=1" \
  -F "status_id=1"
```

### Get Virtual Tours with Pagination
```bash
curl "http://localhost:5000/api/virtual-tour?page=1&limit=10&search=taman"
```

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/             # Request handlers
│   ├── middleware/              # Custom middleware
│   ├── repositories/            # Database queries
│   ├── routes/                  # API routes
│   ├── services/                # Business logic
│   ├── utils/                   # Utility functions
│   ├── app.js                   # Express app setup
│   └── server.js                # Server entry point
├── uploads/                     # Uploaded files
├── .env                         # Environment variables
├── package.json
└── README.md
```

## 🔒 Security Features

- CORS configuration
- File upload validation
- Input sanitization
- Rate limiting
- Error handling
- SQL injection prevention

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Check code style
npm run lint

# Format code
npm run format
```

## 📊 Database Schema

Pastikan database PostgreSQL memiliki tabel berikut:
- `virtual_tour`
- `info_point` 
- `hotspot`
- `lokasi`

## 🚀 Deployment

1. Set environment variables untuk production
2. Install dependencies: `npm ci --production`
3. Start aplikasi: `npm start`

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

ISC License - see LICENSE file for details.