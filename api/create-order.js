const Razorpay = require("razorpay");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { product, amount, size, name, email, phone } = req.body || {};

    if (
      !product ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      !name ||
      !email ||
      !phone
    ) {
      return res.status(400).json({
        error: "Please provide product, amount, name, email and phone."
      });
    }

    if (!email.includes("@")) {
      return res.status(400).json({
        error: "Please provide a valid email address."
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `verra_${Date.now()}`,
      notes: {
        product,
        size: size || "",
        customer_name: name,
        customer_email: email,
        customer_phone: phone
      }
    });

    return res.status(200).json({
      key: process.env.RAZORPAY_KEY_ID,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Could not create payment order"
    });
  }
};
