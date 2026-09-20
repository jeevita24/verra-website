/* =========================================
   VERRA MOBILE MENU
========================================= */

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

  menuButton?.setAttribute(
    "aria-expanded",
    "true"
  );
}


function closeMenu() {
  if (!menu) return;

  menu.classList.remove("is-open");
  overlay?.classList.remove("is-visible");
  document.body.classList.remove("menu-open");

  menuButton?.setAttribute(
    "aria-expanded",
    "false"
  );
}


menuButton?.addEventListener(
  "click",
  openMenu
);


openMenuButton?.addEventListener(
  "click",
  openMenu
);


closeButtons.forEach((button) => {

  button.addEventListener(
    "click",
    closeMenu
  );

});


document
  .querySelectorAll(".mobile-navigation a")
  .forEach((link) => {

    link.addEventListener(
      "click",
      closeMenu
    );

  });


/* =========================================
   VERRA PRODUCT DATA
========================================= */

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


/* =========================================
   CART STORAGE
========================================= */

let verraCart = [];


try {

  const savedCart =
    localStorage.getItem("verraCart");

  if (savedCart) {
    verraCart = JSON.parse(savedCart);
  }

} catch (error) {

  verraCart = [];

}


function saveCart() {

  localStorage.setItem(
    "verraCart",
    JSON.stringify(verraCart)
  );

}


function getCartCount() {

  return verraCart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

}


function getCartTotal() {

  return verraCart.reduce(
    (total, item) =>
      total + (
        item.price *
        item.quantity
      ),
    0
  );

}


/* =========================================
   CART DRAWER
========================================= */

function createCartDrawer() {

  if (
    document.querySelector(".cart-drawer")
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


  document.body.appendChild(drawer);


  const closeButton =
    drawer.querySelector(
      ".cart-close"
    );


  closeButton?.addEventListener(
    "click",
    closeCart
  );


  renderCart();

}


/* =========================================
   OPEN CART
========================================= */

function openCart() {

  createCartDrawer();


  const drawer =
    document.querySelector(
      ".cart-drawer"
    );


  drawer?.classList.add(
    "is-open"
  );


  document.body.classList.add(
    "cart-open"
  );

}


/* =========================================
   CLOSE CART
========================================= */

function closeCart() {

  const drawer =
    document.querySelector(
      ".cart-drawer"
    );


  drawer?.classList.remove(
    "is-open"
  );


  document.body.classList.remove(
    "cart-open"
  );

}


/* =========================================
   RENDER CART
========================================= */

function renderCart() {

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
          (item, index) => `

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

          `
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


/* =========================================
   UPDATE CART COUNT
========================================= */

function updateCartCount() {

  const count =
    getCartCount();


  const countElement =
    document.querySelector(
      ".cart-count"
    );


  if (countElement) {

    countElement.textContent =
      count;

  }


  if (
    document.querySelector(
      ".cart-drawer"
    )
  ) {

    renderCart();

  }

}


/* =========================================
   CART MESSAGE
========================================= */

function showCartMessage(
  message
) {

  const oldToast =
    document.querySelector(
      ".cart-toast"
    );


  oldToast?.remove();


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


  requestAnimationFrame(() => {

    toast.classList.add(
      "show"
    );

  });


  setTimeout(() => {

    toast.classList.remove(
      "show"
    );


    setTimeout(() => {

      toast.remove();

    }, 250);

  }, 1800);

}


/* =========================================
   PRODUCTS PAGE
========================================= */

const productList =
  document.querySelector(
    ".product-list"
  );


if (productList) {


  /* =======================================
     CREATE CART BUTTON
  ======================================= */

  const header =
    document.querySelector(
      ".site-header"
    );


  if (
    header &&
    !document.querySelector(
      ".cart-button"
    )
  ) {

    const cartButton =
      document.createElement(
        "button"
      );


    cartButton.type =
      "button";


    cartButton.className =
      "cart-button";


    cartButton.innerHTML = `
      CART
      <span class="cart-count">
        ${getCartCount()}
      </span>
    `;


    cartButton.addEventListener(
      "click",
      openCart
    );


    header.appendChild(
      cartButton
    );

  }


  /* =======================================
     CREATE BUY NOW + ADD TO CART
  ======================================= */

  document
    .querySelectorAll(
      ".full-product"
    )
    .forEach((productCard) => {


      const nameElement =
        productCard.querySelector(
          "h3"
        );


      if (!nameElement) {
        return;
      }


      const productName =
        nameElement.textContent.trim();


      const productData =
        verraProducts[
          productName
        ];


      if (!productData) {
        return;
      }


      const oldButton =
        productCard.querySelector(
          ".product-button"
        );


      if (!oldButton) {
        return;
      }


      /* Do not process twice */

      if (
        productCard.querySelector(
          ".product-action-group"
        )
      ) {
        return;
      }


      /* ===================================
         BUTTON GROUP
      =================================== */

      const buttonGroup =
        document.createElement(
          "div"
        );


      buttonGroup.className =
        "product-action-group";


      /* ===================================
         BUY NOW BUTTON
      =================================== */

      const buyButton =
        document.createElement(
          "button"
        );


      buyButton.type =
        "button";


      buyButton.className =
        "product-button buy-now-button";


      buyButton.textContent =
        "BUY NOW";


      /* ===================================
         ADD TO CART BUTTON
      =================================== */

      const addButton =
        document.createElement(
          "button"
        );


      addButton.type =
        "button";


      addButton.className =
        "product-button add-cart-button";


      addButton.textContent =
        "ADD TO CART";


      /* ===================================
         PUT BUTTONS TOGETHER
      =================================== */

      buttonGroup.appendChild(
        buyButton
      );


      buttonGroup.appendChild(
        addButton
      );


      oldButton.replaceWith(
        buttonGroup
      );


      /* ===================================
         BUY NOW ACTION
      =================================== */

      buyButton.addEventListener(
        "click",
        () => {

          const url =
            "order.html?product=" +
            encodeURIComponent(
              productName
            );


          window.location.assign(
            url
          );

        }
      );


      /* ===================================
         ADD TO CART ACTION
      =================================== */

      addButton.addEventListener(
        "click",
        () => {


          const existingItem =
            verraCart.find(
              (item) =>
                item.name ===
                productName
            );


          if (existingItem) {

            existingItem.quantity += 1;

          } else {

            verraCart.push({

              name:
                productName,

              price:
                productData.price,

              image:
                productData.image,

              quantity:
                1

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


}


/* =========================================
   ESCAPE KEY
========================================= */

document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Escape"
    ) {

      closeMenu();
      closeCart();

    }

  }
);


/* =========================================
   START
========================================= */

updateCartCount();
