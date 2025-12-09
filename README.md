# TrueEstate - Retail Sales Management System

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Tailwind CSS, TanStack Query, Recharts |
| Backend | Node.js, Express.js, Mongoose |
| Database | MongoDB Atlas |

## Search Implementation

- Full-text search on **Customer Name**, **Phone Number**, and **Product Name**
- Case-insensitive regex matching
- Works alongside filters and sorting
- Debounced input for performance

## Filter Implementation

Multi-select filters with independent and combined operation:
- **Customer Region** - North, South, East, West
- **Gender** - Male, Female
- **Age Range** - Numeric range slider
- **Product Category** - All product categories
- **Tags** - Product tags (top 20)
- **Payment Method** - UPI, Credit Card, Debit Card, Cash, Net Banking
- **Order Status** - Completed, Pending, Cancelled, Returned
- **Delivery Type** - Standard, Express, Same-day
- **Date Range** - Start and end date pickers
- **Amount Range** - Transaction amount slider

## Sorting Implementation

Sortable columns with ascending/descending toggle:
- **Date** (Default: Newest First)
- **Customer Name** (A-Z / Z-A)
- **Amount** (High to Low / Low to High)
- **Transaction ID**

Sorting preserves active search and filter states.

## Pagination Implementation

- **10 items per page**
- Next/Previous navigation
- Page number display with total count
- Retains active search, filter, and sort states
- URL-based pagination for shareable links

## Setup Instructions

```bash
# Clone repository
git clone https://github.com/parthDOOM/truestate.git
cd truestate

# Backend setup
cd backend
npm install
cp .env.example .env   # Add MONGODB_URI
npm run seed           # Seed database
npm run dev            # Starts on port 5000

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev            # Starts on port 5173
```

Open **http://localhost:5173**

## Environment Variables

Create `backend/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/truestate
PORT=5000
```

