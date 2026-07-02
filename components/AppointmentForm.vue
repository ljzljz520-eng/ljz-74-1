<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  fetchBloodStations, 
  fetchTimeSlots, 
  fetchTestItems, 
  submitAppointment,
  calculateTotalPrice,
  checkFastingRequired,
  type BloodStation,
  type TimeSlot,
  type TestItem,
  type AppointmentForm
} from '~/composables/useAppointment'

const stations = ref<BloodStation[]>([])
const timeSlots = ref<TimeSlot[]>([])
const testItems = ref<TestItem[]>([])

const form = ref<AppointmentForm>({
  stationId: 0,
  date: '',
  timeSlotId: 0,
  testItems: [],
  name: '',
  phone: '',
  idCard: '',
  reportMethod: 'self'
})

const isSubmitting = ref(false)
const showSuccess = ref(false)
const successMessage = ref('')

const availableTimeSlots = computed(() => timeSlots.value.filter(slot => slot.available))

const selectedStation = computed(() => stations.value.find(s => s.id === form.value.stationId))
const selectedTimeSlot = computed(() => timeSlots.value.find(t => t.id === form.value.timeSlotId))
const selectedTestItems = computed(() => testItems.value.filter(item => form.value.testItems.includes(item.id)))

const totalPrice = computed(() => calculateTotalPrice(testItems.value, form.value.testItems))
const requiresFasting = computed(() => checkFastingRequired(testItems.value, form.value.testItems))

const formValid = computed(() => {
  return form.value.stationId !== 0 &&
         form.value.date !== '' &&
         form.value.timeSlotId !== 0 &&
         form.value.testItems.length > 0 &&
         form.value.name !== '' &&
         form.value.phone !== '' &&
         form.value.idCard !== ''
})

function toggleTestItem(itemId: number) {
  const index = form.value.testItems.indexOf(itemId)
  if (index > -1) {
    form.value.testItems.splice(index, 1)
  } else {
    form.value.testItems.push(itemId)
  }
}

async function handleSubmit() {
  if (!formValid.value || isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    const response = await submitAppointment(form.value)
    successMessage.value = `预约成功！您的预约编号是：${response.appointmentId}`
    showSuccess.value = true
    
    form.value = {
      stationId: 0,
      date: '',
      timeSlotId: 0,
      testItems: [],
      name: '',
      phone: '',
      idCard: '',
      reportMethod: 'self'
    }
  } catch (error) {
    console.error('预约失败:', error)
    successMessage.value = '预约失败，请稍后重试'
  } finally {
    isSubmitting.value = false
  }
}

function closeSuccess() {
  showSuccess.value = false
}

onMounted(async () => {
  stations.value = await fetchBloodStations()
  timeSlots.value = await fetchTimeSlots()
  testItems.value = await fetchTestItems()
  
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  form.value.date = tomorrow.toISOString().split('T')[0]
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
    <div class="max-w-md mx-auto">
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
          <h1 class="text-xl font-bold text-white">移动采血点预约</h1>
          <p class="text-blue-100 text-sm mt-1">请填写以下信息完成预约</p>
        </div>
        
        <div class="p-6 space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">选择采血点</label>
            <select
              v-model="form.stationId"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="0">请选择采血点</option>
              <option v-for="station in stations" :key="station.id" :value="station.id">
                {{ station.name }}
              </option>
            </select>
            <div v-if="selectedStation" class="mt-2 text-sm text-gray-500">
              <p>{{ selectedStation.address }}</p>
              <p>联系电话：{{ selectedStation.phone }}</p>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">选择日期</label>
            <input
              v-model="form.date"
              type="date"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">选择时间段</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="slot in availableTimeSlots"
                :key="slot.id"
                @click="form.timeSlotId = slot.id"
                :class="[
                  'px-4 py-2 rounded-lg border transition-all text-sm font-medium',
                  form.timeSlotId === slot.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                ]"
              >
                {{ slot.time }}
              </button>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">选择检测项目</label>
            <div class="space-y-2">
              <label
                v-for="item in testItems"
                :key="item.id"
                :class="[
                  'flex items-center p-3 rounded-lg border cursor-pointer transition-all',
                  form.testItems.includes(item.id)
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-gray-300 hover:border-blue-400'
                ]"
              >
                <input
                  type="checkbox"
                  :checked="form.testItems.includes(item.id)"
                  @change="toggleTestItem(item.id)"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div class="ml-3 flex-1">
                  <span class="font-medium text-gray-700">{{ item.name }}</span>
                  <span class="ml-2 text-sm text-blue-600">¥{{ item.price }}</span>
                </div>
                <span v-if="item.requiresFasting" class="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded">
                  需空腹
                </span>
              </label>
            </div>
            <div v-if="selectedTestItems.length > 0" class="mt-3 text-right">
              <span class="text-gray-600">合计：</span>
              <span class="text-xl font-bold text-blue-600">¥{{ totalPrice }}</span>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">个人信息</label>
            <div class="space-y-3">
              <input
                v-model="form.name"
                type="text"
                placeholder="姓名"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <input
                v-model="form.phone"
                type="tel"
                placeholder="手机号码"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <input
                v-model="form.idCard"
                type="text"
                placeholder="身份证号码"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">报告领取方式</label>
            <div class="flex gap-4">
              <label
                :class="[
                  'flex-1 flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all',
                  form.reportMethod === 'self'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
                ]"
              >
                <input
                  type="radio"
                  value="self"
                  v-model="form.reportMethod"
                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span class="ml-2 font-medium">现场领取</span>
              </label>
              <label
                :class="[
                  'flex-1 flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all',
                  form.reportMethod === 'mail'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
                ]"
              >
                <input
                  type="radio"
                  value="mail"
                  v-model="form.reportMethod"
                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span class="ml-2 font-medium">邮寄送达</span>
              </label>
            </div>
          </div>
          
          <div
            v-if="requiresFasting"
            class="bg-orange-50 border border-orange-200 rounded-lg p-4"
          >
            <div class="flex items-start">
              <svg class="w-5 h-5 text-orange-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <div>
                <h3 class="font-medium text-orange-800">注意事项</h3>
                <ul class="mt-1 text-sm text-orange-700 space-y-1">
                  <li>• 您选择的检测项目需要空腹，请在采血前至少禁食8小时</li>
                  <li>• 请携带本人有效身份证件原件</li>
                  <li>• {{ form.reportMethod === 'self' ? '报告请于3个工作日后到采血点领取' : '报告将在3个工作日后邮寄至您填写的地址' }}</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div
            v-else
            class="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div class="flex items-start">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <h3 class="font-medium text-blue-800">温馨提示</h3>
                <ul class="mt-1 text-sm text-blue-700 space-y-1">
                  <li>• 请携带本人有效身份证件原件</li>
                  <li>• {{ form.reportMethod === 'self' ? '报告请于3个工作日后到采血点领取' : '报告将在3个工作日后邮寄至您填写的地址' }}</li>
                </ul>
              </div>
            </div>
          </div>
          
          <button
            @click="handleSubmit"
            :disabled="!formValid || isSubmitting"
            :class="[
              'w-full py-3 rounded-lg font-medium text-white transition-all',
              formValid && !isSubmitting
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                : 'bg-gray-400 cursor-not-allowed'
            ]"
          >
            {{ isSubmitting ? '提交中...' : '确认预约' }}
          </button>
        </div>
      </div>
      
      <div class="mt-4 text-center text-sm text-gray-500">
        <p>如有疑问，请拨打服务热线：400-123-4567</p>
      </div>
    </div>
  </div>
  
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="showSuccess"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="closeSuccess"
      >
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-gray-900 mb-2">预约成功</h2>
          <p class="text-gray-600 mb-6">{{ successMessage }}</p>
          <button
            @click="closeSuccess"
            class="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            确定
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>