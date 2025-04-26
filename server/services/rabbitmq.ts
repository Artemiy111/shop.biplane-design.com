import amqplib, { type ChannelModel } from 'amqplib'

interface RabbitConfig {
  url: string
  reconnectDelay: number
  maxRetries: number
}

const config: RabbitConfig = {
  url: process.env.RABBITMQ_URL || 'amqp://localhost',
  reconnectDelay: 5000,
  maxRetries: 10,
}

class RabbitMQService {
  private connection: ChannelModel | null = null
  public consumerChannel: amqplib.Channel | null = null
  private retryCount = 0
  private consumers = new Map<string, (msg: amqplib.ConsumeMessage | null) => void>()
  private isConnecting = false

  async connect(): Promise<ChannelModel> {
    if (this.connection) return this.connection
    if (this.isConnecting) {
      return new Promise((resolve) => {
        const check = () => {
          if (this.connection) {
            resolve(this.connection)
          }
          else {
            setTimeout(check, 100)
          }
        }
        check()
      })
    }

    this.isConnecting = true
    try {
      this.connection = await amqplib.connect(config.url)
      this.retryCount = 0

      this.connection.on('close', () => this.handleConnectionClose())
      this.connection.on('error', err => this.handleConnectionError(err))

      await this.setupConsumers()
      return this.connection
    }
    catch (err) {
      this.isConnecting = false
      throw err
    }
    finally {
      this.isConnecting = false
    }
  }

  private async handleConnectionClose() {
    if (this.connection) {
      this.connection.removeAllListeners()
      this.connection = null
      this.consumerChannel = null
    }
    await this.reconnect()
  }

  private handleConnectionError(err: Error) {
    console.error('RabbitMQ connection error:', err.message)
  }

  private async reconnect() {
    if (this.retryCount >= config.maxRetries) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.retryCount++
    const delay = config.reconnectDelay * this.retryCount

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.retryCount})`)

    setTimeout(async () => {
      try {
        await this.connect()
      }
      catch (err) {
        console.error('Reconnection failed:', err)
        await this.reconnect()
      }
    }, delay)
  }

  private async setupConsumers() {
    if (!this.connection) return

    try {
      this.consumerChannel = await this.connection.createChannel()

      for (const [queue, handler] of this.consumers) {
        await this.consumerChannel.assertQueue(queue, { durable: true })
        this.consumerChannel.consume(queue, handler)
      }
    }
    catch (err) {
      console.error('Failed to setup consumers:', err)
      this.consumerChannel = null
    }
  }

  async registerConsumer(queue: string, handler: (msg: amqplib.ConsumeMessage | null) => void) {
    this.consumers.set(queue, handler)

    if (this.consumerChannel) {
      await this.consumerChannel.assertQueue(queue, { durable: true })
      this.consumerChannel.consume(queue, handler)
    }
  }

  async publish(queue: string, message: object) {
    const conn = await this.connect()
    const channel = await conn.createChannel()

    try {
      await channel.assertQueue(queue, { durable: true })
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)))
    }
    finally {
      await channel.close()
    }
  }

  async close() {
    if (this.consumerChannel) {
      await this.consumerChannel.close()
      this.consumerChannel = null
    }

    if (this.connection) {
      await this.connection.close()
      this.connection = null
    }

    this.consumers.clear()
  }
}

export const rabbitMQService = new RabbitMQService()
