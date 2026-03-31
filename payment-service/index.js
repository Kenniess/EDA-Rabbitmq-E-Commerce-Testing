const amqp = require("amqplib");

async function start() {
  const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'
  const conn = await amqp.connect(RABBITMQ_URL);
  const channel = await conn.createChannel();

  await channel.assertExchange("order_exchange", "topic", {
    durable: false,
  });

  const q = await channel.assertQueue("");
  await channel.bindQueue(q.queue, "order_exchange", "order.created");

  console.log("💰 Payment Service ready");

  channel.consume(q.queue, (msg) => {
    const data = JSON.parse(msg.content.toString());
    console.log("💳 Processing payment:", data);

    const result = { ...data, status: "paid" };

    channel.publish(
      "order_exchange",
      "payment.processed",
      Buffer.from(JSON.stringify(result))
    );

    channel.ack(msg);
  });
}

start();