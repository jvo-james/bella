(() => {
  "use strict";

  const CART_KEY = "meals-by-bella-cart-v3";
  const PAYSTACK_PUBLIC_KEY = "pk_test_297586e51710e83d3c159bfe71ff45c7e23411fa";

  /* -------------------------------------------------------------------------- */
  /* Helpers                                                                    */
  /* -------------------------------------------------------------------------- */

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const normalise = (value = "") => String(value).trim().toLowerCase();
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const formatPrice = (value) => `GH₵${Number(value || 0)}`;

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
      /* ignore */
    }
  }

  function escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function scrollToTopSmooth() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* -------------------------------------------------------------------------- */
  /* Toast                                                                      */
  /* -------------------------------------------------------------------------- */

  function ensureToastRoot() {
    let root = $("#mbbToastRoot");
    if (root) return root;

    root = document.createElement("div");
    root.id = "mbbToastRoot";
    Object.assign(root.style, {
      position: "fixed",
      top: "16px",
      left: "50%",
      transform: "translateX(-50%)",
      width: "min(92vw, 420px)",
      display: "grid",
      gap: "10px",
      zIndex: "9999",
      pointerEvents: "none",
    });

    document.body.appendChild(root);
    return root;
  }

  function showToast(message, type = "default") {
    const root = ensureToastRoot();
    const toast = document.createElement("div");

    const stylesByType = {
      success: {
        border: "1px solid rgba(84, 139, 84, 0.22)",
        background: "rgba(241, 248, 239, 0.98)",
      },
      danger: {
        border: "1px solid rgba(190, 96, 96, 0.22)",
        background: "rgba(255, 245, 245, 0.98)",
      },
      default: {
        border: "1px solid rgba(179, 132, 91, 0.2)",
        background: "rgba(255, 252, 247, 0.98)",
      },
    };

    const config = stylesByType[type] || stylesByType.default;

    Object.assign(toast.style, {
      padding: "14px 16px",
      borderRadius: "16px",
      color: "#4b3426",
      boxShadow: "0 18px 44px rgba(106, 73, 52, 0.14)",
      backdropFilter: "blur(12px)",
      fontFamily: "Inter, sans-serif",
      fontSize: "0.95rem",
      lineHeight: "1.45",
      opacity: "0",
      transform: "translateY(-10px)",
      transition: "opacity 220ms ease, transform 220ms ease",
      pointerEvents: "auto",
      ...config,
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
    }, 2200);
  }

  /* -------------------------------------------------------------------------- */
  /* Product Data                                                               */
  /* -------------------------------------------------------------------------- */

  function createProduct(config) {
    return {
      id: config.id,
      name: config.name,
      category: config.category,
      price: Number(config.price),
      unit: config.unit,
      image: config.image,
      images: config.images && config.images.length ? config.images : [config.image],
      options: config.options && config.options.length ? config.options : ["Standard"],
      tagline: config.tagline || "Freshly prepared and available to order.",
      availability: config.availability || "Available to order",
      description: config.description || `${config.name} is available to order.`,
      highlights: config.highlights || {
        love: "A customer favourite.",
        time: "Great any time of day.",
        serving: `Served / sold per ${config.unit || "item"}.`,
      },
      overview: config.overview || `${config.name} is available on the Meals by Bella menu.`,
      overviewExtra: config.overviewExtra || "",
      notes: config.notes || ["Available to order."],
      pairing: config.pairing || "Pairs well with other menu items.",
      metaBestWith: config.metaBestWith || "Other menu items",
      sidebarPoints: config.sidebarPoints || [{ title: "Available", text: "Ready to order." }],
    };
  }

  const productList = [
    createProduct({
      id: "oreo-donut",
      name: "Oreo Donuts",
      category: "Donuts",
      price: 100,
      unit: "two",
      image: "https://images.unsplash.com/photo-1526865999163-6676ef0a1519?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1526865999163-6676ef0a1519?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=1400&q=80",
      ],
      options: ["Standard", "Fresh Batch"],
      tagline: "A sweet pick for sharing or enjoying with a cold drink.",
      description: "Chocolate donuts topped with Oreo crumbs, served as a pair.",
      pairing: "Try this with pineapple juice, orange juice, or sobolo.",
      metaBestWith: "Pineapple juice, orange juice, or sobolo",
    }),

    createProduct({
      id: "plain-croissant",
      name: "Plain Croissant",
      category: "Croissants",
      price: 110,
      unit: "two",
      image: "crois.webp",
      images: ["crois.webp"],
      options: ["Standard", "Fresh Batch"],
      tagline: "A light, buttery option for any time of day.",
      description: "Plain croissants served as a pair.",
      pairing: "Pairs well with pineapple juice or orange juice.",
      metaBestWith: "Pineapple juice or orange juice",
    }),

    createProduct({
      id: "cheese-croissant",
      name: "Cheese Croissant",
      category: "Croissants",
      price: 120,
      unit: "two",
      image: "crois.webp",
      images: ["crois.webp"],
      options: ["Standard", "Fresh Batch"],
      tagline: "A warm pastry with a cheesy centre.",
      description: "Cheese croissants served as a pair.",
      pairing: "Pairs well with pineapple juice or orange juice.",
      metaBestWith: "Pineapple juice or orange juice",
    }),

    createProduct({
      id: "chocolate-croissant",
      name: "Chocolate Croissant",
      category: "Croissants",
      price: 120,
      unit: "two",
      image: "https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?auto=format&fit=crop&w=1400&q=80",
        "crois.webp",
      ],
      options: ["Standard", "Fresh Batch"],
      tagline: "A warm favourite for breakfast, snacks, or sharing.",
      description: "Flaky croissants with a chocolate filling and a soft, buttery bite.",
      pairing: "Pairs nicely with pineapple juice, orange juice, or sobolo.",
      metaBestWith: "Juice, sobolo, or a light snack break",
    }),

    createProduct({
      id: "almond-croissant",
      name: "Almond Croissant",
      category: "Croissants",
      price: 140,
      unit: "two",
      image: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=1200&q=80",
      images: ["https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=1400&q=80"],
      options: ["Standard", "Fresh Batch"],
      tagline: "A buttery pastry with almond flavour and a fuller bite.",
      description: "Almond croissants served as a pair.",
      pairing: "Goes well with orange juice or pineapple juice.",
      metaBestWith: "Orange juice or pineapple juice",
    }),

    createProduct({
      id: "walnut-brownie",
      name: "Walnut Brownie",
      category: "Brownies",
      price: 150,
      unit: "two",
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80",
      images: ["https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1400&q=80"],
      options: ["Standard", "Fresh Batch"],
      tagline: "A rich brownie option with walnut pieces and a soft bite.",
      description: "Walnut brownies served as a pair.",
      pairing: "Goes well with sobolo, orange juice, or pineapple juice.",
      metaBestWith: "Sobolo, orange juice, or pineapple juice",
    }),

    createProduct({
      id: "chocolate-brownie",
      name: "Chocolate Brownie",
      category: "Brownies",
      price: 150,
      unit: "two",
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80",
      images: ["https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1400&q=80"],
      options: ["Standard", "Fresh Batch"],
      tagline: "A simple chocolate dessert option that is soft and filling.",
      description: "Chocolate brownies served as a pair.",
      pairing: "Pairs well with sobolo, orange juice, or pineapple juice.",
      metaBestWith: "Sobolo or juice",
    }),

    createProduct({
      id: "mud-cake-slice",
      name: "Mud Cake Slice",
      category: "Cake Slices",
      price: 150,
      unit: "two",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80",
      images: ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1400&q=80"],
      options: ["Standard", "Fresh Batch"],
      tagline: "A rich chocolate cake option served in slices.",
      description: "Mud cake slices served as a pair.",
      pairing: "Goes well with sobolo, orange juice, or pineapple juice.",
      metaBestWith: "Sobolo, orange juice, or pineapple juice",
    }),

    createProduct({
      id: "swirl-cake",
      name: "Swirl Cake",
      category: "Cake Slices",
      price: 135,
      unit: "two",
      image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1200&q=80",
      images: ["https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1400&q=80"],
      options: ["Standard", "Fresh Batch"],
      tagline: "A soft cake slice option that is easy to enjoy.",
      description: "Swirl cake served as a pair of slices.",
      pairing: "Pairs well with orange juice, pineapple juice, or sobolo.",
      metaBestWith: "Orange juice, pineapple juice, or sobolo",
    }),

    createProduct({
      id: "lemon-raspberry-slice",
      name: "Lemon Raspberry Slice",
      category: "Cake Slices",
      price: 90,
      unit: "each",
      image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=1200&q=80",
      images: ["https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=1400&q=80"],
      options: ["Single Slice", "Fresh Slice"],
      tagline: "A lighter cake choice with a fruity flavour.",
      description: "A single slice with lemon and raspberry flavour.",
      pairing: "Pairs nicely with orange juice or pineapple juice.",
      metaBestWith: "Orange juice or pineapple juice",
    }),

    createProduct({
      id: "red-velvet-slice",
      name: "Red Velvet Slice",
      category: "Cake Slices",
      price: 145,
      unit: "two",
      image: "red.jpg",
      images: ["red.jpg"],
      options: ["Standard", "Fresh Batch"],
      tagline: "A soft cake option with a smooth finish.",
      description: "Red velvet cake slices served as a pair.",
      pairing: "Pairs well with pineapple juice, orange juice, or sobolo.",
      metaBestWith: "Pineapple juice, orange juice, or sobolo",
    }),

    createProduct({
      id: "raisin-roll",
      name: "Raisin Roll",
      category: "Pastries",
      price: 110,
      unit: "two",
      image: "raison.jpg",
      images: ["raison.jpg"],
      options: ["Standard", "Fresh Batch"],
      tagline: "A soft roll with raisin flavour and a buttery finish.",
      description: "Raisin rolls served as a pair.",
      pairing: "Pairs well with pineapple juice or orange juice.",
      metaBestWith: "Pineapple juice or orange juice",
    }),

    createProduct({
      id: "cinnamon-roll",
      name: "Cinnamon Roll",
      category: "Pastries",
      price: 125,
      unit: "two",
      image: "cin.jpg",
      images: ["cin.jpg"],
      options: ["Standard", "Fresh Batch"],
      tagline: "A soft pastry with cinnamon flavour and a comforting bite.",
      description: "Cinnamon rolls served as a pair.",
      pairing: "Pairs well with pineapple juice, orange juice, or sobolo.",
      metaBestWith: "Pineapple juice, orange juice, or sobolo",
    }),

    createProduct({
      id: "caramel-roll",
      name: "Caramel Roll",
      category: "Pastries",
      price: 130,
      unit: "two",
      image: "caramel.jpg",
      images: ["caramel.jpg"],
      options: ["Standard", "Fresh Batch"],
      tagline: "A soft roll with caramel flavour and a slightly richer finish.",
      description: "Caramel rolls served as a pair.",
      pairing: "Pairs well with pineapple juice, orange juice, or sobolo.",
      metaBestWith: "Pineapple juice, orange juice, or sobolo",
    }),

    createProduct({
      id: "signature-bagel",
      name: "Bagel",
      category: "Pastries",
      price: 100,
      unit: "two",
      image: "bagels.jpg",
      images: ["bagels.jpg"],
      options: ["Standard", "Fresh Batch"],
      tagline: "A simple baked option that works well for breakfast or a quick bite.",
      description: "Bagels served as a pair.",
      pairing: "Pairs well with pineapple juice or orange juice.",
      metaBestWith: "Pineapple juice or orange juice",
    }),

    createProduct({
      id: "pineapple-juice",
      name: "Pineapple Juice",
      category: "Juices",
      price: 40,
      unit: "each",
      image: "pine.webp",
      images: ["pine.webp"],
      options: ["Chilled", "Bottle"],
      tagline: "Fresh and easy to pair with pastries, brownies, and cake.",
      description: "Fresh pineapple juice served chilled.",
      pairing: "Pairs well with croissants, brownies, cake slices, donuts, and rolls.",
      metaBestWith: "Croissants, brownies, cake, and donuts",
    }),

    createProduct({
      id: "mint-pineapple-juice",
      name: "Mint & Pineapple Juice",
      category: "Juices",
      price: 40,
      unit: "each",
      image: "pm.jpg",
      images: ["pm.jpg"],
      options: ["Chilled", "Bottle"],
      tagline: "A refreshing juice blend with a cool finish.",
      description: "Mint and pineapple juice served chilled.",
      pairing: "Pairs well with croissants, cake slices, and rolls.",
      metaBestWith: "Croissants, cake slices, and rolls",
    }),

    createProduct({
      id: "watermelon-juice",
      name: "Watermelon Juice",
      category: "Juices",
      price: 40,
      unit: "each",
      image: "wm.webp",
      images: ["wm.webp"],
      options: ["Chilled", "Bottle"],
      tagline: "A light and refreshing drink that is easy to enjoy.",
      description: "Watermelon juice served chilled.",
      pairing: "Pairs well with croissants, cake slices, and donuts.",
      metaBestWith: "Croissants, cake slices, and donuts",
    }),

    createProduct({
      id: "sobolo",
      name: "Sobolo",
      category: "Juices",
      price: 40,
      unit: "each",
      image: "sobolo.webp",
      images: ["sobolo.webp"],
      options: ["Chilled", "Bottle"],
      tagline: "A chilled local drink that goes well with many items on the menu.",
      description: "Sobolo served chilled.",
      pairing: "Pairs well with brownies, croissants, mud cake slice, and donuts.",
      metaBestWith: "Brownies, croissants, cake, and donuts",
    }),

    createProduct({
      id: "orange-juice",
      name: "Orange Juice",
      category: "Juices",
      price: 40,
      unit: "each",
      image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=1200&q=80",
      images: ["https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=1400&q=80"],
      options: ["Chilled", "Bottle"],
      tagline: "A chilled drink that works well with pastries and desserts.",
      description: "Orange juice served chilled.",
      pairing: "Pairs well with croissants, brownies, cake slices, rolls, and donuts.",
      metaBestWith: "Croissants, brownies, cake, rolls, and donuts",
    }),
  ];

  const PRODUCTS = Object.fromEntries(productList.map((product) => [product.id, product]));

  const POPULAR_PRODUCT_IDS = [
    "chocolate-croissant",
    "walnut-brownie",
    "mud-cake-slice",
    "pineapple-juice",
    "oreo-donut",
    "sobolo",
  ];

  /* -------------------------------------------------------------------------- */
  /* Cart                                                                       */
  /* -------------------------------------------------------------------------- */

  let cart = safeLoad(CART_KEY, []);
  let currentProduct = null;
  let currentOption = "Standard";

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

  function renderCart() {
    const itemsHost = $("#cartItems");
    const emptyState = $("#cartEmptyState");

    updateCartIndicators();

    if (!itemsHost) return;

    if (!cart.length) {
      itemsHost.innerHTML = "";

      if (emptyState) {
        emptyState.hidden = false;
        emptyState.classList.remove("is-hidden");
      }

      return;
    }

    if (emptyState) {
      emptyState.hidden = true;
      emptyState.classList.add("is-hidden");
    }

    itemsHost.innerHTML = cart
      .map(
        (item) => `
          <article class="cart-item" data-cart-product-id="${escapeHtml(item.id)}" tabindex="0" role="button" aria-label="Open ${escapeHtml(item.name)} details">
            <div class="cart-item__image">
              <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" />
            </div>

            <div class="cart-item__content">
              <h3>${escapeHtml(item.name)}</h3>
              <div class="cart-item__meta">
                ${escapeHtml(item.category)}${item.variant ? ` • ${escapeHtml(item.variant)}` : ""}
              </div>
              <div class="cart-item__price">
                ${formatPrice(item.price)} <span>/ ${escapeHtml(item.unit)}</span>
              </div>

              <div class="cart-item__actions">
                <button class="cart-item__qty-btn" type="button" data-cart-action="decrease" data-key="${escapeHtml(item.key)}" aria-label="Decrease quantity">−</button>
                <span class="cart-item__qty">${item.qty}</span>
                <button class="cart-item__qty-btn" type="button" data-cart-action="increase" data-key="${escapeHtml(item.key)}" aria-label="Increase quantity">+</button>
                <button class="cart-item__remove" type="button" data-cart-action="remove" data-key="${escapeHtml(item.key)}" aria-label="Remove item">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>

            <div class="cart-item__total">${formatPrice(item.qty * item.price)}</div>
          </article>
        `
      )
      .join("");
  }

  function addToCart(product, qty = 1, variant = "") {
    if (!product) return;

    const safeQty = clamp(Number(qty) || 1, 1, 20);
    const key = variant ? `${product.id}::${variant}` : product.id;

    const existing = cart.find((item) => item.key === key);

    if (existing) {
      existing.qty += safeQty;
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
        qty: safeQty,
      });
    }

    saveCart();
    renderCart();
    renderCheckoutSummary();
    showToast(`${product.name} added to cart`, "success");
  }

  function updateCartItemQuantity(key, delta) {
    const item = cart.find((entry) => entry.key === key);
    if (!item) return;

    item.qty += delta;

    if (item.qty <= 0) {
      cart = cart.filter((entry) => entry.key !== key);
    }

    saveCart();
    renderCart();
    renderCheckoutSummary();
  }

  function removeCartItem(key) {
    cart = cart.filter((item) => item.key !== key);
    saveCart();
    renderCart();
    renderCheckoutSummary();
  }

  function clearCart(showMessage = false) {
    cart = [];
    saveCart();
    renderCart();
    renderCheckoutSummary();
    if (showMessage) showToast("Cart cleared");
  }

  function goToProductPage(productId) {
    if (!productId || !PRODUCTS[productId]) return;
    window.location.href = `product.html?product=${encodeURIComponent(productId)}`;
  }

  /* -------------------------------------------------------------------------- */
  /* Product Helpers                                                            */
  /* -------------------------------------------------------------------------- */

  function getProductById(id) {
    return PRODUCTS[id] || null;
  }

  function getProductFromCard(card) {
    if (!card) return null;

    const id = card.dataset.id;
    if (id && PRODUCTS[id]) return PRODUCTS[id];

    const { name, price, unit, image, category } = card.dataset;
    if (!id || !name) return null;

    return createProduct({
      id,
      name,
      category: category || "Menu Item",
      price: Number(price || 0),
      unit: unit || "each",
      image: image || "",
      images: image ? [image] : [],
      options: ["Standard"],
    });
  }

  function productServingText(product) {
    return normalise(product.unit) === "two" ? "Sold in pairs" : "Single serving";
  }

  function getRelatedProducts(product, count = 4) {
    const sameCategory = productList.filter(
      (item) => item.id !== product.id && normalise(item.category) === normalise(product.category)
    );

    const popular = POPULAR_PRODUCT_IDS
      .map((id) => PRODUCTS[id])
      .filter(Boolean)
      .filter((item) => item.id !== product.id && !sameCategory.some((same) => same.id === item.id));

    return [...sameCategory, ...popular].slice(0, count);
  }

  /* -------------------------------------------------------------------------- */
  /* UI Init                                                                    */
  /* -------------------------------------------------------------------------- */

  function initMobileMenu() {
    const menu = $("#mobileMenu");
    if (!menu) return;

    const openButtons = $$(".js-open-mobile-menu");
    const closeButtons = $$(".js-close-mobile-menu");

    function openMenu() {
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      document.body.classList.add("menu-open");
    }

    function closeMenu() {
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      document.body.classList.remove("menu-open");
    }

    openButtons.forEach((button) => button.addEventListener("click", openMenu));
    closeButtons.forEach((button) => button.addEventListener("click", closeMenu));

    menu.addEventListener("click", (event) => {
      if (event.target === menu) closeMenu();
    });

    $$(".mobile-menu a", menu).forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        closeMenu();
      }
    });
  }

  function initCartEvents() {
    $$(".js-open-cart").forEach((button) => {
      button.addEventListener("click", openCart);
    });

    $$(".js-close-cart").forEach((button) => {
      button.addEventListener("click", closeCart);
    });

    $$(".js-clear-cart").forEach((button) => {
      button.addEventListener("click", () => clearCart(true));
    });

    const drawer = $("#cartDrawer");
    if (drawer) {
      drawer.addEventListener("click", (event) => {
        const actionButton = event.target.closest("[data-cart-action]");
        if (actionButton) {
          event.stopPropagation();

          const { cartAction, key } = actionButton.dataset;
          if (cartAction === "increase") updateCartItemQuantity(key, 1);
          if (cartAction === "decrease") updateCartItemQuantity(key, -1);
          if (cartAction === "remove") removeCartItem(key);
          return;
        }

        const cartItem = event.target.closest(".cart-item");
        if (cartItem) {
          const clickedControl = event.target.closest("button");
          if (clickedControl) return;

          const productId = cartItem.dataset.cartProductId;
          if (productId) goToProductPage(productId);
        }
      });

      drawer.addEventListener("keydown", (event) => {
        const cartItem = event.target.closest(".cart-item");
        if (!cartItem) return;

        if (event.key === "Enter" || event.key === " ") {
          const productId = cartItem.dataset.cartProductId;
          if (productId) {
            event.preventDefault();
            goToProductPage(productId);
          }
        }
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeCart();
    });
  }

  function initCardAddToCart() {
    document.addEventListener("click", (event) => {
      const addButton = event.target.closest(".js-add-to-cart");
      if (!addButton) return;

      const card = addButton.closest(".product-card");
      const product = getProductFromCard(card);
      if (!product) return;

      addToCart(product, 1);
    });
  }

  /* -------------------------------------------------------------------------- */
  /* Menu Filtering                                                             */
  /* -------------------------------------------------------------------------- */

  function initMenuFiltering() {
    const menuGrid = $("#menuGrid");
    const searchInput = $("#productSearch");
    const filterButtons = $$(".filter-chip");

    if (!menuGrid || !searchInput || !filterButtons.length) return;

    let activeFilter = "all";

    function getCards() {
      return $$(".product-card", menuGrid);
    }

    function getOrCreateEmptyState() {
      let message = $("#menuEmptyState");

      if (!message) {
        message = document.createElement("div");
        message.id = "menuEmptyState";
        message.className = "empty-state-message is-hidden";
        message.innerHTML =
          "<strong style='display:block;margin-bottom:0.4rem;'>No items matched your search.</strong>Try another keyword or choose a different filter.";
        menuGrid.insertAdjacentElement("afterend", message);
      }

      return message;
    }

    function applyFilters() {
      const searchTerm = normalise(searchInput.value);
      const cards = getCards();

      let visibleCount = 0;

      cards.forEach((card) => {
        const name = normalise(card.dataset.name || "");
        const category = normalise(card.dataset.category || "");
        const id = normalise(card.dataset.id || "");

        const matchesFilter = activeFilter === "all" || category === normalise(activeFilter);
        const matchesSearch =
          !searchTerm || name.includes(searchTerm) || category.includes(searchTerm) || id.includes(searchTerm);

        const shouldShow = matchesFilter && matchesSearch;
        card.classList.toggle("is-hidden", !shouldShow);
        if (shouldShow) visibleCount += 1;
      });

      const emptyState = getOrCreateEmptyState();
      emptyState.classList.toggle("is-hidden", visibleCount > 0);
    }

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.filter || "all";
        filterButtons.forEach((btn) => btn.classList.remove("is-active"));
        button.classList.add("is-active");
        applyFilters();
      });
    });

    searchInput.addEventListener("input", applyFilters);
    applyFilters();
  }

  /* -------------------------------------------------------------------------- */
  /* Product Page                                                               */
  /* -------------------------------------------------------------------------- */

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  }

  function setHTML(id, value) {
    const node = document.getElementById(id);
    if (node) node.innerHTML = value;
  }

  function renderProductOptions(product) {
    const host = $("#productOptions");
    if (!host) return;

    const options = product.options && product.options.length ? product.options : ["Standard"];
    currentOption = options[0];

    host.innerHTML = options
      .map(
        (option, index) => `
          <button class="option-chip ${index === 0 ? "is-active" : ""}" type="button" data-option="${escapeHtml(option)}">
            ${escapeHtml(option)}
          </button>
        `
      )
      .join("");
  }

  function renderProductGallery(product) {
    const mainImage = $("#productMainImage");
    const thumbsHost = $(".product-gallery__thumbs");

    if (!mainImage || !thumbsHost || !product.images?.length) return;

    mainImage.src = product.images[0];
    mainImage.alt = product.name;

    thumbsHost.innerHTML = product.images
      .map(
        (image, index) => `
          <button class="product-thumb ${index === 0 ? "is-active" : ""}" type="button" data-image="${escapeHtml(image)}" aria-label="View ${escapeHtml(product.name)} image ${index + 1}">
            <img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)} thumbnail ${index + 1}" />
          </button>
        `
      )
      .join("");
  }

  function renderProductMeta(product) {
    currentProduct = product;
    document.title = `${product.name} | Meals by Bella`;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", `${product.name} from Meals by Bella. ${product.description}`);
    }

    setText("breadcrumbProductName", product.name);
    setText("productCategory", product.category);
    setText("productName", product.name);
    setText("productPrice", formatPrice(product.price));
    setText("productUnit", `/ ${product.unit}`);
    setText("productTagline", product.tagline);
    setText("productAvailability", product.availability);
    setText("productDescription", product.description);

    if (product.highlights) {
      setText("highlightLove", product.highlights.love || "");
      setText("highlightTime", product.highlights.time || "");
      setText("highlightServing", product.highlights.serving || "");
    }

    setText("productOverviewText", product.overview || "");
    setText("productOverviewExtra", product.overviewExtra || "");
    setHTML("productNotesList", (product.notes || []).map((note) => `<li>${escapeHtml(note)}</li>`).join(""));
    setText("productPairingText", product.pairing || "");

    setText("productMetaCategory", product.category);
    setText("productMetaServing", productServingText(product));
    setText("productMetaBestWith", product.metaBestWith || "");

    setText("sidebarPrice", formatPrice(product.price));
    setText("sidebarUnit", product.unit);
    setText("sidebarCategory", product.category);

    const sidebarPoints = $("#productSidebarPoints");
    if (sidebarPoints) {
      sidebarPoints.innerHTML = (product.sidebarPoints || [])
        .map(
          (point) => `
            <article>
              <strong>${escapeHtml(point.title)}</strong>
              <span>${escapeHtml(point.text)}</span>
            </article>
          `
        )
        .join("");
    }

    setText("mobileStickyName", product.name);
    setText("mobileStickyPrice", formatPrice(product.price));

    const quantityInput = $("#productQuantity");
    if (quantityInput) quantityInput.value = "1";
  }

  function renderRelatedProducts(product) {
    const host = $(".products-grid--related");
    if (!host) return;

    const related = getRelatedProducts(product, 4);

    host.innerHTML = related
      .map(
        (item) => `
          <article class="product-card" data-id="${escapeHtml(item.id)}" data-name="${escapeHtml(item.name)}" data-price="${item.price}" data-unit="${escapeHtml(item.unit)}" data-image="${escapeHtml(item.image)}" data-category="${escapeHtml(item.category)}">
            <a href="product.html?product=${encodeURIComponent(item.id)}" class="product-card__media">
              <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" />
            </a>
            <div class="product-card__content">
              <div class="product-card__top">
                <span class="pill">${escapeHtml(item.category)}</span>
                <button class="product-card__icon js-add-to-cart" type="button" aria-label="Add ${escapeHtml(item.name)} to cart">
                  <i class="fa-solid fa-plus"></i>
                </button>
              </div>
              <a href="product.html?product=${encodeURIComponent(item.id)}" class="product-card__title-wrap">
                <h3>${escapeHtml(item.name)}</h3>
                <p>${escapeHtml(item.description)}</p>
              </a>
              <div class="product-card__bottom">
                <strong>${formatPrice(item.price)} <span>/ ${escapeHtml(item.unit)}</span></strong>
                <a href="product.html?product=${encodeURIComponent(item.id)}" class="text-link">Details</a>
              </div>
            </div>
          </article>
        `
      )
      .join("");
  }

  function initProductGalleryClicks() {
    document.addEventListener("click", (event) => {
      const thumb = event.target.closest(".product-thumb");
      if (!thumb) return;

      const image = thumb.dataset.image;
      const mainImage = $("#productMainImage");
      if (!mainImage || !image) return;

      mainImage.src = image;
      mainImage.alt = currentProduct ? currentProduct.name : "Product image";

      $$(".product-thumb").forEach((node) => node.classList.remove("is-active"));
      thumb.classList.add("is-active");
    });
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

  function initProductQuantityControls() {
    const input = $("#productQuantity");
    if (!input) return;

    const decrease = $(".js-qty-decrease");
    const increase = $(".js-qty-increase");

    function syncValue(nextValue) {
      input.value = String(clamp(Number(nextValue) || 1, 1, 20));
    }

    decrease?.addEventListener("click", () => syncValue((Number(input.value) || 1) - 1));
    increase?.addEventListener("click", () => syncValue((Number(input.value) || 1) + 1));
    input.addEventListener("input", () => syncValue(input.value));
    input.addEventListener("blur", () => syncValue(input.value));
  }

  function initProductOptionClicks() {
    document.addEventListener("click", (event) => {
      const option = event.target.closest(".option-chip");
      const host = $("#productOptions");
      if (!option || !host) return;

      currentOption = option.dataset.option || "Standard";
      $$(".option-chip", host).forEach((node) => node.classList.remove("is-active"));
      option.classList.add("is-active");
    });
  }

  function initProductAddToCart() {
    const mainButton = $("#addCurrentProductToCart");
    const stickyButton = $("#mobileStickyAddToCart");

    function handleAdd() {
      if (!currentProduct) return;
      const quantityInput = $("#productQuantity");
      const qty = clamp(Number(quantityInput?.value || 1), 1, 20);
      addToCart(currentProduct, qty, currentOption);
    }

    mainButton?.addEventListener("click", handleAdd);
    stickyButton?.addEventListener("click", handleAdd);
  }

  function initMobileStickyCartVisibility() {
    const stickyBar = $("#mobileStickyCart");
    const relatedSection = $("#relatedProductsSection");

    if (!stickyBar || !relatedSection || !("IntersectionObserver" in window)) return;

    const mediaQuery = window.matchMedia("(max-width: 820px)");
    let observer = null;

    function applyVisibility(isRelatedVisible) {
      if (!mediaQuery.matches) {
        stickyBar.classList.remove("is-visible");
        return;
      }
      stickyBar.classList.toggle("is-visible", !isRelatedVisible);
    }

    function setupObserver() {
      if (observer) observer.disconnect();

      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          applyVisibility(Boolean(entry?.isIntersecting));
        },
        { threshold: 0.08 }
      );

      observer.observe(relatedSection);
      applyVisibility(false);
    }

    setupObserver();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", setupObserver);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(setupObserver);
    }
  }

  function initProductPage() {
    if (document.body.dataset.page !== "product") return;

    const params = new URLSearchParams(window.location.search);
    const productId = params.get("product") || "chocolate-croissant";
    const product = getProductById(productId) || getProductById("chocolate-croissant");

    if (!product) return;

    renderProductMeta(product);
    renderProductGallery(product);
    renderProductOptions(product);
    renderRelatedProducts(product);

    initProductTabs();
    initProductQuantityControls();
    initProductOptionClicks();
    initProductAddToCart();
    initMobileStickyCartVisibility();
  }

  /* -------------------------------------------------------------------------- */
  /* Gallery                                                                    */
  /* -------------------------------------------------------------------------- */

  function initGalleryLightbox() {
    if (document.body.dataset.page !== "gallery") return;

    const lightbox = $("#galleryLightbox");
    const lightboxContent = $("#galleryLightboxContent");
    const closeBtn = $("#galleryLightboxClose");
    const backdrop = $("#galleryLightboxBackdrop");

    if (!lightbox || !lightboxContent || !closeBtn || !backdrop) return;

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      lightboxContent.innerHTML = "";
      document.body.classList.remove("lightbox-open");
    }

    function openLightbox(type, src, label) {
      lightboxContent.innerHTML = "";

      if (type === "video") {
        const video = document.createElement("video");
        video.src = src;
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        video.setAttribute("aria-label", label);
        lightboxContent.appendChild(video);
      } else {
        const img = document.createElement("img");
        img.src = src;
        img.alt = label;
        lightboxContent.appendChild(img);
      }

      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
    }

    $$(".gallery-item").forEach((item) => {
      item.addEventListener("click", () => {
        const type = item.dataset.type;
        const src = item.dataset.src;
        const label = item.getAttribute("aria-label") || "Gallery item";
        if (!src) return;
        openLightbox(type, src, label);
      });
    });

    closeBtn.addEventListener("click", closeLightbox);
    backdrop.addEventListener("click", closeLightbox);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
        closeLightbox();
      }
    });
  }

  /* -------------------------------------------------------------------------- */
  /* Checkout                                                                   */
  /* -------------------------------------------------------------------------- */

  function calculateProcessingFee(subtotal) {
    return Number((subtotal * 0.0295).toFixed(2));
  }

  function calculateCheckoutTotal(subtotal) {
    return Number((subtotal + calculateProcessingFee(subtotal)).toFixed(2));
  }

  function formatCartItemsForSubmission(items) {
    return items
      .map(
        (item) =>
          `${item.name}${item.variant ? ` (${item.variant})` : ""} - ${item.qty} x ${formatPrice(item.price)} = ${formatPrice(item.qty * item.price)}`
      )
      .join("\n");
  }

  function getCheckoutElements() {
    return {
      form: $("#checkoutForm"),
      itemsHost: $("#checkoutItems"),
      emptyState: $("#checkoutEmptyState"),
      subtotalNode: $("#checkoutSubtotal"),
      feeNode: $("#checkoutProcessingFee"),
      totalNode: $("#checkoutGrandTotal"),
      termsDrawer: $("#termsDrawer"),
      openTermsBtn: $("#openTermsDrawer"),
      closeTermsBtn: $("#closeTermsDrawer"),
      termsOverlay: $("#termsDrawerOverlay"),
      invoiceModal: $("#invoiceModal"),
      invoiceOverlay: $("#invoiceModalOverlay"),
      closeInvoiceModalBtn: $("#closeInvoiceModal"),
      invoicePreview: $("#invoicePreview"),
      viewInvoiceButton: $("#viewInvoiceButton"),
      downloadInvoiceButton: $("#downloadInvoiceButton"),
      confirmationSection: $("#checkoutConfirmationSection"),
      confirmationReference: $("#confirmationReference"),
      confirmationTotalPaid: $("#confirmationTotalPaid"),
      confirmationViewInvoiceButton: $("#confirmationViewInvoiceButton"),
      confirmationDownloadInvoiceButton: $("#confirmationDownloadInvoiceButton"),
      confirmationMessage: $("#checkoutConfirmationMessage"),
      payNowButton: $("#payNowButton"),
    };
  }

  function renderCheckoutSummary() {
    const { itemsHost, emptyState, subtotalNode, feeNode, totalNode, payNowButton } = getCheckoutElements();

    if (!itemsHost || !subtotalNode || !feeNode || !totalNode) return;

    const subtotal = getCartSubtotal();
    const processingFee = calculateProcessingFee(subtotal);
    const grandTotal = calculateCheckoutTotal(subtotal);

    subtotalNode.textContent = formatPrice(subtotal);
    feeNode.textContent = formatPrice(processingFee);
    totalNode.textContent = formatPrice(grandTotal);

    const cartItemsJsonField = $("#formCartItemsJson");
    const cartItemsTextField = $("#formCartItemsText");
    const subtotalField = $("#formSubtotal");
    const feeField = $("#formProcessingFee");
    const totalField = $("#formTotalAmount");

    if (cartItemsJsonField) cartItemsJsonField.value = JSON.stringify(cart);
    if (cartItemsTextField) cartItemsTextField.value = formatCartItemsForSubmission(cart);
    if (subtotalField) subtotalField.value = subtotal.toFixed(2);
    if (feeField) feeField.value = processingFee.toFixed(2);
    if (totalField) totalField.value = grandTotal.toFixed(2);

    if (!cart.length) {
      itemsHost.innerHTML = "";

      if (emptyState) {
        emptyState.hidden = false;
        emptyState.classList.remove("is-hidden");
      }

      if (payNowButton) payNowButton.disabled = true;
      return;
    }

    if (emptyState) {
      emptyState.hidden = true;
      emptyState.classList.add("is-hidden");
    }

    if (payNowButton) payNowButton.disabled = false;

    itemsHost.innerHTML = cart
      .map(
        (item) => `
          <article class="checkout-item">
            <div class="checkout-item__image">
              <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" />
            </div>

            <div class="checkout-item__content">
              <h3>${escapeHtml(item.name)}</h3>
              <p>${escapeHtml(item.category)}${item.variant ? ` • ${escapeHtml(item.variant)}` : ""}</p>
              <span>${item.qty} × ${formatPrice(item.price)}</span>
            </div>

            <strong class="checkout-item__total">${formatPrice(item.qty * item.price)}</strong>
          </article>
        `
      )
      .join("");
  }

  function openTermsDrawer() {
    const { termsDrawer } = getCheckoutElements();
    if (!termsDrawer) return;

    termsDrawer.classList.add("is-open");
    termsDrawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
  }

  function closeTermsDrawer() {
    const { termsDrawer } = getCheckoutElements();
    if (!termsDrawer) return;

    termsDrawer.classList.remove("is-open");
    termsDrawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
  }

  function openInvoiceModal() {
    const { invoiceModal } = getCheckoutElements();
    if (!invoiceModal) return;

    invoiceModal.classList.add("is-open");
    invoiceModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
  }

  function closeInvoiceModal() {
    const { invoiceModal } = getCheckoutElements();
    if (!invoiceModal) return;

    invoiceModal.classList.remove("is-open");
    invoiceModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
  }

  function buildInvoiceData() {
    const subtotal = getCartSubtotal();
    const processingFee = calculateProcessingFee(subtotal);
    const total = calculateCheckoutTotal(subtotal);

    return {
      reference: $("#formPaymentReference")?.value || "Pending",
      paymentStatus: $("#formPaymentStatus")?.value || "paid",
      fullName: $("#customerFullName")?.value?.trim() || "",
      phone: $("#customerPhone")?.value?.trim() || "",
      email: $("#customerEmail")?.value?.trim() || "",
      location: $("#customerLocation")?.value?.trim() || "",
      orderType: $("#orderType")?.value || "",
      instructions: $("#customerInstructions")?.value?.trim() || "",
      subtotal,
      processingFee,
      total,
      items: [...cart],
      date: new Date().toLocaleString(),
    };
  }

  function renderInvoicePreview(invoiceData) {
    const { invoicePreview } = getCheckoutElements();
    if (!invoicePreview) return;

    invoicePreview.innerHTML = `
      <div class="invoice-sheet">
        <div class="invoice-sheet__top">
          <div>
            <p class="section-tag">Invoice</p>
            <h2>Meals by Bella</h2>
            <p>Fresh bakes & treats</p>
          </div>
          <div class="invoice-sheet__meta">
            <p><strong>Reference:</strong> ${escapeHtml(invoiceData.reference)}</p>
            <p><strong>Date:</strong> ${escapeHtml(invoiceData.date)}</p>
            <p><strong>Status:</strong> ${escapeHtml(invoiceData.paymentStatus)}</p>
          </div>
        </div>

        <div class="invoice-sheet__block">
          <h3>Customer Details</h3>
          <p><strong>Name:</strong> ${escapeHtml(invoiceData.fullName)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(invoiceData.phone)}</p>
          <p><strong>Email:</strong> ${escapeHtml(invoiceData.email)}</p>
          <p><strong>Location:</strong> ${escapeHtml(invoiceData.location)}</p>
          <p><strong>Order Type:</strong> ${escapeHtml(invoiceData.orderType)}</p>
          ${invoiceData.instructions ? `<p><strong>Instructions:</strong> ${escapeHtml(invoiceData.instructions)}</p>` : ""}
        </div>

        <div class="invoice-sheet__block">
          <h3>Items Ordered</h3>
          <div class="invoice-sheet__items">
            ${invoiceData.items
              .map(
                (item) => `
                  <div class="invoice-sheet__item">
                    <span>${escapeHtml(item.name)}${item.variant ? ` (${escapeHtml(item.variant)})` : ""} × ${item.qty}</span>
                    <strong>${formatPrice(item.qty * item.price)}</strong>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>

        <div class="invoice-sheet__block invoice-sheet__totals">
          <div class="invoice-sheet__item">
            <span>Subtotal</span>
            <strong>${formatPrice(invoiceData.subtotal)}</strong>
          </div>
          <div class="invoice-sheet__item">
            <span>Processing fee (2.95%)</span>
            <strong>${formatPrice(invoiceData.processingFee)}</strong>
          </div>
          <div class="invoice-sheet__item invoice-sheet__item--total">
            <span>Total</span>
            <strong>${formatPrice(invoiceData.total)}</strong>
          </div>
          <p class="invoice-sheet__note">
            Processing fee includes 1.95% Paystack charge and 1% Mobile Money charge.
          </p>
        </div>
      </div>
    `;
  }

  function generateInvoicePdf(invoiceData) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      showToast("PDF library not found. Add the jsPDF script to checkout.html.", "danger");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
    });

    const left = 18;
    let y = 20;

    doc.setFillColor(246, 232, 214);
    doc.rect(0, 0, 210, 297, "F");

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(12, 12, 186, 273, 6, 6, "F");

    doc.setFont("helvetica", "bold");
    doc.setTextColor(63, 43, 32);
    doc.setFontSize(22);
    doc.text("Meals by Bella", left, y);

    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(109, 84, 68);
    doc.text("Invoice", left, y);

    y += 10;
    doc.setDrawColor(220, 200, 180);
    doc.line(left, y, 190, y);

    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(63, 43, 32);
    doc.text(`Reference: ${invoiceData.reference}`, left, y);
    doc.text(`Date: ${invoiceData.date}`, 120, y);

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Customer Details", left, y);

    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const customerLines = [
      `Name: ${invoiceData.fullName}`,
      `Phone: ${invoiceData.phone}`,
      `Email: ${invoiceData.email}`,
      `Location: ${invoiceData.location}`,
      `Order Type: ${invoiceData.orderType}`,
      invoiceData.instructions ? `Instructions: ${invoiceData.instructions}` : "",
    ].filter(Boolean);

    customerLines.forEach((line) => {
      const wrapped = doc.splitTextToSize(line, 170);
      doc.text(wrapped, left, y);
      y += wrapped.length * 5;
    });

    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Items Ordered", left, y);

    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    invoiceData.items.forEach((item) => {
      const line = `${item.name}${item.variant ? ` (${item.variant})` : ""} x ${item.qty}`;
      const amount = formatPrice(item.qty * item.price);
      const wrapped = doc.splitTextToSize(line, 120);
      doc.text(wrapped, left, y);
      doc.text(amount, 170, y);
      y += wrapped.length * 5 + 2;
    });

    y += 4;
    doc.line(left, y, 190, y);

    y += 8;
    doc.setFont("helvetica", "normal");
    doc.text(`Subtotal: ${formatPrice(invoiceData.subtotal)}`, left, y);

    y += 6;
    doc.text(`Processing fee (2.95%): ${formatPrice(invoiceData.processingFee)}`, left, y);

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Total: ${formatPrice(invoiceData.total)}`, left, y);

    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(109, 84, 68);
    doc.text(
      doc.splitTextToSize(
        "Processing fee includes 1.95% Paystack charge and 1% Mobile Money charge.",
        170
      ),
      left,
      y
    );

    doc.save(`Meals-by-Bella-Invoice-${invoiceData.reference}.pdf`);
  }

  async function submitCheckoutToFormspree(invoiceData) {
    const form = $("#checkoutForm");
    const endpoint = form?.dataset.formspreeEndpoint?.trim();

    if (!endpoint || endpoint === "YOUR_FORMSPREE_ENDPOINT_HERE") {
      throw new Error("Formspree endpoint is not set yet.");
    }

    const payload = {
      full_name: invoiceData.fullName,
      phone: invoiceData.phone,
      email: invoiceData.email,
      location: invoiceData.location,
      order_type: invoiceData.orderType,
      instructions: invoiceData.instructions,
      subtotal: invoiceData.subtotal.toFixed(2),
      processing_fee: invoiceData.processingFee.toFixed(2),
      total_amount: invoiceData.total.toFixed(2),
      payment_reference: invoiceData.reference,
      payment_status: invoiceData.paymentStatus,
      cart_items_json: JSON.stringify(invoiceData.items),
      cart_items_text: formatCartItemsForSubmission(invoiceData.items),
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Formspree submission failed.");
    }
  }

  function enableInvoiceButtons(invoiceData) {
    const {
      viewInvoiceButton,
      downloadInvoiceButton,
      confirmationViewInvoiceButton,
      confirmationDownloadInvoiceButton,
    } = getCheckoutElements();

    const openPreview = () => {
      renderInvoicePreview(invoiceData);
      openInvoiceModal();
    };

    const downloadPdf = () => {
      generateInvoicePdf(invoiceData);
    };

    if (viewInvoiceButton) {
      viewInvoiceButton.disabled = false;
      viewInvoiceButton.onclick = openPreview;
    }

    if (downloadInvoiceButton) {
      downloadInvoiceButton.disabled = false;
      downloadInvoiceButton.onclick = downloadPdf;
    }

    if (confirmationViewInvoiceButton) {
      confirmationViewInvoiceButton.onclick = openPreview;
    }

    if (confirmationDownloadInvoiceButton) {
      confirmationDownloadInvoiceButton.onclick = downloadPdf;
    }
  }

  function showCheckoutConfirmation(invoiceData) {
    const {
      form,
      confirmationSection,
      confirmationReference,
      confirmationTotalPaid,
      confirmationMessage,
      payNowButton,
    } = getCheckoutElements();

    if (payNowButton) {
      payNowButton.disabled = false;
      payNowButton.innerHTML = `<i class="fa-solid fa-lock"></i><span>Pay Now</span>`;
    }

    if (form) {
      const main = form.closest(".checkout-main");
      if (main) main.classList.add("is-hidden");
    }

    const sidebar = $(".checkout-sidebar");
    if (sidebar) sidebar.classList.add("is-hidden");

    if (confirmationSection) {
      confirmationSection.classList.remove("is-hidden");
      confirmationSection.hidden = false;
    }

    if (confirmationReference) {
      confirmationReference.textContent = invoiceData.reference;
    }

    if (confirmationTotalPaid) {
      confirmationTotalPaid.textContent = formatPrice(invoiceData.total);
    }

    if (confirmationMessage) {
      confirmationMessage.textContent =
        "Your payment was successful, your invoice has been generated, and your order has been recorded.";
    }

    renderInvoicePreview(invoiceData);
    enableInvoiceButtons(invoiceData);

    setTimeout(() => {
      generateInvoicePdf(invoiceData);
    }, 300);

    scrollToTopSmooth();

    setTimeout(() => {
      clearCart(false);
      location.replace("index.html");
    }, 9000);
  }

  function validateCheckoutForm() {
    const fullName = $("#customerFullName");
    const phone = $("#customerPhone");
    const email = $("#customerEmail");
    const location = $("#customerLocation");
    const orderType = $("#orderType");
    const agreeTerms = $("#agreeTerms");

    const requiredFields = [fullName, phone, email, location, orderType, agreeTerms].filter(Boolean);

    for (const field of requiredFields) {
      if (field.type === "checkbox") {
        if (!field.checked) {
          showToast("Please agree to the Terms & Conditions.", "danger");
          field.focus();
          return false;
        }
      } else if (!field.value.trim()) {
        showToast("Please complete all required fields.", "danger");
        field.focus();
        return false;
      }
    }

    const emailValue = email?.value.trim() || "";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(emailValue)) {
      showToast("Please enter a valid email address.", "danger");
      email.focus();
      return false;
    }

    if (!cart.length) {
      showToast("Your cart is empty.", "danger");
      return false;
    }

    if (!PAYSTACK_PUBLIC_KEY) {
      showToast("Add your Paystack public key in script.js first.", "danger");
      return false;
    }

    return true;
  }

  function payWithPaystackCheckout() {
    const { payNowButton } = getCheckoutElements();

    const subtotal = getCartSubtotal();
    const total = calculateCheckoutTotal(subtotal);

    const email = $("#customerEmail")?.value.trim();
    const fullName = $("#customerFullName")?.value.trim();
    const phone = $("#customerPhone")?.value.trim();
    const location = $("#customerLocation")?.value.trim();
    const orderType = $("#orderType")?.value;

    try {
      if (!window.PaystackPop || typeof window.PaystackPop.setup !== "function") {
        throw new Error("PaystackPop is not available.");
      }

      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email,
        amount: Math.round(total * 100),
        currency: "GHS",
        ref: `MBB-${Date.now()}`,
        metadata: {
          custom_fields: [
            {
              display_name: "Full Name",
              variable_name: "full_name",
              value: fullName || "",
            },
            {
              display_name: "Phone",
              variable_name: "phone",
              value: phone || "",
            },
            {
              display_name: "Location",
              variable_name: "location",
              value: location || "",
            },
            {
              display_name: "Order Type",
              variable_name: "order_type",
              value: orderType || "",
            },
          ],
        },
        callback: function (response) {
          const paymentRefInput = $("#formPaymentReference");
          const paymentStatusInput = $("#formPaymentStatus");

          if (paymentRefInput) paymentRefInput.value = response.reference;
          if (paymentStatusInput) paymentStatusInput.value = "paid";

          const invoiceData = buildInvoiceData();
          invoiceData.reference = response.reference;
          invoiceData.paymentStatus = "paid";

          submitCheckoutToFormspree(invoiceData)
            .catch((error) => {
              console.error("Formspree save error:", error);
            })
            .finally(() => {
              showCheckoutConfirmation(invoiceData);
            });
        },
        onClose: function () {
          if (payNowButton) {
            payNowButton.disabled = false;
            payNowButton.innerHTML = `<i class="fa-solid fa-lock"></i><span>Pay Now</span>`;
          }
          showToast("Payment window closed.");
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error("Paystack setup error:", error);
      showToast(`Paystack could not open: ${error.message}`, "danger");

      if (payNowButton) {
        payNowButton.disabled = false;
        payNowButton.innerHTML = `<i class="fa-solid fa-lock"></i><span>Pay Now</span>`;
      }
    }
  }

  function initCheckoutPage() {
    if (document.body.dataset.page !== "checkout") return;

    const {
      form,
      openTermsBtn,
      closeTermsBtn,
      termsOverlay,
      invoiceOverlay,
      closeInvoiceModalBtn,
      payNowButton,
    } = getCheckoutElements();

    renderCheckoutSummary();

    openTermsBtn?.addEventListener("click", openTermsDrawer);
    closeTermsBtn?.addEventListener("click", closeTermsDrawer);
    termsOverlay?.addEventListener("click", closeTermsDrawer);

    invoiceOverlay?.addEventListener("click", closeInvoiceModal);
    closeInvoiceModalBtn?.addEventListener("click", closeInvoiceModal);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeTermsDrawer();
        closeInvoiceModal();
      }
    });

    if (!form) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!validateCheckoutForm()) return;

      if (payNowButton) {
        payNowButton.disabled = true;
        payNowButton.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i><span>Processing...</span>`;
      }

      payWithPaystackCheckout();
    });
  }

  function initCheckoutNavigation() {
    $$(".js-go-to-checkout").forEach((button) => {
      button.addEventListener("click", () => {
        if (!cart.length) {
          showToast("Your cart is empty.", "danger");
          return;
        }

        window.location.href = "checkout.html";
      });
    });
  }

  /* -------------------------------------------------------------------------- */
  /* Init                                                                       */
  /* -------------------------------------------------------------------------- */

  function init() {
    renderCart();
    initMobileMenu();
    initCartEvents();
    initCheckoutNavigation();
    initCardAddToCart();
    initMenuFiltering();
    initProductGalleryClicks();
    initProductPage();
    initGalleryLightbox();
    initCheckoutPage();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
