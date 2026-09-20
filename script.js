const menu = document.querySelector(".mobile-menu");
const overlay = document.querySelector(".menu-overlay");
const menuButton = document.querySelector(".menu-button");
const openMenuButton = document.querySelector("[data-menu-open]");
const closeButtons = document.querySelectorAll("[data-menu-close]");

function openMenu() {
  if (!menu) return;

  menu.classList.add("is-open");
  overlay?.classList.add("is-visible");
  document.body.classList.add("menu-open");
  menuButton?.setAttribute("aria-expanded", "true");
}

function closeMenu() {
  if (!menu) return;

  menu.classList.remove("is-open");
  overlay?.classList.remove("is-visible");
  document.body.classList.remove("menu-open");
  menuButton?.setAttribute("aria-expanded", "false");
}

menuButton?.addEventListener("click", openMenu);
openMenuButton?.addEventListener("click", openMenu);

closeButtons.forEach((button) => {
  button.addEventListener("click", closeMenu);
});

document
  .querySelectorAll(".mobile-navigation a")
  .forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
    closeCart();
  }
});


/* =========================
   VERRA PRODUCTS
========================= */

const verraProducts = {
  Rani: {
    price: 14999,
    image: "assets/verra-lehenga-01.jpg"
  },

  Mint: {
    price: 10099,
    image: "assets/verra-lehenga-02.jpg"
  },

  Plum: {
    price: 11999,
    image: "assets/verra-lehenga-03.jpg"
  },

  Ivory: {
    price: 13099,
    image: "assets/verra-lehenga-04.jpg"
  }
};


/* =========================
   CART
========================= */

let verraCart = [];

try {
  verraCart = JSON.parse(
    localStorage.getItem("verraCart")
  ) || [];
} catch {
  verraCart = [];
}


function saveCart() {
  localStorage.setItem(
    "verraCart",
    JSON.stringify(verraCart)
  );
}


function getCartTotal() {
  return verraCart.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
}


function getCartCount() {
  return verraCart.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
}


/* =========================
   CART BUTTON
   PRODUCTS PAGE ONLY
========================= */

const productsPage =
  document.querySelector(".product-list");

const header =
  document.querySelector(".site-header");

if (
  productsPage &&
  header &&
  !document.querySelector(".cart-button")
) {

  const cartButton =
    document.createElement("button");

  cartButton.className = "cart-button";
  cartButton.type = "button";

  cartButton.innerHTML = `
    CART <span class="cart-count">0</span>
  `;

  cartButton.addEventListener(
    "click",
    openCart
  );

  header.appendChild(cartButton);
}


/* =========================
   PRODUCT BUTTONS
========================= */

document
  .querySelectorAll(".full-product")
  .forEach((productCard) => {

    const productName =
      productCard
        .querySelector("h3")
        ?.textContent
        .trim();

    if (
      !productName ||
      !verraProducts[productName]
    ) {
      return;
    }

    const productData =
      verraProducts[productName];

    const oldButton =
      productCard.querySelector(
        ".product-button"
      );

    if (!oldButton) return;


    const buttonGroup =
      document.createElement("div");

    buttonGroup.className =
      "product-action-group";


    buttonGroup.innerHTML = `
      <a
        href="order.html?product=${encodeURIComponent(productName)}"
        class="product-button buy-now-button"
      >
        BUY NOW
      </a>

      <button
        type="button"
        class="product-button add-cart-button"
      >
        ADD TO CART
      </button>
    `;


    oldButton.replaceWith(
      buttonGroup
    );


    const addButton =
      buttonGroup.querySelector(
        ".add-cart-button"
      );


    addButton.addEventListener(
      "click",
      () => {

        const existingItem =
          verraCart.find(
            (item) =>
              item.name === productName
          );


        if (existingItem) {

          existingItem.quantity += 1;

        } else {

          verraCart.push({
            name: productName,
            price: productData.price,
            image: productData.image,
            quantity: 1
          });

        }


        saveCart();

        updateCartCount();

        showCartMessage(
          `${productName} added to cart.`
        );

      }
    );

  });


/* =========================
   CART DRAWER
========================= */

function createCartDrawer() {

  if (
    document.querySelector(
      ".cart-drawer"
    )
  ) {
    return;
  }


  const drawer =
    document.createElement("aside");

  drawer.className =
    "cart-drawer";


  drawer.innerHTML = `

    <div class="cart-drawer-header">

      <div>

        <p class="eyebrow">
          VERRA
        </p>

        <h2>
          Your Cart
        </h2>

      </div>


      <button
        type="button"
        class="cart-close"
        aria-label="Close cart"
      >
        ×
      </button>

    </div>


    <div class="cart-items"></div>


    <div class="cart-drawer-footer">

      <div class="cart-total-row">

        <span>
          Total
        </span>

        <strong class="cart-total">
          ₹0
        </strong>

      </div>


      <p class="cart-note">

        Your order begins with a conversation.
        Size, measurements, blouse preference
        and skirt length will be confirmed before
        preparation.

      </p>


      <a
        href="order.html"
        class="cart-checkout-button"
      >
        PROCEED TO ORDER
      </a>

    </div>

  `;


  document.body.appendChild(
    drawer
  );


  drawer
    .querySelector(".cart-close")
    .addEventListener(
      "click",
      closeCart
    );


  renderCart();
}


/* =========================
   OPEN CART
========================= */

function openCart() {

  createCartDrawer();


  document
    .querySelector(".cart-drawer")
    ?.classList.add(
      "is-open"
    );


  document.body.classList.add(
    "cart-open"
  );
}


/* =========================
   CLOSE CART
========================= */

function closeCart() {

  document
    .querySelector(".cart-drawer")
    ?.classList.remove(
      "is-open"
    );


  document.body.classList.remove(
    "cart-open"
  );
}


/* =========================
   RENDER CART
========================= */

function renderCart() {

  createCartDrawer();


  const itemsContainer =
    document.querySelector(
      ".cart-items"
    );


  const totalElement =
    document.querySelector(
      ".cart-total"
    );


  if (
    !itemsContainer ||
    !totalElement
  ) {
    return;
  }


  if (
    verraCart.length === 0
  ) {

    itemsContainer.innerHTML = `

      <div class="empty-cart">

        <p>
          Your cart is empty.
        </p>

        <a href="products.html">
          VIEW LEHENGAS
        </a>

      </div>

    `;

  } else {

    itemsContainer.innerHTML =
      verraCart
        .map(
          (item, index) => {

            return `

              <div class="cart-item">

                <img
                  src="${item.image}"
                  alt="${item.name} lehenga"
                >


                <div class="cart-item-info">

                  <h3>
                    ${item.name}
                  </h3>

                  <p>
                    ₹${item.price.toLocaleString("en-IN")}
                  </p>

                  <p class="cart-quantity">
                    Quantity: ${item.quantity}
                  </p>

                  <button
                    type="button"
                    class="remove-cart-item"
                    data-index="${index}"
                  >
                    REMOVE
                  </button>

                </div>

              </div>

            `;

          }
        )
        .join("");

  }


  totalElement.textContent =
    `₹${getCartTotal().toLocaleString("en-IN")}`;


  document
    .querySelectorAll(
      ".remove-cart-item"
    )
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(
              button.dataset.index
            );


          verraCart.splice(
            index,
            1
          );


          saveCart();

          updateCartCount();

          renderCart();

        }
      );

    });
}


/* =========================
   UPDATE CART COUNT
========================= */

function updateCartCount() {

  const countElement =
    document.querySelector(
      ".cart-count"
    );


  if (countElement) {

    countElement.textContent =
      getCartCount();

  }


  if (
    document.querySelector(
      ".cart-drawer"
    )
  ) {

    renderCart();

  }
}


/* =========================
   CART MESSAGE
========================= */

function showCartMessage(
  message
) {

  const existing =
    document.querySelector(
      ".cart-toast"
    );


  existing?.remove();


  const toast =
    document.createElement(
      "div"
    );


  toast.className =
    "cart-toast";


  toast.textContent =
    message;


  document.body.appendChild(
    toast
  );


  requestAnimationFrame(
    () => {

      toast.classList.add(
        "show"
      );

    }
  );


  setTimeout(
    () => {

      toast.classList.remove(
        "show"
      );


      setTimeout(
        () => {

          toast.remove();

        },
        250
      );

    },
    1800
  );
}


/* =========================
   START CART
========================= */

if (productsPage) {
  createCartDrawer();
  updateCartCount();
}
