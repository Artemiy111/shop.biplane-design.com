Да, ваш подход абсолютно правильный и соответствует лучшим практикам. Разберём его по шагам и уточним интеграцию с tRPC.
✅ Ваша архитектура (корректна)

    Колбэк от Тинькофф → попадает в tinkoff-callback.post.ts (Nitro-сервер).

    Nitro перенаправляет сообщение в RabbitMQ.

    Отдельный воркер (запущенный независимо) читает RabbitMQ и обновляет статус в БД.

🔧 Уточнения по реализации
1. Обработка колбэка в Nitro (tinkoff-callback.post.ts)
ts

// server/api/tinkoff-callback.post.ts
import { defineEventHandler, readBody } from 'h3';
import amqp from 'amqplib';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  // Отправка в RabbitMQ
  const conn = await amqp.connect('amqp://localhost');
  const channel = await conn.createChannel();
  await channel.assertQueue('tinkoff_payments', { durable: true });
  channel.sendToQueue(
    'tinkoff_payments',
    Buffer.from(JSON.stringify(body)),
    { persistent: true } // Сообщение не потеряется при перезапуске RabbitMQ
  );
  
  await channel.close();
  await conn.close();

  return { ok: true }; // Тинькофф ожидает 200 OK
});

2. Воркер для обработки платежей
ts

// worker/payment-worker.ts
import amqp from 'amqplib';
import { db } from '~/server/db'; // Ваш клиент БД
import { updateOrderStatus } from '~/server/trpc/routers/orders'; // tRPC-метод

async function startWorker() {
  const conn = await amqp.connect('amqp://localhost');
  const channel = await conn.createChannel();
  const queue = 'tinkoff_payments';

  await channel.assertQueue(queue, { durable: true });
  channel.prefetch(1); // Обрабатываем по 1 сообщению за раз

  console.log('Ожидание платежей...');

  channel.consume(queue, async (msg) => {
    if (!msg) return;

    try {
      const paymentData = JSON.parse(msg.content.toString());
      console.log('Обработка платежа:', paymentData.orderId);

      // Обновляем статус через tRPC (если нужно)
      await updateOrderStatus({
        orderId: paymentData.orderId,
        status: 'paid',
      });

      channel.ack(msg); // Подтверждаем успешную обработку
    } catch (err) {
      console.error('Ошибка:', err);
      channel.nack(msg); // Возвращаем в очередь для повторной попытки
    }
  });
}

startWorker().catch(console.error);

🔄 Интеграция с tRPC

Если ваш воркер и Nitro используют общую кодобазу, можно:

    Импортировать tRPC-роутеры напрямую (как в примере выше).

    Либо вызывать tRPC через HTTP (если воркер в другом процессе):

ts

// Альтернатива: вызов tRPC из воркера через fetch
const response = await fetch('http://localhost:3000/api/trpc/orders.updateStatus', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: paymentData.orderId,
    status: 'paid',
  }),
});

⚡ Важные моменты

    Запуск воркера

        Добавьте скрипт в package.json:
        json

"scripts": {
  "worker": "tsx worker/payment-worker.ts",
  "dev:worker": "npm run worker --watch"
}

Для продакшена используйте PM2 или systemd:
bash

    pm2 start npm --name "payment-worker" -- run worker

Обработка ошибок

    Если воркер упадёт, RabbitMQ переотправит сообщение другому потребителю.

    Добавьте dead-letter queue (DLQ) для проблемных сообщений:
    ts

    await channel.assertQueue('tinkoff_payments', {
      durable: true,
      deadLetterExchange: 'dlx', // Обменник для "мертвых" сообщений
    });

Масштабирование

    Запустите несколько воркеров, если нагрузка большая:
    bash

        pm2 start npm --name "payment-worker" -- run worker -i 4

🎯 Итог

    Ваш подход верный: Nitro → RabbitMQ → Воркер → БД.

    tRPC можно использовать как напрямую (если воркер в той же кодобазе), так и через HTTP.

    Для продакшена настройте:

        Мониторинг воркера (PM2, Sentry).

        Dead-letter очередь для ошибок.

        Масштабирование при высокой нагрузке.

Если нужны доп. пояснения по настройке RabbitMQ или tRPC — спрашивайте! 🚀