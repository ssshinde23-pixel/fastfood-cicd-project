// ===== GLOBAL STATE =====
let cart = [];
let menuItems = [];

// ===== LOAD MENU FROM API =====
async function loadMenu() {
    try {
        const response = await fetch('/api/menu');
        menuItems = await response.json();
        displayMenu(menuItems);
        console.log('✅ Menu loaded:', menuItems.length, 'items');
    } catch (error) {
        console.error('❌ Error loading menu:', error);
        document.getElementById('menuGrid').innerHTML = 
            '<p class="loading" style="color: #e94560;">Failed to load menu. Please refresh the page.</p>';
    }
}

// ===== DISPLAY MENU ITEMS =====
function displayMenu(items) {
    const menuGrid = document.getElementById('menuGrid');
    
    if (items.length === 0) {
        menuGrid.innerHTML = '<p class="loading">No items found in this category</p>';
        return;
    }
    
    menuGrid.innerHTML = items.map(item => `
        <div class="menu-item" data-category="${item.category}">
            <div class="item-image">${item.image}</div>
            <h3 class="item-name">${item.name}</h3>
            <p class="item-description">${item.description}</p>
            <div class="item-footer">
                <span class="item-price">₹${item.price}</span>
                <button class="add-to-cart" onclick="addToCart(${item.id})">
                    <i class="fas fa-plus"></i> Add
                </button>
            </div>
        </div>
    `).join('');
}

// ===== FILTER MENU BY CATEGORY =====
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const category = this.dataset.category;
        
        if (category === 'all') {
            displayMenu(menuItems);
        } else {
            const filtered = menuItems.filter(item => item.category === category);
            displayMenu(filtered);
        }
    });
});

// ===== ADD ITEM TO CART =====
function addToCart(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    const existingItem = cart.find(i => i.id === itemId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({...item, quantity: 1});
    }
    
    updateCart();
    showNotification(`${item.name} added to cart! 🎉`);
    
    // Shake cart button animation
    const cartBtn = document.getElementById('cartBtn');
    cartBtn.style.animation = 'none';
    setTimeout(() => {
        cartBtn.style.animation = 'shake 0.5s';
    }, 10);
}

// ===== REMOVE ITEM FROM CART =====
function removeFromCart(itemId) {
    const item = cart.find(i => i.id === itemId);
    cart = cart.filter(item => item.id !== itemId);
    updateCart();
    showNotification(`${item.name} removed from cart`);
}

// ===== UPDATE QUANTITY =====
function updateQuantity(itemId, change) {
    const item = cart.find(i => i.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            updateCart();
        }
    }
}

// ===== UPDATE CART DISPLAY =====
function updateCart() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartCount.textContent = totalItems;
    cartTotal.textContent = `₹${totalPrice}`;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">🛒 Your cart is empty</p>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-header">
                    <span class="cart-item-name">${item.name}</span>
                    <button class="remove-item" onclick="removeFromCart(${item.id})" title="Remove item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="cart-item-details">
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                    <span class="item-price">₹${item.price * item.quantity}</span>
                </div>
            </div>
        `).join('');
    }
}

// ===== CART SIDEBAR TOGGLE =====
document.getElementById('cartBtn').addEventListener('click', () => {
    document.getElementById('cartSidebar').classList.add('active');
});

document.getElementById('closeCart').addEventListener('click', () => {
    document.getElementById('cartSidebar').classList.remove('active');
});

// Close cart when clicking outside
document.getElementById('cartSidebar').addEventListener('click', (e) => {
    if (e.target.id === 'cartSidebar') {
        document.getElementById('cartSidebar').classList.remove('active');
    }
});

// ===== CHECKOUT PROCESS =====
document.getElementById('checkoutBtn').addEventListener('click', () => {
    if (cart.length === 0) {
        showNotification('Your cart is empty! Add some items first. 🛒', 'error');
        return;
    }
    
    // Close cart and open checkout modal
    document.getElementById('cartSidebar').classList.remove('active');
    document.getElementById('checkoutModal').classList.add('active');
    
    // Populate order summary
    const summaryItems = document.getElementById('summaryItems');
    const summaryTotal = document.getElementById('summaryTotal');
    const subtotal = document.getElementById('subtotal');
    
    const itemsTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 40;
    const totalAmount = itemsTotal + deliveryFee;
    
    summaryItems.innerHTML = cart.map(item => `
        <div class="summary-item">
            <span>${item.name} x${item.quantity}</span>
            <span>₹${item.price * item.quantity}</span>
        </div>
    `).join('');
    
    subtotal.textContent = `₹${itemsTotal}`;
    summaryTotal.textContent = `₹${totalAmount}`;
});

// ===== CLOSE CHECKOUT MODAL =====
document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('checkoutModal').classList.remove('active');
});

// Close modal when clicking outside
document.getElementById('checkoutModal').addEventListener('click', (e) => {
    if (e.target.id === 'checkoutModal') {
        document.getElementById('checkoutModal').classList.remove('active');
    }
});

// ===== PLACE ORDER =====
document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const customerAddress = document.getElementById('customerAddress').value;
    
    const itemsTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 40;
    const totalPrice = itemsTotal + deliveryFee;
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Placing Order...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: cart,
                total: totalPrice,
                customerName,
                phone: customerPhone,
                address: customerAddress
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Close checkout modal
            document.getElementById('checkoutModal').classList.remove('active');
            
            // Show success modal
            document.getElementById('displayOrderId').textContent = result.orderId;
            document.getElementById('displayDeliveryTime').textContent = result.estimatedTime;
            document.getElementById('successModal').classList.add('active');
            
            // Clear cart
            cart = [];
            updateCart();
            
            // Reset form
            document.getElementById('checkoutForm').reset();
            
            console.log('✅ Order placed successfully:', result.orderId);
        }
    } catch (error) {
        console.error('❌ Error placing order:', error);
        showNotification('Failed to place order. Please try again.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// ===== CLOSE SUCCESS MODAL =====
function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('active');
}

// Close success modal when clicking outside
document.getElementById('successModal').addEventListener('click', (e) => {
    if (e.target.id === 'successModal') {
        closeSuccessModal();
    }
});

// ===== SHOW NOTIFICATION =====
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#2ecc71' : '#e94560'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        z-index: 4000;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        animation: slideInRight 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== UPDATE BUILD VERSION =====
document.getElementById('buildVersion').textContent = '1.0.' + Date.now().toString().slice(-4);

// ===== INITIALIZE APP =====
document.addEventListener('DOMContentLoaded', () => {
    loadMenu();
    console.log('🍔 Fast Food App initialized successfully!');
    console.log('🚀 Ready to take orders!');
});