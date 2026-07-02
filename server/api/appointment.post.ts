export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const appointmentId = `APT${Date.now().toString().slice(-8)}`
  
  return {
    success: true,
    appointmentId,
    message: '预约成功',
    data: {
      ...body,
      appointmentId,
      createdAt: new Date().toISOString()
    }
  }
})