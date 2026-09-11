const CART_KEY = 'honneshaCafeCart';

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function formatRupees(amount) {
  return `₹${Math.round(amount)}`;
}

function addToCart(name, price) {
  const cart = readCart();
  const item = cart.find((entry) => entry.name === name);
  if (item) {
    item.quantity += 1;
  } else {
    cart.push({ name, price: Number(price), quantity: 1 });
  }
  writeCart(cart);
  alert(`${name} added to cart`);
}

function updateQuantity(name, change) {
  const cart = readCart()
    .map((item) => item.name === name ? { ...item, quantity: item.quantity + change } : item)
    .filter((item) => item.quantity > 0);
  writeCart(cart);
  renderCart();
}

function renderCart() {
  const cartContainer = document.getElementById('cart-items');
  if (!cartContainer) return;

  const cart = readCart();
  if (cart.length === 0) {
    cartContainer.innerHTML = '<article class="feature-card"><h2>Your cart is empty</h2><p>Add a coffee, snack, or dessert from the menu.</p><a class="btn btn-primary" href="menu.html">Browse menu</a></article>';
  } else {
    cartContainer.innerHTML = cart.map((item) => `
      <article class="cart-item">
        <div>
          <h2>${item.name}</h2>
          <p>${formatRupees(item.price)} each</p>
        </div>
        <div class="quantity-controls" aria-label="Quantity controls for ${item.name}">
          <button type="button" data-name="${item.name}" data-change="-1">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-name="${item.name}" data-change="1">+</button>
        </div>
        <strong>${formatRupees(item.price * item.quantity)}</strong>
      </article>
    `).join('');
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const coupon = document.getElementById('coupon-code')?.value.trim().toUpperCase();
  const discount = coupon === 'CAFE10' ? subtotal * 0.1 : 0;
  const delivery = subtotal > 0 ? 40 : 0;
  const tax = (subtotal - discount) * 0.05;
  const total = subtotal - discount + delivery + tax;

  document.getElementById('subtotal').textContent = formatRupees(subtotal);
  document.getElementById('discount').textContent = `-${formatRupees(discount)}`;
  document.getElementById('delivery').textContent = formatRupees(delivery);
  document.getElementById('tax').textContent = formatRupees(tax);
  document.getElementById('total').textContent = formatRupees(total);
}

function setupMenuFilters() {
  const search = document.getElementById('menu-search');
  const chips = document.querySelectorAll('.filter-chip');
  const items = document.querySelectorAll('.menu-item');
  if (!items.length) return;

  const applyFilters = () => {
    const activeFilter = document.querySelector('.filter-chip.active')?.dataset.filter || 'all';
    const query = search?.value.trim().toLowerCase() || '';
    items.forEach((item) => {
      const matchesCategory = activeFilter === 'all' || item.dataset.category === activeFilter;
      const matchesSearch = item.dataset.name.toLowerCase().includes(query);
      item.hidden = !(matchesCategory && matchesSearch);
    });
  };

  chips.forEach((chip) => chip.addEventListener('click', () => {
    chips.forEach((entry) => entry.classList.remove('active'));
    chip.classList.add('active');
    applyFilters();
  }));
  search?.addEventListener('input', applyFilters);
}

document.addEventListener('click', (event) => {
  const addButton = event.target.closest('.add-to-cart');
  if (addButton) {
    addToCart(addButton.dataset.name, addButton.dataset.price);
    return;
  }

  const quantityButton = event.target.closest('.quantity-controls button');
  if (quantityButton) {
    updateQuantity(quantityButton.dataset.name, Number(quantityButton.dataset.change));
  }
});

document.getElementById('apply-coupon')?.addEventListener('click', renderCart);
setupMenuFilters();
renderCart();
