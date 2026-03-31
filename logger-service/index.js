const amqp = require("amqplib");

async function start() {
  const conn = await amqp.connect("amqp://localhost");
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