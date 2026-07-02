export default defineEventHandler(() => {
  return [
    { id: 1, time: '08:00-09:00', available: true },
    { id: 2, time: '09:00-10:00', available: true },
    { id: 3, time: '10:00-11:00', available: false },
    { id: 4, time: '11:00-12:00', available: true },
    { id: 5, time: '14:00-15:00', available: true },
    { id: 6, time: '15:00-16:00', available: true },
    { id: 7, time: '16:00-17:00', available: false },
    { id: 8, time: '17:00-18:00', available: true }
  ]
})