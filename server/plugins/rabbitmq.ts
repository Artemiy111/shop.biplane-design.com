// import { rabbitMQService } from '../services/rabbitmq'

export default defineNitroPlugin(async (_nitroApp) => {
  // console.log('Connecting to rabbitmq')
  // await rabbitMQService.connect()
  // console.log('Connected to rabbitmq')

  // // Регистрация обработчиков
  // rabbitMQService.registerConsumer('tasks', (msg) => {
  //   if (msg) {
  //     console.log('Processing task:', msg.content.toString())
  //     rabbitMQService.consumerChannel?.ack(msg)
  //   }
  // })

  // // Graceful shutdown
  // nitroApp.hooks.hookOnce('close', async () => {
  //   await rabbitMQService.close()
  // })
})
