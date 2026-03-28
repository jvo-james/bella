
(() => {
  "use strict";

  const CART_KEY = "maison-creme-cart-v1";

  /* -------------------------------------------------------------------------- */
  /* Helpers                                                                    */
  /* -------------------------------------------------------------------------- */

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const formatPrice = (value) => `GH₵${Number(value || 0)}`;
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const titleCase = (text = "") =>
    text
      .replace(/[-_]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const normalise = (value = "") => value.toString().trim().toLowerCase();

  function safeLoad(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function safeSave(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* localStorage may be unavailable */
    }
  }

  /* -------------------------------------------------------------------------- */
  /* Toast                                                                      */
  /* -------------------------------------------------------------------------- */

  function ensureToastRoot() {
    let root = $("#mcToastRoot");
    if (root) return root;

    root = document.createElement("div");
    root.id = "mcToastRoot";
    Object.assign(root.style, {
      position: "fixed",
      top: "14px",
      left: "50%",
      transform: "translateX(-50%)",
      width: "min(92vw, 420px)",
      display: "grid",
      gap: "10px",
      zIndex: "200",
      pointerEvents: "none",
    });

    document.body.appendChild(root);
    return root;
  }

  function showToast(message, type = "default") {
    const root = ensureToastRoot();
    const toast = document.createElement("div");

    const borderColor =
      type === "success"
        ? "rgba(240, 200, 130, 0.28)"
        : type === "danger"
        ? "rgba(241, 154, 154, 0.26)"
        : "rgba(255, 240, 228, 0.14)";

    Object.assign(toast.style, {
      padding: "14px 16px",
      borderRadius: "18px",
      border: `1px solid ${borderColor}`,
      background:
        "linear-gradient(180deg, rgba(24, 17, 15, 0.96), rgba(15, 10, 8, 0.96))",
      color: "#f8f2ec",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.28)",
      backdropFilter: "blur(16px)",
      fontFamily: "Inter, sans-serif",
      fontSize: "0.95rem",
      lineHeight: "1.45",
      opacity: "0",
      transform: "translateY(-10px)",
      transition: "opacity 220ms ease, transform 220ms ease",
      pointerEvents: "auto",
    });

    toast.textContent = message;
    root.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-8px)";
      setTimeout(() => toast.remove(), 220);
    }, 2400);
  }

  /* -------------------------------------------------------------------------- */
  /* Images                                                                     */
  /* -------------------------------------------------------------------------- */

  const IMG = {
    spread: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=1400&q=80",
    pastrySpread: "https://images.unsplash.com/photo-1747829581686-b5f0bede4a70?auto=format&fit=crop&w=1400&q=80",

    donut1: "https://images.unsplash.com/photo-1526865999163-6676ef0a1519?auto=format&fit=crop&w=1400&q=80",
    donut2: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1400&q=80",

    roll1: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=1400&q=80",
    roll2: "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=1400&q=80",
    roll3: "https://images.unsplash.com/photo-1559620192-032c4bc4674e?auto=format&fit=crop&w=1400&q=80",

    bagel: "https://images.unsplash.com/photo-1597393353415-b3730f3719ce?auto=format&fit=crop&w=1400&q=80",

    croissant1: "https://images.unsplash.com/photo-1555507036-ab794f57598e?auto=format&fit=crop&w=1400&q=80",
    croissant2: "https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?auto=format&fit=crop&w=1400&q=80",
    croissant3: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=1400&q=80",

    cake1: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1400&q=80",
    cake2: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1400&q=80",
    cake3: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=1400&q=80",
    redVelvet: "https://images.unsplash.com/photo-1586788680434-30d3241b7f8e?auto=format&fit=crop&w=1400&q=80",

    brownie: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1400&q=80",
    tart: "https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?auto=format&fit=crop&w=1400&q=80",
    danish: "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?auto=format&fit=crop&w=1400&q=80",
    eclair: "https://images.unsplash.com/photo-1623246123320-0d663675f19c?auto=format&fit=crop&w=1400&q=80",
    puff: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=1400&q=80",
    cheesecake: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=1400&q=80",
    cookie: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=1400&q=80",

    juiceGeneric: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=1400&q=80",
    pineapple: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=1400&q=80",
    mintPineapple: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1400&q=80",
    watermelon: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=1400&q=80",
    sobolo: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=80",
    orange: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=1400&q=80",
  };

  const MAIN_IMAGE_BY_ID = {
  "oreo-donut": "https://images.unsplash.com/photo-1526865999163-6676ef0a1519?auto=format&fit=crop&w=1200&q=80",
  "plain-croissant": "crois.webp",
"cheese-croissant": "cc.png",
   "chocolate-croissant": "chc.jpg",
    "almond-croissant": "ac.jpg",
  "mud-cake-slice": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80",
  "fresh-juice": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=1200&q=80",

  "raisin-roll": "raison.jpg",
  "cinnamon-roll": "cin.jpg",
  "caramel-roll": "caramel.jpg",
  "signature-bagel": "bagels.jpg",

  "red-velvet-slice": "red.jpg",

  "pineapple-juice": "pine.webp",
  "mint-pineapple-juice": "pm.jpg",
  "watermelon-juice": "wm.webp",
  "sobolo": "sobolo.webp"
};
  
  const GALLERY_BY_CATEGORY = {
    donuts: [IMG.donut1, IMG.donut2, IMG.spread, IMG.pastrySpread],
    rolls: [IMG.roll1, IMG.roll2, IMG.roll3, IMG.pastrySpread],
    bagels: [IMG.bagel, IMG.pastrySpread, IMG.croissant1, IMG.spread],
    croissants: [IMG.croissant1, IMG.croissant2, IMG.croissant3, IMG.pastrySpread],
    "cake slices": [IMG.cake1, IMG.cake2, IMG.cake3, IMG.redVelvet],
    brownies: [IMG.brownie, IMG.cake1, IMG.cookie, IMG.spread],
    tarts: [IMG.tart, IMG.danish, IMG.cake2, IMG.spread],
    danishes: [IMG.danish, IMG.croissant1, IMG.tart, IMG.spread],
    pastries: [IMG.pastrySpread, IMG.puff, IMG.eclair, IMG.croissant1],
    juices: [IMG.juiceGeneric, IMG.pineapple, IMG.orange, IMG.watermelon],
  };

 function getGallery(product) {
  const key =
    normalise(product.category) === "bagels"
      ? "bagels"
      : GALLERY_BY_CATEGORY[normalise(product.category)]
      ? normalise(product.category)
      : "pastries";

  const mainImage = MAIN_IMAGE_BY_ID[product.id] || product.image;
  const combined = [mainImage, ...(GALLERY_BY_CATEGORY[key] || [])];

  return [...new Set(combined)].slice(0, 4);
}

  /* -------------------------------------------------------------------------- */
  /* Product Data                                                               */
  /* -------------------------------------------------------------------------- */

  function defaultOptionsFor(category) {
    const cat = normalise(category);

    if (cat === "croissants") return ["Cheese", "Plain", "Chocolate"];
    if (cat === "juices") return ["Chilled", "Bottle", "Pairing Pick"];
    if (cat === "brownies") return ["Chocolate", "Walnut"];
    return ["Classic", "Premium Box", "Gift Pick"];
  }

  function pairingFor(product) {
    const cat = normalise(product.category);

    if (cat === "donuts") return "orange juice or sobolo";
    if (cat === "croissants") return "mint & pineapple juice or orange juice";
    if (cat === "rolls") return "pineapple juice or mint & pineapple juice";
    if (cat === "brownies") return "sobolo or orange juice";
    if (cat === "cake slices") return "sobolo, orange juice, or watermelon juice";
    if (cat === "tarts") return "orange juice or watermelon juice";
    if (cat === "danishes") return "mint & pineapple juice";
    if (cat === "bagels" || cat === "pastries") return "pineapple juice or orange juice";
    if (cat === "juices") return "croissants, donuts, or cake slices";
    return "a fresh juice from the Maison Crème menu";
  }

  function createProduct(config) {
    const product = {
      id: config.id,
      name: config.name,
      category: config.category,
      price: Number(config.price),
      unit: config.unit,
      image: MAIN_IMAGE_BY_ID[config.id] || config.image,
      badge: config.badge || "Maison Crème Selection",
      description:
        config.description ||
        `${config.name} from the Maison Crème luxury pastry collection.`,
      pairing:
        config.pairing ||
        `Pairs beautifully with ${pairingFor(config)} for a complete Maison Crème order.`,
      options: config.options || defaultOptionsFor(config.category),
    };

    product.images = config.images || getGallery(product);
    product.categoryLabel =
      normalise(product.category) === "juices"
        ? "Fresh Juice Selection"
        : `Luxury ${product.category}`;
    product.serving =
      normalise(product.unit) === "two" ? "Sold in pairs" : "Single serving";
    product.overview =
      config.overview ||
      `${product.description} Every detail is designed to feel polished, rich, and worthy of a premium pastry brand in Ghana.`;
    product.notes =
      config.notes || [
        "Refined presentation with a boutique pastry finish.",
        `Designed to feel ${
          normalise(product.category) === "juices"
            ? "clean, fresh, and elevated"
            : "rich, polished, and indulgent"
        }.`,
        normalise(product.unit) === "two"
          ? "Sold in pairs for sharing, gifting, or curated dessert boxes."
          : "Available as an elegant single addition to larger pastry orders.",
        `Best enjoyed with ${pairingFor(product)}.`,
      ];

    return product;
  }

  const productList = [
    createProduct({
      id: "oreo-donut",
      name: "Oreo Donuts",
      category: "Donuts",
      price: 110,
      unit: "two",
      image: IMG.donut1,
      badge: "Signature Collection",
      description:
        "A rich premium donut experience finished with smooth chocolate, elegant texture, and Oreo crunch.",
      options: ["Classic", "Premium Box", "Gift Pick"],
    }),
    createProduct({
      id: "vanilla-glazed-donut",
      name: "Vanilla Glazed Donuts",
      category: "Donuts",
      price: 105,
      unit: "two",
      image: IMG.donut2,
      badge: "Gloss Finish",
      description:
        "Soft luxury donuts coated in a smooth vanilla glaze with a clean polished finish.",
    }),
    createProduct({
      id: "raisin-roll",
      name: "Raisin Roll",
      category: "Rolls",
      price: 110,
      unit: "two",
      image: IMG.roll1,
      badge: "Classic Richness",
      description:
        "A buttery glazed roll with warm depth, smooth texture, and a refined pastry-house feel.",
    }),
    createProduct({
      id: "cinnamon-roll",
      name: "Cinnamon Rolls",
      category: "Rolls",
      price: 125,
      unit: "two",
      image: IMG.roll2,
      badge: "Warm & Indulgent",
      description:
        "Soft spirals layered with spice and finished with glossy icing for elevated comfort.",
    }),
    createProduct({
      id: "caramel-roll",
      name: "Caramel Rolls",
      category: "Rolls",
      price: 130,
      unit: "two",
      image: IMG.roll3,
      badge: "Luxury Drizzle",
      description:
        "Buttery rolls dressed in rich caramel for a more decadent and polished dessert moment.",
    }),
    createProduct({
      id: "signature-bagel",
      name: "Signature Bagel",
      category: "Bagels",
      price: 100,
      unit: "two",
      image: IMG.bagel,
      badge: "Brunch Favourite",
      description:
        "Golden, glossy, and beautifully baked for a clean boutique-style brunch experience.",
      options: ["Classic", "Toasted", "Brunch Box"],
    }),
  createProduct({
  id: "plain-croissant",
  name: "Plain Croissant",
  category: "Croissants",
  price: 110,
  unit: "two",
  image: "crois.webp",
  badge: "Classic Layers",
  description:
    "Flaky plain croissants with a clean golden finish and a refined bakery texture.",
  options: ["Classic", "Fresh Pair"],
}),
createProduct({
  id: "cheese-croissant",
  name: "Cheese Croissant",
  category: "Croissants",
  price: 120,
  unit: "two",
  image: "crois.webp",
  badge: "Savory Favourite",
  description:
    "Buttery croissants with a rich cheese filling and a polished golden finish.",
  options: ["Cheese", "Fresh Pair"],
}),
createProduct({
  id: "chocolate-croissant",
  name: "Chocolate Croissant",
  category: "Croissants",
  price: 120,
  unit: "two",
  image: IMG.croissant2,
  badge: "Deep Cocoa",
  description:
    "Layered croissants with a rich chocolate center and a premium bakery finish.",
  options: ["Chocolate Classic", "Fresh Pair"],
}),
createProduct({
  id: "almond-croissant",
  name: "Almond Croissant",
  category: "Croissants",
  price: 140,
  unit: "two",
  image: IMG.croissant3,
  badge: "Refined Finish",
  description:
    "Buttery layers finished with almond richness for a more elegant croissant experience.",
  options: ["Almond Classic", "Fresh Pair"],
}),
    createProduct({
      id: "mud-cake-slice",
      name: "Mud Cake Slice",
      category: "Cake Slices",
      price: 150,
      unit: "two",
      image: IMG.cake1,
      badge: "Rich & Elegant",
      description:
        "Dense chocolate luxury with a smooth finish and a boutique dessert-table presence.",
      options: ["Classic", "Premium Box", "Celebration Pick"],
    }),
    createProduct({
      id: "swirl-cake",
      name: "Swirl Cake",
      category: "Cake Slices",
      price: 135,
      unit: "two",
      image: IMG.cake2,
      badge: "Smooth Marble Finish",
      description:
        "A light, elegant swirl cake with a polished marbled look and premium feel.",
      options: ["Classic", "Marble Box", "Gift Pick"],
    }),
    createProduct({
      id: "lemon-raspberry-slice",
      name: "Lemon Raspberry Slice",
      category: "Cake Slices",
      price: 90,
      unit: "each",
      image: IMG.cake3,
      badge: "Bright & Refined",
      description:
        "A fresh citrus-and-berry slice with a clean luxurious finish and balanced sweetness.",
      options: ["Single Slice", "Fresh Pick", "Dessert Pair"],
    }),
    createProduct({
      id: "red-velvet-slice",
      name: "Red Velvet Slice",
      category: "Cake Slices",
      price: 145,
      unit: "two",
      image: IMG.redVelvet,
      badge: "Velvet Luxury",
      description:
        "Soft red velvet layers with a polished cream finish for a rich celebration-ready feel.",
      options: ["Classic", "Premium Box", "Celebration Pick"],
    }),
    createProduct({
      id: "brownie-duo",
      name: "Brownie Duo",
      category: "Brownies",
      price: 150,
      unit: "two",
      image: IMG.brownie,
      badge: "Chocolate • Walnut",
      description:
        "Fudgy premium brownies with deep flavor and a rich boutique-style finish.",
      options: ["Chocolate", "Walnut"],
    }),
    createProduct({
      id: "strawberry-tart",
      name: "Strawberry Tart",
      category: "Tarts",
      price: 140,
      unit: "two",
      image: IMG.tart,
      badge: "Fruit-Luxe",
      description:
        "Glossy strawberry tarts with a delicate base and an elevated pastry-boutique look.",
      options: ["Classic", "Fruit Luxe", "Gift Pick"],
    }),
    createProduct({
      id: "fruit-danish",
      name: "Fruit Danish",
      category: "Danishes",
      price: 130,
      unit: "two",
      image: IMG.danish,
      badge: "Delicate Layers",
      description:
        "Light pastry layers finished with fruit notes and a beautifully refined appearance.",
      options: ["Fruit Classic", "Berry Finish", "Gift Box"],
    }),
    createProduct({
      id: "eclair-selection",
      name: "Éclairs",
      category: "Pastries",
      price: 145,
      unit: "two",
      image: IMG.eclair,
      badge: "French-Inspired",
      description:
        "Elegant pastry shells with smooth filling and a polished luxury dessert finish.",
      options: ["Classic", "Chocolate Finish", "Gift Pick"],
    }),
    createProduct({
      id: "puff-pastries",
      name: "Puff Pastries",
      category: "Pastries",
      price: 115,
      unit: "two",
      image: IMG.puff,
      badge: "Crisp Layers",
      description:
        "Light, crisp, and beautifully layered for a polished premium pastry moment.",
      options: ["Classic", "Savory Style", "Gift Box"],
    }),
    createProduct({
      id: "mini-cheesecake",
      name: "Mini Cheesecakes",
      category: "Cake Slices",
      price: 155,
      unit: "two",
      image: IMG.cheesecake,
      badge: "Creamy Luxury",
      description:
        "Rich mini cheesecakes with a smooth premium finish perfect for gifting or indulgence.",
      options: ["Classic", "Berry Finish", "Gift Box"],
    }),
    createProduct({
      id: "cookie-selection",
      name: "Cookie Selection",
      category: "Pastries",
      price: 95,
      unit: "two",
      image: IMG.cookie,
      badge: "Elegant Everyday",
      description:
        "Luxury cookies with a rich bakery feel, ideal for light indulgence or curated gifting.",
      options: ["Classic", "Crunch Mix", "Gift Pick"],
    }),
    createProduct({
      id: "fresh-juice",
      name: "Fresh Juices",
      category: "Juices",
      price: 40,
      unit: "each",
      image: IMG.juiceGeneric,
      badge: "Juice Bar",
      description:
        "A fresh handcrafted juice selection that completes the full Maison Crème pastry experience.",
      options: ["Pineapple", "Mint & Pineapple", "Watermelon", "Sobolo", "Orange"],
      pairing: "Pairs beautifully with croissants, donuts, brownies, and premium cake slices.",
    }),
    createProduct({
      id: "pineapple-juice",
      name: "Pineapple Juice",
      category: "Juices",
      price: 40,
      unit: "each",
      image: IMG.pineapple,
      badge: "Fresh Juice",
      description:
        "Bright tropical pineapple juice served cold with a clean premium finish.",
      options: ["Chilled", "Bottle", "Pairing Pick"],
    }),
    createProduct({
      id: "mint-pineapple-juice",
      name: "Mint & Pineapple Juice",
      category: "Juices",
      price: 40,
      unit: "each",
      image: IMG.mintPineapple,
      badge: "Refreshing Pairing",
      description:
        "Fresh pineapple lifted with mint for a cool, elegant, and refined drink pairing.",
      options: ["Chilled", "Bottle", "Pairing Pick"],
    }),
    createProduct({
      id: "watermelon-juice",
      name: "Watermelon Juice",
      category: "Juices",
      price: 40,
      unit: "each",
      image: IMG.watermelon,
      badge: "Cold & Smooth",
      description:
        "A fresh, juicy, and beautifully light drink that balances rich pastries with ease.",
      options: ["Chilled", "Bottle", "Pairing Pick"],
    }),
    createProduct({
      id: "sobolo",
      name: "Sobolo",
      category: "Juices",
      price: 40,
      unit: "each",
      image: IMG.sobolo,
      badge: "Local Classic",
      description:
        "A premium take on a beloved favourite, served cold and beautifully presented.",
      options: ["Chilled", "Bottle", "Pairing Pick"],
    }),
    createProduct({
      id: "orange-juice",
      name: "Orange Juice",
      category: "Juices",
      price: 40,
      unit: "each",
      image: IMG.orange,
      badge: "Clean Citrus",
      description:
        "Bright citrus freshness that balances rich cakes, donuts, and layered pastries beautifully.",
      options: ["Chilled", "Bottle", "Pairing Pick"],
    }),
  ];

  const PRODUCTS = Object.fromEntries(productList.map((product) => [product.id, product]));

  /* -------------------------------------------------------------------------- */
  /* Cart                                                                       */
  /* -------------------------------------------------------------------------- */

  let cart = safeLoad(CART_KEY, []);
  let currentProduct = null;
  let currentOption = "";

  function getCartCount() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }

  function getCartSubtotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function saveCart() {
    safeSave(CART_KEY, cart);
  }

  function updateCartIndicators() {
    const count = getCartCount();
    const subtotal = getCartSubtotal();

    $$("#cartBadge").forEach((node) => {
      node.textContent = count > 99 ? "99+" : String(count);
    });

    $$("#cartCountLabel").forEach((node) => {
      node.textContent = String(count);
    });

    $$("#cartSubtotal").forEach((node) => {
      node.textContent = formatPrice(subtotal);
    });
  }

  function renderCart() {
    const itemsHost = $("#cartItems");
    const emptyState = $("#cartEmptyState");

    updateCartIndicators();

    if (!itemsHost) return;

    if (!cart.length) {
      itemsHost.innerHTML = "";
      if (emptyState) emptyState.hidden = false;
      return;
    }

    if (emptyState) emptyState.hidden = true;

    itemsHost.innerHTML = cart
      .map(
        (item) => `
          <article class="cart-item">
            <div class="cart-item__image">
              <img src="${item.image}" alt="${item.name}" />
            </div>

            <div class="cart-item__content">
              <h3>${item.name}</h3>
              <div class="cart-item__meta">
                ${item.category}${item.variant ? ` • ${item.variant}` : ""}
              </div>
              <div class="cart-item__price">${formatPrice(item.price)} <span style="color:#a89283;font-weight:500;">/ ${item.unit}</span></div>

              <div class="cart-item__actions">
                <button class="cart-item__qty-btn" type="button" data-cart-action="decrease" data-key="${item.key}" aria-label="Decrease quantity">−</button>
                <span class="cart-item__qty">${item.qty}</span>
                <button class="cart-item__qty-btn" type="button" data-cart-action="increase" data-key="${item.key}" aria-label="Increase quantity">+</button>
                <button class="cart-item__remove" type="button" data-cart-action="remove" data-key="${item.key}" aria-label="Remove item">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>

            <div style="font-weight:700; align-self:start;">${formatPrice(item.qty * item.price)}</div>
          </article>
        `
      )
      .join("");
  }

  function openCart() {
    const drawer = $("#cartDrawer");
    if (!drawer) return;

    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("cart-open");
  }

  function closeCart() {
    const drawer = $("#cartDrawer");
    if (!drawer) return;

    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cart-open");
  }

  function addToCart(product, qty = 1, variant = "") {
    if (!product) return;

    const key = variant ? `${product.id}::${variant}` : product.id;
    const existing = cart.find((item) => item.key === key);

    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({
        key,
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        unit: product.unit,
        image: product.image,
        variant,
        qty,
      });
    }

    saveCart();
    renderCart();
  }

  function updateCartItemQuantity(key, delta) {
    const target = cart.find((item) => item.key === key);
    if (!target) return;

    target.qty += delta;

    if (target.qty <= 0) {
      cart = cart.filter((item) => item.key !== key);
    }

    saveCart();
    renderCart();
  }

  function removeCartItem(key) {
    cart = cart.filter((item) => item.key !== key);
    saveCart();
    renderCart();
  }

  function clearCart() {
    cart = [];
    saveCart();
    renderCart();
  }

  /* -------------------------------------------------------------------------- */
  /* Product Extraction                                                         */
  /* -------------------------------------------------------------------------- */

  function fallbackProductFromCard(card) {
    if (!card) return null;

    const { id, name, category, price, unit, image } = card.dataset;

    if (!id) return null;

    return createProduct({
      id,
      name: name || titleCase(id),
      category: category || "Pastries",
      price: Number(price || 0),
      unit: unit || "two",
      image: image || IMG.pastrySpread,
      description: `${name || titleCase(id)} from the Maison Crème luxury pastry collection.`,
    });
  }

  function getProductById(id) {
    return PRODUCTS[id] || null;
  }

  function getProductFromCard(card) {
    const id = card?.dataset?.id;
    return getProductById(id) || fallbackProductFromCard(card);
  }

  /* -------------------------------------------------------------------------- */
  /* Menu Filters                                                               */
  /* -------------------------------------------------------------------------- */

function initMenuFiltering() {
  const searchInput = $("#productSearch");
  const filterButtons = $$(".filter-chip");
  const sections = $$(".menu-category-section");

  if (!searchInput || !filterButtons.length || !sections.length) return;

  let activeFilter = "all";

  function getAllCards() {
    return $$(".product-card");
  }

  function getOrCreateEmptyState() {
    let message = $("#menuEmptyState");

    if (!message) {
      message = document.createElement("div");
      message.id = "menuEmptyState";
      message.className = "empty-state-message is-hidden";
      message.innerHTML =
        "<strong style='display:block;margin-bottom:0.4rem;'>No products matched your search.</strong>Try another keyword or category.";

      const toolbar = $(".menu-toolbar .container");
      if (toolbar) {
        toolbar.insertAdjacentElement("afterend", message);
      }
    }

    return message;
  }

  function applyFilters() {
    const searchTerm = normalise(searchInput.value);
    const cards = getAllCards();
    let visibleCount = 0;

    cards.forEach((card) => {
      const name = normalise(card.dataset.name || "");
      const category = normalise(card.dataset.category || "");
      const id = normalise(card.dataset.id || "");

      const matchesFilter =
        activeFilter === "all" || category === normalise(activeFilter);

      const matchesSearch =
        !searchTerm ||
        name.includes(searchTerm) ||
        category.includes(searchTerm) ||
        id.includes(searchTerm);

      const shouldShow = matchesFilter && matchesSearch;

      card.classList.toggle("is-hidden", !shouldShow);

      if (shouldShow) visibleCount += 1;
    });

    sections.forEach((section) => {
      const visibleCards = $$(".product-card:not(.is-hidden)", section);
      section.classList.toggle("is-hidden", visibleCards.length === 0);
    });

    const emptyState = getOrCreateEmptyState();
    emptyState.classList.toggle("is-hidden", visibleCount > 0);
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const filter = button.dataset.filter || "all";

      if (filter !== "all") {
        event.preventDefault();
      }

      activeFilter = filter;
      filterButtons.forEach((btn) => btn.classList.remove("is-active"));
      button.classList.add("is-active");
      applyFilters();

      if (filter === "all") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const targetSection = document.querySelector(button.getAttribute("href"));
        targetSection?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  searchInput.addEventListener("input", () => {
    if (searchInput.value.trim()) {
      activeFilter = "all";
      filterButtons.forEach((btn) => btn.classList.remove("is-active"));
      filterButtons[0]?.classList.add("is-active");
    }

    applyFilters();
  });

  applyFilters();
}

  /* -------------------------------------------------------------------------- */
  /* Product Page                                                               */
  /* -------------------------------------------------------------------------- */

  function setGalleryImages(images, productName) {
    const mainImage = $("#productMainImage");
    const thumbsHost = $(".product-gallery__thumbs");

    if (!mainImage || !thumbsHost || !images.length) return;

    mainImage.src = images[0];
    mainImage.alt = `${productName} by Maison Crème`;

    thumbsHost.innerHTML = images
      .map(
        (image, index) => `
          <button
            class="product-thumb ${index === 0 ? "is-active" : ""}"
            type="button"
            data-image="${image}"
            aria-label="View ${productName} image ${index + 1}"
          >
            <img src="${image}" alt="${productName} thumbnail ${index + 1}" />
          </button>
        `
      )
      .join("");
  }

  function setProductOptions(product) {
    const optionsHost = $("#productOptions");
    if (!optionsHost) return;

    const options = product.options?.length
      ? product.options
      : defaultOptionsFor(product.category);

    currentOption = options[0] || "";

    optionsHost.innerHTML = options
      .map(
        (option, index) => `
          <button
            class="option-chip ${index === 0 ? "is-active" : ""}"
            type="button"
            data-option="${option}"
          >
            ${option}
          </button>
        `
      )
      .join("");
  }

  function updateProductMeta(product) {
    const mapping = {
      breadcrumbProductName: product.name,
      productBadge: product.badge,
      productCategory: product.categoryLabel,
      productName: product.name,
      productPrice: formatPrice(product.price),
      productUnit: `/ ${product.unit}`,
      productDescription: product.description,
      productMetaCategory: product.category,
      productMetaServing: product.serving,
      sidebarPrice: formatPrice(product.price),
      sidebarUnit: product.unit,
      productOverviewText: product.overview,
      productPairingText: product.pairing,
    };

    Object.entries(mapping).forEach(([id, value]) => {
      const node = document.getElementById(id);
      if (node) node.textContent = value;
    });

    const notesList = $("#productNotesList");
    if (notesList) {
      notesList.innerHTML = product.notes.map((note) => `<li>${note}</li>`).join("");
    }

    const statusText = $(".product-status span");
    if (statusText) statusText.textContent = "Freshly available today";

    const mainImage = $("#productMainImage");
    if (mainImage) {
      mainImage.src = product.images[0];
      mainImage.alt = `${product.name} by Maison Crème`;
    }

    document.title = `${product.name} | Maison Crème`;

    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) {
      descriptionMeta.setAttribute(
        "content",
        `${product.name} from Maison Crème — ${product.description}`
      );
    }
  }

  function renderProductPage(product) {
    if (!product) return;

    currentProduct = product;

    updateProductMeta(product);
    setGalleryImages(product.images, product.name);
    setProductOptions(product);

    const quantityInput = $("#productQuantity");
    if (quantityInput) quantityInput.value = "1";
  }

  function initProductTabs() {
    const tabs = $$(".details-tab");
    if (!tabs.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.dataset.tab;

        tabs.forEach((btn) => btn.classList.remove("is-active"));
        tab.classList.add("is-active");

        $$(".details-panel").forEach((panel) => {
          panel.classList.toggle("is-active", panel.id === `tab-${target}`);
        });
      });
    });
  }

  function initProductPage() {
    const page = document.body.dataset.page;
    if (page !== "product") return;

    const info = $("#productInfo");
    if (!info) return;

    const params = new URLSearchParams(window.location.search);
    const productId = params.get("product") || info.dataset.defaultId || "oreo-donut";
    const product =
      getProductById(productId) ||
      createProduct({
        id: info.dataset.defaultId || "oreo-donut",
        name: info.dataset.defaultName || "Oreo Donuts",
        category: info.dataset.defaultCategory || "Donuts",
        price: Number(info.dataset.defaultPrice || 110),
        unit: info.dataset.defaultUnit || "two",
        image: info.dataset.defaultImage || IMG.donut1,
        description:
          "A rich premium donut experience finished with smooth chocolate and a polished bakery finish.",
      });

    renderProductPage(product);
    initProductTabs();

    const quantityInput = $("#productQuantity");
    const decreaseBtn = $(".js-qty-decrease");
    const increaseBtn = $(".js-qty-increase");
    const addCurrentBtn = $("#addCurrentProductToCart");
    const optionsHost = $("#productOptions");
    const thumbsHost = $(".product-gallery__thumbs");

    function getQuantity() {
      const raw = Number(quantityInput?.value || 1);
      return clamp(Number.isFinite(raw) ? raw : 1, 1, 20);
    }

    function syncQuantityInput() {
      if (!quantityInput) return;
      quantityInput.value = String(getQuantity());
    }

    decreaseBtn?.addEventListener("click", () => {
      if (!quantityInput) return;
      quantityInput.value = String(clamp(getQuantity() - 1, 1, 20));
    });

    increaseBtn?.addEventListener("click", () => {
      if (!quantityInput) return;
      quantityInput.value = String(clamp(getQuantity() + 1, 1, 20));
    });

    quantityInput?.addEventListener("input", syncQuantityInput);
    quantityInput?.addEventListener("blur", syncQuantityInput);

    optionsHost?.addEventListener("click", (event) => {
      const button = event.target.closest(".option-chip");
      if (!button) return;

      currentOption = button.dataset.option || "";
      $$(".option-chip", optionsHost).forEach((chip) => chip.classList.remove("is-active"));
      button.classList.add("is-active");
    });

    thumbsHost?.addEventListener("click", (event) => {
      const thumb = event.target.closest(".product-thumb");
      const mainImage = $("#productMainImage");
      if (!thumb || !mainImage) return;

      mainImage.src = thumb.dataset.image || mainImage.src;
      mainImage.alt = `${currentProduct?.name || "Maison Crème product"} by Maison Crème`;

      $$(".product-thumb", thumbsHost).forEach((node) => node.classList.remove("is-active"));
      thumb.classList.add("is-active");
    });

    addCurrentBtn?.addEventListener("click", () => {
      if (!currentProduct) return;

      const qty = getQuantity();
      addToCart(currentProduct, qty, currentOption);
      openCart();
      showToast(
        `${currentProduct.name}${currentOption ? ` • ${currentOption}` : ""} added to cart.`,
        "success"
      );
    });
  }

  /* -------------------------------------------------------------------------- */
  /* Mobile Menu                                                                */
  /* -------------------------------------------------------------------------- */

  function openMobileMenu() {
    const menu = $("#mobileMenu");
    if (!menu) return;

    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
  }

  function closeMobileMenu() {
    const menu = $("#mobileMenu");
    if (!menu) return;

    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
  }

  function initMobileMenu() {
    $$(".js-open-mobile-menu").forEach((button) =>
      button.addEventListener("click", openMobileMenu)
    );

    $$(".js-close-mobile-menu").forEach((button) =>
      button.addEventListener("click", closeMobileMenu)
    );

    const menu = $("#mobileMenu");
    menu?.addEventListener("click", (event) => {
      if (event.target === menu) closeMobileMenu();
    });
  }

  /* -------------------------------------------------------------------------- */
  /* Global Event Binding                                                       */
  /* -------------------------------------------------------------------------- */

  function bindCartControls() {
    $$(".js-open-cart").forEach((button) => {
      button.addEventListener("click", openCart);
    });

    $$(".js-close-cart").forEach((button) => {
      button.addEventListener("click", closeCart);
    });

    $$(".js-clear-cart").forEach((button) => {
      button.addEventListener("click", () => {
        if (!cart.length) {
          showToast("Your cart is already empty.");
          return;
        }

        clearCart();
        showToast("Cart cleared.", "danger");
      });
    });

    const itemsHost = $("#cartItems");
    itemsHost?.addEventListener("click", (event) => {
      const actionBtn = event.target.closest("[data-cart-action]");
      if (!actionBtn) return;

      const action = actionBtn.dataset.cartAction;
      const key = actionBtn.dataset.key;
      if (!key) return;

      if (action === "increase") updateCartItemQuantity(key, 1);
      if (action === "decrease") updateCartItemQuantity(key, -1);
      if (action === "remove") removeCartItem(key);

      renderCart();
    });

    $$(".cart-drawer__actions .btn--primary").forEach((button) => {
      button.addEventListener("click", () => {
        if (!cart.length) {
          showToast("Your cart is empty. Add pastries or juices first.");
          return;
        }

        showToast(
          `Order summary ready • ${getCartCount()} item${getCartCount() > 1 ? "s" : ""} • ${formatPrice(
            getCartSubtotal()
          )}`,
          "success"
        );
      });
    });
  }

  function bindProductCardActions() {
    $$(".js-add-to-cart").forEach((button) => {
      button.addEventListener("click", (event) => {
        const card = event.currentTarget.closest(".product-card");
        const product = getProductFromCard(card);

        if (!product) return;

        addToCart(product, 1, "");
        openCart();
        showToast(`${product.name} added to cart.`, "success");
      });
    });
  }

  function bindEscapeKey() {
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      closeCart();
      closeMobileMenu();
    });
  }

  /* -------------------------------------------------------------------------- */
  /* Init                                                                       */
  /* -------------------------------------------------------------------------- */

  function initStore() {
    renderCart();
    initMobileMenu();
    bindCartControls();
    bindProductCardActions();
    bindEscapeKey();
    initMenuFiltering();
    initProductPage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initStore);
  } else {
    initStore();
  }
})();
