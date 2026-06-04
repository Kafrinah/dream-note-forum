<template>
  <div v-if="novel" class="novel-editor">
    <!-- 顶部栏 -->
    <div class="editor-header">
      <div class="header-left">
        <button @click="$router.push('/novels')" class="back-btn">← 返回</button>
        <input v-model="novel.title" class="novel-title-input" placeholder="作品名称">
        <span class="status-badge" :class="novel.status">{{ getStatusText(novel.status) }}</span>
      </div>
      <div class="header-right">
        <button @click="saveNovel" class="save-btn">💾 保存</button>
        <button @click="showSettings = true" class="settings-btn">⚙️ 设置</button>
      </div>
    </div>

    <!-- 三栏布局 -->
    <div class="editor-three-columns">
      <!-- 左侧：大纲/目录 -->
      <div class="left-panel">
        <div class="panel-header">
          <span>📚 目录</span>
          <div class="panel-actions">
            <button @click="addVolume" class="icon-btn" title="添加卷">+ 卷</button>
            <button @click="addChapter" class="icon-btn" title="添加章节">+ 章</button>
          </div>
        </div>
        <div class="outline-tree">
          <div v-for="volume in volumes" :key="volume.id" class="volume-item">
            <div class="volume-header" @click="toggleVolume(volume.id)">
              <span class="toggle-icon">{{ expandedVolumes.includes(volume.id) ? '▼' : '▶' }}</span>
              <span class="volume-title">{{ volume.title || `第${volume.volume_number}卷` }}</span>
              <div class="volume-actions">
                <button @click.stop="editVolume(volume)" class="action-btn">✏️</button>
                <button @click.stop="deleteVolume(volume.id)" class="action-btn">🗑️</button>
              </div>
            </div>
            <div v-if="expandedVolumes.includes(volume.id)" class="chapters-list">
              <div 
                v-for="chapter in getChaptersByVolume(volume.id)" 
                :key="chapter.id"
                class="chapter-item"
                :class="{ active: currentChapter?.id === chapter.id }"
                @click="loadChapter(chapter)"
              >
                <span class="chapter-title">{{ chapter.title || `第${chapter.chapter_number}章` }}</span>
                <div class="chapter-actions">
                  <button @click.stop="editChapter(chapter)" class="action-btn">✏️</button>
                  <button @click.stop="deleteChapter(chapter.id)" class="action-btn">🗑️</button>
                </div>
              </div>
            </div>
          </div>
          <div v-if="chaptersWithoutVolume.length > 0" class="no-volume-chapters">
            <div class="volume-header">
              <span>📄 无卷章节</span>
            </div>
            <div class="chapters-list">
              <div 
                v-for="chapter in chaptersWithoutVolume" 
                :key="chapter.id"
                class="chapter-item"
                :class="{ active: currentChapter?.id === chapter.id }"
                @click="loadChapter(chapter)"
              >
                <span class="chapter-title">{{ chapter.title || `第${chapter.chapter_number}章` }}</span>
                <div class="chapter-actions">
                  <button @click.stop="editChapter(chapter)" class="action-btn">✏️</button>
                  <button @click.stop="deleteChapter(chapter.id)" class="action-btn">🗑️</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间：章节编辑区 -->
      <div class="center-panel">
        <div v-if="currentChapter" class="chapter-editor">
          <div class="chapter-header">
            <input v-model="currentChapter.title" class="chapter-title-input" placeholder="章节标题">
            <div class="chapter-meta">
              <span>字数：{{ currentChapter.word_count || 0 }}</span>
              <span class="status-badge small">{{ getChapterStatusText(currentChapter.status) }}</span>
            </div>
          </div>
          
          <!-- 上一章预览 -->
          <div v-if="prevChapter" class="prev-chapter-preview" @click="loadChapter(prevChapter)">
            <span>📖 上一章：{{ prevChapter.title }}</span>
            <span class="preview-text">{{ getPreview(prevChapter.content) }}</span>
          </div>
          
          <!-- 正文编辑器 -->
          <textarea 
            v-model="currentChapter.content" 
            class="chapter-content-editor"
            placeholder="在这里写下你的故事..."
            @input="updateWordCount"
          ></textarea>
          
          <div class="chapter-actions">
            <button @click="saveChapter" class="btn-primary">💾 保存章节</button>
            <button @click="showAIPanel = !showAIPanel" class="btn-ai">🤖 AI 助手</button>
          </div>
        </div>
        <div v-else class="no-chapter-selected">
          <p>选择或创建一个章节开始写作</p>
        </div>
      </div>

      <!-- 右侧：AI 对话栏 -->
      <div class="right-panel" :class="{ expanded: showAIPanel }">
        <div class="panel-header">
          <span>🤖 AI 创作助手</span>
          <button @click="showAIPanel = !showAIPanel" class="close-panel-btn">✕</button>
        </div>
        <div class="ai-chat-messages" ref="chatMessagesRef">
          <div v-for="msg in aiMessages" :key="msg.id" :class="['message', msg.role]">
            <div class="message-content">{{ msg.content }}</div>
          </div>
        </div>
        <div class="ai-input-area">
          <textarea 
            v-model="aiPrompt" 
            placeholder="输入指令，如：帮我续写下一段、润色这段文字、生成下一章大纲..."
            rows="2"
            @keydown.ctrl.enter="callAI"
          ></textarea>
          <div class="ai-actions">
            <button @click="callAI('continue')" class="ai-action-btn">续写</button>
            <button @click="callAI('polish')" class="ai-action-btn">润色</button>
            <button @click="callAI('outline')" class="ai-action-btn">大纲</button>
            <button @click="sendCustomPrompt" class="ai-send-btn">发送</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 设置弹窗 -->
    <div v-if="showSettings" class="modal-overlay" @click.self="showSettings = false">
      <div class="modal-card">
        <div class="modal-header">
          <h2>作品设置</h2>
          <button @click="showSettings = false" class="close-modal">✕</button>
        </div>
        <div class="modal-body">
          <label>作品简介</label>
          <textarea v-model="novel.description" rows="3" class="modal-textarea"></textarea>
          <label>世界观设定</label>
          <textarea v-model="novel.world_setting" rows="4" class="modal-textarea" placeholder="描述这个世界的基本设定..."></textarea>
          <label>全文大纲</label>
          <textarea v-model="novel.outline" rows="4" class="modal-textarea" placeholder="整体故事大纲..."></textarea>
        </div>
        <div class="modal-footer">
          <button @click="showSettings = false" class="btn-secondary">取消</button>
          <button @click="saveNovelSettings" class="btn-primary">保存</button>
        </div>
      </div>
    </div>

    <!-- 卷/章编辑弹窗 -->
    <div v-if="showVolumeDialog" class="modal-overlay" @click.self="showVolumeDialog = false">
      <div class="modal-card small">
        <div class="modal-header">
          <h2>{{ editingVolume ? '编辑卷' : '新建卷' }}</h2>
          <button @click="showVolumeDialog = false" class="close-modal">✕</button>
        </div>
        <div class="modal-body">
          <input v-model="volumeForm.title" placeholder="卷名（可选）" class="modal-input">
        </div>
        <div class="modal-footer">
          <button @click="showVolumeDialog = false" class="btn-secondary">取消</button>
          <button @click="saveVolume" class="btn-primary">保存</button>
        </div>
      </div>
    </div>

    <div v-if="showChapterDialog" class="modal-overlay" @click.self="showChapterDialog = false">
      <div class="modal-card small">
        <div class="modal-header">
          <h2>{{ editingChapter ? '编辑章节' : '新建章节' }}</h2>
          <button @click="showChapterDialog = false" class="close-modal">✕</button>
        </div>
        <div class="modal-body">
          <input v-model="chapterForm.title" placeholder="章节标题" class="modal-input">
          <select v-model="chapterForm.volume_id" class="modal-select">
            <option :value="null">无卷</option>
            <option v-for="vol in volumes" :key="vol.id" :value="vol.id">{{ vol.title || `第${vol.volume_number}卷` }}</option>
          </select>
        </div>
        <div class="modal-footer">
          <button @click="showChapterDialog = false" class="btn-secondary">取消</button>
          <button @click="saveChapterInfo" class="btn-primary">保存</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading">加载中...</div>
</template>

<style scoped>
.novel-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

/* 顶部栏 */
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 12px;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.back-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #614A44;
}

.novel-title-input {
  font-size: 18px;
  font-weight: 600;
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
}

.status-badge.planning { background: #fef3c7; color: #d97706; }
.status-badge.writing { background: #dbeafe; color: #2563eb; }
.status-badge.revising { background: #fce7f3; color: #db2777; }
.status-badge.completed { background: #d1fae5; color: #059669; }

.save-btn, .settings-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.save-btn {
  background: #10b981;
  color: white;
}

.settings-btn {
  background: #f3f4f6;
}

/* 三栏布局 */
.editor-three-columns {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.left-panel {
  width: 280px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.center-panel {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.right-panel {
  width: 320px;
  background: white;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
}

.right-panel.expanded {
  width: 400px;
}

.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #614A44;
  font-size: 12px;
}

.outline-tree {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.volume-item {
  margin-bottom: 8px;
}

.volume-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  background: #f9fafb;
}

.volume-header:hover {
  background: #f1f5f9;
}

.toggle-icon {
  font-size: 10px;
  width: 16px;
}

.volume-title {
  flex: 1;
  font-weight: 500;
}

.volume-actions, .chapter-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.volume-item:hover .volume-actions,
.chapter-item:hover .chapter-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 4px;
}

.chapters-list {
  padding-left: 24px;
  margin-top: 4px;
}

.chapter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 6px;
}

.chapter-item:hover {
  background: #f1f5f9;
}

.chapter-item.active {
  background: #e0e7ff;
  color: #614A44;
}

.chapter-title {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-volume-chapters {
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

/* 章节编辑器 */
.chapter-editor {
  background: white;
  border-radius: 16px;
  padding: 24px;
}

.chapter-header {
  margin-bottom: 20px;
}

.chapter-title-input {
  width: 100%;
  font-size: 24px;
  font-weight: 600;
  border: none;
  border-bottom: 2px solid #e5e7eb;
  padding: 8px 0;
  margin-bottom: 12px;
}

.chapter-title-input:focus {
  outline: none;
  border-bottom-color: #614A44;
}

.chapter-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #6b7280;
}

.prev-chapter-preview {
  background: #f9fafb;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 20px;
  cursor: pointer;
  border: 1px solid #e5e7eb;
}

.prev-chapter-preview span:first-child {
  font-weight: 500;
  display: block;
  margin-bottom: 4px;
}

.preview-text {
  font-size: 13px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.chapter-content-editor {
  width: 100%;
  min-height: 400px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-family: inherit;
  font-size: 16px;
  line-height: 1.6;
  resize: vertical;
}

.chapter-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btn-primary {
  background: #614A44;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.btn-ai {
  background: #614A44;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.no-chapter-selected {
  text-align: center;
  padding: 60px;
  color: #9ca3af;
}

/* AI 面板 */
.ai-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  max-width: 85%;
}

.message.user {
  align-self: flex-end;
}

.message.assistant {
  align-self: flex-start;
}

.message-content {
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 13px;
  line-height: 1.5;
}

.message.user .message-content {
  background: #614A44;
  color: white;
}

.message.assistant .message-content {
  background: #f3f4f6;
  color: #1f2937;
}

.ai-input-area {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
}

.ai-input-area textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  resize: vertical;
  font-family: inherit;
}

.ai-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.ai-action-btn {
  padding: 6px 12px;
  background: #f3f4f6;
  border: none;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
}

.ai-send-btn {
  padding: 6px 16px;
  background: #614A44;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.close-panel-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
}

/* 弹窗 */
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
  border-radius: 24px;
  width: 90%;
  max-width: 500px;
  overflow: hidden;
}

.modal-card.small {
  max-width: 400px;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 24px;
}

.modal-input, .modal-textarea, .modal-select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  margin-bottom: 16px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase.js'
import { callDeepSeek } from '../lib/ai.js'

const route = useRoute()
const router = useRouter()
const user = ref(null)
const novel = ref(null)
const volumes = ref([])
const chapters = ref([])
const currentChapter = ref(null)
const expandedVolumes = ref([])
const showSettings = ref(false)
const showVolumeDialog = ref(false)
const showChapterDialog = ref(false)
const editingVolume = ref(null)
const editingChapter = ref(null)
const volumeForm = ref({ title: '' })
const chapterForm = ref({ title: '', volume_id: null })
const aiMessages = ref([])
const aiPrompt = ref('')
const showAIPanel = ref(true)
const chatMessagesRef = ref(null)

// 计算属性
const chaptersWithoutVolume = computed(() => {
  return chapters.value.filter(c => !c.volume_id)
})

const prevChapter = computed(() => {
  if (!currentChapter.value) return null
  const sorted = [...chapters.value].sort((a, b) => a.chapter_number - b.chapter_number)
  const index = sorted.findIndex(c => c.id === currentChapter.value.id)
  return index > 0 ? sorted[index - 1] : null
})

const getChaptersByVolume = (volumeId) => {
  return chapters.value.filter(c => c.volume_id === volumeId).sort((a, b) => a.chapter_number - b.chapter_number)
}

// 加载数据
const loadNovel = async () => {
  const { data } = await supabase
    .from('novels')
    .select('*')
    .eq('id', route.params.id)
    .single()
  novel.value = data
}

const loadVolumes = async () => {
  const { data } = await supabase
    .from('novel_volumes')
    .select('*')
    .eq('novel_id', route.params.id)
    .order('volume_number')
  volumes.value = data || []
}

const loadChapters = async () => {
  const { data } = await supabase
    .from('novel_chapters')
    .select('*')
    .eq('novel_id', route.params.id)
    .order('chapter_number')
  chapters.value = data || []
}

const loadAIHistory = async () => {
  const { data } = await supabase
    .from('novel_ai_history')
    .select('*')
    .eq('novel_id', route.params.id)
    .order('created_at')
  aiMessages.value = data || []
}

const saveNovel = async () => {
  await supabase
    .from('novels')
    .update({ title: novel.value.title, updated_at: new Date() })
    .eq('id', novel.value.id)
  alert('保存成功')
}

const saveNovelSettings = async () => {
  await supabase
    .from('novels')
    .update({
      description: novel.value.description,
      world_setting: novel.value.world_setting,
      outline: novel.value.outline
    })
    .eq('id', novel.value.id)
  showSettings.value = false
  alert('设置已保存')
}

// 卷操作
const addVolume = async () => {
  editingVolume.value = null
  volumeForm.value = { title: '' }
  showVolumeDialog.value = true
}

const editVolume = (volume) => {
  editingVolume.value = volume
  volumeForm.value = { title: volume.title }
  showVolumeDialog.value = true
}

const saveVolume = async () => {
  const nextNumber = editingVolume.value ? editingVolume.value.volume_number : volumes.value.length + 1
  
  if (editingVolume.value) {
    await supabase
      .from('novel_volumes')
      .update({ title: volumeForm.value.title })
      .eq('id', editingVolume.value.id)
  } else {
    await supabase
      .from('novel_volumes')
      .insert({
        novel_id: novel.value.id,
        volume_number: nextNumber,
        title: volumeForm.value.title
      })
  }
  showVolumeDialog.value = false
  await loadVolumes()
}

const deleteVolume = async (id) => {
  if (!confirm('确定要删除这个卷吗？卷内的章节会变为无卷')) return
  await supabase.from('novel_volumes').delete().eq('id', id)
  await loadVolumes()
  await loadChapters()
}

// 章节操作
const addChapter = async () => {
  editingChapter.value = null
  chapterForm.value = { title: '', volume_id: null }
  showChapterDialog.value = true
}

const editChapter = (chapter) => {
  editingChapter.value = chapter
  chapterForm.value = { title: chapter.title, volume_id: chapter.volume_id }
  showChapterDialog.value = true
}

const saveChapterInfo = async () => {
  const nextNumber = chapters.value.length + 1
  
  if (editingChapter.value) {
    await supabase
      .from('novel_chapters')
      .update({
        title: chapterForm.value.title,
        volume_id: chapterForm.value.volume_id
      })
      .eq('id', editingChapter.value.id)
  } else {
    const { data } = await supabase
      .from('novel_chapters')
      .insert({
        novel_id: novel.value.id,
        chapter_number: nextNumber,
        title: chapterForm.value.title,
        volume_id: chapterForm.value.volume_id,
        content: ''
      })
      .select()
      .single()
    currentChapter.value = data
  }
  showChapterDialog.value = false
  await loadChapters()
}

const deleteChapter = async (id) => {
  if (!confirm('确定要删除这个章节吗？')) return
  await supabase.from('novel_chapters').delete().eq('id', id)
  if (currentChapter.value?.id === id) currentChapter.value = null
  await loadChapters()
}

const loadChapter = (chapter) => {
  currentChapter.value = { ...chapter }
}

const saveChapter = async () => {
  if (!currentChapter.value) return
  await supabase
    .from('novel_chapters')
    .update({
      title: currentChapter.value.title,
      content: currentChapter.value.content,
      word_count: currentChapter.value.content?.length || 0,
      updated_at: new Date()
    })
    .eq('id', currentChapter.value.id)
  
  // 更新本地列表
  const index = chapters.value.findIndex(c => c.id === currentChapter.value.id)
  if (index !== -1) {
    chapters.value[index] = { ...currentChapter.value }
  }
  alert('章节已保存')
}

const updateWordCount = () => {
  if (currentChapter.value) {
    currentChapter.value.word_count = currentChapter.value.content?.length || 0
  }
}

// AI 调用
const callAI = async (action) => {
  if (!currentChapter.value) {
    alert('请先选择一个章节')
    return
  }
  
  let prompt = ''
  if (action === 'continue') {
    prompt = `继续写下去，延续上述风格和情节，写接下来的内容。`
  } else if (action === 'polish') {
    prompt = `润色这段文字，保持原意但让表达更优美。`
  } else if (action === 'outline') {
    prompt = `根据当前内容，生成下一章的大纲。`
  } else {
    return
  }
  
  await sendAIPrompt(prompt)
}

const sendCustomPrompt = async () => {
  if (!aiPrompt.value.trim()) return
  await sendAIPrompt(aiPrompt.value)
  aiPrompt.value = ''
}

const sendAIPrompt = async (prompt) => {
  const userMessage = { id: Date.now(), role: 'user', content: prompt }
  aiMessages.value.push(userMessage)
  await scrollChat()
  
  // 构建上下文
  const context = `
当前小说：${novel.value.title}
大纲：${novel.value.outline || '无'}
当前章节：${currentChapter.value.title}
当前内容：${currentChapter.value.content?.substring(0, 1500) || '无'}
`
  
  try {
    const response = await callDeepSeek([
      { role: 'system', content: '你是一个专业的长篇小说创作助手。请根据用户的需求和上下文内容，给出高质量的创作建议。' },
      { role: 'user', content: `${context}\n\n用户指令：${prompt}` }
    ])
    
    const assistantMessage = { id: Date.now() + 1, role: 'assistant', content: response }
    aiMessages.value.push(assistantMessage)
    
    // 保存到数据库
    await supabase.from('novel_ai_history').insert([
      { novel_id: novel.value.id, role: 'user', content: prompt },
      { novel_id: novel.value.id, role: 'assistant', content: response }
    ])
    
    await scrollChat()
  } catch (error) {
    console.error('AI 调用失败:', error)
    aiMessages.value.push({ id: Date.now() + 1, role: 'assistant', content: 'AI 服务暂时不可用，请稍后再试。' })
  }
}

const scrollChat = async () => {
  await nextTick()
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
  }
}

// 辅助函数
const getStatusText = (status) => {
  const map = { planning: '规划中', writing: '写作中', revising: '修订中', completed: '已完成' }
  return map[status] || '写作中'
}

const getChapterStatusText = (status) => {
  const map = { draft: '草稿', published: '已发布' }
  return map[status] || '草稿'
}

const getPreview = (content) => {
  if (!content) return ''
  return content.substring(0, 100) + (content.length > 100 ? '...' : '')
}

const toggleVolume = (id) => {
  const index = expandedVolumes.value.indexOf(id)
  if (index === -1) {
    expandedVolumes.value.push(id)
  } else {
    expandedVolumes.value.splice(index, 1)
  }
}

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
  await loadNovel()
  await loadVolumes()
  await loadChapters()
  await loadAIHistory()
  
  // 如果有章节，自动加载第一个
  if (chapters.value.length > 0 && !currentChapter.value) {
    currentChapter.value = { ...chapters.value[0] }
  }
})
</script>