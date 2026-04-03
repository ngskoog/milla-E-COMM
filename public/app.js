const productsEl = document.getElementById("products");
const cartEl = document.getElementById("cartContent");
const cartPill = document.getElementById("cartPill");
const clearCartBtn = document.getElementById("clearCartBtn");

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error("Request failed");
  return res.json();
}

async function loadProducts() {
  const products = await api("/api/products");

  productsEl.innerHTML = products.map(p => `
    <article class="card">
      <img src="${p.image_url}" alt="${p.name}" />
      <div class="content">
        <h3>${p.name}</h3>
        <p class="price">$${Number(p.price).toFixed(2)}</p>
        <button class="btn" data-add="${p.id}">Add to cart</button>
      </div>
    </article>
  `).join("");

  productsEl.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;

    const productId = Number(btn.dataset.add);

    await api("/api/cart", {
      method: "POST",
      body: JSON.stringify({ product_id: productId })
    });

    refreshCart();
  });
}

async function refreshCart() {
  const items = await api("/api/cart");

  if (items.length === 0) {
    cartEl.innerHTML = "<p class='muted'>Cart is empty</p>";
    return;
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  cartEl.innerHTML = `
    ${items.map(i => `
      <div class="cartRow">
        <span>${i.name}</span>
        <span>${i.quantity} × $${i.price}</span>
        <button data-inc="${i.cart_item_id}">+</button>
        <button data-dec="${i.cart_item_id}">-</button>
        <button data-del="${i.cart_item_id}">Remove</button>
      </div>
    `).join("")}
    <hr/>
    <strong>Total: $${total.toFixed(2)}</strong>
  `;
}

cartEl.addEventListener("click", async (e) => {
  const inc = e.target.dataset.inc;
  const dec = e.target.dataset.dec;
  const del = e.target.dataset.del;

  if (inc) {
    const items = await api("/api/cart");
    const item = items.find(i => i.cart_item_id == inc);
    await api(`/api/cart/${inc}`, {
      method: "PUT",
      body: JSON.stringify({ quantity: item.quantity + 1 })
    });
    refreshCart();
  }

  if (dec) {
    const items = await api("/api/cart");
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
if (cartPill) cartPill.textContent = `Cart • ${count} item${count === 1 ? "" : "s"}`;
    const item = items.find(i => i.cart_item_id == dec);
    if (item.quantity > 1) {
      await api(`/api/cart/${dec}`, {
        method: "PUT",
        body: JSON.stringify({ quantity: item.quantity - 1 })
      });
      refreshCart();
    }
  }

  if (del) {
    await api(`/api/cart/${del}`, { method: "DELETE" });
    refreshCart();
  }
});
if (clearCartBtn) {
  clearCartBtn.addEventListener("click", async () => {
    if (!confirm("Clear all items from cart?")) return;

    try {
      const items = await api("/api/cart");
      for (const it of items) {
        await api(`/api/cart/${it.cart_item_id}`, { method: "DELETE" });
      }
      await refreshCart();
    } catch (err) {
      alert("Could not clear cart.");
    }
  });
}

async function init() {
  await loadProducts();
  await refreshCart();
}

init();