# 📊 TruEstate Transaction Viewer

This project is a high-performance, full-stack application designed to ingest, filter, and view a large dataset of transaction records. It utilizes a modern **MERN-like stack** (MongoDB, Express, React, Node.js) with TanStack Query for efficient server state management.

## 🚀 Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 | UI rendering & components |
| **State** | TanStack Query v5 | Server state fetching & caching |
| **Styling** | Tailwind CSS 3 | Utility-first styling |
| **Icons** | Lucide React | Icon library |
| **Routing** | React Router v6 | Client-side navigation |
| **Backend** | Express.js | RESTful API |
| **ODM** | Mongoose 8 | MongoDB schema & query handling |
| **Database** | MongoDB Atlas | Cloud database storage |
| **CSV** | `csv-parser` | CSV ingestion pipeline |

## 📐 Core System Architecture

The application follows a standard component-based architecture with a clear separation between the client and server. The key to performance is the **QueryBuilder** on the backend and **TanStack Query caching** on the frontend, working together in a URL-driven data flow.



### Data Flow Overview

1.  **User interacts** → URL parameters (filters, search, pagination) are updated.
2.  **URL changes** → **TanStack Query** observes the change and triggers a data fetch.
3.  **API receives request** → **QueryBuilder** dynamically constructs an optimized Mongo query.
4.  **Database query** → **Mongoose** runs the indexed query against MongoDB.
5.  **Response cached** → The response is cached by **TanStack Query**.
6.  **UI updates** → React components instantly reflect the new data.

## 📦 Core Components

### Backend

| Component | Purpose | Key Features |
| :--- | :--- | :--- |
| **QueryBuilder** (`services/QueryBuilder.js`) | Modular, dynamic query construction. | Eliminates lengthy conditional logic. Supports **Regex keyword search**, **Multi-select filters** (`$in`), **Range filtering** (`$gte`/`$lte`), and **Sort mapping**. |
| **Transaction Model** (`models/Transaction.js`) | Defines the data schema. | 26 properties mapped from CSV, **Text index** on `customerName` and `productName`, **Compound indexes** on frequently queried fields, and **Virtual properties** (e.g., formatted date). |
| **Seeder** (`utils/seeder.js`) | High-volume data ingestion tool. | Uses native MongoDB driver, inserts in **1,000-record batches**, uses **sequential insertion** (stable on M0), and builds indexes only **after** insertion. |

### Frontend

| Component | Purpose | Key Features |
| :--- | :--- | :--- |
| **State Management** | Global state for filters, search, and data. | **URL-driven filters** via `useSearchParams` for sharable links. **TanStack Query** handles asynchronous server state & caching. |
| **TransactionTable** | Displays the transaction data. | Sortable and paginated grid view. |
| **FilterPanel** | Provides filtering options. | Accordion-style filter options (e.g., date range, category multi-select). |
| **SearchBar** | Customer/Product name search. | **Debounced search field (300ms)** to prevent excessive API calls. |
| **Pagination** | Navigation controls. | Page navigation controls tied to URL state. |

## 🌐 API Endpoints

The Express.js backend provides the following RESTful endpoints:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/transactions` | Paginated results with filtering, searching, and sorting applied. |
| `GET` | `/api/transactions/:id` | Fetch a single transaction record by ID. |
| `GET` | `/api/transactions/filters` | Fetch distinct values required for dropdown filter options (e.g., unique product categories). |
| `GET` | `/api/transactions/export` | CSV export of filtered data (**limited to 50,000 records**). |
| `GET` | `/api/transactions/stats` | Filter-aware aggregated statistics (e.g., total sales, average price). |

## ⚙️ Performance Optimizations

| Optimization | Benefit |
| :--- | :--- |
| **MongoDB indexes** | Enables fast execution of filtered and sorted queries. |
| **Batch CSV ingestion** | High-performance data loading into the database. |
| **TanStack Query caching** | Minimizes redundant fetches and improves perceived load time. |
| **Debounced search** | Prevents excessive API hits during user typing. |
| **Sequential inserts** | Ensures stability and avoids connection limits on the M0 tier. |

## ⚠️ Known Limitations & Solutions

### 1. MongoDB Atlas Free Tier (M0)

The use of the free-tier database introduces several constraints:

| Limitation | Impact | Possible Solution |
| :--- | :--- | :--- |
| **512MB storage max** | Only **~830,000** out of the **1,000,000** rows could be imported. | Use local MongoDB for development (no size constraints) or **Upgrade to Atlas M10 or higher** for production. |
| **Shared cluster** | Query performance may vary based on other tenants' load. | Work with the 830K records, which is still suitable for demonstrations. |
| **No dedicated compute** | Slower operations, especially during heavy load or initial indexing. | *See above solution.* |

### 2. CSV Data Handling

* The **Tags** field contains complex, quoted, comma-separated values (e.g., `"organic,skincare"`). The `csv-parser` library correctly handles this, but any manual splitting logic would break the parser's ability to distinguish between internal list separators and record delimiters.

### 3. CSV Export Constraints

* The CSV export API is restricted to **50,000 records** to avoid Node.js memory overload and potential timeouts on the API server.
* For exporting the complete dataset, direct tools like **MongoDB Compass** or **`mongodump`** are recommended.

## 📁 File Structure

TruEstate/
├── backend/
│   ├── src/
│   │   ├── controllers/transactionController.js
│   │   ├── models/Transaction.js
│   │   ├── routes/transactionRoutes.js
│   │   ├── services/QueryBuilder.js
│   │   ├── utils/seeder.js
│   │   └── index.js
│   ├── .env
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/useTransactions.js
│   │   ├── services/api.js
│   │   ├── styles/index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── docs/
│   └── architecture.md
└── truestate_assignment_dataset.csv (235MB)
