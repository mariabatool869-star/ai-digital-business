const AzlanCart = (() => {
  const CART_KEY = 'azlan_cart';

  function getItems() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveItems(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateBadge();
  }

  function addItem(product) {
    const items = getItems();
    const existing = items.find(i => i.productId === product._id);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({
        productId: product._id,
        name: product.name,
        type: product.type,
        price: product.price,
        quantity: 1
      });
    }
    saveItems(items);
    return items;
  }

  function removeItem(productId) {
    const items = getItems().filter(i => i.productId !== productId);
    saveItems(items);
    return items;
  }

  function updateQuantity(productId, quantity) {
    const items = getItems();
    const item = items.find(i => i.productId === productId);
    if (!item) return items;
    if (quantity <= 0) return removeItem(productId);
    item.quantity = quantity;
    saveItems(items);
    return items;
  }

  function clear() {
    localStorage.removeItem(CART_KEY);
    updateBadge();
  }

  function getTotal() {
    return getItems().reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  function getCount() {
    return getItems().reduce((sum, i) => sum + i.quantity, 0);
  }

  function updateBadge() {
    document.querySelectorAll('.cart-badge').forEach(el => {
      const count = getCount();
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  return { getItems, addItem, removeItem, updateQuantity, clear, getTotal, getCount, updateBadge };
})();

if (typeof window !== 'undefined') {
  window.AzlanCart = AzlanCart;
  document.addEventListener('DOMContentLoaded', () => AzlanCart.updateBadge());
}
