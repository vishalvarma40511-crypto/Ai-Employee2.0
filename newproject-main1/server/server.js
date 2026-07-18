require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const { Customer, Product, SMSTemplate } = require('./models/Schemas');
const apiRouter = require('./routes/api');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Store socket io instance to express app
app.set('socketio', io);

app.use(cors());
app.use(express.json());

// API endpoints binding
app.use('/api', apiRouter);

// Socket IO connection handler
io.on('connection', (socket) => {
  console.log(`[Socket.IO] New client synchronized: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client connection closed: ${socket.id}`);
  });
});

// MongoDB Connection and Seeder
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/businessos';
mongoose.connect(MONGODB_URI, { bufferCommands: false, serverSelectionTimeoutMS: 2000 })
  .then(async () => {
    console.log('[MongoDB] Connected successfully to ' + MONGODB_URI);
    
    // Seed default SMS templates if empty
    const templatesCount = await SMSTemplate.countDocuments();
    if (templatesCount === 0) {
      console.log('[Seeder] Populating default custom SMS templates...');
      const defaultTemplates = [
        {
          category: 'order_placed',
          templateText: 'AI Employee: Hello {{customer}}, your order {{order}} has been placed successfully. Items: {{items}} - Total: ₹{{amount}}. Estimated Delivery: {{delivery}}. Track your order: {{tracking}}'
        },
        {
          category: 'order_shipped',
          templateText: 'Your order {{order}} has been shipped via Blue Dart. Courier: Blue Dart. Tracking ID: {{tracking}}'
        },
        {
          category: 'out_for_delivery',
          templateText: 'Good News! Your order {{order}} is Out For Delivery today. Expected today before 8 PM. Track: {{tracking}}'
        },
        {
          category: 'order_delivered',
          templateText: 'Your order {{order}} has been delivered successfully. Thank you for shopping with Quantum Stores. Please rate your review experience: {{tracking}}'
        },
        {
          category: 'offline_billing',
          templateText: 'Thank you for shopping at AI Employee Store. Invoice: {{order}}. Amount: ₹{{amount}}. Items: {{items}}. Visit Again!'
        }
      ];
      await SMSTemplate.insertMany(defaultTemplates);
    }

    // Seed default products if empty
    const productsCount = await Product.countDocuments();
    if (productsCount === 0) {
      console.log('[Seeder] Populating default catalog products...');
      const defaultProducts = [
        {
          name: 'Wireless Earbuds X1',
          category: 'Electronics',
          stock: 45,
          minStock: 8,
          price: 2499,
          cost: 1100,
          sku: 'SKU-ELECT-E12',
          image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80',
          rating: 4.8
        },
        {
          name: 'Classic Running Shoes',
          category: 'Apparel',
          stock: 12,
          minStock: 5,
          price: 3999,
          cost: 1600,
          sku: 'SKU-APP-SH04',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
          rating: 4.6
        },
        {
          name: 'Organic Green Tea Bag Pack',
          category: 'Groceries',
          stock: 150,
          minStock: 20,
          price: 299,
          cost: 100,
          sku: 'SKU-GROC-GT55',
          image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=400&q=80',
          rating: 4.5
        },
        {
          name: 'Paracetamol 650mg Sterile Pack',
          category: 'Medical',
          stock: 80,
          minStock: 15,
          price: 49,
          cost: 12,
          sku: 'SKU-MED-P098',
          image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
          rating: 4.7
        },
        {
          name: 'Bluetooth Speaker Portable',
          category: 'Electronics',
          stock: 3,
          minStock: 6,
          price: 1999,
          cost: 850,
          sku: 'SKU-ELECT-SP81',
          image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=400&q=80',
          rating: 4.3
        },
        {
          name: 'Premium Leather Jacket',
          category: 'Apparel',
          stock: 8,
          minStock: 4,
          price: 8999,
          cost: 3800,
          sku: 'SKU-APP-JK11',
          image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80',
          rating: 4.9
        }
      ];
      await Product.insertMany(defaultProducts);
    }

    // Seed default customer if empty
    const customersCount = await Customer.countDocuments();
    if (customersCount === 0) {
      console.log('[Seeder] Populating default customer account...');
      const defaultCustomer = {
        name: 'Vishal',
        email: 'vishal@gmail.com',
        password: 'password123',
        phone: '+91 98765 43210',
        address: 'Sector 62, Noida, UP, India',
        rewardsPoints: 250,
        wishlist: []
      };
      await new Customer(defaultCustomer).save();
    }
  })
  .catch(err => {
    console.error('[MongoDB] Connection error:', err.message);
    console.log('\n========================================================================');
    console.log('⚠️  [MongoDB] Local MongoDB is offline/not running or could not connect.');
    console.log('💡  [System] Switch: Running smoothly with Local JSON Database Fallback.');
    console.log('📝  [System] Fallback database file: server/db_fallback.json');
    console.log('========================================================================\n');
  });
// Export app for Vercel Serverless environment
module.exports = app;

if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`[Server] Backoffice server running securely on http://localhost:${PORT}`);
  });
}

