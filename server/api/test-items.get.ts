export default defineEventHandler(() => {
  return [
    { id: 1, name: '血常规', price: 50, requiresFasting: false },
    { id: 2, name: '肝功能', price: 80, requiresFasting: true },
    { id: 3, name: '肾功能', price: 70, requiresFasting: true },
    { id: 4, name: '血糖', price: 30, requiresFasting: true },
    { id: 5, name: '血脂四项', price: 120, requiresFasting: true },
    { id: 6, name: '甲状腺功能', price: 200, requiresFasting: false },
    { id: 7, name: '肿瘤标志物', price: 350, requiresFasting: false },
    { id: 8, name: '电解质', price: 45, requiresFasting: false }
  ]
})