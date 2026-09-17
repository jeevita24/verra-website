const crypto = require("crypto");

module.exports.config = {
  api: {
    bodyParser: false
  }
};

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => {
      chunks.push(Buffer.from(chunk));
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });

    req.on("error", reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const rawBody = await getRawBody(req);

    const signature = req.headers["x-razorpay-signature"];

    if (!signature || !process.env.RAZORPAY_WEBHOOK_SECRET) {
      return res.status(400).json({
        error: "Webhook verification details missing"
      });
    }

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_WEBHOOK_SECRET
      )
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({
        error: "Invalid webhook signature"
      });
    }

    const event = JSON.parse(rawBody);
    const eventId = req.headers["x-razorpay-event-id"];

    if (event.event !== "order.paid") {
      return res.status(200).json({
        received: true,
        ignored: true
      });
    }

    const order = event.payload?.order?.entity;
    const payment = event.payload?.payment?.entity;

    const notes = order?.notes || {};

    const product = notes.product || "VERRA Product";
    const size = notes.size || "Not specified";
    const name = notes.customer_name || "";
    const customerEmail = notes.customer_email || "";
    const phone = notes.customer_phone || "";

    const amount = Number(order?.amount || 0) / 100;
    const formattedAmount = `₹${amount.toLocaleString("en-IN")}`;

    const paymentId = payment?.id || "Not available";
    const orderId = order?.id || "Not available";

    const ownerEmail =
      process.env.VERRA_OWNER_EMAIL ||
      "orders@officialverra.in";

    const customerEmailHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#111;">
        <h1 style="letter-spacing:2px;">VERRA</h1>

        <h2>Order confirmed ✨</h2>

        <p>Thank you, ${name || "for shopping with us"}.</p>

        <div style="padding:20px;background:#f7f7f7;margin:20px 0;">
          <p><strong>Product:</strong> ${product}</p>
          <p><strong>Size:</strong> ${size}</p>
          <p><strong>Amount:</strong> ${formattedAmount}</p>
          <p><strong>Payment ID:</strong> ${paymentId}</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
        </div>

        <p>Your payment has been successfully received.</p>

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
          <p><strong>Customer:</strong> ${name}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>WhatsApp / Phone:</strong> ${phone}</p>
          <p><strong>Product:</strong> ${product}</p>
          <p><strong>Size:</strong> ${size}</p>
          <p><strong>Amount:</strong> ${formattedAmount}</p>
          <p><strong>Payment ID:</strong> ${paymentId}</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
        </div>

        <p>Payment confirmed through Razorpay.</p>
      </div>
    `;

    if (process.env.RESEND_API_KEY) {
      const requests = [];

      if (customerEmail) {
        requests.push(
          fetch("https://api.resend.com/emails", {
            method: "POST",

            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
              "Idempotency-Key": `order.paid/customer/${eventId || orderId}`
            },

            body: JSON.stringify({
              from: "VERRA Orders <orders@officialverra.in>",
              to: [customerEmail],
              subject: "VERRA Order Confirmation",
              html: customerEmailHtml
            })
          })
        );
      }

      requests.push(
        fetch("https://api.resend.com/emails", {
          method: "POST",

          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
            "Idempotency-Key": `order.paid/owner/${eventId || orderId}`
          },

          body: JSON.stringify({
            from: "VERRA Orders <orders@officialverra.in>",
            to: [ownerEmail],
            subject: `New VERRA Order — ${product}`,
            html: ownerEmailHtml
          })
        })
      );

      await Promise.all(requests);
    }

    return res.status(200).json({
      success: true,
      message: "Order webhook processed"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: "Webhook processing failed"
    });
  }
};
