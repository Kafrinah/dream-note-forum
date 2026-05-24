<template>
  <div class="global-background" :style="backgroundStyle"></div>
  <div class="app-wrapper">
    <slot></slot>
  </div>
</template>

<style scoped>
.global-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.app-wrapper {
  position: relative;
  z-index: 1;
  min-height: 100vh;
}
</style>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabase.js'
import { generateStickerSVG } from '../lib/borderDetect.js'

const user = ref(null)
const backgroundConfig = ref(null)
const stickerDataMap = ref({})

// 加载贴纸数据
const loadStickerData = async () => {
  const { data } = await supabase
    .from('sticker_slots')
    .select('id, pixel_data')
    .not('pixel_data', 'is', null)
  
  if (data) {
    for (const sticker of data) {
      stickerDataMap.value[sticker.id] = sticker.pixel_data
    }
  }
}

// 加载用户背景
const loadUserBackground = async () => {
  if (!user.value) return
  
  const { data } = await supabase
    .from('user_backgrounds')
    .select('background_data')
    .eq('user_id', user.value.id)
    .single()
  
  if (data?.background_data) {
    backgroundConfig.value = JSON.parse(data.background_data)
    console.log('背景配置:', backgroundConfig.value)
  }
}

// 生成背景样式
const backgroundStyle = computed(() => {
  // 默认背景渐变
  let bgGradient = 'linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%)'
  
  if (!backgroundConfig.value || !backgroundConfig.value.stickers || backgroundConfig.value.stickers.length === 0) {
    return { background: bgGradient }
  }
  
  // 创建画布
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const width = window.innerWidth
  const height = window.innerHeight
  canvas.width = width
  canvas.height = height
  
  // 绘制渐变背景
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#f5f7fa')
  gradient.addColorStop(1, '#f0f2f5')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  // 绘制每个贴纸
  for (const sticker of backgroundConfig.value.stickers) {
    const pixelData = stickerDataMap.value[sticker.sticker_slot_id]
    if (pixelData) {
      // 解析像素数据
      let colors
      if (typeof pixelData === 'string') {
        colors = JSON.parse(pixelData)
      } else {
        colors = pixelData
      }
      
      // 找出贴纸的实际边界
      const size = 100
      let minX = size, minY = size, maxX = -1, maxY = -1
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const color = colors[y * size + x]
          if (color && color !== '#f3f4f6' && color !== '#FFFFFF') {
            if (x < minX) minX = x
            if (x > maxX) maxX = x
            if (y < minY) minY = y
            if (y > maxY) maxY = y
          }
        }
      }
      
      if (minX > maxX || minY > maxY) continue
      
      const stickerWidth = maxX - minX + 1
      const stickerHeight = maxY - minY + 1
      
      // 贴纸显示大小（80px）
      const displaySize = 80
      const scaleX = displaySize / stickerWidth
      const scaleY = displaySize / stickerHeight
      
      // 计算位置（百分比转像素）
      const posX = (sticker.pos_x / 100) * width
      const posY = (sticker.pos_y / 100) * height
      
      ctx.save()
      ctx.translate(posX, posY)
      ctx.rotate((sticker.rotation * Math.PI) / 180)
      ctx.translate(-displaySize / 2, -displaySize / 2)
      
      // 绘制贴纸像素
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const color = colors[y * size + x]
          if (color && color !== '#f3f4f6' && color !== '#FFFFFF') {
            const px = (x - minX) * scaleX
            const py = (y - minY) * scaleY
            ctx.fillStyle = color
            ctx.fillRect(px, py, Math.ceil(scaleX), Math.ceil(scaleY))
          }
        }
      }
      
      ctx.restore()
    }
  }
  
  const dataUrl = canvas.toDataURL()
  return {
    backgroundImage: `url("${dataUrl}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#f5f7fa'
  }
})

// 监听窗口大小变化，重新生成背景
const handleResize = () => {
  // 触发重新计算
  backgroundStyle.value = backgroundStyle.value
}

// 初始化
const init = async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
  if (user.value) {
    await loadStickerData()
    await loadUserBackground()
  }
}

// 监听用户登录
supabase.auth.onAuthStateChange(async (event, session) => {
  if (session?.user) {
    user.value = session.user
    await loadStickerData()
    await loadUserBackground()
  } else {
    user.value = null
    backgroundConfig.value = null
  }
})

onMounted(() => {
  init()
  window.addEventListener('resize', handleResize)
})
</script>