<template>
  <div>
    <h1 class="page-title">📝 写作</h1>
    <p class="page-subtitle">记录你的灵感、梦境与思考</p>

    <!-- 左右布局：左侧竖条菜单 + 右侧写作表单 -->
    <div class="writing-layout">
      <!-- 左侧竖条菜单 -->
      <div class="scene-sidebar">
        <button 
          v-for="scene in scenes" 
          :key="scene.value"
          @click="selectedScene = scene.value"
          :class="['scene-btn', selectedScene === scene.value ? 'active' : '']"
          :title="scene.name"
        >
          <span class="scene-icon">{{ scene.icon }}</span>
          <span class="scene-name">{{ scene.name }}</span>
        </button>
      </div>

      <!-- 右侧写作表单 -->
      <div class="writing-form">
        <input 
          v-model="title" 
          type="text" 
          placeholder="标题..." 
          class="title-input"
        >
        
        <textarea 
          v-model="content" 
          rows="16" 
          placeholder="在这里写内容..." 
          class="content-textarea"
        ></textarea>

        <div class="form-actions">
          <button @click="saveEntry" class="btn btn-success">💾 保存</button>
          <button @click="showAIChat = true" class="btn btn-purple">🤖 AI助手</button>
        </div>
      </div>
    </div>

    <!-- AI 助手对话框 -->
    <div v-if="showAIChat" class="ai-chat">
      <div class="ai-chat-header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="assistant-avatar-pixel" v-html="assistantAvatarSvg"></div>
          <div>
            <span style="font-weight: 700; font-size: 20px;">{{ assistantName }}</span>
            <span style="font-size: 12px; opacity: 0.8; display: block;">AI创作助手</span>
          </div>
        </div>
        <button @click="showAIChat = false" class="close-btn">✕</button>
      </div>
      <div class="ai-chat-messages">
        <div v-for="msg in chatMessages" :key="msg.id" :class="['message', msg.role === 'user' ? 'user' : 'assistant']">
          <span class="message-bubble">{{ msg.content }}</span>
        </div>
      </div>
      <div class="ai-chat-input">
        <input 
          v-model="aiQuestion" 
          @keyup.enter="askAI" 
          placeholder="问AI一个问题..."
        >
        <button @click="askAI" class="btn btn-purple" style="padding: 16px 28px;">发送</button>
      </div>
    </div>

    <!-- AI 助手浮动按钮 -->
    <div 
      @click="showAIChat = true" 
      class="ai-float-pixel"
      v-if="!showAIChat"
    >
      <div class="pixel-avatar-wrapper" v-html="assistantAvatarSvg"></div>
      <div class="pixel-name">{{ assistantName }}</div>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  font-size: 42px;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 12px;
}

.page-subtitle {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 32px;
}

/* 左右布局 */
.writing-layout {
  display: flex;
  gap: 24px;
  align-items: stretch;
}

/* 左侧竖条菜单 */
.scene-sidebar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: white;
  border-radius: 20px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  min-width: 100px;
}

.scene-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: transparent;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.scene-btn:hover {
  background: #f3f4f6;
}

.scene-btn.active {
  background: #6366f1;
  color: white;
}

.scene-icon {
  font-size: 24px;
}

.scene-name {
  font-size: 12px;
  font-weight: 500;
}

/* 右侧写作表单 */
.writing-form {
  flex: 1;
  background: white;
  border-radius: 24px;
  padding: 28px;
  border: 1px solid #e5e7eb;
}

.title-input {
  width: 100%;
  font-size: 24px;
  font-weight: 600;
  border: none;
  border-bottom: 2px solid #e5e7eb;
  padding: 8px 0;
  margin-bottom: 20px;
}

.title-input:focus {
  outline: none;
  border-bottom-color: #6366f1;
}

.content-textarea {
  width: 100%;
  font-size: 16px;
  line-height: 1.7;
  border: none;
  padding: 8px 0;
  resize: vertical;
}

.content-textarea:focus {
  outline: none;
}

.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.btn-purple {
  background: #8b5cf6;
  color: white;
}

.btn-purple:hover {
  background: #7c3aed;
}

/* 响应式：小屏幕时竖条菜单变横向 */
@media (max-width: 640px) {
  .writing-layout {
    flex-direction: column;
  }
  
  .scene-sidebar {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .scene-btn {
    flex-direction: row;
    gap: 8px;
    padding: 8px 16px;
  }
  
  .scene-icon {
    font-size: 18px;
  }
}

/* AI 聊天框样式（保持不变） */
.ai-chat {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 420px;
  background: white;
  border-radius: 28px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1001;
}

.ai-chat-header {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: white;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  font-size: 24px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
}

.ai-chat-messages {
  height: 400px;
  overflow-y: auto;
  padding: 20px;
  background: #f9fafb;
}

.message {
  margin-bottom: 16px;
}

.message.user {
  text-align: right;
}

.message-bubble {
  display: inline-block;
  padding: 12px 18px;
  border-radius: 24px;
  max-width: 85%;
  font-size: 16px;
}

.message.user .message-bubble {
  background: #6366f1;
  color: white;
}

.message.assistant .message-bubble {
  background: #e5e7eb;
  color: #1f2937;
}

.ai-chat-input {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  background: white;
}

.ai-chat-input input {
  flex: 1;
  padding: 16px 20px;
  font-size: 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 40px;
}

/* 浮动按钮 - 桌宠风格 */
.ai-float-pixel {
  position: fixed;
  bottom: 24px;
  right: 24px;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.ai-float-pixel:hover {
  transform: scale(1.05);
}

.pixel-avatar-wrapper {
  width: 80px;
  height: 80px;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
  background: #f3f4f6;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid #8b5cf6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pixel-avatar-wrapper svg {
  width: 100%;
  height: 100%;
  display: block;
}

.pixel-name {
  font-size: 11px;
  font-weight: 600;
  color: #8b5cf6;
  background: white;
  padding: 3px 10px;
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}

.assistant-avatar-pixel {
  width: 48px;
  height: 48px;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
  background-color: #f3f4f6;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.assistant-avatar-pixel svg {
  width: 100%;
  height: 100%;
  display: block;
}
</style>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabase.js'
import { generateCroppedAvatarSVG } from '../lib/avatarHelper.js'

const scenes = [
  { value: 'diary', name: '日记', icon: '📝' },
  { value: 'academic', name: '学术笔记', icon: '📚' },
  { value: 'dream', name: '梦记', icon: '🌙' },
  { value: 'creation', name: '创作', icon: '✍️' },
  { value: 'reading', name: '读书笔记', icon: '📖' },
  { value: 'quote', name: '摘抄', icon: '✂️' }
]

const selectedScene = ref('diary')
const title = ref('')
const content = ref('')
const showAIChat = ref(false)
const aiQuestion = ref('')
const chatMessages = ref([])
const user = ref(null)

const assistantName = ref('小助手')
const assistantAvatarData = ref(null)

// 生成裁剪后居中显示的 SVG
const assistantAvatarSvg = computed(() => {
  if (!assistantAvatarData.value) {
    return generateCroppedAvatarSVG(null, 80)
  }
  return generateCroppedAvatarSVG(assistantAvatarData.value, 80)
})

const saveEntry = async () => {
  if (!title.value || !content.value) {
    alert('请填写标题和内容')
    return
  }

  const { error } = await supabase
    .from('user_entries')
    .insert([
      {
        user_id: user.value.id,
        title: title.value,
        content: content.value,
        type: selectedScene.value
      }
    ])

  if (error) {
    console.error(error)
    alert('保存失败')
  } else {
    alert('保存成功！')
    title.value = ''
    content.value = ''
  }
}

const askAI = async () => {
  if (!aiQuestion.value) return

  chatMessages.value.push({
    id: Date.now(),
    role: 'user',
    content: aiQuestion.value
  })

  setTimeout(() => {
    chatMessages.value.push({
      id: Date.now() + 1,
      role: 'assistant',
      content: `关于「${aiQuestion.value}」，这是一个很好的问题！建议你多记录相关内容，AI会帮你分析和整理。`
    })
  }, 500)

  aiQuestion.value = ''
}

const loadAssistant = async () => {
  const { data } = await supabase
    .from('assistant_profiles')
    .select('*')
    .eq('user_id', user.value.id)
    .single()
  
  if (data) {
    if (data.name) assistantName.value = data.name
    if (data.pixel_avatar) assistantAvatarData.value = data.pixel_avatar
  }
}

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
  await loadAssistant()
})
</script>