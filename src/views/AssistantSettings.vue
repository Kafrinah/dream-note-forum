<template>
  <div class="assistant-settings">
    <h1 class="page-title">🎨 我的 AI 助手</h1>
    <p class="page-subtitle">设计属于你的专属创作伙伴</p>

    <PixelAvatar :initialPixels="savedAvatar" @save="saveAssistant" />

    <div class="name-section">
      <label>给助手起个名字</label>
      <div class="name-input-group">
        <input v-model="assistantName" placeholder="例如：小梦、笔灵、梦灵" class="name-input">
        <button @click="saveName" class="btn-primary">保存名字</button>
      </div>
      <p v-if="savedName" class="saved-name">当前名字：{{ savedName }}</p>
    </div>

    <div class="preview-section">
      <h3>预览效果</h3>
      <div class="preview">
        <div class="preview-avatar" v-html="avatarImageUrl"></div>
        <span class="preview-name">{{ savedName || '未命名' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.assistant-settings {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 42px;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #A9C9C4, #614A44);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.page-subtitle {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 40px;
}

.name-section {
  background: #faf6ee;
  border-radius: 28px;
  padding: 32px;
  margin-top: 40px;
  box-shadow: -5px -5px 10px rgba(255, 255, 255, 0.8),
             5px 5px 10px rgba(0, 0, 0, 0.1);
}

.name-section label {
  display: block;
  font-weight: 600;
  margin-bottom: 16px;
  font-size: 20px;
}

.name-input-group {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.name-input {
  flex: 1;
  padding: 16px 20px;
  font-size: 18px;
  background: #faf6ee;
  border: none;
  border-radius: 16px;
  box-shadow: inset -3px -3px 6px rgba(255, 255, 255, 0.8),
            inset 3px 3px 6px rgba(0, 0, 0, 0.1);
}

.saved-name {
  color: #A9C9C4;
  font-size: 16px;
}

.preview-section {
  background: #faf6ee;
  border-radius: 28px;
  padding: 32px;
  margin-top: 24px;
  box-shadow: -5px -5px 10px rgba(255, 255, 255, 0.8),
             5px 5px 10px rgba(0, 0, 0, 0.1);
}

.preview-section h3 {
  font-size: 20px;
  margin-bottom: 24px;
}

.preview {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px;
  background: #faf6ee;
  border-radius: 24px;
  box-shadow: inset -3px -3px 6px rgba(255, 255, 255, 0.8),
            inset 3px 3px 6px rgba(0, 0, 0, 0.1);
}

.preview-avatar {
  width: 80px;
  height: 80px;
  background-color: #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-avatar svg {
  width: 100%;
  height: 100%;
  display: block;
}

.preview-name {
  font-size: 22px;
  font-weight: 600;
}

.btn-primary {
  background: #A9C9C4;
  color: white;
  padding: 16px 32px;
  border: none;
  border-radius: 40px;
  font-size: 18px;
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
import { supabase } from '../lib/supabase.js'
import PixelAvatar from '../components/PixelAvatar.vue'
import { generateCroppedAvatarSVG } from '../lib/avatarHelper.js'

const user = ref(null)
const assistantName = ref('')
const savedName = ref('')
const savedAvatar = ref(null)

const loadProfile = async () => {
  const { data } = await supabase
    .from('assistant_profiles')
    .select('*')
    .eq('user_id', user.value.id)
    .single()
  
  if (data) {
    savedName.value = data.name
    savedAvatar.value = data.pixel_avatar
    assistantName.value = data.name
  }
}

const saveAssistant = async (avatarData) => {
  const { error } = await supabase
    .from('assistant_profiles')
    .upsert({
      user_id: user.value.id,
      pixel_avatar: avatarData,
      name: assistantName.value || '小助手'
    })
  
  if (!error) {
    savedAvatar.value = avatarData
    alert('形象保存成功！')
  } else {
    alert('保存失败')
  }
}

const saveName = async () => {
  if (!assistantName.value) return
  
  const { error } = await supabase
    .from('assistant_profiles')
    .upsert({
      user_id: user.value.id,
      name: assistantName.value
    })
  
  if (!error) {
    savedName.value = assistantName.value
    alert('名字保存成功！')
  }
}

const avatarImageUrl = computed(() => {
  if (!savedAvatar.value) return ''
  return generateCroppedAvatarSVG(savedAvatar.value, 80)
})

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
  await loadProfile()
})
</script>