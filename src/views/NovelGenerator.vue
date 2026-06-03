<template>
  <div class="novel-generator">
    <h1 class="page-title">✨ 灵感拓延器</h1>
    <p class="page-subtitle">基于你的笔记和梦境，创作专属小说</p>

    <div class="selector-section">
      <h3>选择素材</h3>
      <div class="material-list">
        <div class="material-group">
          <h4>笔记</h4>
          <div v-for="note in notes" :key="note.id" class="material-item">
            <input type="checkbox" :value="note" v-model="selectedNotes">
            <span>{{ note.title }}</span>
          </div>
          <div v-if="notes.length === 0" class="empty-hint">暂无笔记，先去写一些吧～</div>
        </div>
        <div class="material-group">
          <h4>梦境</h4>
          <div v-for="dream in dreams" :key="dream.id" class="material-item">
            <input type="checkbox" :value="dream" v-model="selectedDreams">
            <span>{{ dream.title }}</span>
          </div>
          <div v-if="dreams.length === 0" class="empty-hint">暂无梦境，先去记录一些吧～</div>
        </div>
      </div>

      <div class="prompt-section">
        <label>额外提示（可选）</label>
        <textarea v-model="additionalPrompt" placeholder="例如：悬疑风格、温暖治愈、科幻等..." rows="3"></textarea>
      </div>

      <button @click="generateNovel" :disabled="isGenerating" class="generate-btn">
        {{ isGenerating ? '生成中...' : '生成小说' }}
      </button>
    </div>

    <div v-if="novel" class="result-section">
      <h3>生成的小说</h3>
      <div class="novel-content">{{ novel }}</div>
      <div class="result-actions">
        <button @click="copyNovel" class="copy-btn">复制</button>
        <button @click="publishToForum" class="publish-btn">发布到论坛</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.novel-generator {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 12px;
  color: #1f2937;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.page-subtitle {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 32px;
}

.selector-section {
  background: white;
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 24px;
}

.material-list {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.material-group {
  flex: 1;
  min-width: 200px;
}

.material-group h4 {
  margin-bottom: 12px;
  font-size: 16px;
  color: #374151;
}

.material-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 6px;
  border-radius: 8px;
}

.material-item:hover {
  background: #f3f4f6;
}

.empty-hint {
  color: #9ca3af;
  font-size: 13px;
  padding: 12px;
  text-align: center;
}

.prompt-section {
  margin-bottom: 24px;
}

.prompt-section label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.prompt-section textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  resize: vertical;
  font-family: inherit;
}

.prompt-section textarea:focus {
  outline: none;
  border-color: #6366f1;
}

.generate-btn {
  background: #6366f1;
  color: white;
  padding: 14px 28px;
  border: none;
  border-radius: 40px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.generate-btn:hover:not(:disabled) {
  background: #4f46e5;
  transform: translateY(-1px);
}

.generate-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.result-section {
  background: white;
  border-radius: 24px;
  padding: 24px;
}

.result-section h3 {
  margin-bottom: 16px;
  font-size: 18px;
}

.novel-content {
  background: #f9fafb;
  padding: 20px;
  border-radius: 16px;
  white-space: pre-wrap;
  line-height: 1.8;
  margin: 16px 0;
  max-height: 500px;
  overflow-y: auto;
}

.result-actions {
  display: flex;
  gap: 16px;
}

.copy-btn, .publish-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn {
  background: #f3f4f6;
  color: #4b5563;
}

.copy-btn:hover {
  background: #e5e7eb;
}

.publish-btn {
  background: #10b981;
  color: white;
}

.publish-btn:hover {
  background: #059669;
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase.js'
import { generateNovel as callGenerateNovel } from '../lib/ai.js'
import { findFirstBadWord } from '../lib/badWords.js'

const user = ref(null)
const notes = ref([])
const dreams = ref([])
const selectedNotes = ref([])
const selectedDreams = ref([])
const additionalPrompt = ref('')
const novel = ref('')
const isGenerating = ref(false)

const loadMaterials = async () => {
  if (!user.value) return

  const { data: notesData } = await supabase
    .from('user_entries')
    .select('*')
    .eq('user_id', user.value.id)
    .eq('type', 'note')
    .order('created_at', { ascending: false })

  const { data: dreamsData } = await supabase
    .from('user_entries')
    .select('*')
    .eq('user_id', user.value.id)
    .eq('type', 'dream')
    .order('created_at', { ascending: false })

  notes.value = notesData || []
  dreams.value = dreamsData || []
}

const generateNovel = async () => {
  if (selectedNotes.value.length === 0 && selectedDreams.value.length === 0) {
    alert('请至少选择一篇笔记或梦境')
    return
  }

  isGenerating.value = true
  novel.value = ''

  try {
    const result = await callGenerateNovel(
      selectedNotes.value,
      selectedDreams.value,
      additionalPrompt.value
    )
    novel.value = result
  } catch (error) {
    alert('生成失败: ' + error.message)
  } finally {
    isGenerating.value = false
  }
}

const copyNovel = () => {
  navigator.clipboard.writeText(novel.value)
  alert('已复制到剪贴板')
}

const publishToForum = async () => {
  if (!novel.value) return
  
  const title = prompt('请输入帖子标题', `🤖 AI 小说 - ${new Date().toLocaleDateString()}`)
  if (!title) return
  
  // 敏感词检测
  const titleBadWord = await findFirstBadWord(title)
  if (titleBadWord) {
    alert(`标题包含敏感词「${titleBadWord}」，请修改后重试`)
    return
  }
  
  const contentBadWord = await findFirstBadWord(novel.value)
  if (contentBadWord) {
    alert(`内容包含敏感词「${contentBadWord}」，请修改后重试`)
    return
  }

  const { error } = await supabase.from('forum_posts').insert({
    user_id: user.value.id,
    title: title,
    content: novel.value,
    is_ai_generated: true
  })

  if (!error) {
    alert('发布成功！')
  } else {
    alert('发布失败: ' + error.message)
  }
}


onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
  await loadMaterials()
})
</script>