document.addEventListener("DOMContentLoaded", () => {
  const rootElement = document.getElementById("app-root");

  let _clockInterval = null;
  let _statsInterval = null;
  let _trackInterval = null;

  function clearIntervals() {
    if (_clockInterval) {
      clearInterval(_clockInterval);
      _clockInterval = null;
    }
    if (_statsInterval) {
      clearInterval(_statsInterval);
      _statsInterval = null;
    }
    if (_trackInterval) {
      clearInterval(_trackInterval);
      _trackInterval = null;
    }
  }

  let liveAnnouncer = document.getElementById("app-live-announcer");
  if (!liveAnnouncer) {
    liveAnnouncer = document.createElement("div");
    liveAnnouncer.id = "app-live-announcer";
    liveAnnouncer.setAttribute("aria-live", "polite");
    liveAnnouncer.setAttribute("aria-atomic", "true");
    Object.assign(liveAnnouncer.style, {
      position: "absolute",
      width: "1px",
      height: "1px",
      padding: "0",
      margin: "-1px",
      overflow: "hidden",
      clip: "rect(0,0,0,0)",
      whiteSpace: "nowrap",
      border: "0",
    });
    document.body.appendChild(liveAnnouncer);
  }

  const LogStore = {
    entries: [
      {
        ts: "15:11:02 UTC",
        context: "User session context token generated successfully",
        status: "COMPLETED",
      },
      {
        ts: "15:08:44 UTC",
        context:
          "Database validation collection query cache synchronization execution",
        status: "COMPLETED",
      },
      {
        ts: "14:52:19 UTC",
        context:
          "Microservice fallback configuration check sequence triggered headlessly",
        status: "ATTENTION",
      },
    ],
    add(context, status) {
      const ts = new Date().toISOString().slice(11, 19) + " UTC";
      this.entries.unshift({ ts, context, status });
      return { ts, context, status };
    },
  };

  const KeyStore = {
    keys: [
      {
        id: "key_prod_01",
        label: "Production API Key",
        value: "pk_live_••••••••••••3f9a",
        created: "2025-01-10",
        status: "active",
      },
      {
        id: "key_dev_02",
        label: "Development API Key",
        value: "pk_dev_••••••••••••7b2c",
        created: "2025-03-22",
        status: "active",
      },
      {
        id: "key_old_03",
        label: "Legacy Webhook Key",
        value: "wh_••••••••••••0d1e",
        created: "2024-11-05",
        status: "revoked",
      },
    ],
    nextId: 4,
    add(label) {
      const rand = Math.random().toString(36).slice(2, 10);
      const paddedId = String(this.nextId++).padStart(2, "0");
      this.keys.unshift({
        id: `key_new_${paddedId}`,
        label,
        value: `pk_new_••••••••••••${rand.slice(0, 4)}`,
        created: new Date().toISOString().slice(0, 10),
        status: "active",
      });
    },
    revoke(id) {
      const k = this.keys.find((k) => k.id === id);
      if (k) k.status = "revoked";
    },
  };

  const SettingsStore = {
    profile: { displayName: "Admin User", timezone: "UTC", language: "en" },
    security: { twoFA: false, sessionTimeout: "30" },
    notifications: {
      emailAlerts: true,
      slackAlerts: false,
      weeklyReport: true,
    },
    appearance: { theme: "dark", density: "comfortable" },
  };

  const ProductStore = {
    nextId: 7,
    cart: [],
    checkoutStep: "listing",
    products: [
      {
        id: 1,
        name: "Wireless Noise-Cancelling Headphones",
        category: "Electronics",
        price: 2499,
        originalPrice: 3999,
        rating: 4.5,
        reviews: 1284,
        stock: 15,
        badge: "Best Seller",
        img: "🎧",
        desc: "Premium sound with 30hr battery life, foldable design.",
      },
      {
        id: 2,
        name: "Mechanical Keyboard RGB Backlit",
        category: "Electronics",
        price: 1899,
        originalPrice: 2799,
        rating: 4.3,
        reviews: 876,
        stock: 8,
        badge: "Deal",
        img: "⌨️",
        desc: "Blue switches, full-size layout, aluminum frame.",
      },
      {
        id: 3,
        name: 'Ultra-Wide 34" Monitor',
        category: "Electronics",
        price: 28999,
        originalPrice: 35000,
        rating: 4.7,
        reviews: 432,
        stock: 3,
        badge: "Limited",
        img: "🖥️",
        desc: "IPS panel, 144Hz, 1ms response, HDR400.",
      },
      {
        id: 4,
        name: "Ergonomic Office Chair",
        category: "Furniture",
        price: 12499,
        originalPrice: 17999,
        rating: 4.6,
        reviews: 2341,
        stock: 20,
        badge: "Best Seller",
        img: "🪑",
        desc: "Lumbar support, adjustable armrests, mesh back.",
      },
      {
        id: 5,
        name: "Portable SSD 1TB",
        category: "Storage",
        price: 3499,
        originalPrice: 4999,
        rating: 4.8,
        reviews: 5621,
        stock: 50,
        badge: "Top Rated",
        img: "💾",
        desc: "1050MB/s read, USB-C, shock-resistant, pocket-sized.",
      },
      {
        id: 6,
        name: "Smart LED Desk Lamp",
        category: "Accessories",
        price: 899,
        originalPrice: 1299,
        rating: 4.2,
        reviews: 743,
        stock: 30,
        badge: "",
        img: "💡",
        desc: "Touch dimmer, USB charging port, eye-care mode.",
      },
    ],
    addProduct(p) {
      this.products.unshift({
        ...p,
        id: this.nextId++,
        reviews: 0,
        badge: "New",
      });
    },
    addToCart(id, qty = 1) {
      const p = this.products.find((p) => p.id === id);
      if (!p) return;
      const existing = this.cart.find((c) => c.id === id);
      if (existing) {
        existing.qty = Math.min(existing.qty + qty, p.stock);
      } else {
        this.cart.push({ ...p, qty });
      }
    },
    removeFromCart(id) {
      this.cart = this.cart.filter((c) => c.id !== id);
    },
    updateQty(id, qty) {
      const item = this.cart.find((c) => c.id === id);
      if (item) {
        if (qty < 1) this.removeFromCart(id);
        else item.qty = qty;
      }
    },
    cartTotal() {
      return this.cart.reduce((s, c) => s + c.price * c.qty, 0);
    },
    cartCount() {
      return this.cart.reduce((s, c) => s + c.qty, 0);
    },
  };

  const TrackingStore = {
    searchInput: "",
    activeOrder: null,
    orders: [
      {
        id: "ORD82941057",
        product: "Wireless Noise-Cancelling Headphones",
        img: "🎧",
        date: "2026-06-01",
        deliveryDate: "2026-06-07",
        price: 2499,
        qty: 1,
        address: "42, Anna Nagar, Chennai — 600040",
        carrier: "BlueDart Express",
        awb: "BD9912304581",
        currentStep: 3,
        steps: [
          {
            label: "Order Placed",
            icon: "📋",
            time: "Jun 1, 10:30 AM",
            detail: "Your order has been confirmed and payment received.",
          },
          {
            label: "Processing",
            icon: "⚙️",
            time: "Jun 1, 02:15 PM",
            detail: "Seller is packing your item at the warehouse.",
          },
          {
            label: "Shipped",
            icon: "📦",
            time: "Jun 2, 09:00 AM",
            detail: "Package picked up by BlueDart Express. AWB: BD9912304581",
          },
          {
            label: "Out for Delivery",
            icon: "🚚",
            time: "Jun 7, 08:45 AM",
            detail:
              "Your package is with the delivery agent and will arrive today.",
          },
          {
            label: "Delivered",
            icon: "🏠",
            time: "—",
            detail: "Package will be handed to you or a household member.",
          },
        ],
      },
      {
        id: "ORD73610284",
        product: "Portable SSD 1TB",
        img: "💾",
        date: "2026-05-28",
        deliveryDate: "2026-06-03",
        price: 3499,
        qty: 2,
        address: "17, Koramangala 4th Block, Bengaluru — 560034",
        carrier: "DTDC Courier",
        awb: "DT4420193872",
        currentStep: 4,
        steps: [
          {
            label: "Order Placed",
            icon: "📋",
            time: "May 28, 11:00 AM",
            detail: "Order confirmed. Payment of ₹6,998 received.",
          },
          {
            label: "Processing",
            icon: "⚙️",
            time: "May 28, 03:30 PM",
            detail: "Item quality-checked and packed by seller.",
          },
          {
            label: "Shipped",
            icon: "📦",
            time: "May 29, 07:00 AM",
            detail: "Dispatched via DTDC. AWB: DT4420193872",
          },
          {
            label: "Out for Delivery",
            icon: "🚚",
            time: "Jun 3, 09:10 AM",
            detail: "Out for delivery in your area.",
          },
          {
            label: "Delivered",
            icon: "🏠",
            time: "Jun 3, 02:22 PM",
            detail: "Delivered successfully. Signed by: Gopi S.",
          },
        ],
      },
      {
        id: "ORD61038492",
        product: "Ergonomic Office Chair",
        img: "🪑",
        date: "2026-06-05",
        deliveryDate: "2026-06-12",
        price: 12499,
        qty: 1,
        address: "8, T Nagar, Chennai — 600017",
        carrier: "Delhivery",
        awb: "DL8830021947",
        currentStep: 1,
        steps: [
          {
            label: "Order Placed",
            icon: "📋",
            time: "Jun 5, 04:00 PM",
            detail: "Order confirmed. Expected delivery by Jun 12.",
          },
          {
            label: "Processing",
            icon: "⚙️",
            time: "—",
            detail: "Seller will start packing soon.",
          },
          {
            label: "Shipped",
            icon: "📦",
            time: "—",
            detail: "Awaiting pickup by courier.",
          },
          {
            label: "Out for Delivery",
            icon: "🚚",
            time: "—",
            detail: "Pending.",
          },
          {
            label: "Delivered",
            icon: "🏠",
            time: "—",
            detail: "Estimated: Jun 12, 2026.",
          },
        ],
      },
    ],
    findOrder(query) {
      const q = query.trim().toUpperCase();
      return (
        this.orders.find((o) => o.id === q || o.awb.toUpperCase() === q) || null
      );
    },
  };

  const AppState = {
    data: {
      currentView: "landing",
      dashboardTab: "console",
      userEmail: "",
      successMessage: "",
      errorMessage: "",
      settingsTab: "profile",
      productSearch: "",
      productCategory: "All",
      productSort: "default",
    },

    setState(key, value) {
      this.data[key] = value;
      this.render();
    },

    render() {
      if (!rootElement) return;
      clearIntervals();
      switch (this.data.currentView) {
        case "landing":
          rootElement.innerHTML = Components.LandingView();
          this.bindLandingEvents();
          break;
        case "login":
          rootElement.innerHTML = Components.LoginView(
            this.data.successMessage,
            this.data.errorMessage,
          );
          this.bindLoginEvents();
          break;
        case "signup":
          rootElement.innerHTML = Components.SignUpView();
          this.bindSignUpEvents();
          break;
        case "dashboard":
          rootElement.innerHTML = Components.DashboardView(
            this.data.userEmail,
            this.data.dashboardTab,
            this.data.settingsTab,
          );
          this.bindDashboardEvents();
          this.startDashboardLiveFeatures();
          break;
        default:
          rootElement.innerHTML = `<div role="alert">Routing Context Error</div>`;
      }
    },

    startDashboardLiveFeatures() {
      const clockEl = document.getElementById("live-utc-clock");
      if (clockEl) {
        const tick = () => {
          clockEl.textContent = new Date().toISOString().slice(11, 19) + " UTC";
        };
        tick();
        _clockInterval = setInterval(tick, 1000);
      }
      const refreshStats = () => {
        const completed = LogStore.entries.filter(
          (e) => e.status === "COMPLETED",
        ).length;
        const attention = LogStore.entries.filter(
          (e) => e.status === "ATTENTION",
        ).length;
        const failed = LogStore.entries.filter(
          (e) => e.status === "FAILED",
        ).length;
        const total = LogStore.entries.length || 1;
        const set = (id, val, barId, pct) => {
          const el = document.getElementById(id);
          if (el && el.textContent !== String(val)) {
            el.textContent = val;
            el.classList.remove("cstat-pop");
            void el.offsetWidth;
            el.classList.add("cstat-pop");
          }
          const bar = document.getElementById(barId);
          if (bar) bar.style.width = Math.min((pct / total) * 100, 100) + "%";
        };
        set("stat-completed", completed, "stat-completed-bar", completed);
        set("stat-attention", attention, "stat-attention-bar", attention);
        set("stat-failed", failed, "stat-failed-bar", failed);
        const sub = document.getElementById("clog-subtitle");
        if (sub)
          sub.textContent = `${LogStore.entries.length} event${LogStore.entries.length !== 1 ? "s" : ""} recorded · updates live`;
      };
      if (document.getElementById("stat-completed")) {
        refreshStats();
        _statsInterval = setInterval(refreshStats, 1500);
      }
      if (this.data.dashboardTab === "tracking") {
        _trackInterval = setInterval(() => {
          document.querySelectorAll(".trk-pulse-dot").forEach((dot) => {
            dot.style.opacity = dot.style.opacity === "0" ? "1" : "0";
          });
        }, 800);
      }
    },

    bindLandingEvents() {
      document
        .getElementById("get-started-btn")
        ?.addEventListener("click", () =>
          this.setState("currentView", "login"),
        );
    },

    bindLoginEvents() {
      document.getElementById("auth-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const emailInput = document.getElementById("login-email");
        const trimmedEmail = emailInput ? emailInput.value.trim() : "";
        if (!trimmedEmail) {
          this.setState("errorMessage", "Please fill out this field.");
          document.getElementById("login-email")?.focus();
          return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
          this.setState("errorMessage", "Please enter a valid email address.");
          document.getElementById("login-email")?.focus();
          return;
        }
        this.data.successMessage = "";
        this.data.errorMessage = "";
        this.data.dashboardTab = "console";
        this.data.userEmail = trimmedEmail;
        this.setState("currentView", "dashboard");
      });
      document.getElementById("go-to-signup")?.addEventListener("click", () => {
        this.data.successMessage = "";
        this.data.errorMessage = "";
        this.setState("currentView", "signup");
      });
    },

    bindSignUpEvents() {
      document
        .getElementById("signup-form")
        ?.addEventListener("submit", (e) => {
          e.preventDefault();
          this.data.errorMessage = "";
          this.setState(
            "successMessage",
            "Account created successfully. Please login to access your account.",
          );
          this.setState("currentView", "login");
        });
      document
        .getElementById("back-to-login")
        ?.addEventListener("click", () => {
          this.data.successMessage = "";
          this.data.errorMessage = "";
          this.setState("currentView", "login");
        });
    },

    bindDashboardEvents() {
      document
        .getElementById("sidebar-logout-btn")
        ?.addEventListener("click", () => {
          this.data.userEmail = "";
          this.data.errorMessage = "";
          this.setState(
            "successMessage",
            "Logged out securely from active terminal session.",
          );
          this.setState("currentView", "login");
        });

      document.querySelectorAll(".nav-item[data-tab]").forEach((el) => {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          this.data.dashboardTab = el.dataset.tab;
          this.data.settingsTab = "profile";
          ProductStore.checkoutStep = "listing";
          TrackingStore.activeOrder = null;
          TrackingStore.searchInput = "";
          this.render();
        });
      });

      if (this.data.dashboardTab === "console") {
        document
          .getElementById("log-add-form")
          ?.addEventListener("submit", (e) => {
            e.preventDefault();
            const ctxInput = document.getElementById("log-context-input");
            const statusSel = document.getElementById("log-status-select");
            const ctx = ctxInput.value.trim();
            if (!ctx) {
              ctxInput.focus();
              return;
            }
            const entry = LogStore.add(ctx, statusSel.value);
            const badgeClass =
              entry.status === "COMPLETED"
                ? "success"
                : entry.status === "ATTENTION"
                  ? "warning"
                  : "danger";
            const tbody = document.getElementById("log-table-body");
            if (tbody) {
              const tr = document.createElement("tr");
              tr.className = "clog-row clog-row-new";
              const dotColor =
                entry.status === "COMPLETED"
                  ? "#10b981"
                  : entry.status === "ATTENTION"
                    ? "#f59e0b"
                    : "#ef4444";
              tr.innerHTML = `
              <td class="clog-td-ts"><span class="clog-ts-dot" style="background:${dotColor};box-shadow:0 0 6px ${dotColor}80;"></span><span class="clog-ts-text">${entry.ts}</span></td>
              <td class="clog-td-ctx">${entry.context}</td>
              <td class="clog-td-badge"><span class="badge-tag ${badgeClass}">${entry.status}</span></td>`;
              tbody.insertBefore(tr, tbody.firstChild);
              setTimeout(() => tr.classList.remove("clog-row-new"), 600);
            }
            const completed = LogStore.entries.filter(
              (e) => e.status === "COMPLETED",
            ).length;
            const attention = LogStore.entries.filter(
              (e) => e.status === "ATTENTION",
            ).length;
            const failed = LogStore.entries.filter(
              (e) => e.status === "FAILED",
            ).length;
            const total = LogStore.entries.length || 1;
            const setStatNow = (id, val, barId, pct) => {
              const el = document.getElementById(id);
              if (el) {
                el.textContent = val;
                el.classList.remove("cstat-pop");
                void el.offsetWidth;
                el.classList.add("cstat-pop");
              }
              const bar = document.getElementById(barId);
              if (bar)
                bar.style.width = Math.min((pct / total) * 100, 100) + "%";
            };
            setStatNow(
              "stat-completed",
              completed,
              "stat-completed-bar",
              completed,
            );
            setStatNow(
              "stat-attention",
              attention,
              "stat-attention-bar",
              attention,
            );
            setStatNow("stat-failed", failed, "stat-failed-bar", failed);
            const sub = document.getElementById("clog-subtitle");
            if (sub)
              sub.textContent = `${LogStore.entries.length} event${LogStore.entries.length !== 1 ? "s" : ""} recorded · updates live`;
            ctxInput.value = "";
            ctxInput.focus();
          });
      }

      if (this.data.dashboardTab === "keymanager") {
        document
          .getElementById("key-add-form")
          ?.addEventListener("submit", (e) => {
            e.preventDefault();
            const labelInput = document.getElementById("key-label-input");
            const label = labelInput ? labelInput.value.trim() : "";
            if (!label) return;
            KeyStore.add(label);
            this.render();
          });
        document.querySelectorAll(".btn-revoke-key").forEach((btn) => {
          btn.addEventListener("click", () => {
            KeyStore.revoke(btn.dataset.id);
            this.render();
          });
        });
      }

      if (this.data.dashboardTab === "settings") {
        document.querySelectorAll(".settings-tab-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            this.data.settingsTab = btn.dataset.stab;
            this.render();
          });
        });
        document
          .getElementById("settings-profile-form")
          ?.addEventListener("submit", (e) => {
            e.preventDefault();
            SettingsStore.profile.displayName =
              document.getElementById("s-display-name").value;
            SettingsStore.profile.timezone =
              document.getElementById("s-timezone").value;
            SettingsStore.profile.language =
              document.getElementById("s-language").value;
            Notifications.toast("Profile saved successfully.", "success");
          });
        document
          .getElementById("settings-security-form")
          ?.addEventListener("submit", (e) => {
            e.preventDefault();
            SettingsStore.security.twoFA =
              document.getElementById("s-2fa").checked;
            SettingsStore.security.sessionTimeout =
              document.getElementById("s-session-timeout").value;
            Notifications.toast("Security settings updated.", "success");
          });
        document
          .getElementById("settings-notifications-form")
          ?.addEventListener("submit", (e) => {
            e.preventDefault();
            SettingsStore.notifications.emailAlerts =
              document.getElementById("s-email-alerts").checked;
            SettingsStore.notifications.slackAlerts =
              document.getElementById("s-slack-alerts").checked;
            SettingsStore.notifications.weeklyReport =
              document.getElementById("s-weekly-report").checked;
            Notifications.toast("Notification preferences saved.", "success");
          });
        document
          .getElementById("settings-appearance-form")
          ?.addEventListener("submit", (e) => {
            e.preventDefault();
            SettingsStore.appearance.theme =
              document.getElementById("s-theme").value;
            SettingsStore.appearance.density =
              document.getElementById("s-density").value;
            Notifications.toast("Appearance settings applied.", "success");
          });
      }

      if (this.data.dashboardTab === "products") {
        this.bindProductEvents();
      }
      if (this.data.dashboardTab === "tracking") {
        this.bindTrackingEvents();
      }
    },

    bindProductEvents() {
      const step = ProductStore.checkoutStep;

      document
        .getElementById("prod-search-input")
        ?.addEventListener("input", (e) => {
          this.data.productSearch = e.target.value;
          this._renderProductGrid();
        });
      document
        .getElementById("prod-category-filter")
        ?.addEventListener("change", (e) => {
          this.data.productCategory = e.target.value;
          this._renderProductGrid();
        });
      document
        .getElementById("prod-sort-select")
        ?.addEventListener("change", (e) => {
          this.data.productSort = e.target.value;
          this._renderProductGrid();
        });
      document
        .getElementById("btn-show-add-product")
        ?.addEventListener("click", () => {
          const modal = document.getElementById("add-product-modal");
          if (modal) {
            modal.style.display = "flex";
            setTimeout(() => modal.classList.add("modal-visible"), 10);
          }
        });
      document
        .getElementById("btn-close-modal")
        ?.addEventListener("click", () => {
          const modal = document.getElementById("add-product-modal");
          if (modal) {
            modal.classList.remove("modal-visible");
            setTimeout(() => {
              modal.style.display = "none";
            }, 250);
          }
        });
      document
        .getElementById("btn-close-modal-2")
        ?.addEventListener("click", () => {
          const modal = document.getElementById("add-product-modal");
          if (modal) {
            modal.classList.remove("modal-visible");
            setTimeout(() => {
              modal.style.display = "none";
            }, 250);
          }
        });
      document
        .getElementById("add-product-form")
        ?.addEventListener("submit", (e) => {
          e.preventDefault();
          const name = document.getElementById("np-name").value.trim();
          const category = document.getElementById("np-category").value;
          const price = parseInt(document.getElementById("np-price").value);
          const original =
            parseInt(document.getElementById("np-original").value) || price;
          const stock =
            parseInt(document.getElementById("np-stock").value) || 10;
          const img = document.getElementById("np-img").value.trim() || "📦";
          const desc = document.getElementById("np-desc").value.trim() || "";
          const rating =
            parseFloat(document.getElementById("np-rating").value) || 4.0;
          if (!name || !price) return;
          ProductStore.addProduct({
            name,
            category,
            price,
            originalPrice: original,
            stock,
            img,
            desc,
            rating,
          });
          const modal = document.getElementById("add-product-modal");
          if (modal) {
            modal.classList.remove("modal-visible");
            setTimeout(() => {
              modal.style.display = "none";
            }, 250);
          }
          this._renderProductGrid();
          Notifications.toast("Product added successfully!", "success");
          document.getElementById("add-product-form").reset();
        });
      document.querySelectorAll(".btn-add-to-cart").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = parseInt(btn.dataset.id);
          ProductStore.addToCart(id);
          this._updateCartBadge();
          btn.textContent = "✓ Added";
          btn.style.background = "#10b981";
          setTimeout(() => {
            btn.textContent = "Add to Cart";
            btn.style.background = "";
          }, 1500);
          Notifications.toast("Added to cart!", "success");
        });
      });
      document.querySelectorAll(".btn-buy-now").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = parseInt(btn.dataset.id);
          ProductStore.addToCart(id);
          ProductStore.checkoutStep = "cart";
          this.render();
        });
      });
      document
        .getElementById("btn-checkout-from-listing")
        ?.addEventListener("click", () => {
          if (ProductStore.cart.length === 0) {
            Notifications.toast("Your cart is empty!", "error");
            return;
          }
          ProductStore.checkoutStep = "cart";
          this.render();
        });

      if (step === "cart") {
        document.querySelectorAll(".btn-remove-cart").forEach((btn) => {
          btn.addEventListener("click", () => {
            ProductStore.removeFromCart(parseInt(btn.dataset.id));
            this.render();
          });
        });
        document.querySelectorAll(".cart-qty-input").forEach((inp) => {
          inp.addEventListener("change", () => {
            ProductStore.updateQty(
              parseInt(inp.dataset.id),
              parseInt(inp.value) || 1,
            );
            this.render();
          });
        });
        document
          .getElementById("btn-continue-shopping")
          ?.addEventListener("click", () => {
            ProductStore.checkoutStep = "listing";
            this.render();
          });
        document
          .getElementById("btn-proceed-checkout")
          ?.addEventListener("click", () => {
            if (ProductStore.cart.length === 0) {
              Notifications.toast("Your cart is empty!", "error");
              return;
            }
            ProductStore.checkoutStep = "checkout";
            this.render();
          });
      }

      if (step === "checkout") {
        document
          .getElementById("btn-back-to-cart")
          ?.addEventListener("click", () => {
            ProductStore.checkoutStep = "cart";
            this.render();
          });
        document
          .getElementById("checkout-form")
          ?.addEventListener("submit", (e) => {
            e.preventDefault();
            const fields = [
              "co-fullname",
              "co-email",
              "co-phone",
              "co-address",
              "co-city",
              "co-state",
              "co-pincode",
            ];
            let valid = true;
            fields.forEach((fid) => {
              const el = document.getElementById(fid);
              const err = document.getElementById(fid + "-err");
              if (el && !el.value.trim()) {
                if (err) err.textContent = "This field is required.";
                el.classList.add("input-error");
                valid = false;
              } else {
                if (err) err.textContent = "";
                if (el) el.classList.remove("input-error");
              }
            });
            const phoneEl = document.getElementById("co-phone");
            const phoneErr = document.getElementById("co-phone-err");
            if (
              phoneEl &&
              phoneEl.value.trim() &&
              !/^\d{10}$/.test(phoneEl.value.trim())
            ) {
              if (phoneErr)
                phoneErr.textContent = "Enter a valid 10-digit phone number.";
              phoneEl.classList.add("input-error");
              valid = false;
            }
            const emailEl = document.getElementById("co-email");
            const emailErr = document.getElementById("co-email-err");
            if (
              emailEl &&
              emailEl.value.trim() &&
              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())
            ) {
              if (emailErr)
                emailErr.textContent = "Enter a valid email address.";
              emailEl.classList.add("input-error");
              valid = false;
            }
            if (!valid) return;
            const newOrderId = "ORD" + Date.now().toString().slice(-8);
            const newAwb =
              "BD" + Math.floor(Math.random() * 9000000000 + 1000000000);
            const today = new Date();
            const delivDate = new Date(today);
            delivDate.setDate(today.getDate() + 5);
            const fmtDate = (d) => d.toISOString().slice(0, 10);
            const now = today.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const todayStr = today.toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
            });
            const newOrder = {
              id: newOrderId,
              product: ProductStore.cart.map((c) => c.name).join(", "),
              img: ProductStore.cart[0]?.img || "📦",
              date: fmtDate(today),
              deliveryDate: fmtDate(delivDate),
              price: ProductStore.cartTotal(),
              qty: ProductStore.cartCount(),
              address:
                (document.getElementById("co-address")?.value || "") +
                ", " +
                (document.getElementById("co-city")?.value || ""),
              carrier: "BlueDart Express",
              awb: newAwb,
              currentStep: 0,
              steps: [
                {
                  label: "Order Placed",
                  icon: "📋",
                  time: `${todayStr}, ${now}`,
                  detail: "Your order has been confirmed and payment received.",
                },
                {
                  label: "Processing",
                  icon: "⚙️",
                  time: "—",
                  detail: "Seller will start packing soon.",
                },
                {
                  label: "Shipped",
                  icon: "📦",
                  time: "—",
                  detail: "Awaiting courier pickup.",
                },
                {
                  label: "Out for Delivery",
                  icon: "🚚",
                  time: "—",
                  detail: "Pending.",
                },
                {
                  label: "Delivered",
                  icon: "🏠",
                  time: "—",
                  detail: `Estimated: ${delivDate.toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}.`,
                },
              ],
            };
            TrackingStore.orders.unshift(newOrder);
            TrackingStore.activeOrder = newOrder;
            ProductStore.cart = [];
            ProductStore.checkoutStep = "success";
            this.render();
          });
      }

      if (step === "success") {
        document
          .getElementById("btn-back-to-products")
          ?.addEventListener("click", () => {
            ProductStore.checkoutStep = "listing";
            this.render();
          });
        document
          .getElementById("btn-track-order")
          ?.addEventListener("click", () => {
            this.data.dashboardTab = "tracking";
            ProductStore.checkoutStep = "listing";
            this.render();
          });
      }
    },

    bindTrackingEvents() {
      document
        .getElementById("trk-search-input")
        ?.addEventListener("input", (e) => {
          TrackingStore.searchInput = e.target.value;
        });
      document
        .getElementById("trk-search-form")
        ?.addEventListener("submit", (e) => {
          e.preventDefault();
          const result = TrackingStore.findOrder(TrackingStore.searchInput);
          if (result) {
            TrackingStore.activeOrder = result;
            this.render();
          } else {
            const errEl = document.getElementById("trk-search-err");
            if (errEl) {
              errEl.textContent = "No order found with this ID or AWB number.";
              errEl.style.display = "block";
              setTimeout(() => {
                errEl.textContent = "";
                errEl.style.display = "none";
              }, 3000);
            }
          }
        });
      document.querySelectorAll(".trk-order-card").forEach((card) => {
        card.addEventListener("click", () => {
          TrackingStore.activeOrder =
            TrackingStore.orders.find((o) => o.id === card.dataset.id) || null;
          this.render();
        });
      });
      document.querySelectorAll(".trk-hint-id").forEach((el) => {
        el.addEventListener("click", () => {
          const input = document.getElementById("trk-search-input");
          if (input) {
            input.value = el.textContent;
            TrackingStore.searchInput = el.textContent;
          }
        });
      });
      document.getElementById("btn-trk-back")?.addEventListener("click", () => {
        TrackingStore.activeOrder = null;
        this.render();
      });
      document
        .getElementById("btn-trk-refresh")
        ?.addEventListener("click", () => {
          const btn = document.getElementById("btn-trk-refresh");
          if (btn) {
            btn.textContent = "⟳ Refreshing...";
            btn.disabled = true;
          }
          setTimeout(() => {
            Notifications.toast("Tracking info is up to date.", "success");
            if (btn) {
              btn.textContent = "⟳ Refresh";
              btn.disabled = false;
            }
          }, 1200);
        });
    },

    _updateCartBadge() {
      const badge = document.getElementById("cart-count-badge");
      if (badge) badge.textContent = ProductStore.cartCount();
    },

    _getFilteredProducts() {
      let list = [...ProductStore.products];
      const q = this.data.productSearch.toLowerCase();
      const cat = this.data.productCategory;
      const sort = this.data.productSort;
      if (q)
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.desc.toLowerCase().includes(q),
        );
      if (cat !== "All") list = list.filter((p) => p.category === cat);
      if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
      if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
      if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
      if (sort === "reviews") list.sort((a, b) => b.reviews - a.reviews);
      return list;
    },

    _renderProductGrid() {
      const grid = document.getElementById("product-grid");
      if (!grid) return;
      const list = this._getFilteredProducts();
      const countEl = document.getElementById("product-count");
      if (countEl)
        countEl.textContent = `${list.length} result${list.length !== 1 ? "s" : ""}`;
      if (list.length === 0) {
        grid.innerHTML = `<div class="prod-no-results">😕 No products match your search.</div>`;
        return;
      }
      grid.innerHTML = list.map((p) => Components._productCard(p)).join("");
      grid.querySelectorAll(".btn-add-to-cart").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = parseInt(btn.dataset.id);
          ProductStore.addToCart(id);
          this._updateCartBadge();
          btn.textContent = "✓ Added";
          btn.style.background = "#10b981";
          setTimeout(() => {
            btn.textContent = "Add to Cart";
            btn.style.background = "";
          }, 1500);
          Notifications.toast("Added to cart!", "success");
        });
      });
      grid.querySelectorAll(".btn-buy-now").forEach((btn) => {
        btn.addEventListener("click", () => {
          ProductStore.addToCart(parseInt(btn.dataset.id));
          ProductStore.checkoutStep = "cart";
          this.render();
        });
      });
    },
  };

  const Notifications = {
    toast(msg, type = "success") {
      const existing = document.getElementById("toast-popup");
      if (existing) existing.remove();
      const el = document.createElement("div");
      el.id = "toast-popup";
      el.className = `toast-popup toast-${type}`;
      el.textContent = msg;
      if (liveAnnouncer) {
        liveAnnouncer.textContent = "";
        setTimeout(() => {
          liveAnnouncer.textContent = msg;
        }, 50);
      }
      document.body.appendChild(el);
      setTimeout(() => el.classList.add("toast-visible"), 10);
      setTimeout(() => {
        el.classList.remove("toast-visible");
        setTimeout(() => el.remove(), 300);
      }, 3000);
    },
  };

  const Components = {
    LandingView() {
      return `
        <div class="card">
          <h1>Enterprise Core</h1>
          <p>Welcome to modern Full-Stack development architecture. Click on "Get Started" to Login.</p>
          <button class="action-btn" id="get-started-btn">Get Started</button>
        </div>`;
    },

    LoginView(successMsg, errorMsg) {
      const banner = successMsg
        ? `<div class="success-banner" role="status">${successMsg}</div>`
        : "";
      const errorBlock = errorMsg
        ? `<div class="error-message-text" id="login-error-desc" role="alert">${errorMsg}</div>`
        : "";
      return `
        <div class="card">
          ${banner}
          <h2>Sign In</h2>
          <p>Please enter your credentials to access your account.</p>
          <form id="auth-form" novalidate>
            <div class="form-group">
              <label for="login-email">Email Address</label>
              <input type="email" id="login-email" placeholder="name@domain.com" autocomplete="username" ${errorMsg ? 'aria-describedby="login-error-desc" aria-invalid="true"' : ""}>
              ${errorBlock}
            </div>
            <div class="form-group">
              <label for="login-password">Password</label>
              <input type="password" id="login-password" placeholder="••••••••" autocomplete="current-password">
            </div>
            <div class="button-group">
              <button type="submit" class="action-btn">Log In</button>
              <button type="button" class="btn-secondary" id="go-to-signup">New? Create New Account</button>
            </div>
          </form>
        </div>`;
    },

    SignUpView() {
      return `
        <div class="card">
          <h2>Register</h2>
          <p>Create a new Account Here</p>
          <form id="signup-form">
            <div class="form-group">
              <label for="signup-username">Full Name</label>
              <input type="text" id="signup-username" placeholder="Alex Mercer" required>
            </div>
            <div class="form-group">
              <label for="signup-email">Enter Your Email id</label>
              <input type="email" id="signup-email" placeholder="name@domain.com" required autocomplete="email">
            </div>
            <div class="form-group">
              <label for="signup-password">Please Create a Password</label>
              <input type="password" id="signup-password" placeholder="••••••••" required autocomplete="new-password">
            </div>
            <div class="button-group">
              <button type="submit" class="action-btn">Click here to Create Account</button>
              <button type="button" class="btn-secondary" id="back-to-login">Click Here to return to main page</button>
            </div>
          </form>
        </div>`;
    },

    DashboardView(email, tab, settingsTab) {
      const tabs = {
        console: this.ConsoleTab(),
        keymanager: this.KeyManagerTab(),
        settings: this.SettingsTab(settingsTab),
        products: this.ProductsTab(),
        tracking: this.TrackingTab(),
      };
      const activeContent = tabs[tab] || tabs.console;
      const isWide = tab === "products" || tab === "tracking";
      const navItem = (id, icon, label) => {
        const isSelected = tab === id;
        return `<a href="#" class="nav-item${isSelected ? " active" : ""}" data-tab="${id}" role="tab" aria-selected="${isSelected}">${icon} ${label}</a>`;
      };
      return `
        <div class="dashboard-viewport">
          <aside class="sidebar">
            <div>
              <h3 style="letter-spacing:0.05em;font-size:1.25rem;">🚀 FSD MATRIX</h3>
              <nav class="sidebar-menu" role="tablist" aria-label="Dashboard Navigation">
                ${navItem("console", "📊", "Console Node")}
                ${navItem("keymanager", "🔑", "Key Manager")}
                ${navItem("settings", "⚙️", "Settings Config")}
                ${navItem("products", "🛒", "Product Listing")}
                ${navItem("tracking", "📍", "Delivery Tracking")}
              </nav>
            </div>
            <div>
              <div class="sidebar-user-info">
                <div class="status-dot" style="display:inline-block;margin-right:6px;"></div>
                <span style="font-size:0.78rem;color:#64748b;word-break:break-all;">${email}</span>
              </div>
              <button type="button" class="btn-sidebar-logout" id="sidebar-logout-btn" style="margin-top:0.75rem;">Log Out</button>
            </div>
          </aside>
          <main class="main-content${isWide ? " main-content-products" : ""}" role="tabpanel">
            <header class="content-header">
              <div>
                <h2 style="font-size:1.75rem;color:#fff;">${this._tabTitle(tab)}</h2>
                <p style="margin:0.25rem 0 0 0;">${this._tabSubtitle(tab)}</p>
              </div>
              <div class="user-profile-badge">
                <div class="status-dot"></div>
                <span id="live-utc-clock" style="font-size:0.8rem;color:#94a3b8;font-variant-numeric:tabular-nums;">--:--:-- UTC</span>
              </div>
            </header>
            ${activeContent}
          </main>
        </div>`;
    },

    _tabTitle(tab) {
      return (
        {
          console: "Control Console Workspace",
          keymanager: "Key Manager",
          settings: "Settings Config",
          products: "Product Listing",
          tracking: "Delivery Tracking",
        }[tab] || "Dashboard"
      );
    },
    _tabSubtitle(tab) {
      return (
        {
          console: "Real-time node metrics processing pipeline active.",
          keymanager: "Manage your API keys, rotate and revoke credentials.",
          settings:
            "Configure account, security, notifications and appearance.",
          products: "Search, add, buy and manage your product catalogue.",
          tracking: "Track your orders in real-time from dispatch to doorstep.",
        }[tab] || ""
      );
    },

    ConsoleTab() {
      const completed = LogStore.entries.filter(
        (e) => e.status === "COMPLETED",
      ).length;
      const attention = LogStore.entries.filter(
        (e) => e.status === "ATTENTION",
      ).length;
      const failed = LogStore.entries.filter(
        (e) => e.status === "FAILED",
      ).length;
      const total = LogStore.entries.length || 1;

      const rows = LogStore.entries
        .map((e, i) => {
          const bc =
            e.status === "COMPLETED"
              ? "success"
              : e.status === "ATTENTION"
                ? "warning"
                : "danger";
          const dotColor =
            e.status === "COMPLETED"
              ? "#10b981"
              : e.status === "ATTENTION"
                ? "#f59e0b"
                : "#ef4444";
          const rowClass = i === 0 ? " clog-row-new" : "";
          return `
          <tr class="clog-row${rowClass}">
            <td class="clog-td-ts">
              <span class="clog-ts-dot" style="background:${dotColor};box-shadow:0 0 6px ${dotColor}80;"></span>
              <span class="clog-ts-text">${e.ts}</span>
            </td>
            <td class="clog-td-ctx">${e.context}</td>
            <td class="clog-td-badge"><span class="badge-tag ${bc}">${e.status}</span></td>
          </tr>`;
        })
        .join("");

      return `
        <div class="console-shell">

          <div class="cstat-grid">
            <div class="cstat-card cstat-green">
              <div class="cstat-top">
                <div class="cstat-icon-wrap cstat-icon-green">✅</div>
                <div class="cstat-trend">↑ Live</div>
              </div>
              <div class="cstat-value" id="stat-completed">${completed}</div>
              <div class="cstat-label">User Completion Status</div>
              <div class="cstat-bar-track"><div class="cstat-bar-fill cstat-fill-green" style="width:${Math.min((completed / total) * 100, 100)}%" id="stat-completed-bar"></div></div>
            </div>

            <div class="cstat-card cstat-amber">
              <div class="cstat-top">
                <div class="cstat-icon-wrap cstat-icon-amber">⚠️</div>
                <div class="cstat-trend cstat-trend-amber">● Active</div>
              </div>
              <div class="cstat-value" id="stat-attention">${attention}</div>
              <div class="cstat-label">Active Learnings (Attention)</div>
              <div class="cstat-bar-track"><div class="cstat-bar-fill cstat-fill-amber" style="width:${Math.min((attention / total) * 100, 100)}%" id="stat-attention-bar"></div></div>
            </div>

            <div class="cstat-card cstat-red">
              <div class="cstat-top">
                <div class="cstat-icon-wrap cstat-icon-red">❌</div>
                <div class="cstat-trend cstat-trend-red">● Monitor</div>
              </div>
              <div class="cstat-value" id="stat-failed">${failed}</div>
              <div class="cstat-label">Failure</div>
              <div class="cstat-bar-track"><div class="cstat-bar-fill cstat-fill-red" style="width:${Math.min((failed / total) * 100, 100)}%" id="stat-failed-bar"></div></div>
            </div>
          </div>

          <div class="clog-panel">
            <div class="clog-header">
              <div class="clog-title-wrap">
                <span class="clog-title-icon">📋</span>
                <div>
                  <div class="clog-title">Pipeline Activity History Logs</div>
                  <div class="clog-subtitle" id="clog-subtitle">${LogStore.entries.length} event${LogStore.entries.length !== 1 ? "s" : ""} recorded · updates live</div>
                </div>
              </div>
              <form id="log-add-form" class="clog-add-form">
                <div class="clog-input-wrap">
                  <span class="clog-input-icon">✏️</span>
                  <input id="log-context-input" aria-label="Event Context" type="text" placeholder="Describe the event context..." class="clog-input" />
                </div>
                <select id="log-status-select" aria-label="Log Status Selection" class="clog-select">
                  <option value="COMPLETED">✅ COMPLETED</option>
                  <option value="ATTENTION">⚠️ ATTENTION</option>
                  <option value="FAILED">❌ FAILED</option>
                </select>
                <button type="submit" class="clog-add-btn">+ Add Log</button>
              </form>
            </div>

            <div class="clog-table-wrap">
              <table class="clog-table">
                <thead>
                  <tr>
                    <th scope="col" class="clog-th">Timestamp</th>
                    <th scope="col" class="clog-th">Event Context</th>
                    <th scope="col" class="clog-th clog-th-right">Status</th>
                  </tr>
                </thead>
                <tbody id="log-table-body">${rows}</tbody>
              </table>
              ${LogStore.entries.length === 0 ? `<div class="clog-empty">No log entries yet. Add your first event above.</div>` : ""}
            </div>
          </div>

        </div>`;
    },

    KeyManagerTab() {
      const rows = KeyStore.keys
        .map((k) => {
          const bc = k.status === "active" ? "success" : "danger";
          const btn =
            k.status === "active"
              ? `<button class="btn-revoke-key" data-id="${k.id}" aria-label="Revoke key ${k.label}" style="background:transparent;border:1px solid #ef4444;color:#ef4444;padding:0.25rem 0.65rem;border-radius:5px;font-size:0.75rem;cursor:pointer;transition:all 0.2s;">Revoke</button>`
              : `<span style="color:#475569;font-size:0.75rem;">—</span>`;
          return `<tr><td style="font-weight:600;">${k.label}</td><td><code style="font-size:0.82rem;color:#94a3b8;letter-spacing:0.03em;">${k.value}</code></td><td style="white-space:nowrap;">${k.created}</td><td><span class="badge-tag ${bc}">${k.status.toUpperCase()}</span></td><td>${btn}</td></tr>`;
        })
        .join("");
      return `
        <section class="data-table-container" style="margin-bottom:1.25rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:0.75rem;">
            <h3 style="margin:0;">API Keys</h3>
            <form id="key-add-form" style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;">
              <input id="key-label-input" aria-label="Key Label Description" type="text" placeholder="Key label (e.g. Mobile App Key)" style="min-width:210px;background:#0f172a;border:1px solid #334155;color:#f8fafc;padding:0.5rem 0.75rem;border-radius:6px;font-size:0.85rem;outline:none;" />
              <button type="submit" class="action-btn" style="padding:0.5rem 1rem;font-size:0.85rem;width:auto;">+ Generate Key</button>
            </form>
          </div>
          <div style="overflow-x:auto;">
            <table class="log-table">
              <thead><tr><th scope="col">Label</th><th scope="col">Key Value</th><th scope="col">Created</th><th scope="col">Status</th><th scope="col">Action</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </section>
        <section class="data-table-container" aria-label="Key Management Documentation">
          <h3 style="margin-bottom:0.75rem;">Key Usage Guidelines</h3>
          <ul style="color:#94a3b8;font-size:0.9rem;line-height:1.9;padding-left:1.25rem;margin:0;">
            <li>Never expose API keys in client-side code or public repositories.</li>
            <li>Rotate keys every 90 days as a best practice.</li>
            <li>Revoke unused or compromised keys immediately.</li>
            <li>Use environment variables to inject keys at runtime.</li>
            <li>Restrict key permissions to only the required scopes.</li>
          </ul>
        </section>`;
    },

    SettingsTab(activeStab) {
      const stabs = ["profile", "security", "notifications", "appearance"];
      const stabLabels = {
        profile: "👤 Profile",
        security: "🔒 Security",
        notifications: "🔔 Notifications",
        appearance: "🎨 Appearance",
      };
      const tabBar = stabs
        .map((s) => {
          const isSelected = s === activeStab;
          return `<button class="settings-tab-btn${isSelected ? " settings-tab-active" : ""}" data-stab="${s}" role="tab" aria-selected="${isSelected}">${stabLabels[s]}</button>`;
        })
        .join("");
      const contentMap = {
        profile: this._SettingsProfile(),
        security: this._SettingsSecurity(),
        notifications: this._SettingsNotifications(),
        appearance: this._SettingsAppearance(),
      };
      return `
        <section class="settings-shell">
          <div class="settings-tab-bar" role="tablist" aria-label="Configuration Options">${tabBar}</div>
          <div class="settings-body" role="tabpanel">${contentMap[activeStab] || contentMap.profile}</div>
        </section>`;
    },

    _SettingsProfile() {
      const p = SettingsStore.profile;
      return `
        <form id="settings-profile-form">
          <h3 class="settings-section-title">Account Profile</h3>
          <div class="settings-field"><label for="s-display-name">Display Name</label><input id="s-display-name" type="text" value="${p.displayName}" /></div>
          <div class="settings-field">
            <label for="s-email-disabled">Email Address</label>
            <input id="s-email-disabled" type="email" value="${AppState.data.userEmail}" disabled style="opacity:0.45;cursor:not-allowed;" aria-describedby="s-email-hint" />
            <small id="s-email-hint">Email cannot be changed here. Contact support.</small>
          </div>
          <div class="settings-field">
            <label for="s-timezone">Timezone</label>
            <select id="s-timezone">${["UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Asia/Kolkata", "Asia/Tokyo", "Australia/Sydney"].map((tz) => `<option value="${tz}" ${p.timezone === tz ? "selected" : ""}>${tz}</option>`).join("")}</select>
          </div>
          <div class="settings-field">
            <label for="s-language">Language</label>
            <select id="s-language">
              <option value="en" ${p.language === "en" ? "selected" : ""}>English</option>
              <option value="fr" ${p.language === "fr" ? "selected" : ""}>French</option>
              <option value="de" ${p.language === "de" ? "selected" : ""}>German</option>
              <option value="ja" ${p.language === "ja" ? "selected" : ""}>Japanese</option>
            </select>
          </div>
          <button type="submit" class="action-btn settings-save-btn">Save Profile</button>
        </form>`;
    },

    _SettingsSecurity() {
      const s = SettingsStore.security;
      return `
        <form id="settings-security-form">
          <h3 class="settings-section-title">Security Settings</h3>
          <div class="settings-field settings-toggle-row">
            <div>
              <label for="s-2fa" style="font-size:0.95rem;color:#f8fafc;font-weight:600;display:block;">Two-Factor Authentication (2FA)</label>
              <small>Require a verification code on every login.</small>
            </div>
            <label class="toggle-switch"><input type="checkbox" id="s-2fa" ${s.twoFA ? "checked" : ""}><span class="toggle-slider"></span></label>
          </div>
          <div class="settings-field">
            <label for="s-session-timeout">Session Timeout (minutes)</label>
            <select id="s-session-timeout">${["15", "30", "60", "120", "480"].map((v) => `<option value="${v}" ${s.sessionTimeout === v ? "selected" : ""}>${v} min</option>`).join("")}</select>
          </div>
          <div class="settings-field">
            <label for="s-curr-pass">Change Password</label>
            <input id="s-curr-pass" type="password" placeholder="Current password" style="margin-bottom:0.5rem;" autocomplete="current-password" />
            <input id="s-new-pass" aria-label="New Password" type="password" placeholder="New password" style="margin-bottom:0.5rem;" autocomplete="new-password" />
            <input id="s-conf-pass" aria-label="Confirm New Password" type="password" placeholder="Confirm new password" autocomplete="new-password" />
          </div>
          <button type="submit" class="action-btn settings-save-btn">Update Security</button>
        </form>`;
    },

    _SettingsNotifications() {
      const n = SettingsStore.notifications;
      const tr = (id, label, desc, checked) => `
        <div class="settings-field settings-toggle-row">
          <div><label for="${id}" style="font-size:0.95rem;color:#f8fafc;font-weight:600;display:block;">${label}</label><small>${desc}</small></div>
          <label class="toggle-switch"><input type="checkbox" id="${id}" ${checked ? "checked" : ""}><span class="toggle-slider"></span></label>
        </div>`;
      return `
        <form id="settings-notifications-form">
          <h3 class="settings-section-title">Notification Preferences</h3>
          ${tr("s-email-alerts", "Email Alerts", "Receive critical system alerts via email.", n.emailAlerts)}
          ${tr("s-slack-alerts", "Slack Alerts", "Push notifications to your Slack workspace.", n.slackAlerts)}
          ${tr("s-weekly-report", "Weekly Report", "Receive a weekly pipeline activity summary.", n.weeklyReport)}
          <button type="submit" class="action-btn settings-save-btn">Save Preferences</button>
        </form>`;
    },

    _SettingsAppearance() {
      const a = SettingsStore.appearance;
      return `
        <form id="settings-appearance-form">
          <h3 class="settings-section-title">Appearance</h3>
          <div class="settings-field">
            <label for="s-theme">Theme</label>
            <select id="s-theme">
              <option value="dark"  ${a.theme === "dark" ? "selected" : ""}>Dark (Default)</option>
              <option value="light" ${a.theme === "light" ? "selected" : ""}>Light</option>
              <option value="auto"  ${a.theme === "auto" ? "selected" : ""}>Auto (System)</option>
            </select>
          </div>
          <div class="settings-field">
            <label for="s-density">Density</label>
            <select id="s-density">
              <option value="comfortable" ${a.density === "comfortable" ? "selected" : ""}>Comfortable</option>
              <option value="compact"     ${a.density === "compact" ? "selected" : ""}>Compact</option>
              <option value="spacious"    ${a.density === "spacious" ? "selected" : ""}>Spacious</option>
            </select>
          </div>
          <div class="settings-field settings-toggle-row" style="margin-top:0.5rem;">
            <div><label for="s-reduce-motion" style="font-size:0.95rem;color:#f8fafc;font-weight:600;display:block;">Reduce Motion</label><small>Disable animations for accessibility.</small></div>
            <label class="toggle-switch"><input type="checkbox" id="s-reduce-motion"><span class="toggle-slider"></span></label>
          </div>
          <button type="submit" class="action-btn settings-save-btn">Apply Appearance</button>
        </form>`;
    },

    ProductsTab() {
      const step = ProductStore.checkoutStep;
      if (step === "cart") return this._CartView();
      if (step === "checkout") return this._CheckoutView();
      if (step === "success") return this._OrderSuccessView();
      return this._ProductListingView();
    },

    _productCard(p) {
      const discount =
        p.originalPrice > p.price
          ? Math.round((1 - p.price / p.originalPrice) * 100)
          : 0;
      const stars =
        "★".repeat(Math.floor(p.rating)) +
        (p.rating % 1 >= 0.5 ? "½" : "") +
        "☆".repeat(5 - Math.ceil(p.rating));
      return `
        <div class="prod-card">
          ${p.badge ? `<div class="prod-badge">${p.badge}</div>` : ""}
          <div class="prod-img">${p.img}</div>
          <div class="prod-info">
            <div class="prod-category">${p.category}</div>
            <div class="prod-name">${p.name}</div>
            <div class="prod-rating"><span class="prod-stars">${stars}</span><span class="prod-review-count">(${p.reviews.toLocaleString()})</span></div>
            <div class="prod-pricing">
              <span class="prod-price">₹${p.price.toLocaleString()}</span>
              ${discount > 0 ? `<span class="prod-original">₹${p.originalPrice.toLocaleString()}</span><span class="prod-discount">${discount}% off</span>` : ""}
            </div>
            <div class="prod-stock ${p.stock <= 5 ? "prod-stock-low" : ""}">${p.stock <= 5 ? `⚠️ Only ${p.stock} left` : `✓ In Stock (${p.stock})`}</div>
            <div class="prod-desc">${p.desc}</div>
            <div class="prod-actions">
              <button class="btn-add-to-cart prod-btn-cart" data-id="${p.id}">Add to Cart</button>
              <button class="btn-buy-now prod-btn-buy" data-id="${p.id}">Buy Now</button>
            </div>
          </div>
        </div>`;
    },

    _ProductListingView() {
      const categories = [
        "All",
        ...new Set(ProductStore.products.map((p) => p.category)),
      ];
      const list = AppState._getFilteredProducts();
      const cartCount = ProductStore.cartCount();
      return `
        <div class="prod-shell">
          <div class="prod-topbar">
            <div class="prod-search-wrap">
              <span class="prod-search-icon">🔍</span>
              <input id="prod-search-input" type="text" placeholder="Search products by name, category..." value="${AppState.data.productSearch}" class="prod-search-input" />
            </div>
            <div class="prod-filters">
              <select id="prod-category-filter" class="prod-select">
                ${categories.map((c) => `<option value="${c}" ${AppState.data.productCategory === c ? "selected" : ""}>${c}</option>`).join("")}
              </select>
              <select id="prod-sort-select" class="prod-select">
                <option value="default"    ${AppState.data.productSort === "default" ? "selected" : ""}>Sort: Featured</option>
                <option value="price-asc"  ${AppState.data.productSort === "price-asc" ? "selected" : ""}>Price: Low to High</option>
                <option value="price-desc" ${AppState.data.productSort === "price-desc" ? "selected" : ""}>Price: High to Low</option>
                <option value="rating"     ${AppState.data.productSort === "rating" ? "selected" : ""}>Avg. Rating</option>
                <option value="reviews"    ${AppState.data.productSort === "reviews" ? "selected" : ""}>Most Reviews</option>
              </select>
            </div>
            <div class="prod-topbar-actions">
              <button class="prod-btn-add-new" id="btn-show-add-product">+ Add Product</button>
              <button class="prod-btn-cart-view" id="btn-checkout-from-listing">
                🛒 Cart <span id="cart-count-badge" class="cart-badge">${cartCount}</span>
              </button>
            </div>
          </div>
          <div class="prod-results-bar">
            <span id="product-count">${list.length} result${list.length !== 1 ? "s" : ""}</span>
            <span class="prod-free-delivery">🚚 FREE delivery on orders above ₹499</span>
          </div>
          <div id="product-grid" class="prod-grid">
            ${list.length === 0 ? `<div class="prod-no-results">😕 No products match your search.</div>` : list.map((p) => this._productCard(p)).join("")}
          </div>
        </div>
        <div id="add-product-modal" class="prod-modal-overlay" style="display:none;">
          <div class="prod-modal">
            <div class="prod-modal-header">
              <h3>Add New Product</h3>
              <button id="btn-close-modal" class="prod-modal-close">✕</button>
            </div>
            <form id="add-product-form" class="prod-modal-form">
              <div class="prod-form-row">
                <div class="prod-form-field"><label>Product Name *</label><input id="np-name" type="text" placeholder="e.g. Wireless Mouse" required /></div>
                <div class="prod-form-field"><label>Category *</label>
                  <select id="np-category"><option>Electronics</option><option>Furniture</option><option>Storage</option><option>Accessories</option><option>Clothing</option><option>Books</option><option>Other</option></select>
                </div>
              </div>
              <div class="prod-form-row">
                <div class="prod-form-field"><label>Selling Price (₹) *</label><input id="np-price" type="number" min="1" placeholder="1299" required /></div>
                <div class="prod-form-field"><label>Original Price (₹)</label><input id="np-original" type="number" min="1" placeholder="1999" /></div>
              </div>
              <div class="prod-form-row">
                <div class="prod-form-field"><label>Stock Quantity</label><input id="np-stock" type="number" min="1" placeholder="25" /></div>
                <div class="prod-form-field"><label>Rating (1–5)</label><input id="np-rating" type="number" min="1" max="5" step="0.1" placeholder="4.2" /></div>
              </div>
              <div class="prod-form-row">
                <div class="prod-form-field"><label>Emoji Icon</label><input id="np-img" type="text" placeholder="📦" maxlength="4" /></div>
                <div class="prod-form-field"><label>Short Description</label><input id="np-desc" type="text" placeholder="Brief product description" /></div>
              </div>
              <div class="prod-modal-footer">
                <button type="button" id="btn-close-modal-2" class="btn-secondary" style="width:auto;padding:0.65rem 1.5rem;">Cancel</button>
                <button type="submit" class="action-btn" style="width:auto;padding:0.65rem 1.5rem;">Add Product</button>
              </div>
            </form>
          </div>
        </div>`;
    },

    _CartView() {
      const cart = ProductStore.cart;
      const total = ProductStore.cartTotal();
      const shipping = total > 499 ? 0 : 49;
      const tax = Math.round(total * 0.18);
      const grandTotal = total + shipping + tax;
      const rows =
        cart.length === 0
          ? `<div class="cart-empty">🛒 Your cart is empty. <button class="prod-link-btn" id="btn-continue-shopping">Browse Products</button></div>`
          : cart
              .map(
                (item) => `
          <div class="cart-item">
            <div class="cart-item-img">${item.img}</div>
            <div class="cart-item-details">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-category">${item.category}</div>
              <div class="cart-item-price">₹${item.price.toLocaleString()} each</div>
              <div class="cart-item-actions">
                <label style="font-size:0.82rem;color:#64748b;">Qty:</label>
                <input type="number" class="cart-qty-input" data-id="${item.id}" value="${item.qty}" min="1" max="${item.stock}" style="width:56px;background:#0f172a;border:1px solid #334155;color:#f8fafc;padding:0.25rem 0.4rem;border-radius:5px;font-size:0.85rem;outline:none;" />
                <button class="btn-remove-cart" data-id="${item.id}" style="background:transparent;border:none;color:#ef4444;cursor:pointer;font-size:0.82rem;font-weight:600;">Remove</button>
              </div>
            </div>
            <div class="cart-item-subtotal">₹${(item.price * item.qty).toLocaleString()}</div>
          </div>`,
              )
              .join("");
      return `
        <div class="cart-shell">
          <div class="cart-main">
            <div class="cart-header-bar">
              <h3 style="margin:0;font-size:1.1rem;">Shopping Cart (${cart.length} item${cart.length !== 1 ? "s" : ""})</h3>
              <button class="prod-link-btn" id="btn-continue-shopping">← Continue Shopping</button>
            </div>
            <div class="cart-items">${rows}</div>
          </div>
          <div class="cart-summary">
            <h3 style="margin:0 0 1rem 0;font-size:1rem;color:#f8fafc;">Order Summary</h3>
            <div class="cart-summary-row"><span>Subtotal (${cart.reduce((s, c) => s + c.qty, 0)} items)</span><span>₹${total.toLocaleString()}</span></div>
            <div class="cart-summary-row"><span>Shipping</span><span>${shipping === 0 ? '<span style="color:#10b981;">FREE</span>' : "₹" + shipping}</span></div>
            <div class="cart-summary-row"><span>GST (18%)</span><span>₹${tax.toLocaleString()}</span></div>
            <div class="cart-summary-divider"></div>
            <div class="cart-summary-row cart-summary-total"><span>Grand Total</span><span>₹${grandTotal.toLocaleString()}</span></div>
            ${shipping === 0 ? '<div class="cart-free-delivery-msg">🎉 You qualify for FREE delivery!</div>' : `<div class="cart-free-delivery-msg" style="color:#fbbf24;">Add ₹${499 - total + 1} more for FREE delivery</div>`}
            <button class="action-btn" id="btn-proceed-checkout" style="margin-top:1rem;">Proceed to Checkout →</button>
          </div>
        </div>`;
    },

    _CheckoutView() {
      const total = ProductStore.cartTotal();
      const shipping = total > 499 ? 0 : 49;
      const tax = Math.round(total * 0.18);
      const grandTotal = total + shipping + tax;
      const field = (id, label, type, placeholder, half) => `
        <div class="co-field${half ? " co-field-half" : ""}">
          <label for="${id}">${label} *</label>
          <input id="${id}" type="${type}" placeholder="${placeholder}" autocomplete="off" />
          <span class="co-field-error" id="${id}-err"></span>
        </div>`;
      return `
        <div class="checkout-shell">
          <div class="checkout-main">
            <div class="checkout-step-bar">
              <span class="co-step co-step-done">🛒 Cart</span>
              <span class="co-step-arrow">›</span>
              <span class="co-step co-step-active">📦 Delivery</span>
              <span class="co-step-arrow">›</span>
              <span class="co-step">✅ Confirm</span>
            </div>
            <div class="checkout-card">
              <h3 style="margin:0 0 1.25rem 0;font-size:1rem;color:#38bdf8;">Delivery Address</h3>
              <form id="checkout-form" novalidate>
                <div class="co-form-grid">
                  ${field("co-fullname", "Full Name", "text", "John Doe", false)}
                  ${field("co-email", "Email Address", "email", "john@example.com", false)}
                  <div class="co-form-row">${field("co-phone", "Phone Number", "tel", "10-digit mobile number", true)}${field("co-pincode", "PIN Code", "text", "600001", true)}</div>
                  ${field("co-address", "Full Address", "text", "House No, Street, Area", false)}
                  <div class="co-form-row">${field("co-city", "City", "text", "Chennai", true)}${field("co-state", "State", "text", "Tamil Nadu", true)}</div>
                </div>
                <div class="checkout-payment-section">
                  <h3 style="margin:0 0 0.75rem 0;font-size:1rem;color:#38bdf8;">Payment Method</h3>
                  <div class="payment-options">
                    <label class="payment-option"><input type="radio" name="payment" value="cod" checked /> Cash on Delivery</label>
                    <label class="payment-option"><input type="radio" name="payment" value="upi" /> UPI</label>
                    <label class="payment-option"><input type="radio" name="payment" value="card" /> Credit / Debit Card</label>
                    <label class="payment-option"><input type="radio" name="payment" value="netbanking" /> Net Banking</label>
                  </div>
                </div>
                <div style="display:flex;gap:1rem;margin-top:1.5rem;flex-wrap:wrap;">
                  <button type="button" class="btn-secondary" id="btn-back-to-cart" style="width:auto;padding:0.75rem 1.5rem;">← Back to Cart</button>
                  <button type="submit" class="action-btn" style="width:auto;padding:0.75rem 2rem;">Place Order ✓</button>
                </div>
              </form>
            </div>
          </div>
          <div class="checkout-summary">
            <h3 style="margin:0 0 1rem 0;font-size:1rem;color:#f8fafc;">Order Summary</h3>
            ${ProductStore.cart.map((item) => `<div class="co-summary-item"><span>${item.img} ${item.name} × ${item.qty}</span><span>₹${(item.price * item.qty).toLocaleString()}</span></div>`).join("")}
            <div class="cart-summary-divider" style="margin:0.75rem 0;"></div>
            <div class="cart-summary-row"><span>Subtotal</span><span>₹${total.toLocaleString()}</span></div>
            <div class="cart-summary-row"><span>Shipping</span><span>${shipping === 0 ? '<span style="color:#10b981;">FREE</span>' : "₹" + shipping}</span></div>
            <div class="cart-summary-row"><span>GST (18%)</span><span>₹${tax.toLocaleString()}</span></div>
            <div class="cart-summary-divider" style="margin:0.75rem 0;"></div>
            <div class="cart-summary-row cart-summary-total"><span>Grand Total</span><span>₹${grandTotal.toLocaleString()}</span></div>
          </div>
        </div>`;
    },

    _OrderSuccessView() {
      const order = TrackingStore.activeOrder;
      const orderId = order
        ? order.id
        : "ORD" + Date.now().toString().slice(-8);
      return `
        <div class="order-success-shell">
          <div class="order-success-card">
            <div class="order-success-icon">✅</div>
            <h2 style="color:#10b981;margin:0.5rem 0;">Order Placed Successfully!</h2>
            <p style="color:#94a3b8;margin:0 0 0.5rem 0;">Thank you for your order. We'll deliver it soon.</p>
            <div class="order-id-badge">Order ID: ${orderId}</div>
            <div class="order-success-steps">
              <div class="order-step order-step-done">✓ Order Confirmed</div>
              <div class="order-step-line"></div>
              <div class="order-step">📦 Processing</div>
              <div class="order-step-line"></div>
              <div class="order-step">🚚 Out for Delivery</div>
              <div class="order-step-line"></div>
              <div class="order-step">🏠 Delivered</div>
            </div>
            <div style="display:flex;gap:1rem;margin-top:1.5rem;justify-content:center;flex-wrap:wrap;">
              <button class="btn-secondary" id="btn-back-to-products" style="width:auto;padding:0.65rem 1.5rem;">Continue Shopping</button>
              <button class="action-btn" id="btn-track-order" style="width:auto;padding:0.65rem 1.5rem;">📍 Track My Order</button>
            </div>
          </div>
        </div>`;
    },

    TrackingTab() {
      const order = TrackingStore.activeOrder;
      if (order) return this._TrackingDetailView(order);
      return this._TrackingListView();
    },

    _TrackingListView() {
      const orderCards = TrackingStore.orders
        .map((o) => {
          const done = o.currentStep >= 4;
          const activeLabel =
            o.steps[Math.min(o.currentStep, o.steps.length - 1)].label;
          const badgeColor = done
            ? "#10b981"
            : o.currentStep === 3
              ? "#f59e0b"
              : "#38bdf8";
          const badgeBg = done
            ? "rgba(16,185,129,0.15)"
            : o.currentStep === 3
              ? "rgba(245,158,11,0.15)"
              : "rgba(56,189,248,0.12)";
          return `
          <div class="trk-order-card" data-id="${o.id}">
            <div class="trk-card-icon">${o.img}</div>
            <div class="trk-card-info">
              <div class="trk-card-name">${o.product.length > 45 ? o.product.slice(0, 45) + "…" : o.product}</div>
              <div class="trk-card-meta">
                <span>Order: <strong>${o.id}</strong></span>
                <span>·</span>
                <span>₹${(o.price * o.qty).toLocaleString()}</span>
                <span>·</span>
                <span>${o.date}</span>
              </div>
              <div class="trk-card-awb">AWB: ${o.awb} · ${o.carrier}</div>
            </div>
            <div class="trk-card-status" style="background:${badgeBg};color:${badgeColor};">
              ${done ? "" : '<span class="trk-pulse-dot" style="display:inline-block;width:7px;height:7px;background:currentColor;border-radius:50%;margin-right:5px;transition:opacity 0.4s;"></span>'}
              ${activeLabel}
            </div>
          </div>`;
        })
        .join("");

      return `
        <div class="trk-shell">
          <div class="trk-search-section">
            <form id="trk-search-form" class="trk-search-form">
              <div class="trk-search-wrap">
                <span style="font-size:1.1rem;">📍</span>
                <input id="trk-search-input" type="text" placeholder="Enter Order ID (e.g. ORD82941057) or AWB number..." class="prod-search-input" value="${TrackingStore.searchInput}" />
                <button type="submit" class="prod-btn-add-new" style="white-space:nowrap;flex-shrink:0;">Track →</button>
              </div>
              <span class="co-field-error" id="trk-search-err" style="display:none;margin-top:0.4rem;"></span>
            </form>
            <div class="trk-hint">💡 Try: <span class="trk-hint-id">ORD82941057</span> · <span class="trk-hint-id">ORD73610284</span> · <span class="trk-hint-id">ORD61038492</span></div>
          </div>

          <div class="trk-summary-strip">
            <div class="trk-summary-box"><div class="trk-summary-num">${TrackingStore.orders.length}</div><div class="trk-summary-lbl">Total Orders</div></div>
            <div class="trk-summary-box"><div class="trk-summary-num" style="color:#f59e0b;">${TrackingStore.orders.filter((o) => o.currentStep === 3).length}</div><div class="trk-summary-lbl">Out for Delivery</div></div>
            <div class="trk-summary-box"><div class="trk-summary-num" style="color:#10b981;">${TrackingStore.orders.filter((o) => o.currentStep >= 4).length}</div><div class="trk-summary-lbl">Delivered</div></div>
            <div class="trk-summary-box"><div class="trk-summary-num" style="color:#38bdf8;">${TrackingStore.orders.filter((o) => o.currentStep < 3).length}</div><div class="trk-summary-lbl">In Transit</div></div>
          </div>

          <div class="trk-orders-list">
            <h3 style="margin:0 0 0.75rem 0;font-size:0.95rem;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Your Orders — click to track</h3>
            ${orderCards}
          </div>
        </div>`;
    },

    _TrackingDetailView(order) {
      const progressPct = Math.min(
        (order.currentStep / (order.steps.length - 1)) * 100,
        100,
      );
      const stepNodes = order.steps
        .map((s, i) => {
          const done = i < order.currentStep;
          const active = i === order.currentStep;
          const circleColor = done ? "#10b981" : active ? "#38bdf8" : "#334155";
          const textColor = done ? "#10b981" : active ? "#38bdf8" : "#475569";
          return `
          <div class="trk-step${active ? " trk-step-active" : ""}">
            <div class="trk-step-circle" style="background:${circleColor};border-color:${circleColor};">
              ${done ? "✓" : active ? s.icon : ""}
            </div>
            <div class="trk-step-body">
              <div class="trk-step-label" style="color:${textColor};">${s.label}</div>
              ${s.time !== "—" ? `<div class="trk-step-time">${s.time}</div>` : ""}
              ${active || done ? `<div class="trk-step-detail">${s.detail}</div>` : ""}
            </div>
          </div>
          ${i < order.steps.length - 1 ? `<div class="trk-step-connector${done ? " trk-connector-done" : ""}"></div>` : ""}`;
        })
        .join("");

      const isDelivered = order.currentStep >= 4;

      return `
        <div class="trk-detail-shell">
          <div class="trk-detail-main">
            <div class="trk-detail-topbar">
              <button id="btn-trk-back" class="prod-link-btn" style="font-size:0.88rem;">← All Orders</button>
              <button id="btn-trk-refresh" class="prod-btn-add-new" style="font-size:0.8rem;padding:0.4rem 0.85rem;">⟳ Refresh</button>
            </div>

            <div class="trk-detail-card">
              <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem;">
                <div style="font-size:2.5rem;background:#0f172a;border-radius:10px;width:56px;height:56px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${order.img}</div>
                <div>
                  <div style="font-size:0.95rem;font-weight:700;color:#f8fafc;line-height:1.3;">${order.product}</div>
                  <div style="font-size:0.78rem;color:#64748b;margin-top:2px;">Qty: ${order.qty} · ₹${(order.price * order.qty).toLocaleString()}</div>
                </div>
              </div>
              <div class="trk-progress-bar-wrap">
                <div class="trk-progress-bar-track">
                  <div class="trk-progress-bar-fill" style="width:${progressPct}%;"></div>
                </div>
                <div style="display:flex;justify-content:space-between;margin-top:4px;">
                  <span style="font-size:0.7rem;color:#64748b;">Order Placed</span>
                  <span style="font-size:0.7rem;color:#64748b;">Delivered</span>
                </div>
              </div>
              <div class="trk-status-banner ${isDelivered ? "trk-banner-delivered" : "trk-banner-active"}">
                ${
                  isDelivered
                    ? "✅ Delivered successfully!"
                    : `<span class="trk-pulse-dot" style="display:inline-block;width:8px;height:8px;background:currentColor;border-radius:50%;margin-right:6px;transition:opacity 0.4s;vertical-align:middle;"></span>${order.steps[order.currentStep].label} — Expected: ${order.deliveryDate}`
                }
              </div>
            </div>

            <div class="trk-timeline-card">
              <h3 style="margin:0 0 1.25rem 0;font-size:0.9rem;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Shipment Timeline</h3>
              <div class="trk-timeline">${stepNodes}</div>
            </div>
          </div>

          <div class="trk-detail-side">
            <div class="trk-info-card">
              <h3 style="margin:0 0 1rem 0;font-size:0.85rem;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Shipment Info</h3>
              <div class="trk-info-row"><span>Order ID</span><span style="font-family:monospace;color:#38bdf8;">${order.id}</span></div>
              <div class="trk-info-row"><span>AWB Number</span><span style="font-family:monospace;color:#38bdf8;">${order.awb}</span></div>
              <div class="trk-info-row"><span>Carrier</span><span>${order.carrier}</span></div>
              <div class="trk-info-row"><span>Order Date</span><span>${order.date}</span></div>
              <div class="trk-info-row"><span>Est. Delivery</span><span style="color:#10b981;">${order.deliveryDate}</span></div>
            </div>
            <div class="trk-info-card" style="margin-top:1rem;">
              <h3 style="margin:0 0 1rem 0;font-size:0.85rem;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Delivery Address</h3>
              <div style="font-size:0.85rem;color:#94a3b8;line-height:1.6;">${order.address}</div>
            </div>
            <div class="trk-info-card" style="margin-top:1rem;">
              <h3 style="margin:0 0 0.75rem 0;font-size:0.85rem;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Need Help?</h3>
              <div style="font-size:0.82rem;color:#64748b;line-height:1.7;">
                <div>📞 1800-XXX-XXXX</div>
                <div>📧 support@fsdmatrix.com</div>
                <div>🕐 Mon–Sat, 9AM–8PM</div>
              </div>
            </div>
          </div>
        </div>`;
    },
  };

  AppState.render();
});
