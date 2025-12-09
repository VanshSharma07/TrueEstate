import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    transactionID: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    customerID: {
        type: String,
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        index: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    region: {
        type: String,
        required: true,
        index: true
    },
    customerType: {
        type: String,
        required: true
    },
    productID: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    productCategory: {
        type: String,
        required: true,
        index: true
    },
    tags: {
        type: [String],
        default: []
    },
    quantity: {
        type: Number,
        required: true
    },
    pricePerUnit: {
        type: Number,
        required: true
    },
    discountPercentage: {
        type: Number,
        default: 0
    },
    amount: {
        type: Number,
        required: true
    },
    finalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        index: true
    },
    status: {
        type: String,
        required: true,
        index: true
    },
    deliveryType: {
        type: String,
        required: true
    },
    storeID: {
        type: String,
        required: true
    },
    storeLocation: {
        type: String,
        required: true
    },
    employeeID: {
        type: String,
        required: true
    },
    employeeName: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for formatted date (DD-MM-YYYY)
transactionSchema.virtual('formattedDate').get(function () {
    const date = this.date;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
});

// Text index for search functionality
transactionSchema.index({ customerName: 'text', productName: 'text' });

// Compound index for common queries
transactionSchema.index({ region: 1, status: 1 });
transactionSchema.index({ productCategory: 1, paymentMethod: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
