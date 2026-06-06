<template>
  <div class="pixel-editor">
    <h2 class="pixel-title">设计你的专属 AI 助手</h2>
    <p class="pixel-subtitle">点击格子填色，创造一个属于你的小伙伴</p>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="tool-group">
        <button 
          @click="tool = 'brush'" 
          :class="{ active: tool === 'brush' }" 
          class="tool-btn"
          title="画笔"
        >
          画笔
        </button>
        <button 
          @click="tool = 'eyedropper'" 
          :class="{ active: tool === 'eyedropper' }" 
          class="tool-btn"
          title="吸色笔"
        >
          吸色
        </button>
        <button 
          @click="tool = 'eraser'" 
          :class="{ active: tool === 'eraser' }" 
          class="tool-btn"
          title="橡皮"
        >
          橡皮
        </button>
      </div>

      <div class="grid-control">
        <label>
          <input type="checkbox" v-model="showGrid">
          显示辅助线
        </label>
      </div>
    </div>

    <!-- 当前工具提示 -->
    <div class="tool-hint" v-if="tool === 'eyedropper'">
      吸色笔模式：点击任意格子吸取颜色，然后切换回画笔使用
    </div>

    <!-- 像素画板 -->
    <div class="pixel-canvas-wrapper">
      <div 
        class="pixel-canvas"
        :style="{ width: canvasWidth + 'px', height: canvasWidth + 'px' }"
      >
        <div v-for="(row, y) in displayPixels" :key="y" class="pixel-row">
          <div 
            v-for="(color, x) in row" 
            :key="x" 
            class="pixel"
            :class="{ 'grid-line': showGrid }"
            :style="{ 
              backgroundColor: color, 
              width: pixelSize + 'px', 
              height: pixelSize + 'px',
              borderRight: showGrid ? '0.5px solid #ccc' : 'none',
              borderBottom: showGrid ? '0.5px solid #ccc' : 'none'
            }"
            @click="handlePixelClick(x, y)"
          ></div>
        </div>
      </div>
    </div>

    <p class="hint">提示：吸色笔点击格子取色，然后切换回画笔继续绘制</p>

    <!-- 调色盘 -->
    <div class="color-palette">
      <div class="palette-title">调色盘</div>
      <div class="colors-grid">
        <div 
          v-for="color in presetColors" 
          :key="color"
          class="color-option"
          :style="{ backgroundColor: color, border: selectedColor === color ? '3px solid #6366f1' : '3px solid transparent' }"
          @click="selectColor(color)"
        ></div>
      </div>
      <div class="custom-color">
        <input type="color" v-model="customColor" @change="selectColor(customColor)">
        <span>自定义</span>
      </div>
    </div>

    <!-- 当前颜色显示 -->
    <div class="current-color">
      <span>当前颜色：</span>
      <div class="color-preview" :style="{ backgroundColor: selectedColor }"></div>
      <span class="color-code">{{ selectedColor }}</span>
    </div>

    <!-- 操作按钮 -->
    <div class="pixel-actions">
      <button @click="clearCanvas" class="btn-secondary">清空</button>
      <button @click="randomCanvas" class="btn-secondary">随机</button>
      <button @click="applySymmetry" class="btn-secondary">左右对称</button>
      <button @click="saveAvatar" class="btn-primary">保存形象</button>
    </div>
  </div>
</template>

<style scoped>
.pixel-editor {
  background: #faf6ee;
  border-radius: 32px;
  padding: 32px;
  width: 100%;
  max-width: none;
  box-shadow: -5px -5px 10px rgba(255, 255, 255, 0.8),
             5px 5px 10px rgba(0, 0, 0, 0.1);
}

.pixel-title {
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 8px;
  color: #1f2937;
}

.pixel-subtitle {
  text-align: center;
  color: #6b7280;
  margin-bottom: 24px;
  font-size: 16px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px;
  background: #faf6ee;
  border-radius: 20px;
  box-shadow: inset -3px -3px 6px rgba(255, 255, 255, 0.8),
            inset 3px 3px 6px rgba(0, 0, 0, 0.1);
}

.tool-group {
  display: flex;
  gap: 8px;
}

.tool-btn {
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 500;
  background: white;
  border: 1px solid #faf6ee;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: -5px -5px 10px rgba(255, 255, 255, 0.8),
             5px 5px 10px rgba(0, 0, 0, 0.1);
}

.tool-btn.active {
  background: #A9C9C4;
  color: white;
  border-color: #A9C9C4;
  box-shadow: inset -3px -3px 6px #A9C9C4,
            inset 3px 3px 6px rgba(0, 0, 0, 0.1);
}

.tool-btn:hover:not(.active) {
  background: #e6e3de;
}

.tool-hint {
  background: #faf6ee;
  color: #d97706;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 13px;
  margin-bottom: 16px;
  text-align: center;
}

.grid-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.grid-control label {
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
}

.hint {
  text-align: center;
  font-size: 12px;
  color: #615f5b;
  margin: 12px 0;
}

.pixel-canvas-wrapper {
  overflow: auto;
  display: flex;
  justify-content: center;
  background: #f4efe6;
  padding: 20px;
  border-radius: 20px;
  margin: 16px 0;
  max-height: 600px;
  box-shadow: inset -3px -3px 6px rgba(255, 255, 255, 0.8),
            inset 3px 3px 6px rgba(0, 0, 0, 0.1);
}

.pixel-canvas {
  display: flex;
  flex-direction: column;
  background: white;
  flex-shrink: 0;
  box-shadow: -5px -5px 10px rgba(255, 255, 255, 0.8),
             5px 5px 10px rgba(0, 0, 0, 0.1);
}

.pixel-row {
  display: flex;
}

.pixel {
  cursor: pointer;
  transition: all 0.05s;
  box-sizing: border-box;
}

.pixel:hover {
  filter: brightness(0.85);
}

.color-palette {
  background: #faf6ee;
  border-radius: 20px;
  padding: 16px;
  margin: 20px 0;
  box-shadow: inset -3px -3px 6px rgba(255, 255, 255, 0.8),
            inset 3px 3px 6px rgba(0, 0, 0, 0.1);
}

.palette-title {
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 12px;
}

.colors-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  box-shadow: -5px -5px 10px rgba(255, 255, 255, 0.8),
             5px 5px 10px rgba(0, 0, 0, 0.1);
}

.color-option:hover {
  transform: scale(1.1);
}

.custom-color {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.custom-color input {
  width: 50px;
  height: 40px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
}

.custom-color span {
  font-size: 13px;
  color: #6b7280;
}

.current-color {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
  padding: 10px;
  background: #faf6ee;
  border-radius: 12px;
}

.color-preview {
  width: 30px;
  height: 30px;
  border-radius: 15px;
  border: 1px solid #e5e7eb;
}

.color-code {
  font-family: monospace;
  font-size: 13px;
  color: #4b5563;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.pixel-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
}

.btn-secondary {
  background: #f9f9f9;
  color: #4b5563;
  padding: 12px 24px;
  border: none;
  border-radius: 40px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: -5px -5px 10px rgba(255, 255, 255, 0.8),
             5px 5px 10px rgba(0, 0, 0, 0.1);
}

.btn-secondary:hover {
  background: #e4e2dd;
}

.btn-primary {
  background: #A9C9C4;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 40px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: -5px -5px 10px rgba(255, 255, 255, 0.8),
             5px 5px 10px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  background: #A9C9C4;
}
</style>

<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  initialPixels: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['save'])

// 工具类型
const tool = ref('brush') // brush, eyedropper, eraser
const showGrid = ref(true)

// 固定 100x100
const size = 100
const displaySize = 40
const canvasSize = 400
const canvasWidth = 400
const pixelSize = computed(() => canvasSize / displaySize)

// 像素数据
const pixels = ref([])

// 当前颜色
const selectedColor = ref('#A9C9C4')
const customColor = ref('#A9C9C4')

// 预设颜色
const presetColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#000000', '#FFFFFF', '#FF6B35', '#2EC4B6', '#E71D36',
  '#F39C12', '#9B59B6', '#1ABC9C', '#E67E22', '#3498DB'
]

// 显示用的像素（缩放）
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

// 选择颜色
const selectColor = (color) => {
  selectedColor.value = color
  customColor.value = color
}

// 处理格子点击（根据当前工具）
const handlePixelClick = (displayX, displayY) => {
  const scale = size / displaySize
  const centerX = Math.floor(displayX * scale)
  const centerY = Math.floor(displayY * scale)
  
  if (tool.value === 'eyedropper') {
    // 吸色：获取当前格子的颜色
    const color = pixels.value[centerY]?.[centerX] || '#f3f4f6'
    if (color !== '#f3f4f6') {
      selectColor(color)
    }
    // 自动切换回画笔模式
    tool.value = 'brush'
  } else if (tool.value === 'eraser') {
    // 橡皮：涂成背景色
    const half = 1
    for (let dy = -half; dy <= half; dy++) {
      for (let dx = -half; dx <= half; dx++) {
        const ny = centerY + dy
        const nx = centerX + dx
        if (ny >= 0 && ny < size && nx >= 0 && nx < size) {
          pixels.value[ny][nx] = '#f3f4f6'
        }
      }
    }
  } else {
    // 画笔模式
    const half = 1
    for (let dy = -half; dy <= half; dy++) {
      for (let dx = -half; dx <= half; dx++) {
        const ny = centerY + dy
        const nx = centerX + dx
        if (ny >= 0 && ny < size && nx >= 0 && nx < size) {
          pixels.value[ny][nx] = selectedColor.value
        }
      }
    }
  }
}

// 清空画板
const clearCanvas = () => {
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      pixels.value[i][j] = '#f3f4f6'
    }
  }
}

// 随机生成
const randomCanvas = () => {
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (Math.random() > 0.92) {
        pixels.value[i][j] = presetColors[Math.floor(Math.random() * presetColors.length)]
      } else {
        pixels.value[i][j] = '#f3f4f6'
      }
    }
  }
}

// 左右对称
const applySymmetry = () => {
  const half = Math.floor(size / 2)
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < half; j++) {
      const right = size - 1 - j
      pixels.value[i][right] = pixels.value[i][j]
    }
  }
}

const setPixel = (y, x, color) => {
  if (y >= 0 && y < size && x >= 0 && x < size) {
    pixels.value[y][x] = color
  }
}

// 初始化画板
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
  
  // 默认全灰色
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

// 保存
const saveAvatar = () => {
  const flatPixels = []
  for (let i = 0; i < size; i++) {
    flatPixels.push(...pixels.value[i])
  }
  emit('save', JSON.stringify(flatPixels))
}

onMounted(() => {
  initCanvas()
})
</script>