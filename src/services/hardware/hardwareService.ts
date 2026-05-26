import axios from 'axios'

const ESP_URL = process.env.EXPO_PUBLIC_ESP8266_URL

export interface ESP8266Response {
  distance_cm: number
  weight_kg: number
  buzzer: 'ON' | 'OFF'
}

export interface DeviceReading {
  distance: number
  weight: number
  buzzerActive: boolean
  timestamp: string
  deviceOnline: boolean
}

export const hardwareService = {

  async fetchReading(customUrl?: string, isArmed?: boolean): Promise<DeviceReading> {
    const baseURL = (customUrl || ESP_URL || '').replace(/\/$/, '');
    const url = isArmed !== undefined 
      ? `${baseURL}/?armed=${isArmed ? '1' : '0'}` 
      : `${baseURL}/`;
    const response = await axios.get<ESP8266Response>(
      url,
      { timeout: 5000 }
    )
    return {
      distance: response.data.distance_cm !== undefined ? response.data.distance_cm : (response.data as any).distance,
      weight: response.data.weight_kg || 0,
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
