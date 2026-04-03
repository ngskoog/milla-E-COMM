const db = require("./db");

db.serialize(() => {
  // PRODUCTS TABLE
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      image_url TEXT,
      description TEXT,
      stock INTEGER NOT NULL DEFAULT 0
    )
  `);

  // CART TABLE
  db.run(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Clear tables each time you seed
  db.run(`DELETE FROM cart_items`);
  db.run(`DELETE FROM products`);

  const stmt = db.prepare(`
    INSERT INTO products (name, price, image_url, description, stock)
    VALUES (?, ?, ?, ?, ?)
  `);

  const products = [
    [
      "Reusable Water Bottle",
      24.95,
      "https://picsum.photos/seed/bottle/400/300",
      "Insulated and lightweight.",
      12,
    ],
    [
      "Canvas Tote Bag",
      14.5,
      "https://picsum.photos/seed/tote/400/300",
      "Perfect for groceries.",
      20,
    ],
    [
      "Wireless Earbuds",
      79.0,
      "https://picsum.photos/seed/earbuds/400/300",
      "Noise isolation, compact case.",
      6,
    ],
    [
      "Notebook Set",
      12.0,
      "https://picsum.photos/seed/notebooks/400/300",
      "3-pack dotted notebooks.",
      25,
    ],
    [
      "Desk Lamp",
      39.99,
      "https://picsum.photos/seed/lamp/400/300",
      "Warm light, adjustable arm.",
      8,
    ],
    [
      "Coffee Mug",
      18.0,
      "https://picsum.photos/seed/mug/400/300",
      "Ceramic mug 350ml.",
      30,
    ],
    [
      "Phone Stand",
      9.95,
      "https://picsum.photos/seed/stand/400/300",
      "Aluminium foldable stand.",
      40,
    ],
    [
      "Yoga Mat",
      45.0,
      "https://picsum.photos/seed/yogamat/400/300",
      "Non-slip, easy to clean.",
      10,
    ],
  ];

  for (const p of products) stmt.run(p);
  stmt.finalize();

  console.log(" Seed complete: products and cart tables created.");
});
