import axios from 'axios'

const ESP_URL = process.env.EXPO_PUBLIC_ESP8266_URL

export interface ESP8266Response {
  distance: number
  buzzer: 'ON' | 'OFF'
}

export interface DeviceReading {
  distance: number
  buzzerActive: boolean
  timestamp: string
  deviceOnline: boolean
}

export const hardwareService = {

  async fetchReading(): Promise<DeviceReading> {
    const response = await axios.get<ESP8266Response>(
      `${ESP_URL}/`,
      { timeout: 3000 }
    )
    return {
      distance: response.data.distance,
      buzzerActive: response.data.buzzer === 'ON',
      timestamp: new Date().toISOString(),
      deviceOnline: true,
    }
  },

  async checkOnline(customUrl?: string): Promise<boolean> {
    try {
      await axios.get(`${customUrl || ESP_URL}/`, { timeout: 2000 })
      return true
    } catch {
      return false
    }
  },
}
