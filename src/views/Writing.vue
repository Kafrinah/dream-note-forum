<template>
  <div>
    <h1 class="page-title">📝 写作</h1>
    <p class="page-subtitle">记录你的灵感、梦境与思考</p>
    
    <!-- 写作场景选择 -->
    <div class="scenes-wrapper">
      <button 
        v-for="scene in scenes" 
        :key="scene.value"
        @click="selectedScene = scene.value"
        :class="['scene-tag', selectedScene === scene.value ? 'active' : '']"
      >
        <span>{{ scene.icon }}</span>
        <span>{{ scene.name }}</span>
      </button>
    </div>

    <!-- 写作表单 -->
    <div class="card">
      <input 
        v-model="title" 
        type="text" 
        placeholder="标题..." 
        style="font-size: 24px; font-weight: 600; margin-bottom: 20px;"
      >
      
      <textarea 
        v-model="content" 
        rows="16" 
        placeholder="在这里写内容..." 
        style="font-size: 18px; line-height: 1.7;"
      ></textarea>

      <div style="display: flex; gap: 16px; margin-top: 24px;">
        <button @click="saveEntry" class="btn btn-success">💾 保存</button>
        <button @click="showAIChat = true" class="btn btn-purple">🤖 AI助手</button>
      </div>
    </div>

    <!-- AI 助手对话框 -->
    <div v-if="showAIChat" class="ai-chat">
      <div class="ai-chat-header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="assistant-avatar-pixel" v-html="dialogAvatarSvg"></div>
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

    <!-- AI 助手浮动按钮 - 桌宠风格，居中显示 -->
    <div 
      @click="showAIChat = true" 
      class="ai-float-pixel"
      v-if="!showAIChat"
    >
      <div class="pixel-avatar-wrapper" v-html="croppedAvatarSvg"></div>
      <div class="pixel-name">{{ assistantName }}</div>
    </div>
  </div>
</template>

<style scoped>
.scenes-wrapper {
  display: flex;
  gap: 14px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.card {
  background: white;
  border-radius: 24px;
  padding: 28px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 32px;
  font-size: 18px;
  font-weight: 600;
  border: none;
  border-radius: 16px;
  cursor: pointer;
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

.scene-tag {
  padding: 14px 28px;
  font-size: 17px;
  font-weight: 600;
  border-radius: 60px;
  background: #f3f4f6;
  border: none;
  cursor: pointer;
}

.scene-tag.active {
  background: #6366f1;
  color: white;
}

.page-title {
  font-size: 42px;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 12px;
}

.page-subtitle {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 40px;
}

/* AI 聊天框 */
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

/* AI 对话框内的头像 */
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
import { findFirstBadWord } from '../lib/badWords.js'

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
const croppedAvatarSvg = computed(() => {
  if (!assistantAvatarData.value) {
    return generateCroppedAvatarSVG(null, 80)
  }
  return generateCroppedAvatarSVG(assistantAvatarData.value, 80)
})

// 对话框内的小头像
const dialogAvatarSvg = computed(() => {
  if (!assistantAvatarData.value) {
    return generateCroppedAvatarSVG(null, 48)
  }
  return generateCroppedAvatarSVG(assistantAvatarData.value, 48)
})

const saveEntry = async () => {
  if (!title.value || !content.value) {
    alert('请填写标题和内容')
    return
  }
  
  // 敏感词检测
  const titleBadWord = await findFirstBadWord(title.value)
  if (titleBadWord) {
    alert(`标题包含敏感词「${titleBadWord}」，请修改后重试`)
    return
  }
  
  const contentBadWord = await findFirstBadWord(content.value)
  if (contentBadWord) {
    alert(`内容包含敏感词「${contentBadWord}」，请修改后重试`)
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