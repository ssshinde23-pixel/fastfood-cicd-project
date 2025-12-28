const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Menu data - Our fast food items
const menuItems = [
    {
        id: 1,
        name: 'Classic Burger',
        category: 'burgers',
        price: 299,
        description: 'Juicy aloo patty with lettuce, tomato, and special sauce',
        image: '🍔'
    },
    {
        id: 2,
        name: 'Cheese Burger',
        category: 'burgers',
        price: 349,
        description: 'Double cheese with premium aloo patty',
        image: '🍔'
    },
    {
        id: 3,
        name: 'Chicken Burger',
        category: 'burgers',
        price: 279,
        description: 'Crispy chicken fillet with mayo and lettuce',
        image: '🍔'
    },
    {
        id: 4,
        name: 'Veggie Burger',
        category: 'burgers',
        price: 249,
        description: 'Plant-based patty with fresh vegetables',
        image: '🍔'
    },
    {
        id: 5,
        name: 'Margherita Pizza',
        category: 'pizza',
        price: 399,
        description: 'Classic cheese pizza with fresh basil',
        image: '🍕'
    },
    {
        id: 6,
        name: 'Pepperoni Pizza',
        category: 'pizza',
        price: 499,
        description: 'Loaded with pepperoni and mozzarella',
        image: '🍕'
    },
    {
        id: 7,
        name: 'Veggie Supreme Pizza',
        category: 'pizza',
        price: 449,
        description: 'Fresh vegetables with cheese blend',
        image: '🍕'
    },
    {
        id: 8,
        name: 'BBQ Chicken Pizza',
        category: 'pizza',
        price: 479,
        description: 'BBQ sauce, chicken, and onions',
        image: '🍕'
    },
    {
        id: 9,
        name: 'French Fries',
        category: 'sides',
        price: 99,
        description: 'Crispy golden fries with seasoning',
        image: '🍟'
    },
    {
        id: 10,
        name: 'Chicken Nuggets',
        category: 'sides',
        price: 149,
        description: '6 pieces of crispy chicken nuggets',
        image: '🍗'
    },
    {
        id: 11,
        name: 'Onion Rings',
        category: 'sides',
        price: 129,
        description: 'Crispy battered onion rings',
        image: '🧅'
    },
    {
        id: 12,
        name: 'Garlic Bread',
        category: 'sides',
        price: 119,
        description: 'Toasted bread with garlic butter',
        image: '🥖'
    },
    {
        id: 13,
        name: 'Coca Cola',
        category: 'drinks',
        price: 49,
        description: 'Chilled soft drink - 330ml',
        image: '🥤'
    },
    {
        id: 14,
        name: 'Sprite',
        category: 'drinks',
        price: 49,
        description: 'Refreshing lemon drink - 330ml',
        image: '🥤'
    },
    {
        id: 15,
        name: 'Chocolate Shake',
        category: 'drinks',
        price: 149,
        description: 'Thick chocolate milkshake',
        image: '🥤'
    },
    {
        id: 16,
        name: 'Mango Smoothie',
        category: 'drinks',
        price: 129,
        description: 'Fresh mango blended smoothie',
        image: '🥤'
    }
];

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to get menu
app.get('/api/menu', (req, res) => {
    res.json(menuItems);
});

// API endpoint to place order
app.post('/api/order', (req, res) => {
    const { items, total, customerName, phone, address } = req.body;
    
    // Log order details (in real app, this would save to database)
    console.log('\n🎉 ===== NEW ORDER RECEIVED =====');
    console.log(`📋 Order ID: ORD${Date.now()}`);
    console.log(`👤 Customer: ${customerName}`);
    console.log(`📱 Phone: ${phone}`);
    console.log(`📍 Address: ${address}`);
    console.log(`💰 Total: ₹${total}`);
    console.log('🍔 Items ordered:');
    items.forEach(item => {
        console.log(`   - ${item.name} x${item.quantity} = ₹${item.price * item.quantity}`);
    });
    console.log('================================\n');
    
    // Send response
    res.json({
        success: true,
        message: 'Order placed successfully!',
        orderId: 'ORD' + Date.now(),
        estimatedTime: '30-40 minutes',
        total: total
    });
});

// Health check endpoint (for deployment verification)
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date(),
        version: '1.0',
        menuItems: menuItems.length,
        message: 'Fast Food App is running smoothly!'
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('🍔 ================================');
    console.log('🍕 Fast Food Ordering App Started!');
    console.log('🍟 ================================');
    console.log(`🌐 Server: http://localhost:${PORT}`);
    console.log(`💚 Health: http://localhost:${PORT}/health`);
    console.log(`📋 Menu items loaded: ${menuItems.length}`);
    console.log('🚀 Ready to accept orders!');
    console.log('================================\n');
});