# TruEstate Backend

Backend API for the TruEstate Retail Sales Management System.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB (Atlas or local)
- **ODM**: Mongoose 8
- **CSV Parsing**: csv-parser

## Quick Start

```bash
# Install dependencies
cd backend
npm install

# Create .env file
echo "MONGODB_URI=mongodb://localhost:27017/truestate" > .env

# Seed database (requires MongoDB running)
npm run seed

# Start development server
npm run dev
```

## Environment Variables

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/truestate
```

**For MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/truestate
```

## Database Seeding

The seeder ingests the CSV dataset into MongoDB:

```bash
npm run seed
```

### Important Notes

| Note | Details |
|------|---------|
| **Atlas Free Tier** | 512MB limit - only ~830K of 1M records fit |
| **Local MongoDB** | No limit - all 1M records can be seeded |
| **Seeding time** | ~70 seconds for 1M records (local), ~6 min (Atlas) |
| **CSV handling** | Properly handles quoted tags like `"organic,skincare"` |

## API Endpoints

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | Paginated list with filters |
| GET | `/api/transactions/:id` | Single transaction by ID |
| GET | `/api/transactions/filters` | Filter dropdown options |
| GET | `/api/transactions/export` | CSV export (max 50K records) |
| GET | `/api/transactions/stats` | Statistics (supports filters) |

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |
| `keyword` | string | Search customer, phone, product |
| `region` | string[] | Filter by regions |
| `gender` | string[] | Filter by genders |
| `status` | string[] | Filter by order status |
| `paymentMethod` | string[] | Filter by payment methods |
| `productCategory` | string[] | Filter by product categories |
| `deliveryType` | string[] | Filter by delivery types |
| `tags` | string[] | Filter by tags |
| `minAge` / `maxAge` | number | Age range filter |
| `minAmount` / `maxAmount` | number | Amount range filter |
| `sortBy` | string | Sort field (format: `field_direction`) |

### Example API Calls

```bash
# Get first 20 transactions
curl "http://localhost:5000/api/transactions"

# Search by customer name
curl "http://localhost:5000/api/transactions?keyword=Sharma"

# Filter by multiple regions
curl "http://localhost:5000/api/transactions?region=North&region=South"

# Filter by status and sort by amount
curl "http://localhost:5000/api/transactions?status=Completed&sortBy=amount_desc"

# Get filter options for dropdowns
curl "http://localhost:5000/api/transactions/filters"

# Get statistics (with filters)
curl "http://localhost:5000/api/transactions/stats?region=East"

# Export as CSV
curl "http://localhost:5000/api/transactions/export" -o transactions.csv
```

## Project Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── transactionController.js   # API handlers
│   ├── models/
│   │   └── Transaction.js             # Mongoose schema
│   ├── routes/
│   │   └── transactionRoutes.js       # Express routes
│   ├── services/
│   │   └── QueryBuilder.js            # Dynamic query builder
│   ├── utils/
│   │   └── seeder.js                  # CSV ingestion
│   └── index.js                       # Server entry point
├── .env                               # Environment variables
├── package.json
└── README.md
```