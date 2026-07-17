const mongoose = require('mongoose');

// Customer Schema
const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Simple JWT password auth
  phone: { type: String, default: '+91 99999 88888' },
  address: { type: String, default: 'Sector 62, Noida, India' },
  rewardsPoints: { type: Number, default: 250 },
  wishlist: [{ type: String }] // Store product IDs/names
});

// Product Schema
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  minStock: { type: Number, default: 5 },
  price: { type: Number, required: true },
  cost: { type: Number, required: true },
  expiryDate: { type: String },
  salesCount: { type: Number, default: 0 },
  overstock: { type: Boolean, default: false },
  sku: { type: String, required: true, unique: true },
  image: { type: String, default: '' },
  rating: { type: Number, default: 4.5 }
});

// Order Schema
const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true }, // ORD-10052
  timestamp: { type: Date, default: Date.now },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: 'buyer@gmail.com' },
  address: { type: String, default: 'Sector 62, Noida, India' },
  products: [{
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  total: { type: Number, required: true },
  paymentMethod: { type: String, default: 'Cash on Delivery (COD)' },
  shippingStatus: {
    type: String,
    enum: ['placed', 'confirmed', 'packed', 'ready_for_dispatch', 'shipped', 'reached_hub', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'placed'
  },
  courier: { type: String, default: 'Blue Dart' },
  trackingId: { type: String, default: '' },
  deliveryPerson: { type: String, default: 'Automated Cargo Drone #098' },
  rating: { type: Number },
  review: { type: String }
});

// SMS Log Schema
const SMSLogSchema = new mongoose.Schema({
  recipient: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: 'Sent' }, // 'Sent', 'Failed', etc.
  details: { type: String, default: '' }
});

// SMS Template Schema
const SMSTemplateSchema = new mongoose.Schema({
  category: { type: String, required: true, unique: true }, // 'order_placed', 'order_shipped', etc.
  templateText: { type: String, required: true }
});

// Invoice Schema
const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  orderId: { type: String, required: true },
  products: [{
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  gst: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, enum: ['Paid', 'Unpaid', 'Pending'], default: 'Paid' },
  pdfPath: { type: String },
  emailStatus: { type: String, enum: ['Success', 'Failed', 'Pending'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Email Log Schema
const EmailLogSchema = new mongoose.Schema({
  email: { type: String, required: true },
  orderNumber: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['Success', 'Failed'], required: true },
  smtpResponse: { type: String },
  retryCount: { type: Number, default: 0 }
});

// Counter Schema
const CounterSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  seq: { type: Number, default: 0 }
});
CounterSchema.index({ year: 1 }, { unique: true });

// Settings Schema — stores owner email credentials & store info
const SettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'store' },
  ownerEmail: { type: String, default: '' },
  ownerEmailPass: { type: String, default: '' }, // Gmail App Password
  smtpHost: { type: String, default: 'smtp.gmail.com' },
  smtpPort: { type: Number, default: 587 },
  storeName: { type: String, default: 'Alfa Store' },
  storePhone: { type: String, default: '' },
  storeAddress: { type: String, default: '' },
  websiteUrl: { type: String, default: process.env.SITE_URL || process.env.WEBSITE_URL || '' },
  updatedAt: { type: Date, default: Date.now }
});

const Customer = mongoose.model('Customer', CustomerSchema);
const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);
const SMSLog = mongoose.model('SMSLog', SMSLogSchema);
const SMSTemplate = mongoose.model('SMSTemplate', SMSTemplateSchema);
const Invoice = mongoose.model('Invoice', InvoiceSchema);
const EmailLog = mongoose.model('EmailLog', EmailLogSchema);
const Counter = mongoose.model('Counter', CounterSchema);
const Settings = mongoose.model('Settings', SettingsSchema);

module.exports = {
  Customer,
  Product,
  Order,
  SMSLog,
  SMSTemplate,
  Invoice,
  EmailLog,
  Counter,
  Settings
};

