import { sdk } from '../scripts/otel'

export default defineNitroPlugin((nitro) => {
  sdk.start()

  console.log('otel sdk started')
})
