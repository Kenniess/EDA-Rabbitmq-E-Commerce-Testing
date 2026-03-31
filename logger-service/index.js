const amqp = require("amqplib");

async function start() {
  const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'
  const conn = await amqp.connect(RABBITMQ_URL);
  const channel = await conn.createChannel();

  await channel.assertExchange("order_exchange", "topic", {
    durable: false,
  });

  const q = await channel.assertQueue("");
  await channel.bindQueue(q.queue, "order_exchange", "#");

  console.log("📜 Logger ready");

  channel.consume(q.queue, (msg) => {
    console.log(
      "📝",
      msg.fields.routingKey,
      msg.content.toString()
    );
    channel.ack(msg);
  });
}

start();