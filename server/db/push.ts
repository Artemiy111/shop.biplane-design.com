import { sql } from 'drizzle-orm'
import { logger } from 'better-auth'
import { imageToModelT } from './schema'
import { db } from '.'

const push = async () => {
  const idx = 'image_to_model_model_id_sort_order_unique'
  await db.execute(sql`
  ALTER TABLE ${imageToModelT}
    DROP CONSTRAINT IF EXISTS ${sql.raw(idx)};

  ALTER TABLE ${imageToModelT}
    ADD CONSTRAINT ${sql.raw(idx)}
    UNIQUE (model_id, sort_order)
    DEFERRABLE INITIALLY DEFERRED;
`)
  await db.$client.end()
}

try {
  logger.info('start push')
  await push()
  logger.success('push done')
}
catch (e) {
  logger.error('push error')
  console.log(e)
}
