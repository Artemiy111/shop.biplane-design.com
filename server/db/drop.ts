import * as schema from './schema'
import { db } from '.'

const drop = async () => {
  await db.transaction(async (tx) => {
    await tx.delete(schema.users)
    await tx.delete(schema.accounts)
    await tx.delete(schema.sessions)
    await tx.delete(schema.verifications)

    await tx.delete(schema.files)
    await tx.delete(schema.imageToModel)
    await tx.delete(schema.images)

    await tx.delete(schema.models)
    await tx.delete(schema.categories)

    await tx.delete(schema.discounts)
    await tx.delete(schema.promocodes)
    await tx.delete(schema.orders)
  })
}

await drop()
