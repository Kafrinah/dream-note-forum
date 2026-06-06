<template>
  <div>
    <h1 class="page-title">🎨 我的贴纸位</h1>
    <p class="page-subtitle">成就解锁的空白画布，创造属于你的贴纸</p>

    <!-- 贴纸位网格 -->
    <div class="slots-grid">
      <div 
        v-for="slot in slots" 
        :key="slot.slot_index" 
        class="slot-card"
        @click="openEditor(slot)"
      >
        <div class="slot-preview" v-html="getSlotPreview(slot)"></div>
        <div class="slot-info">
          <span class="slot-name">{{ slot.name || `贴纸 ${slot.slot_index}` }}</span>
          <button 
            v-if="slot.pixel_data" 
            @click.stop="deleteSlot(slot)" 
            class="delete-slot-btn"
          >清除</button>
        </div>
      </div>
      
      <div v-if="slots.length === 0" class="empty-slots">
        还没有贴纸位，完成成就后点击领取奖励获得
      </div>
    </div>

    <!-- 贴纸编辑器弹窗 -->
    <div v-if="editingSlot" class="modal-overlay" @click.self="closeEditor">
      <div class="modal-card modal-large">
        <div class="modal-header">
          <h2>编辑贴纸：{{ editingSlot.name || `贴纸 ${editingSlot.slot_index}` }}</h2>
          <button @click="closeEditor" class="close-modal">✕</button>
        </div>
        <div class="modal-body">
          <PixelAvatarSimple 
            :initialPixels="editingSlot.pixel_data"
            @save="saveSticker"
          />
        </div>
        <div class="modal-footer">
          <button @click="closeEditor" class="btn-secondary">取消</button>
          <button @click="saveStickerAndClose" class="btn-primary">保存贴纸</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

/* 贴纸位响应式 */
@media (max-width: 768px) {
  .slots-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 12px;
  }
  
  .slot-preview {
    width: 80px;
    height: 80px;
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

.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
}

.slot-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid #ffffff;
  box-shadow: -5px -5px 10px rgba(255, 255, 255, 0.8),
             5px 5px 10px rgba(0, 0, 0, 0.1);
}

.slot-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-color: #ffffff;
}

.slot-preview {
  width: 100px;
  height: 100px;
  margin: 0 auto 12px;
  background: #f3f4f6;
  border-radius: 12px;
  overflow: hidden;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
  box-shadow: inset -3px -3px 6px rgba(255, 255, 255, 0.8),
            inset 3px 3px 6px rgba(0, 0, 0, 0.1);
}

.slot-preview svg {
  width: 100%;
  height: 100%;
}

.slot-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.slot-name {
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
}

.delete-slot-btn {
  background: #614A44;
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  cursor: pointer;
  box-shadow: -5px -5px 10px rgba(255, 255, 255, 0.8),
             5px 5px 10px rgba(0, 0, 0, 0.1);
}

.empty-slots {
  text-align: center;
  padding: 60px;
  color: #9ca3af;
  font-size: 16px;
  grid-column: 1 / -1;
}

.modal-large {
  max-width: 700px;
  width: 90%;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: white;
  border-radius: 28px;
  width: 90%;
  max-width: 550px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.close-modal {
  background: #f3f4f6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  font-size: 18px;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-secondary {
  background: #f3f4f6;
  color: #4b5563;
  padding: 10px 20px;
  border: none;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: -5px -5px 10px rgba(255, 255, 255, 0.8),
             5px 5px 10px rgba(0, 0, 0, 0.1);
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #A9C9C4;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: -5px -5px 10px rgba(255, 255, 255, 0.8),
             5px 5px 10px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  background: #A9C9C4;
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase.js'
import PixelAvatarSimple from '../components/PixelAvatarSimple.vue'
import { generateStickerSVG } from '../lib/borderDetect.js'

const user = ref(null)
const slots = ref([])
const editingSlot = ref(null)
const pendingSaveData = ref(null)

const getSlotPreview = (slot) => {
  if (!slot.pixel_data) {
    return '<svg width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="#9ca3af" font-size="10">空白</text></svg>'
  }
  return generateStickerSVG(slot.pixel_data, 100)
}

const loadSlots = async () => {
  const { data } = await supabase
    .from('sticker_slots')
    .select('*')
    .eq('user_id', user.value.id)
    .order('slot_index')
  
  slots.value = data || []
}

const openEditor = (slot) => {
  console.log('打开编辑器 - 贴纸位:', slot)
  editingSlot.value = { ...slot }
}

const closeEditor = () => {
  editingSlot.value = null
  pendingSaveData.value = null
}

const saveSticker = (pixelData) => {
  pendingSaveData.value = pixelData
}

const saveStickerAndClose = async () => {
  if (!pendingSaveData.value) {
    console.log('没有待保存的数据')
    closeEditor()
    return
  }
  
  console.log('保存贴纸 - 贴纸位ID:', editingSlot.value.id)
  console.log('保存贴纸 - 贴纸位索引:', editingSlot.value.slot_index)
  console.log('保存贴纸 - 数据长度:', pendingSaveData.value.length)
  
  const { data, error } = await supabase
    .from('sticker_slots')
    .update({
      pixel_data: pendingSaveData.value,
      updated_at: new Date()
    })
    .eq('id', editingSlot.value.id)
    .select()  // 添加 .select() 看返回的数据
  
  console.log('更新结果:', { data, error })
  
  if (!error) {
    console.log('保存成功，返回数据:', data)
    closeEditor()
    await loadSlots()
    alert('保存成功！')
  } else {
    console.error('保存失败:', error)
    alert('保存失败: ' + error.message)
  }
}

const deleteSlot = async (slot) => {
  if (!confirm('确定要清除这个贴纸吗？')) return
  
  const { error } = await supabase
    .from('sticker_slots')
    .update({
      pixel_data: null,
      name: `贴纸 ${slot.slot_index}`
    })
    .eq('id', slot.id)
  
  if (!error) {
    await loadSlots()
    alert('已清除')
  }
}

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
  await loadSlots()
})
</script>