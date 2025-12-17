import { getPayload } from 'payload'

import config from '@/payload.config'

type PayloadClient = Awaited<ReturnType<typeof getPayload>>

declare global {
  // eslint-disable-next-line no-var
  var __toughPayloadClient: Promise<PayloadClient> | undefined
}

export async function getPayloadClient(): Promise<PayloadClient> {
  // Reuse a single Payload instance across requests in dev to avoid repeated init work
  // (and issues like EventEmitter MaxListeners warnings).
  if (!globalThis.__toughPayloadClient) {
    globalThis.__toughPayloadClient = getPayload({ config: await config })
  }
  return globalThis.__toughPayloadClient
}

