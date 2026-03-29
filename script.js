(() => {
  "use strict";

  const CART_KEY = "meals-by-bella-cart-v2";

  /* -------------------------------------------------------------------------- */
  /* Helpers                                                                    */
  /* -------------------------------------------------------------------------- */

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const normalise = (value = "") => value.toString().trim().toLowerCase();
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
      /* ignore localStorage errors */
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
      zIndex: "300",
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
      tagline: config.tagline,
      availability: config.availability || "Available to order",
      description: config.description,
      highlights: config.highlights,
      overview: config.overview,
      overviewExtra: config.overviewExtra,
      notes: config.notes,
      pairing: config.pairing,
      metaBestWith: config.metaBestWith,
      sidebarPoints: config.sidebarPoints,
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
        "https://images.unsplash.com/photo-1555507036-ab794f57598e?auto=format&fit=crop&w=1400&q=80",
      ],
      options: ["Standard", "Fresh Batch"],
      tagline: "A sweet pick for sharing, gifting, or enjoying with a cold drink.",
      description:
        "Chocolate donuts topped with Oreo crumbs, served as a pair. They are soft, sweet, and easy to enjoy when you want something simple and satisfying.",
      highlights: {
        love: "Customers like the soft texture and the extra crunch from the Oreo topping.",
        time: "Works well as a snack, dessert, or something to share with a friend.",
        serving: "Served as two donuts, so it is easy to split or enjoy both yourself.",
      },
      overview:
        "Oreo Donuts are a good choice when you want something sweet, familiar, and easy to enjoy. They are simple, filling, and work well for casual cravings.",
      overviewExtra:
        "They are especially nice when paired with a cold drink if you want something refreshing beside them.",
      notes: [
        "Soft donut texture with a chocolate topping.",
        "Crushed Oreo adds a little crunch on top.",
        "Sweet without being too complicated.",
        "Best enjoyed fresh for the softest bite.",
      ],
      pairing:
        "Try this with pineapple juice, orange juice, or sobolo if you want something chilled beside it.",
      metaBestWith: "Pineapple juice, orange juice, or sobolo",
      sidebarPoints: [
        { title: "Best enjoyed fresh", text: "The texture is softest and nicest when freshly served." },
        { title: "Easy to share", text: "Comes as a pair, so it works well for sharing." },
        { title: "Sweet snack", text: "A simple choice when you want something sweet and filling." },
      ],
    }),

    createProduct({
      id: "plain-croissant",
      name: "Plain Croissant",
      category: "Croissants",
      price: 110,
      unit: "two",
      image: "crois.webp",
      images: [
        "crois.webp",
        "https://images.unsplash.com/photo-1555507036-ab794f57598e?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=1400&q=80",
      ],
      options: ["Standard", "Fresh Batch"],
      tagline: "A light, buttery option that is easy to enjoy at any time of day.",
      description:
        "Plain croissants served as a pair. They are flaky, soft inside, and have a light buttery taste that works well for breakfast or a quick snack.",
      highlights: {
        love: "People enjoy how light and flaky they are without being too sweet.",
        time: "Great for breakfast, a quick snack, or something to eat with juice.",
        serving: "Served as a pair, which makes them easy to share.",
      },
      overview:
        "Plain Croissant is a good everyday choice for someone who wants something light, simple, and freshly baked. It is easy to enjoy on its own or with a drink.",
      overviewExtra:
        "Because it is not too sweet, it also works well if you want a pastry that feels lighter than cake or brownies.",
      notes: [
        "Light buttery flavour.",
        "Flaky outside with a softer inside.",
        "Not too sweet, so it feels easy to eat.",
        "Best when fresh and slightly warm.",
      ],
      pairing:
        "This goes well with pineapple juice, orange juice, or even on its own if you want something light.",
      metaBestWith: "Pineapple juice or orange juice",
      sidebarPoints: [
        { title: "Simple and light", text: "A good option when you want something easy and not too heavy." },
        { title: "Fresh texture", text: "Best when enjoyed while still fresh." },
        { title: "Breakfast-friendly", text: "Works especially well earlier in the day." },
      ],
    }),

    createProduct({
      id: "cheese-croissant",
      name: "Cheese Croissant",
      category: "Croissants",
      price: 120,
      unit: "two",
      image: "crois.webp",
      images: [
        "crois.webp",
        "https://images.unsplash.com/photo-1555507036-ab794f57598e?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=1400&q=80",
      ],
      options: ["Standard", "Fresh Batch"],
      tagline: "A warm pastry option with a cheesy centre and a soft bite.",
      description:
        "Cheese croissants served as a pair. They are buttery, flaky, and have a cheesy filling that makes them more savoury and filling.",
      highlights: {
        love: "Customers like the mix of flaky pastry and cheesy flavour.",
        time: "A nice option for breakfast, brunch, or an afternoon snack.",
        serving: "Comes as a pair, so it is easy to order for one person or two.",
      },
      overview:
        "Cheese Croissant is a good option for someone who wants a pastry that feels a little more filling. It has the same flaky texture as a croissant, with a savoury centre.",
      overviewExtra:
        "It is a nice middle ground if you want something baked but not too sweet.",
      notes: [
        "Flaky pastry with a savoury cheese filling.",
        "Soft inside and lightly crisp outside.",
        "More filling than a plain pastry.",
        "Best enjoyed fresh for the best texture.",
      ],
      pairing:
        "This pairs well with pineapple juice, orange juice, or a simple chilled drink.",
      metaBestWith: "Pineapple juice or orange juice",
      sidebarPoints: [
        { title: "Savoury choice", text: "A good option if you do not want something too sweet." },
        { title: "Freshly baked", text: "Best enjoyed while still fresh." },
        { title: "Easy to share", text: "Served in a simple pair." },
      ],
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
        "https://images.unsplash.com/photo-1555507036-ab794f57598e?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=1400&q=80",
        "crois.webp",
      ],
      options: ["Standard", "Fresh Batch"],
      tagline: "A warm favourite for breakfast, snacks, or sharing.",
      description:
        "Flaky croissants with a chocolate filling and a soft, buttery bite. A good pick when you want something warm, satisfying, and easy to enjoy with a drink.",
      highlights: {
        love: "It is soft, flaky, and filling without feeling too heavy.",
        time: "Great for breakfast, a quick snack, or something to go with a chilled drink.",
        serving: "Served as a pair, which makes it easy to share or keep both for yourself.",
      },
      overview:
        "Chocolate Croissant is a simple favourite for anyone who enjoys soft pastry with a rich filling. It works well as a breakfast option, an afternoon snack, or a quick treat when you want something warm and satisfying.",
      overviewExtra:
        "It is easy to enjoy on its own, but it also goes well with a drink if you want something more filling.",
      notes: [
        "Soft, flaky layers with a buttery texture.",
        "A chocolate filling that adds sweetness without being too much.",
        "Best enjoyed fresh when the pastry is still soft and light.",
        "A good choice if you want something easy to share.",
      ],
      pairing:
        "This pairs nicely with pineapple juice, orange juice, or sobolo. If you want something refreshing beside a warm pastry, any of those work well.",
      metaBestWith: "Juice, sobolo, or a light snack break",
      sidebarPoints: [
        { title: "Freshly prepared", text: "Best enjoyed while fresh for the best texture." },
        { title: "Easy to pair", text: "Works well with juice or as part of a snack order." },
        { title: "Simple serving", text: "Served in a clear, easy-to-order portion." },
      ],
    }),

    createProduct({
      id: "almond-croissant",
      name: "Almond Croissant",
      category: "Croissants",
      price: 140,
      unit: "two",
      image: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1555507036-ab794f57598e?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?auto=format&fit=crop&w=1400&q=80",
        "crois.webp",
      ],
      options: ["Standard", "Fresh Batch"],
      tagline: "A buttery pastry with almond flavour and a fuller bite.",
      description:
        "Almond croissants served as a pair. They have a soft buttery texture and an almond flavour that makes them a little richer and more filling.",
      highlights: {
        love: "Customers enjoy the richer almond taste and the soft pastry layers.",
        time: "A good option for breakfast, brunch, or when you want something more filling.",
        serving: "Served as two pieces, so it is easy to share.",
      },
      overview:
        "Almond Croissant is a good option if you want something that feels a little richer than a plain pastry. It is still soft and flaky, but the almond flavour gives it more depth.",
      overviewExtra:
        "If you like pastries that feel a bit more filling, this is a great one to try.",
      notes: [
        "Buttery pastry layers with almond flavour.",
        "A richer taste than a plain croissant.",
        "Soft texture that is easy to enjoy.",
        "Pairs nicely with cold drinks.",
      ],
      pairing:
        "This goes well with orange juice, pineapple juice, or any chilled drink that balances the richer flavour.",
      metaBestWith: "Orange juice or pineapple juice",
      sidebarPoints: [
        { title: "Richer flavour", text: "A good option if you want more than a plain pastry." },
        { title: "Served in pairs", text: "Simple portion for one person or sharing." },
        { title: "Nice with drinks", text: "Pairs well with chilled juice." },
      ],
    }),

    createProduct({
      id: "walnut-brownie",
      name: "Walnut Brownie",
      category: "Brownies",
      price: 150,
      unit: "two",
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=1400&q=80",
      ],
      options: ["Standard", "Fresh Batch"],
      tagline: "A rich brownie option with walnut pieces and a soft bite.",
      description:
        "Walnut brownies served as a pair. They are chocolatey, soft, and have walnut pieces that add a little crunch and make them more filling.",
      highlights: {
        love: "People like the mix of soft brownie texture and the extra crunch from the walnuts.",
        time: "A good choice when you want something sweet and filling.",
        serving: "Served as a pair, which makes it easy to share or save one for later.",
      },
      overview:
        "Walnut Brownie is a simple option for someone who wants a richer dessert. The chocolate flavour is familiar, while the walnut pieces add a little more texture.",
      overviewExtra:
        "It works well as a dessert, snack, or something to enjoy alongside a cold drink.",
      notes: [
        "Soft brownie texture with chocolate flavour.",
        "Walnut pieces add a little crunch.",
        "Feels more filling than a lighter pastry.",
        "Best if you want something rich and sweet.",
      ],
      pairing:
        "This goes well with sobolo, orange juice, or pineapple juice if you want something chilled beside it.",
      metaBestWith: "Sobolo, orange juice, or pineapple juice",
      sidebarPoints: [
        { title: "Rich dessert", text: "A good option when you want something more chocolatey." },
        { title: "Nutty texture", text: "Walnuts add crunch to the soft brownie." },
        { title: "Easy to split", text: "Served in a pair for simple sharing." },
      ],
    }),

    createProduct({
      id: "chocolate-brownie",
      name: "Chocolate Brownie",
      category: "Brownies",
      price: 150,
      unit: "two",
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=1400&q=80",
      ],
      options: ["Standard", "Fresh Batch"],
      tagline: "A simple chocolate dessert option that is soft and filling.",
      description:
        "Chocolate brownies served as a pair. They are soft, rich, and a good choice when you want a straightforward chocolate dessert.",
      highlights: {
        love: "Customers enjoy the soft texture and familiar chocolate taste.",
        time: "Works as a dessert, snack, or sweet treat during the day.",
        serving: "Comes in a pair, so it is easy to share.",
      },
      overview:
        "Chocolate Brownie is a simple go-to option if you want something sweet, soft, and easy to enjoy. It is rich enough to feel satisfying without needing much else beside it.",
      overviewExtra:
        "It also works well if you want to add a dessert item to a larger order.",
      notes: [
        "Soft brownie texture.",
        "Rich chocolate flavour.",
        "A straightforward dessert option.",
        "Good when you want something filling and sweet.",
      ],
      pairing:
        "Pairs well with sobolo, orange juice, or pineapple juice.",
      metaBestWith: "Sobolo or juice",
      sidebarPoints: [
        { title: "Simple favourite", text: "A classic dessert choice for chocolate lovers." },
        { title: "Soft texture", text: "Easy to enjoy and filling." },
        { title: "Served in pairs", text: "A clear and simple serving size." },
      ],
    }),

    createProduct({
      id: "mud-cake-slice",
      name: "Mud Cake Slice",
      category: "Cake Slices",
      price: 150,
      unit: "two",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=1400&q=80",
        "red.jpg",
      ],
      options: ["Standard", "Fresh Batch"],
      tagline: "A rich chocolate cake option served in slices.",
      description:
        "Mud cake slices served as a pair. It is rich, chocolatey, and a good choice when you want something more filling than a pastry.",
      highlights: {
        love: "Customers enjoy the rich chocolate taste and soft cake texture.",
        time: "A nice choice for dessert, celebrations, or just when you want cake.",
        serving: "Served as two slices, so it is easy to share.",
      },
      overview:
        "Mud Cake Slice is a good option if you want cake that feels rich and satisfying. It works well for dessert and also for moments when you want something a little more special.",
      overviewExtra:
        "Because it is served in slices, it is easy to share or enjoy over time.",
      notes: [
        "Rich chocolate flavour.",
        "Soft cake texture.",
        "Feels fuller and heavier than lighter pastries.",
        "A good dessert-style option.",
      ],
      pairing:
        "This goes well with sobolo, orange juice, or pineapple juice.",
      metaBestWith: "Sobolo, orange juice, or pineapple juice",
      sidebarPoints: [
        { title: "Rich cake option", text: "A strong pick if you want dessert instead of pastry." },
        { title: "Served in slices", text: "Easy to share between two people." },
        { title: "Works for occasions", text: "Also nice for birthdays or special orders." },
      ],
    }),

    createProduct({
      id: "swirl-cake",
      name: "Swirl Cake",
      category: "Cake Slices",
      price: 135,
      unit: "two",
      image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=1400&q=80",
        "red.jpg",
      ],
      options: ["Standard", "Fresh Batch"],
      tagline: "A soft cake slice option that is easy to enjoy.",
      description:
        "Swirl cake served as a pair of slices. It has a soft texture and is a good pick if you want cake that feels simple, familiar, and easy to enjoy.",
      highlights: {
        love: "Customers like that it feels soft, light, and easy to eat.",
        time: "Works well as a dessert or something to have with a drink.",
        serving: "Served as two slices for simple sharing.",
      },
      overview:
        "Swirl Cake is a nice option if you want cake without going for something too heavy. It is soft, straightforward, and works well for everyday orders.",
      overviewExtra:
        "It is also a good choice if you want to add a cake item to a mixed order.",
      notes: [
        "Soft cake texture.",
        "Easy-to-enjoy flavour.",
        "Lighter feel than a rich chocolate cake.",
        "Works well as an everyday dessert option.",
      ],
      pairing:
        "Pairs well with orange juice, pineapple juice, or sobolo.",
      metaBestWith: "Orange juice, pineapple juice, or sobolo",
      sidebarPoints: [
        { title: "Soft cake", text: "Easy to enjoy and not too heavy." },
        { title: "Served as slices", text: "A simple portion for sharing." },
        { title: "Everyday option", text: "A good choice for regular orders." },
      ],
    }),

    createProduct({
      id: "lemon-raspberry-slice",
      name: "Lemon Raspberry Slice",
      category: "Cake Slices",
      price: 90,
      unit: "each",
      image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1400&q=80",
        "red.jpg",
      ],
      options: ["Single Slice", "Fresh Slice"],
      tagline: "A lighter cake choice with a fruity flavour.",
      description:
        "A single slice with lemon and raspberry flavour. It is a nice choice if you want something a little lighter and fruitier than a chocolate dessert.",
      highlights: {
        love: "Customers like the lighter feel and the fruity flavour.",
        time: "A nice choice for a light dessert or sweet snack.",
        serving: "Sold as a single slice, so it is easy to add to any order.",
      },
      overview:
        "Lemon Raspberry Slice is a good option if you want something different from chocolate-based desserts. It feels lighter and works well when you want a smaller sweet option.",
      overviewExtra:
        "Because it comes as a single slice, it is also easy to include alongside other items.",
      notes: [
        "Fruity and lighter than most chocolate-based desserts.",
        "Easy single-slice serving.",
        "A nice option for smaller orders.",
        "Good if you want something sweet without it feeling too heavy.",
      ],
      pairing:
        "Pairs nicely with orange juice or pineapple juice.",
      metaBestWith: "Orange juice or pineapple juice",
      sidebarPoints: [
        { title: "Single serving", text: "Easy to add to any order." },
        { title: "Lighter option", text: "Good if you want cake without something too rich." },
        { title: "Fruit flavour", text: "A refreshing change from chocolate desserts." },
      ],
    }),

    createProduct({
      id: "red-velvet-slice",
      name: "Red Velvet Slice",
      category: "Cake Slices",
      price: 145,
      unit: "two",
      image: "red.jpg",
      images: [
        "red.jpg",
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=1400&q=80",
      ],
      options: ["Standard", "Fresh Batch"],
      tagline: "A soft cake option with a smooth finish.",
      description:
        "Red velvet cake slices served as a pair. They are soft, smooth, and a good pick when you want cake that feels balanced and easy to enjoy.",
      highlights: {
        love: "Customers enjoy the soft cake texture and smooth finish.",
        time: "Works well for dessert, celebrations, or casual orders.",
        serving: "Served as a pair of slices for easy sharing.",
      },
      overview:
        "Red Velvet Slice is a good option if you want cake that feels soft and familiar. It is a nice middle ground between something very rich and something very light.",
      overviewExtra:
        "It also works well when you want cake for sharing without ordering a full cake.",
      notes: [
        "Soft cake texture.",
        "Smooth finish and balanced flavour.",
        "Easy to enjoy for different occasions.",
        "A good sharing option.",
      ],
      pairing:
        "Pairs well with pineapple juice, orange juice, or sobolo.",
      metaBestWith: "Pineapple juice, orange juice, or sobolo",
      sidebarPoints: [
        { title: "Soft cake", text: "Easy to enjoy and share." },
        { title: "Balanced option", text: "Not as heavy as some richer cakes." },
        { title: "Good for occasions", text: "Works for everyday orders and small celebrations." },
      ],
    }),

    createProduct({
      id: "raisin-roll",
      name: "Raisin Roll",
      category: "Pastries",
      price: 110,
      unit: "two",
      image: "raison.jpg",
      images: [
        "raison.jpg",
        "cin.jpg",
        "caramel.jpg",
        "bagels.jpg",
      ],
      options: ["Standard", "Fresh Batch"],
      tagline: "A soft roll with raisin flavour and a buttery finish.",
      description:
        "Raisin rolls served as a pair. They are soft, slightly sweet, and a good option if you want something baked that feels familiar and filling.",
      highlights: {
        love: "Customers like the soft texture and the raisin flavour.",
        time: "Good for breakfast, a snack, or something light to go with a drink.",
        serving: "Served as a pair for easy sharing.",
      },
      overview:
        "Raisin Roll is a simple baked option that works well for everyday orders. It is soft, filling, and easy to enjoy at almost any time of day.",
      overviewExtra:
        "It is especially good if you want something not too sweet but still satisfying.",
      notes: [
        "Soft roll texture.",
        "Slightly sweet with raisin flavour.",
        "Easy to enjoy for breakfast or snack time.",
        "Best when fresh.",
      ],
      pairing:
        "Pairs well with pineapple juice or orange juice.",
      metaBestWith: "Pineapple juice or orange juice",
      sidebarPoints: [
        { title: "Simple favourite", text: "A familiar baked option that is easy to enjoy." },
        { title: "Served in pairs", text: "Good for one person or sharing." },
        { title: "Nice for mornings", text: "Works well for breakfast." },
      ],
    }),

    createProduct({
      id: "cinnamon-roll",
      name: "Cinnamon Roll",
      category: "Pastries",
      price: 125,
      unit: "two",
      image: "cin.jpg",
      images: [
        "cin.jpg",
        "raison.jpg",
        "caramel.jpg",
        "bagels.jpg",
      ],
      options: ["Standard", "Fresh Batch"],
      tagline: "A soft pastry with cinnamon flavour and a comforting bite.",
      description:
        "Cinnamon rolls served as a pair. They are soft, sweet, and a good option if you want something baked that feels warm and comforting.",
      highlights: {
        love: "Customers enjoy the soft texture and cinnamon flavour.",
        time: "Great for breakfast, snack time, or something sweet during the day.",
        serving: "Comes as a pair, so it is easy to share.",
      },
      overview:
        "Cinnamon Roll is a good choice if you want a pastry that feels soft, sweet, and familiar. It works well for mornings and also as a casual dessert option.",
      overviewExtra:
        "It is especially nice when you want something baked that feels comforting and filling.",
      notes: [
        "Soft pastry texture.",
        "Cinnamon flavour throughout.",
        "Sweet and easy to enjoy.",
        "A nice baked snack choice.",
      ],
      pairing:
        "Pairs well with pineapple juice, orange juice, or sobolo.",
      metaBestWith: "Pineapple juice, orange juice, or sobolo",
      sidebarPoints: [
        { title: "Comforting flavour", text: "A soft pastry with cinnamon taste." },
        { title: "Good any time", text: "Works for breakfast or a sweet snack." },
        { title: "Easy serving", text: "Served in a pair." },
      ],
    }),

    createProduct({
      id: "caramel-roll",
      name: "Caramel Roll",
      category: "Pastries",
      price: 130,
      unit: "two",
      image: "caramel.jpg",
      images: [
        "caramel.jpg",
        "cin.jpg",
        "raison.jpg",
        "bagels.jpg",
      ],
      options: ["Standard", "Fresh Batch"],
      tagline: "A soft roll with caramel flavour and a slightly richer finish.",
      description:
        "Caramel rolls served as a pair. They are soft and sweet, with a caramel flavour that makes them feel a little richer than a plain pastry.",
      highlights: {
        love: "Customers like the sweeter caramel taste and soft texture.",
        time: "A nice option when you want something baked and a little richer.",
        serving: "Served as a pair for easy sharing.",
      },
      overview:
        "Caramel Roll is a good choice if you want something soft and sweet with a slightly richer taste. It works well as a snack or dessert-style pastry.",
      overviewExtra:
        "It is a nice alternative if you want something a little sweeter than a plain roll.",
      notes: [
        "Soft roll texture.",
        "Sweeter caramel flavour.",
        "Feels a little richer than a plain pastry.",
        "Easy to enjoy with chilled drinks.",
      ],
      pairing:
        "Pairs well with pineapple juice, orange juice, or sobolo.",
      metaBestWith: "Pineapple juice, orange juice, or sobolo",
      sidebarPoints: [
        { title: "Sweeter option", text: "A good pick if you want more sweetness." },
        { title: "Soft pastry", text: "Easy to enjoy and filling." },
        { title: "Served in pairs", text: "Simple and shareable serving." },
      ],
    }),

    createProduct({
      id: "signature-bagel",
      name: "Bagel",
      category: "Pastries",
      price: 100,
      unit: "two",
      image: "bagels.jpg",
      images: [
        "bagels.jpg",
        "raison.jpg",
        "cin.jpg",
        "caramel.jpg",
      ],
      options: ["Standard", "Fresh Batch"],
      tagline: "A simple baked option that works well for breakfast or a quick bite.",
      description:
        "Bagels served as a pair. They are a good option if you want something baked, easy to enjoy, and not too sweet.",
      highlights: {
        love: "Customers like that it feels simple, filling, and easy to eat.",
        time: "Works well for breakfast or a light snack.",
        serving: "Comes as a pair for easy sharing.",
      },
      overview:
        "Bagel is a simple menu option for people who want something baked that feels light and straightforward. It is easy to enjoy and fits well into breakfast or snack orders.",
      overviewExtra:
        "It also works if you want to add something mild to a bigger order.",
      notes: [
        "Simple baked texture.",
        "Not too sweet.",
        "Good for breakfast or quick bites.",
        "Easy to pair with drinks.",
      ],
      pairing:
        "Pairs well with pineapple juice or orange juice.",
      metaBestWith: "Pineapple juice or orange juice",
      sidebarPoints: [
        { title: "Simple option", text: "Good if you want something plain and easy." },
        { title: "Light choice", text: "Feels lighter than richer desserts." },
        { title: "Good with drinks", text: "Nice with chilled juice." },
      ],
    }),

    createProduct({
      id: "pineapple-juice",
      name: "Pineapple Juice",
      category: "Juices",
      price: 40,
      unit: "each",
      image: "pine.webp",
      images: [
        "pine.webp",
        "pm.jpg",
        "wm.webp",
        "sobolo.webp",
      ],
      options: ["Chilled", "Bottle"],
      tagline: "Fresh and easy to pair with pastries, brownies, and cake.",
      description:
        "Fresh pineapple juice served chilled. It is a refreshing drink option that pairs well with pastries, brownies, cake slices, and more.",
      highlights: {
        love: "Customers like how fresh and easy it is to pair with different food items.",
        time: "Good at any time of day, especially with baked items.",
        serving: "Sold individually, so it is easy to add to any order.",
      },
      overview:
        "Pineapple Juice is a simple drink option that works with almost everything on the menu. If you want something cold and refreshing beside a baked item, this is a good pick.",
      overviewExtra:
        "It is especially useful if you want a drink that balances sweeter pastries and desserts.",
      notes: [
        "Served chilled.",
        "Fresh and refreshing.",
        "Easy to pair with most menu items.",
        "Good as part of a larger order or on its own.",
      ],
      pairing:
        "Pairs well with croissants, brownies, cake slices, donuts, and rolls.",
      metaBestWith: "Croissants, brownies, cake, and donuts",
      sidebarPoints: [
        { title: "Refreshing", text: "A simple chilled drink option." },
        { title: "Easy to pair", text: "Works with many items on the menu." },
        { title: "Single serving", text: "Easy to add to any order." },
      ],
    }),

    createProduct({
      id: "mint-pineapple-juice",
      name: "Mint & Pineapple Juice",
      category: "Juices",
      price: 40,
      unit: "each",
      image: "pm.jpg",
      images: [
        "pm.jpg",
        "pine.webp",
        "wm.webp",
        "sobolo.webp",
      ],
      options: ["Chilled", "Bottle"],
      tagline: "A refreshing juice blend with a cool finish.",
      description:
        "Mint and pineapple juice served chilled. It is refreshing, easy to drink, and a good choice if you want something cooler and lighter beside pastries or cake.",
      highlights: {
        love: "Customers like the refreshing feel and the cool mint finish.",
        time: "Great for hot days or whenever you want something refreshing.",
        serving: "Sold individually, so it is easy to add to your order.",
      },
      overview:
        "Mint & Pineapple Juice is a nice option if you want something a little more refreshing than a regular fruit juice. It feels lighter and works well with pastries and cakes.",
      overviewExtra:
        "It is especially good when you want a drink that helps balance sweeter items.",
      notes: [
        "Served chilled.",
        "Refreshing pineapple flavour with mint.",
        "Feels lighter and cooling.",
        "Works well with baked items.",
      ],
      pairing:
        "Pairs well with croissants, cake slices, and rolls.",
      metaBestWith: "Croissants, cake slices, and rolls",
      sidebarPoints: [
        { title: "Cooling drink", text: "A refreshing option for warm days." },
        { title: "Easy to match", text: "Works well with pastries and cakes." },
        { title: "Single serving", text: "Simple to add to any order." },
      ],
    }),

    createProduct({
      id: "watermelon-juice",
      name: "Watermelon Juice",
      category: "Juices",
      price: 40,
      unit: "each",
      image: "wm.webp",
      images: [
        "wm.webp",
        "pine.webp",
        "pm.jpg",
        "sobolo.webp",
      ],
      options: ["Chilled", "Bottle"],
      tagline: "A light and refreshing drink that is easy to enjoy.",
      description:
        "Watermelon juice served chilled. It is light, refreshing, and a good option if you want something simple beside pastries or cake.",
      highlights: {
        love: "Customers like how light and refreshing it feels.",
        time: "Good for hot days, quick refreshment, or a light drink with snacks.",
        serving: "Sold individually for easy ordering.",
      },
      overview:
        "Watermelon Juice is a simple drink choice if you want something cold and refreshing without it feeling too heavy or too sweet.",
      overviewExtra:
        "It works especially well if you want a lighter drink next to a pastry or dessert.",
      notes: [
        "Served chilled.",
        "Light and refreshing.",
        "Easy to pair with sweet items.",
        "A simple drink option for any time of day.",
      ],
      pairing:
        "Pairs well with croissants, cake slices, and donuts.",
      metaBestWith: "Croissants, cake slices, and donuts",
      sidebarPoints: [
        { title: "Light drink", text: "A good option if you want something not too heavy." },
        { title: "Refreshing", text: "Works especially well chilled." },
        { title: "Easy add-on", text: "Simple drink to include with food." },
      ],
    }),

    createProduct({
      id: "sobolo",
      name: "Sobolo",
      category: "Juices",
      price: 40,
      unit: "each",
      image: "sobolo.webp",
      images: [
        "sobolo.webp",
        "pine.webp",
        "pm.jpg",
        "wm.webp",
      ],
      options: ["Chilled", "Bottle"],
      tagline: "A chilled local drink that goes well with many items on the menu.",
      description:
        "Sobolo served chilled. It is a refreshing local drink and a great option to enjoy with pastries, brownies, cake slices, and donuts.",
      highlights: {
        love: "Customers like that it feels familiar, refreshing, and easy to enjoy with different foods.",
        time: "Good at any time of day, especially with baked snacks or dessert.",
        serving: "Sold individually, so it is easy to add to any order.",
      },
      overview:
        "Sobolo is one of the easiest drinks to pair with items on the menu. It is refreshing and works especially well beside baked goods and sweeter desserts.",
      overviewExtra:
        "If you want a chilled local drink that fits naturally into your order, this is a good option.",
      notes: [
        "Served chilled.",
        "A familiar local drink option.",
        "Easy to pair with pastries and desserts.",
        "Refreshing without feeling too heavy.",
      ],
      pairing:
        "Pairs well with brownies, croissants, mud cake slice, and donuts.",
      metaBestWith: "Brownies, croissants, cake, and donuts",
      sidebarPoints: [
        { title: "Local favourite", text: "A familiar chilled drink option." },
        { title: "Easy pairing", text: "Works well with many sweet and baked items." },
        { title: "Simple serving", text: "Easy to add to any order." },
      ],
    }),

    createProduct({
      id: "orange-juice",
      name: "Orange Juice",
      category: "Juices",
      price: 40,
      unit: "each",
      image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=1200&q=80",
      images: [
        "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=1400&q=80",
        "pine.webp",
        "pm.jpg",
        "wm.webp",
      ],
      options: ["Chilled", "Bottle"],
      tagline: "A chilled drink that works well with pastries and desserts.",
      description:
        "Orange juice served chilled. It is fresh, simple, and a good choice when you want a drink that pairs easily with pastries, cake slices, or brownies.",
      highlights: {
        love: "Customers enjoy how easy it is to pair with different items.",
        time: "Works well with breakfast items, snacks, and desserts.",
        serving: "Sold individually, so it is easy to include in any order.",
      },
      overview:
        "Orange Juice is a simple drink option that works with many items on the menu. It is easy to enjoy and especially useful if you want something fresh beside baked food.",
      overviewExtra:
        "It is one of the easiest drinks to add if you are not sure what to pair with your order.",
      notes: [
        "Served chilled.",
        "Fresh and simple.",
        "Easy to pair with pastries and desserts.",
        "A good all-round drink option.",
      ],
      pairing:
        "Pairs well with croissants, brownies, cake slices, rolls, and donuts.",
      metaBestWith: "Croissants, brownies, cake, rolls, and donuts",
      sidebarPoints: [
        { title: "Simple choice", text: "A good all-round juice option." },
        { title: "Very easy to pair", text: "Works with most menu items." },
        { title: "Single serving", text: "Easy to add to your order." },
      ],
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
    showToast("Cart cleared");
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
      tagline: "Available to order.",
      description: `${name} is available to order from Meals by Bella.`,
      highlights: {
        love: "A simple menu choice.",
        time: "Works for different times of day.",
        serving: `Served / sold per ${unit || "item"}.`,
      },
      overview: `${name} is available on the Meals by Bella menu.`,
      overviewExtra: "Tap add to cart to include it in your order.",
      notes: ["Available to order."],
      pairing: "Can be paired with other menu items.",
      metaBestWith: "Other menu items",
      sidebarPoints: [
        { title: "Available", text: "This item is available to order." },
      ],
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

    $$(".mobile-menu a", menu).forEach((link) =>
      link.addEventListener("click", () => closeMenu())
    );

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
      button.addEventListener("click", clearCart);
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
          if (productId) {
            goToProductPage(productId);
          }
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
      if (event.key === "Escape") {
        closeCart();
      }
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
          <button
            class="option-chip ${index === 0 ? "is-active" : ""}"
            type="button"
            data-option="${escapeHtml(option)}"
          >
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
          <button
            class="product-thumb ${index === 0 ? "is-active" : ""}"
            type="button"
            data-image="${escapeHtml(image)}"
            aria-label="View ${escapeHtml(product.name)} image ${index + 1}"
          >
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
      metaDescription.setAttribute(
        "content",
        `${product.name} from Meals by Bella. ${product.description}`
      );
    }

    setText("breadcrumbProductName", product.name);
    setText("productCategory", product.category);
    setText("productName", product.name);
    setText("productPrice", formatPrice(product.price));
    setText("productUnit", `/ ${product.unit}`);
    setText("productTagline", product.tagline);
    setText("productAvailability", product.availability);
    setText("productDescription", product.description);

    setText("highlightLove", product.highlights.love);
    setText("highlightTime", product.highlights.time);
    setText("highlightServing", product.highlights.serving);

    setText("productOverviewText", product.overview);
    setText("productOverviewExtra", product.overviewExtra);
    setHTML(
      "productNotesList",
      product.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")
    );
    setText("productPairingText", product.pairing);

    setText("productMetaCategory", product.category);
    setText("productMetaServing", productServingText(product));
    setText("productMetaBestWith", product.metaBestWith);

    setText("sidebarPrice", formatPrice(product.price));
    setText("sidebarUnit", product.unit);
    setText("sidebarCategory", product.category);

    const sidebarPoints = $("#productSidebarPoints");
    if (sidebarPoints) {
      sidebarPoints.innerHTML = product.sidebarPoints
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
          <article
            class="product-card"
            data-id="${escapeHtml(item.id)}"
            data-name="${escapeHtml(item.name)}"
            data-price="${item.price}"
            data-unit="${escapeHtml(item.unit)}"
            data-image="${escapeHtml(item.image)}"
            data-category="${escapeHtml(item.category)}"
          >
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

    decrease?.addEventListener("click", () => {
      syncValue((Number(input.value) || 1) - 1);
    });

    increase?.addEventListener("click", () => {
      syncValue((Number(input.value) || 1) + 1);
    });

    input.addEventListener("input", () => {
      syncValue(input.value);
    });

    input.addEventListener("blur", () => {
      syncValue(input.value);
    });
  }

  function initProductOptionClicks() {
    document.addEventListener("click", (event) => {
      const option = event.target.closest(".option-chip");
      if (!option || !$("#productOptions")) return;

      currentOption = option.dataset.option || "Standard";
      $$(".option-chip", $("#productOptions")).forEach((node) =>
        node.classList.remove("is-active")
      );
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
    const mediaQuery = window.matchMedia("(max-width: 820px)");

    if (!stickyBar || !relatedSection) return;

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
          applyVisibility(entry.isIntersecting);
        },
        {
          root: null,
          threshold: 0.08,
        }
      );

      observer.observe(relatedSection);
      applyVisibility(false);
    }

    setupObserver();
    mediaQuery.addEventListener("change", setupObserver);
  }

  function initProductPage() {
    if (document.body.dataset.page !== "product") return;

    const params = new URLSearchParams(window.location.search);
    const productId = params.get("product") || "chocolate-croissant";
    const product = getProductById(productId) || getProductById("chocolate-croissant");

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
  /* Init                                                                       */
  /* -------------------------------------------------------------------------- */

  function init() {
    renderCart();
    initMobileMenu();
    initCartEvents();
    initCardAddToCart();
    initMenuFiltering();
    initProductGalleryClicks();
    initProductPage();
    initGalleryLightbox();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
