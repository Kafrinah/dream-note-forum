<template>
  <div>
    <h1 class="page-title">🖼️ 背景编辑器</h1>
    <p class="page-subtitle">拖拽贴纸到背景上，布置你的专属空间</p>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="tool-group">
        <button 
          @click="mode = 'move'" 
          :class="{ active: mode === 'move' }" 
          class="tool-btn"
        >
          移动模式
        </button>
        <button 
          @click="mode = 'rotate'" 
          :class="{ active: mode === 'rotate' }" 
          class="tool-btn"
        >
          旋转模式
        </button>
        <button @click="saveBackground" class="tool-btn btn-primary">
          保存背景
        </button>
        <button @click="resetBackground" class="tool-btn btn-danger">
          重置
        </button>
      </div>
    </div>

    <!-- 贴纸库 -->
    <div class="sticker-library">
      <h3>我的贴纸库</h3>
      <div class="sticker-list">
        <div 
          v-for="sticker in myStickers" 
          :key="sticker.id" 
          class="sticker-item"
          draggable="true"
          @dragstart="dragStart($event, sticker)"
          @dragend="dragEnd"
        >
          <div class="sticker-preview" v-html="getStickerPreview(sticker)"></div>
          <span class="sticker-name">{{ sticker.name }}</span>
        </div>
      </div>
      <div v-if="myStickers.length === 0" class="empty-stickers">
        还没有贴纸，先去「贴纸位」创建吧～
      </div>
    </div>

    <!-- 背景画布 -->
    <div 
      class="background-canvas" 
      ref="canvasRef" 
      @drop="onDrop" 
      @dragover.prevent
      @click="selectSticker"
    >
      <div v-if="placedStickers.length === 0" class="empty-hint">
        从上方贴纸库拖拽贴纸到此处
      </div>
      
      <!-- 已放置的贴纸 -->
      <div 
        v-for="item in placedStickers" 
        :key="item.id"
        class="placed-sticker"
        :data-id="item.id"
        :style="{
          left: item.pos_x + '%',
          top: item.pos_y + '%',
          transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
          cursor: mode === 'move' ? 'grab' : 'pointer',
          zIndex: selectedStickerId === item.id ? 10 : 1
        }"
        @mousedown="startDragSticker(item, $event)"
        @click.stop="selectStickerById(item.id)"
      >
        <div class="sticker-content" v-html="getStickerPreviewById(item.sticker_slot_id)"></div>
        <div v-if="selectedStickerId === item.id" class="sticker-controls">
          <button @click.stop="rotateSticker(item)" class="control-btn">90°</button>
          <button @click.stop="removeSticker(item)" class="control-btn btn-danger-small">✕</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

/* 背景编辑器响应式 */
@media (max-width: 768px) {
  .background-canvas {
    min-height: 400px;
  }
  
  .sticker-content {
    width: 60px;
    height: 60px;
  }
  
  .sticker-controls {
    top: -35px;
  }
  
  .control-btn {
    padding: 4px 8px;
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .sticker-content {
    width: 50px;
    height: 50px;
  }
}

.page-title {
  font-size: 42px;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #A9C9C4, #A9C9C4);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.page-subtitle {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 32px;
}

.toolbar {
  background: white;
  border-radius: 20px;
  padding: 16px 24px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.tool-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.tool-btn {
  padding: 10px 20px;
  font-size: 14px;
  background: #f3f4f6;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-btn.active {
  background: #807c74;
  color: white;
}

.btn-primary {
  background: #A9C9C4;
  color: white;
}

.btn-danger {
  background: #614A44;
  color: white;
}

.sticker-library {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 24px;
}

.sticker-library h3 {
  margin-bottom: 16px;
  font-size: 18px;
}

.sticker-list {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.sticker-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 16px;
  cursor: grab;
  transition: all 0.2s;
}

.sticker-item:active {
  cursor: grabbing;
}

.sticker-item:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
}

.sticker-preview {
  width: 64px;
  height: 64px;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
}

.sticker-preview svg {
  width: 100%;
  height: 100%;
}

.sticker-name {
  font-size: 12px;
  color: #4b5563;
}

.empty-stickers {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
}

.background-canvas {
  position: relative;
  width: 100%;
  min-height: 600px;
  background: #e5e7eb;
  border-radius: 24px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
}

.empty-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #9ca3af;
  font-size: 16px;
  text-align: center;
}

.placed-sticker {
  position: absolute;
  cursor: grab;
  user-select: none;
}

.placed-sticker:active {
  cursor: grabbing;
}

.sticker-content {
  width: 80px;
  height: 80px;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
}

.sticker-content svg {
  width: 100%;
  height: 100%;
}

.sticker-controls {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  background: white;
  padding: 4px 8px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
}

.control-btn {
  padding: 4px 12px;
  font-size: 12px;
  background: #f3f4f6;
  border: none;
  border-radius: 16px;
  cursor: pointer;
}

.btn-danger-small {
  background: #614A44;
  color: white;
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase.js'
import { generateStickerSVG } from '../lib/borderDetect.js'

const user = ref(null)
const mode = ref('move')
const myStickers = ref([])
const placedStickers = ref([])
const selectedStickerId = ref(null)
const canvasRef = ref(null)
const draggingSticker = ref(null)
const dragOffset = ref({ x: 0, y: 0 })
const stickerDataMap = ref({})

// 加载贴纸数据
const loadStickerData = async () => {
  const { data } = await supabase
    .from('sticker_slots')
    .select('id, pixel_data, name')
    .eq('user_id', user.value.id)
    .not('pixel_data', 'is', null)
    .order('slot_index')
  
  myStickers.value = data || []
  
  for (const sticker of myStickers.value) {
    stickerDataMap.value[sticker.id] = sticker.pixel_data
  }
}

// 加载已保存的背景贴纸
const loadBackgroundStickers = async () => {
  const { data } = await supabase
    .from('background_stickers')
    .select('*')
    .eq('user_id', user.value.id)
  
  if (data) {
    placedStickers.value = data.map(item => ({
      ...item,
      pixel_data: stickerDataMap.value[item.sticker_slot_id]
    }))
  }
}

const getStickerPreview = (sticker) => {
  if (!sticker.pixel_data) return ''
  return generateStickerSVG(sticker.pixel_data, 64)
}

const getStickerPreviewById = (slotId) => {
  const pixelData = stickerDataMap.value[slotId]
  if (!pixelData) return ''
  return generateStickerSVG(pixelData, 80)
}

// 拖拽添加贴纸
const dragStart = (event, sticker) => {
  event.dataTransfer.setData('text/plain', JSON.stringify({
    id: sticker.id,
    name: sticker.name
  }))
  event.dataTransfer.effectAllowed = 'copy'
}

const dragEnd = () => {}

const onDrop = async (event) => {
  const data = JSON.parse(event.dataTransfer.getData('text/plain'))
  const rect = canvasRef.value.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  
  const posX = Math.min(95, Math.max(5, Math.round(x / 2) * 2))
  const posY = Math.min(95, Math.max(5, Math.round(y / 2) * 2))
  
  const { error } = await supabase
    .from('background_stickers')
    .insert({
      user_id: user.value.id,
      sticker_slot_id: data.id,
      pos_x: posX,
      pos_y: posY,
      rotation: 0
    })
  
  if (!error) {
    await loadBackgroundStickers()
  } else {
    alert('添加失败: ' + error.message)
  }
}

// 选择贴纸
const selectStickerById = (id) => {
  selectedStickerId.value = id
}

const selectSticker = (event) => {
  if (event.target === canvasRef.value) {
    selectedStickerId.value = null
  }
}

// 移动贴纸
const startDragSticker = (sticker, event) => {
  if (mode.value !== 'move') return
  event.stopPropagation()
  
  draggingSticker.value = sticker
  const rect = event.target.closest('.placed-sticker').getBoundingClientRect()
  dragOffset.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
  
  const onMouseMove = (moveEvent) => {
    if (!draggingSticker.value) return
    const canvasRect = canvasRef.value.getBoundingClientRect()
    let newX = ((moveEvent.clientX - dragOffset.value.x - canvasRect.left) / canvasRect.width) * 100
    let newY = ((moveEvent.clientY - dragOffset.value.y - canvasRect.top) / canvasRect.height) * 100
    
    newX = Math.min(95, Math.max(5, Math.round(newX / 2) * 2))
    newY = Math.min(95, Math.max(5, Math.round(newY / 2) * 2))
    
    draggingSticker.value.pos_x = newX
    draggingSticker.value.pos_y = newY
  }
  
  const onMouseUp = async () => {
    if (draggingSticker.value) {
      const { error } = await supabase
        .from('background_stickers')
        .update({
          pos_x: draggingSticker.value.pos_x,
          pos_y: draggingSticker.value.pos_y
        })
        .eq('id', draggingSticker.value.id)
      
      if (error) {
        console.error('保存位置失败:', error)
      }
    }
    draggingSticker.value = null
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
  
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

// 旋转贴纸
const rotateSticker = async (sticker) => {
  const newRotation = (sticker.rotation + 90) % 360
  const { error } = await supabase
    .from('background_stickers')
    .update({ rotation: newRotation })
    .eq('id', sticker.id)
  
  if (!error) {
    sticker.rotation = newRotation
  } else {
    alert('旋转失败: ' + error.message)
  }
}

// 删除贴纸
const removeSticker = async (sticker) => {
  if (!confirm('确定要移除此贴纸吗？')) return
  
  const { error } = await supabase
    .from('background_stickers')
    .delete()
    .eq('id', sticker.id)
  
  if (!error) {
    placedStickers.value = placedStickers.value.filter(s => s.id !== sticker.id)
    if (selectedStickerId.value === sticker.id) {
      selectedStickerId.value = null
    }
  } else {
    alert('删除失败: ' + error.message)
  }
}

// 手动保存背景到全局
const saveBackground = async () => {
  const backgroundConfig = {
    stickers: placedStickers.value.map(s => ({
      id: s.id,
      sticker_slot_id: s.sticker_slot_id,
      pos_x: s.pos_x,
      pos_y: s.pos_y,
      rotation: s.rotation
    }))
  }
  
  const { error } = await supabase
    .from('user_backgrounds')
    .upsert({
      user_id: user.value.id,
      background_data: JSON.stringify(backgroundConfig),
      updated_at: new Date()
    })
  
  if (!error) {
    alert('背景已保存！')
  } else {
    alert('保存失败: ' + error.message)
  }
}

// 重置所有贴纸
const resetBackground = async () => {
  if (!confirm('确定要清空所有贴纸吗？')) return
  
  const { error } = await supabase
    .from('background_stickers')
    .delete()
    .eq('user_id', user.value.id)
  
  if (!error) {
    placedStickers.value = []
    selectedStickerId.value = null
    alert('已重置')
  } else {
    alert('重置失败: ' + error.message)
  }
}

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
  if (user.value) {
    await loadStickerData()
    await loadBackgroundStickers()
  }
})
</script>