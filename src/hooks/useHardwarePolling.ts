import { useEffect, useRef } from 'react'
import { hardwareService } from '@/services/hardware/hardwareService'
import { useSensorStore } from '@/store/sensorStore'
import { useDeviceStore } from '@/store/deviceStore'
import { useEmergencyStore } from '@/store/emergencyStore'
import { auth, db } from '@/config/firebaseConfig'
import { collection, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore'
import { useSettingsStore } from '@/store/settingsStore'

export const useHardwarePolling = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const failureCountRef = useRef(0)
  const alertDocRefId = useRef<string | null>(null)
  
  const { updateSensor } = useSensorStore()
  const { setDeviceStatus } = useDeviceStore()
  const { triggerEmergency, resolveEmergency } = useEmergencyStore()

  const poll = async () => {
    // Read the current interval directly from the Zustand store
    const { pollInterval, apiUrl } = useSettingsStore.getState()
    
    try {
      const currentIsArmed = useDeviceStore.getState().isArmed;
      const reading = await hardwareService.fetchReading(apiUrl, currentIsArmed)
      failureCountRef.current = 0

      const currentIsActive = useEmergencyStore.getState().isActive;

      const effectiveBuzzerActive = currentIsArmed && reading.buzzerActive;

      // Update sensor store
      updateSensor({
        distance: reading.distance,
        weight: reading.weight,
        buzzerActive: effectiveBuzzerActive,
        triggered: effectiveBuzzerActive,
        lastUpdated: reading.timestamp,
      })

      // Update device status
      setDeviceStatus({ connected: true })

      // Trigger emergency if buzzer is ON and no active emergency
      if (effectiveBuzzerActive && !currentIsActive) {
        // Determine the source of the emergency
        const sourceSensor = reading.weight >= 10 ? 'force' : 'ultrasonic';
        triggerEmergency({
          source: sourceSensor,
          value: sourceSensor === 'force' ? reading.weight : reading.distance,
          severity: (reading.distance > 0 && reading.distance < 30) || reading.weight >= 15 ? 'high' : 'medium',
        })
        
        // Log to Firestore
        try {
          const user = auth.currentUser;
          const docRef = await addDoc(collection(db, 'alerts'), {
            userId: user?.uid || 'unknown',
            sensorType: sourceSensor,
            distance: reading.distance,
            weight: reading.weight,
            buzzerState: 'ON',
            severity: (reading.distance > 0 && reading.distance < 30) || reading.weight >= 15 ? 'high' : 'medium',
            resolved: false,
            createdAt: Timestamp.now(),
          });
          alertDocRefId.current = docRef.id;
        } catch (err) {
          console.error("Failed to log alert to Firestore", err);
        }
      } else if (!effectiveBuzzerActive && currentIsActive) {
        // Resolve emergency when buzzer goes OFF
        resolveEmergency();
        
        // Update Firestore doc
        if (alertDocRefId.current) {
          try {
            await updateDoc(doc(db, 'alerts', alertDocRefId.current), {
              resolved: true,
              resolvedAt: Timestamp.now(),
            });
            alertDocRefId.current = null;
          } catch (err) {
            console.error("Failed to resolve alert in Firestore", err);
          }
        }
      }

    } catch (err) {
      console.error("Hardware polling failed:", err);
      // Device is offline or unreachable
      failureCountRef.current += 1
      if (failureCountRef.current >= 3) {
        setDeviceStatus({ connected: false })
        updateSensor({ distance: null, weight: null, buzzerActive: false, triggered: false })
        const currentIsActive = useEmergencyStore.getState().isActive;
        if (currentIsActive) {
          resolveEmergency()
          if (alertDocRefId.current) {
            try {
              updateDoc(doc(db, 'alerts', alertDocRefId.current), {
                resolved: true,
                resolvedAt: Timestamp.now(),
              });
            } catch (err) {}
            alertDocRefId.current = null;
          }
        }
      }
    }
  }

  const startPolling = () => {
    if (intervalRef.current) return
    poll() // Immediate first call
    // Use dynamic interval from settings
    const { pollInterval } = useSettingsStore.getState()
    intervalRef.current = setInterval(poll, pollInterval || 500)
  }

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    return () => stopPolling() // Cleanup on unmount
  }, [])

  return { startPolling, stopPolling }
}
