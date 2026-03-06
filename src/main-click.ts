import './styles/wheel.css'
import { loadWheelConfig, applyBranding } from './config'
import { getDeviceId } from './device-id'
import { createWheelApp } from './app-click'
import { DEFAULT_PRIZES } from './prizes'

async function boot() {
  const [config, deviceId] = await Promise.all([loadWheelConfig(), getDeviceId()])

  applyBranding(config)

  const root = document.getElementById('app')!
  createWheelApp(root, config, DEFAULT_PRIZES, deviceId)
}

boot()
