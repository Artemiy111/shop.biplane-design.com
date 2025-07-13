import * as schema from './schema'

import { db } from '.'

const drop = async () => {
  await db.transaction(async (tx) => {
    await tx.delete(schema.usersT)
    await tx.delete(schema.accountsT)
    await tx.delete(schema.sessionsT)
    await tx.delete(schema.verificationsT)

    await tx.delete(schema.filesT)
    await tx.delete(schema.imageToModelT)
    await tx.delete(schema.imagesT)

    await tx.delete(schema.setsT)
    await tx.delete(schema.modelsToSetsT)
    await tx.delete(schema.modelsT)
    await tx.delete(schema.categoriesT)

    await tx.delete(schema.discountsT)
    await tx.delete(schema.promocodesT)
    await tx.delete(schema.ordersT)
  })
}

await drop()
