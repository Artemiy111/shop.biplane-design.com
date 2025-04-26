import ampq from 'amqplib'

const conn = await ampq.connect('amqp://guest:guest@localhost:5672')
const channel = await conn.createChannel()

const queue = 'helloqueue'

await channel.assertQueue(queue, { durable: true })
channel.sendToQueue(queue, Buffer.from('Hello RabbitMQ!'), { persistent: true })

channel.consume(queue, async (msg) => {
  if (msg === null) {
    return
  }

  console.log(msg)
  const message = msg.content.toString()
  console.log(message)
  channel.ack(msg)
})
