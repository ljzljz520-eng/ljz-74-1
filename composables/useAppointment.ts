export interface BloodStation {
  id: number
  name: string
  address: string
  phone: string
}

export interface TimeSlot {
  id: number
  time: string
  available: boolean
}

export interface TestItem {
  id: number
  name: string
  price: number
  requiresFasting: boolean
}

export interface AppointmentForm {
  stationId: number
  date: string
  timeSlotId: number
  testItems: number[]
  name: string
  phone: string
  idCard: string
  reportMethod: 'self' | 'mail'
}

export async function fetchBloodStations(): Promise<BloodStation[]> {
  return await $fetch('/api/blood-stations')
}

export async function fetchTimeSlots(): Promise<TimeSlot[]> {
  return await $fetch('/api/time-slots')
}

export async function fetchTestItems(): Promise<TestItem[]> {
  return await $fetch('/api/test-items')
}

export async function submitAppointment(form: AppointmentForm) {
  return await $fetch('/api/appointment', {
    method: 'POST',
    body: form
  })
}

export function calculateTotalPrice(items: TestItem[], selectedIds: number[]): number {
  return selectedIds
    .map(id => items.find(item => item.id === id))
    .filter(Boolean)
    .reduce((sum, item) => sum + (item?.price || 0), 0)
}

export function checkFastingRequired(items: TestItem[], selectedIds: number[]): boolean {
  return selectedIds.some(id => items.find(item => item.id === id)?.requiresFasting)
}