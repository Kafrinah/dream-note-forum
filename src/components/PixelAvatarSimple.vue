<template>
  <div class="pixel-editor-simple">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="tool-group">
        <button 
          @click="tool = 'brush'" 
          :class="{ active: tool === 'brush' }" 
          class="tool-btn"
        >
          画笔
        </button>
        <button 
          @click="tool = 'eyedropper'" 
          :class="{ active: tool === 'eyedropper' }" 
          class="tool-btn"
        >
          吸色
        </button>
        <button 
          @click="tool = 'eraser'" 
          :class="{ active: tool === 'eraser' }" 
          class="tool-btn"
        >
          橡皮
        </button>
      </div>

      <div class="tool-group">
        <button @click="clearCanvas" class="tool-btn">清空</button>
        <button @click="autoDetectBorder" class="tool-btn">识别边框</button>
        <button @click="save" class="tool-btn btn-primary">保存</button>
      </div>
    </div>

    <!-- 像素画板 -->
    <div class="pixel-canvas-wrapper">
      <div class="pixel-canvas" style="width: 400px; height: 400px;">
        <div v-for="(row, y) in displayPixels" :key="y" class="pixel-row">
          <div 
            v-for="(color, x) in row" 
            :key="x" 
            class="pixel"
            :style="{ backgroundColor: color, width: '8px', height: '8px' }"
            @click="paintPixel(x, y)"
          ></div>
        </div>
      </div>
    </div>

    <!-- 边框预览 -->
    <div v-if="borderPixels.length > 0" class="border-preview">
      <div class="border-title">识别到的边框（{{ borderPixels.length }}个像素）</div>
      <div class="border-hint">边框已自动识别，保存时会一起保存</div>
    </div>

    <!-- 调色盘 -->
    <div class="color-palette">
      <div 
        v-for="color in colors" 
        :key="color"
        class="color-option"
        :style="{ backgroundColor: color, border: selectedColor === color ? '3px solid #A9C9C4' : '3px solid transparent' }"
        @click="selectColor(color)"
      ></div>
      <div class="color-option eraser" @click="selectColor('#f3f4f6')"></div>
    </div>

    <div class="custom-color">
      <input type="color" v-model="customColor" @change="selectColor(customColor)">
      <span>自定义颜色</span>
    </div>

    <div class="editor-hint">
      提示：绘制完图案后点击「识别边框」，边框内的区域将作为贴纸形状
    </div>
  </div>
</template>

<style scoped>
.pixel-editor-simple {
  padding: 16px;
  background: #f9fafb;
  border-radius: 20px;
  box-shadow: -5px -5px 10px rgba(255, 255, 255, 0.8),
             5px 5px 10px rgba(0, 0, 0, 0.1);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
  box-shadow: inset -3px -3px 6px rgba(255, 255, 255, 0.8),
            inset 3px 3px 6px rgba(0, 0, 0, 0.1);
}

.tool-group {
  display: flex;
  gap: 8px;
}

.tool-btn {
  padding: 8px 16px;
  font-size: 13px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: -5px -5px 10px rgba(255, 255, 255, 0.8),
             5px 5px 10px rgba(0, 0, 0, 0.1);
}

.tool-btn.active {
  background: #614A44;
  color: white;
  border-color: #614A44;
  box-shadow: inset -3px -3px 6px #614A44,
            inset 3px 3px 6px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: #A9C9C4;
  color: white;
  box-shadow: -5px -5px 10px rgba(255, 255, 255, 0.8),
             5px 5px 10px rgba(0, 0, 0, 0.1);
}

.pixel-canvas-wrapper {
  overflow: auto;
  display: flex;
  justify-content: center;
  background: #e5e7eb;
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 16px;
  box-shadow: inset -3px -3px 6px rgba(255, 255, 255, 0.8),
            inset 3px 3px 6px rgba(0, 0, 0, 0.1);
}

.pixel-canvas {
  display: flex;
  flex-direction: column;
  background: white;
  box-shadow: -5px -5px 10px rgba(255, 255, 255, 0.8),
             5px 5px 10px rgba(0, 0, 0, 0.1);
}

.pixel-row {
  display: flex;
}

.pixel {
  cursor: pointer;
  transition: all 0.05s;
}

.pixel:hover {
  filter: brightness(0.85);
}

.color-palette {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin: 16px 0;
  box-shadow: inset -3px -3px 6px rgba(255, 255, 255, 0.8),
            inset 3px 3px 6px rgba(0, 0, 0, 0.1);
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: -5px -5px 10px rgba(255, 255, 255, 0.8),
             5px 5px 10px rgba(0, 0, 0, 0.1);
}

.custom-color {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  margin-bottom: 16px;
}

.border-preview {
  background: #e0f2fe;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 16px;
  text-align: center;
}

.border-title {
  font-weight: bold;
  color: #0369a1;
  margin-bottom: 4px;
}

.border-hint {
  font-size: 12px;
  color: #0c4a6e;
}

.editor-hint {
  text-align: center;
  font-size: 12px;
  color: #6b7280;
  padding: 8px;
  background: #f3f4f6;
  border-radius: 10px;
}
</style>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { detectBorder } from '../lib/borderDetect.js'

const props = defineProps({
  initialPixels: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['save', 'detectBorder'])

const size = 100
const displaySize = 50
const pixels = ref([])
const tool = ref('brush')
const selectedColor = ref('#A9C9C4')
const customColor = ref('#A9C9C4')
const borderPixels = ref([])

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#000000', '#FFFFFF', '#FF6B35', '#2EC4B6', '#E71D36'
]

const displayPixels = computed(() => {
  const scale = size / displaySize
  const result = []
  for (let i = 0; i < displaySize; i++) {
    const row = []
    for (let j = 0; j < displaySize; j++) {
      const srcY = Math.floor(i * scale)
      const srcX = Math.floor(j * scale)
      row.push(pixels.value[srcY]?.[srcX] || '#f3f4f6')
    }
    result.push(row)
  }
  return result
})

const initCanvas = () => {
  if (props.initialPixels) {
    try {
      const saved = JSON.parse(props.initialPixels)
      if (saved && saved.length === size * size) {
        const newPixels = []
        for (let i = 0; i < size; i++) {
          newPixels.push(saved.slice(i * size, (i + 1) * size))
        }
        pixels.value = newPixels
        return
      }
    } catch(e) {}
  }
  
  const newPixels = []
  for (let i = 0; i < size; i++) {
    const row = []
    for (let j = 0; j < size; j++) {
      row.push('#f3f4f6')
    }
    newPixels.push(row)
  }
  pixels.value = newPixels
}

const selectColor = (color) => {
  selectedColor.value = color
  customColor.value = color
}

const paintPixel = (displayX, displayY) => {
  const scale = size / displaySize
  const centerX = Math.floor(displayX * scale)
  const centerY = Math.floor(displayY * scale)
  
  if (tool.value === 'eyedropper') {
    const color = pixels.value[centerY]?.[centerX] || '#f3f4f6'
    if (color !== '#f3f4f6') {
      selectColor(color)
    }
    tool.value = 'brush'
  } else if (tool.value === 'eraser') {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const ny = centerY + dy
        const nx = centerX + dx
        if (ny >= 0 && ny < size && nx >= 0 && nx < size) {
          pixels.value[ny][nx] = '#f3f4f6'
        }
      }
    }
  } else {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const ny = centerY + dy
        const nx = centerX + dx
        if (ny >= 0 && ny < size && nx >= 0 && nx < size) {
          pixels.value[ny][nx] = selectedColor.value
        }
      }
    }
  }
}

const clearCanvas = () => {
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      pixels.value[i][j] = '#f3f4f6'
    }
  }
  borderPixels.value = []
}

const autoDetectBorder = () => {
  // 将像素数据扁平化
  const flatPixels = []
  for (let i = 0; i < size; i++) {
    flatPixels.push(...pixels.value[i])
  }
  borderPixels.value = detectBorder(flatPixels, size)
  emit('detectBorder', flatPixels)
}

const save = () => {
  const flatPixels = []
  for (let i = 0; i < size; i++) {
    flatPixels.push(...pixels.value[i])
  }
  console.log('PixelAvatarSimple 保存，数据长度:', flatPixels.length)
  emit('save', JSON.stringify(flatPixels))
}

onMounted(() => {
  initCanvas()
})
</script>