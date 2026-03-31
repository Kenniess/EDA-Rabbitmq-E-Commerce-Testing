const amqp = require("amqplib");

async function start() {
  const conn = await amqp.connect("amqp://localhost");
  const channel = await conn.createChannel();

  await channel.assertExchange("order_exchange", "topic", {
    durable: false,
  });

  const q = await channel.assertQueue("");
  await channel.bindQueue(q.queue, "order_exchange", "payment.processed");

  console.log("📦 Shipping Service ready");

  channel.consume(q.queue, (msg) => {
    const data = JSON.parse(msg.content.toString());
    console.log("🚚 Creating shipping:", data);

    const shipping = {
      ...data,
      tracking: "TRACK-" + Date.now(),
    };

    channel.publish(
      "order_exchange",
      "shipping.created",
      Buffer.from(JSON.stringify(shipping))
    );

    channel.ack(msg);
  });
}

start();