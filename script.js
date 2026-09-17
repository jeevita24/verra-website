const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");

menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", open);
  menuToggle.textContent = open ? "×" : "☰";
});

document.querySelectorAll(".nav a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  });
});

document.getElementById("year").textContent = new Date().getFullYear();

function showMessage() {
  document.getElementById("contact-message").textContent =
    "Thank you! Contact details will be added soon.";
}

document.querySelectorAll(".buy-button").forEach((button) => {
  button.addEventListener("click", async () => {
    const product = button.dataset.product;
    const amount = Number(button.dataset.amount);

    const sizeSelect = button.dataset.sizeSelect
      ? document.getElementById(button.dataset.sizeSelect)
      : null;

    const size = sizeSelect ? sizeSelect.value : "";

    const name = document.getElementById("customer-name")?.value.trim() || "";
    const email = document.getElementById("customer-email")?.value.trim() || "";
    const phone = document.getElementById("customer-phone")?.value.trim() || "";

    if (!name || !email || !phone) {
      alert("Please enter your name, email and WhatsApp / phone number.");
      return;
    }

    if (!email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    button.disabled = true;
    button.textContent = "Opening…";

    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          product,
          amount,
          size,
          name,
          email,
          phone
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create order.");
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: "INR",
        name: "VERRA",
        description: size ? `${product} · Size ${size}` : product,
        order_id: data.order_id,

        prefill: {
          name,
          email,
          contact: phone
        },

        theme: {
          color: "#111111"
        },

        handler: async function (paymentResponse) {
          try {
            const verify = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                ...paymentResponse,
                product,
                size,
                name,
                email,
                phone,
                amount
              })
            });

            const result = await verify.json();

            if (result.success) {
              alert(
                "Payment successful! Your VERRA order confirmation has been sent to your email."
              );
            } else {
              alert(
                "Payment received, but confirmation is still being processed."
              );
            }
          } catch (error) {
            console.error(error);
            alert(
              "Payment received. Your order confirmation is being processed."
            );
          }
        },

        modal: {
          ondismiss: () => {
            button.disabled = false;
            button.textContent = "Buy now · ₹800";
          }
        }
      };

      const razorpay = new Razorpay(options);
      razorpay.open();

      button.textContent = "Payment open";
    } catch (error) {
      console.error(error);
      alert("Checkout could not be opened. Please try again.");

      button.disabled = false;
      button.textContent = "Buy now · ₹800";
    }
  });
});


// Product image modal gallery
const productModal = document.getElementById("product-modal");
const modalProductImage = document.getElementById("modal-product-image");
const modalImageLabel = document.getElementById("modal-image-label");
const modalDots = [...document.querySelectorAll(".modal-dot")];
const modalImages = [
  { src: "assets/black-m-top.jpg", label: "Product view" },
  { src: "assets/black-m-top-model.jpg", label: "Worn on model" }
];
let modalIndex = 0;

function setModalImage(index) {
  modalIndex = (index + modalImages.length) % modalImages.length;
  modalProductImage.src = modalImages[modalIndex].src;
  modalProductImage.alt = modalIndex === 0
    ? "Black M Top with delicate floral embroidery"
    : "Model wearing the Black M Top with delicate floral embroidery";
  modalImageLabel.textContent = modalImages[modalIndex].label;
  modalDots.forEach((dot, i) => dot.classList.toggle("is-active", i === modalIndex));
}

function openProductModal() {
  setModalImage(0);
  productModal.classList.add("is-open");
  productModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeProductModal() {
  productModal.classList.remove("is-open");
  productModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

document.querySelectorAll("[data-modal-open]").forEach((trigger) => {
  trigger.addEventListener("click", openProductModal);
  trigger.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProductModal();
    }
  });
});
document.querySelectorAll("[data-modal-close]").forEach((el) => {
  el.addEventListener("click", closeProductModal);
});
document.querySelector("[data-modal-prev]").addEventListener("click", () => setModalImage(modalIndex - 1));
document.querySelector("[data-modal-next]").addEventListener("click", () => setModalImage(modalIndex + 1));
modalDots.forEach((dot) => {
  dot.addEventListener("click", () => setModalImage(Number(dot.dataset.modalIndex)));
});
document.addEventListener("keydown", (event) => {
  if (!productModal.classList.contains("is-open")) return;
  if (event.key === "Escape") closeProductModal();
  if (event.key === "ArrowLeft") setModalImage(modalIndex - 1);
  if (event.key === "ArrowRight") setModalImage(modalIndex + 1);
});
