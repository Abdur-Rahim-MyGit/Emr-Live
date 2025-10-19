const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  // Patient Information
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient ID is required']
  },
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  
  // Invoice Details
  invoiceNumber: {
    type: String,
    required: [true, 'Invoice number is required'],
    unique: true,
    trim: true
  },
  invoiceDate: {
    type: Date,
    required: [true, 'Invoice date is required'],
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  terms: {
    type: String,
    default: 'Net 30',
    trim: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'],
    default: 'Draft'
  },
  
  // Items and Services
  items: [{
    description: {
      type: String,
      required: [true, 'Item description is required'],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative']
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative']
    }
  }],
  
  // Financial Information
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  taxRate: {
    type: Number,
    default: 0,
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100%']
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: [0, 'Tax amount cannot be negative']
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: [0, 'Discount amount cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  
  // Payment Information
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partial', 'Paid', 'Refunded'],
    default: 'Unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Check', 'Bank Transfer', 'Insurance'],
    trim: true
  },
  paymentDate: {
    type: Date
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'Paid amount cannot be negative']
  },
  balanceAmount: {
    type: Number,
    default: 0,
    min: [0, 'Balance amount cannot be negative']
  },
  
  // Notes and Additional Information
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  internalNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Internal notes cannot exceed 500 characters']
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for is overdue
invoiceSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status !== 'Paid' && this.status !== 'Cancelled';
});

// Virtual for days overdue
invoiceSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0;
  const today = new Date();
  const diffTime = today - this.dueDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to calculate totals
invoiceSchema.pre('save', function(next) {
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  
  // Calculate tax amount
  this.taxAmount = (this.subtotal * this.taxRate) / 100;
  
  // Calculate total amount
  this.totalAmount = this.subtotal + this.taxAmount - this.discountAmount;
  
  // Calculate balance amount
  this.balanceAmount = this.totalAmount - this.paidAmount;
  
  // Update payment status based on paid amount
  if (this.paidAmount === 0) {
    this.paymentStatus = 'Unpaid';
  } else if (this.paidAmount >= this.totalAmount) {
    this.paymentStatus = 'Paid';
  } else {
    this.paymentStatus = 'Partial';
  }
  
  next();
});

// Pre-save middleware to generate invoice number
invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.models.Invoice.countDocuments();
    const year = new Date().getFullYear();
    this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Indexes for better query performance
invoiceSchema.index({ patientId: 1 });
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ paymentStatus: 1 });
invoiceSchema.index({ invoiceDate: -1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ createdAt: -1 });

// Static method to find invoices by date range
invoiceSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    invoiceDate: {
      $gte: startDate,
      $lte: endDate
    }
  });
};

// Static method to find overdue invoices
invoiceSchema.statics.findOverdue = function() {
  return this.find({
    dueDate: { $lt: new Date() },
    status: { $nin: ['Paid', 'Cancelled'] }
  });
};

// Static method to find invoices by status
invoiceSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

// Instance method to mark as paid
invoiceSchema.methods.markAsPaid = function(amount, method, date) {
  this.paidAmount = amount || this.totalAmount;
  this.paymentMethod = method;
  this.paymentDate = date || new Date();
  this.paymentStatus = 'Paid';
  this.updatedAt = new Date();
  return this.save();
};

// Instance method to add payment
invoiceSchema.methods.addPayment = function(amount, method, date) {
  this.paidAmount += amount;
  this.paymentMethod = method;
  this.paymentDate = date || new Date();
  this.updatedAt = new Date();
  return this.save();
};

// Instance method to send invoice
invoiceSchema.methods.send = function() {
  this.status = 'Sent';
  this.updatedAt = new Date();
  return this.save();
};

// Instance method to cancel invoice
invoiceSchema.methods.cancel = function() {
  this.status = 'Cancelled';
  this.updatedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Invoice', invoiceSchema);
