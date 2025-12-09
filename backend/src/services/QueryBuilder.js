/**
 * QueryBuilder - Builds MongoDB queries from request parameters
 * Avoids massive if/else chains in controllers
 */
class QueryBuilder {
    constructor(reqQuery) {
        this.reqQuery = reqQuery;
        this.query = {};
        this.sortOptions = {};
    }

    /**
     * Build search query for keyword
     * Searches customerName, phone, productName
     */
    search() {
        const { keyword } = this.reqQuery;
        if (keyword && keyword.trim()) {
            const regex = new RegExp(keyword.trim(), 'i');
            this.query.$or = [
                { customerName: regex },
                { phone: regex },
                { productName: regex },
                { customerID: regex }
            ];
        }
        return this;
    }

    /**
     * Build multi-select filter for array values
     * Uses $in operator for multiple selections
     */
    multiSelectFilter(field, queryParam) {
        const value = this.reqQuery[queryParam || field];
        if (value) {
            const values = Array.isArray(value) ? value : [value];
            if (values.length > 0 && values[0] !== '') {
                this.query[field] = { $in: values };
            }
        }
        return this;
    }

    /**
     * Build tag filter - checks if any of the selected tags exist in the tags array
     */
    tagFilter() {
        const { tags } = this.reqQuery;
        if (tags) {
            const tagValues = Array.isArray(tags) ? tags : [tags];
            if (tagValues.length > 0 && tagValues[0] !== '') {
                this.query.tags = { $in: tagValues };
            }
        }
        return this;
    }

    /**
     * Build range filter for numeric fields
     */
    rangeFilter(field, minParam, maxParam) {
        const min = this.reqQuery[minParam || `min${field.charAt(0).toUpperCase() + field.slice(1)}`];
        const max = this.reqQuery[maxParam || `max${field.charAt(0).toUpperCase() + field.slice(1)}`];

        if (min !== undefined || max !== undefined) {
            this.query[field] = {};
            if (min !== undefined && min !== '') {
                this.query[field].$gte = parseFloat(min);
            }
            if (max !== undefined && max !== '') {
                this.query[field].$lte = parseFloat(max);
            }
            // Remove empty object
            if (Object.keys(this.query[field]).length === 0) {
                delete this.query[field];
            }
        }
        return this;
    }

    /**
     * Build date range filter
     */
    dateRangeFilter() {
        const { startDate, endDate } = this.reqQuery;
        if (startDate || endDate) {
            this.query.date = {};
            if (startDate) {
                this.query.date.$gte = new Date(startDate);
            }
            if (endDate) {
                this.query.date.$lte = new Date(endDate);
            }
        }
        return this;
    }

    /**
     * Build sort options
     * Format: sortBy=field_direction (e.g., date_desc, amount_asc)
     */
    sort() {
        const { sortBy } = this.reqQuery;
        if (sortBy) {
            const [field, direction] = sortBy.split('_');
            const sortField = this.mapSortField(field);
            this.sortOptions[sortField] = direction === 'desc' ? -1 : 1;
        } else {
            // Default sort by date descending
            this.sortOptions.date = -1;
        }
        return this;
    }

    /**
     * Map frontend sort field names to schema field names
     */
    mapSortField(field) {
        const fieldMap = {
            'date': 'date',
            'amount': 'amount',
            'finalAmount': 'finalAmount',
            'age': 'age',
            'name': 'customerName',
            'customer': 'customerName',
            'quantity': 'quantity',
            'id': 'transactionID',
            'category': 'productCategory'
        };
        return fieldMap[field] || field;
    }

    /**
     * Build all standard filters
     */
    buildAllFilters() {
        return this
            .search()
            .multiSelectFilter('region')
            .multiSelectFilter('gender')
            .multiSelectFilter('paymentMethod')
            .multiSelectFilter('status')
            .multiSelectFilter('productCategory')
            .multiSelectFilter('deliveryType')
            .multiSelectFilter('storeLocation')
            .tagFilter()
            .rangeFilter('age', 'minAge', 'maxAge')
            .rangeFilter('amount', 'minAmount', 'maxAmount')
            .rangeFilter('finalAmount', 'minFinalAmount', 'maxFinalAmount')
            .dateRangeFilter()
            .sort();
    }

    /**
     * Get the built query object
     */
    getQuery() {
        return this.query;
    }

    /**
     * Get the sort options
     */
    getSortOptions() {
        return this.sortOptions;
    }

    /**
     * Get pagination options
     */
    getPagination() {
        const page = parseInt(this.reqQuery.page, 10) || 1;
        const limit = parseInt(this.reqQuery.limit, 10) || 10;
        const skip = (page - 1) * limit;

        return { page, limit, skip };
    }
}

export default QueryBuilder;
