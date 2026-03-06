import { get, set } from 'idb-keyval'

const DEVICE_ID_KEY = 'pulse-device-id'

export async function getDeviceId(): Promise<string> {
  let id = await get<string>(DEVICE_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    await set(DEVICE_ID_KEY, id)
  }
  return id
}
