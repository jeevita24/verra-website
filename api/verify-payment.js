const crypto = require("crypto");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      product,
      size,
      name,
      email,
      phone,
      amount
    } = req.body || {};

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing payment details"
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: "Payment verification failed"
      });
    }

    const customerEmail = String(email || "").trim();
    const ownerEmail =
      process.env.VERRA_OWNER_EMAIL || "orders@officialverra.in";

    const formattedAmount = `₹${Number(amount || 0).toLocaleString("en-IN")}`;

    const customerEmailHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#111;">
        <h1 style="letter-spacing:2px;">VERRA</h1>
        <h2>Order confirmed ✨</h2>
        <p>Thank you, ${name || "for shopping with us"}.</p>

        <div style="padding:20px;background:#f7f7f7;margin:20px 0;">
          <p><strong>Product:</strong> ${product || "VERRA Product"}</p>
          <p><strong>Size:</strong> ${size || "Not specified"}</p>
          <p><strong>Amount:</strong> ${formattedAmount}</p>
          <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
          <p><strong>Order ID:</strong> ${razorpay_order_id}</p>
        </div>

        <p>Your payment has been successfully verified.</p>
        <p>We will process your order shortly.</p>

        <p style="margin-top:30px;">
          Your outfit is the reflection of what you are.
        </p>
        <p><strong>— VERRA</strong></p>
      </div>
    `;

    const ownerEmailHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#111;">
        <h1 style="letter-spacing:2px;">VERRA</h1>
        <h2>New order received 🛍️</h2>

        <div style="padding:20px;background:#f7f7f7;margin:20px 0;">
          <p><strong>Customer:</strong> ${name || ""}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>WhatsApp / Phone:</strong> ${phone || ""}</p>
          <p><strong>Product:</strong> ${product || ""}</p>
          <p><strong>Size:</strong> ${size || ""}</p>
          <p><strong>Amount:</strong> ${formattedAmount}</p>
          <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
          <p><strong>Order ID:</strong> ${razorpay_order_id}</p>
        </div>

        <p>Payment signature verified successfully.</p>
      </div>
    `;

    if (process.env.RESEND_API_KEY && customerEmail) {
      const emailRequests = [
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "VERRA Orders <orders@officialverra.in>",
            to: [customerEmail],
            subject: "VERRA Order Confirmation",
            html: customerEmailHtml
          })
        }),
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "VERRA Orders <orders@officialverra.in>",
            to: [ownerEmail],
            subject: `New VERRA Order — ${product || "Product"}`,
            html: ownerEmailHtml
          })
        })
      ];

      await Promise.all(emailRequests);
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and order confirmation processed"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: "Could not verify payment"
    });
  }
};
