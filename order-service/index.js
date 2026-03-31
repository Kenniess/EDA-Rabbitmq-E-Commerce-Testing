const express = require("express");
const amqp = require("amqplib");

const app = express();
app.use(express.json());

let channel;

async function connectRabbitMQ() {
  const conn = await amqp.connect("amqp://localhost");
  channel = await conn.createChannel();

  await channel.assertExchange("order_exchange", "topic", {
    durable: false,
  });

  console.log("✅ Order Service connected to RabbitMQ");
}

async function publish(event, data) {
  channel.publish(
    "order_exchange",
    event,
    Buffer.from(JSON.stringify(data))
  );
  console.log("📤 Sent:", event, data);
}

app.post("/order", async (req, res) => {
  const order = {
    orderId: Date.now().toString(),
    user: req.body.user,
    total: req.body.total,
  };

  publish("order.created", order);

  res.json({ message: "Order created", order });
});

app.listen(3000, async () => {
  await connectRabbitMQ();
  console.log("🚀 Order Service running on port 3000");
});