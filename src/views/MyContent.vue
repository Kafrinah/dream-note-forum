<template>
  <div>
    <h1 class="page-title">📚 我的内容</h1>
    <p class="page-subtitle">所有记录都在这里</p>
    
    <div class="scenes-wrapper">
      <button 
        v-for="scene in scenes" 
        :key="scene.value"
        @click="filterType = scene.value"
        :class="['scene-tag', filterType === scene.value ? 'active' : '']"
      >
        {{ scene.icon }} {{ scene.name }}
      </button>
      <button 
        @click="filterType = 'all'"
        :class="['scene-tag', filterType === 'all' ? 'active' : '']"
      >
        📄 全部
      </button>
    </div>

    <div class="entries-list">
      <div 
        v-for="entry in filteredEntries" 
        :key="entry.id" 
        class="card entry-card"
      >
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="flex: 1; cursor: pointer;" @click="viewDetail(entry)">
            <h3 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">{{ entry.title }}</h3>
            <div style="display: flex; gap: 16px; margin-bottom: 12px; color: #6b7280; font-size: 14px;">
              <span>{{ getSceneIcon(entry.type) }} {{ getSceneName(entry.type) }}</span>
              <span>📅 {{ formatDate(entry.created_at) }}</span>
            </div>
            <p style="color: #4b5563; line-height: 1.5; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              {{ getPreview(entry.content) }}
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button @click.stop="publishToForum(entry)" class="publish-btn">🌐 发布到论坛</button>
            <button @click.stop="deleteEntry(entry.id)" class="delete-btn">删除</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredEntries.length === 0" class="empty-state">
      <p>暂无内容，去写点什么吧～</p>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="showDetail" class="modal-overlay" @click.self="showDetail = false">
      <div class="modal-card">
        <div class="modal-header">
          <h2>{{ selectedEntry?.title }}</h2>
          <button @click="showDetail = false" class="close-modal">✕</button>
        </div>
        <div class="modal-body">
          <div class="detail-meta">
            <span>{{ getSceneIcon(selectedEntry?.type) }} {{ getSceneName(selectedEntry?.type) }}</span>
            <span>📅 {{ formatDate(selectedEntry?.created_at) }}</span>
          </div>
          <div class="detail-content">{{ selectedEntry?.content }}</div>
        </div>
        <div class="modal-footer">
          <button @click="publishFromDetail" class="btn-publish">🌐 发布到论坛</button>
          <button @click="deleteFromDetail" class="btn-danger">删除</button>
          <button @click="showDetail = false" class="btn-secondary">关闭</button>
        </div>
      </div>
    </div>

    <!-- 发布确认弹窗 -->
    <div v-if="showPublishDialog" class="modal-overlay" @click.self="showPublishDialog = false">
      <div class="modal-card" style="max-width: 500px;">
        <div class="modal-header">
          <h2>发布到论坛</h2>
          <button @click="showPublishDialog = false" class="close-modal">✕</button>
        </div>
        <div class="modal-body">
          <p style="margin-bottom: 16px; color: #6b7280;">将「{{ publishEntry?.title }}」发布到作品广场</p>
          <div class="input-group">
            <label>作品标题</label>
            <input v-model="publishTitle" class="modal-input" placeholder="标题">
          </div>
          <div class="input-group">
            <label>内容预览</label>
            <textarea v-model="publishContent" rows="4" class="modal-textarea" placeholder="内容"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showPublishDialog = false" class="btn-secondary">取消</button>
          <button @click="confirmPublish" class="btn-publish">确认发布</button>
        </div>
      </div>
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

.entries-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  transition: all 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.publish-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 40px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.publish-btn:hover {
  background: #059669;
}

.delete-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 40px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #dc2626;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #9ca3af;
  font-size: 18px;
}

/* 模态框样式 */
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
  border-radius: 32px;
  width: 90%;
  max-width: 800px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.close-modal {
  background: #f3f4f6;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
}

.close-modal:hover {
  background: #e5e7eb;
}

.modal-body {
  padding: 28px;
  overflow-y: auto;
  flex: 1;
}

.detail-meta {
  display: flex;
  gap: 20px;
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.detail-content {
  font-size: 16px;
  line-height: 1.7;
  color: #374151;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.modal-footer {
  padding: 20px 28px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-publish {
  background: #10b981;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-publish:hover {
  background: #059669;
}

.btn-danger {
  background: #ef4444;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-secondary {
  background: #f3f4f6;
  color: #4b5563;
  padding: 10px 20px;
  border: none;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.scene-tag {
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 40px;
  background: #f3f4f6;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.scene-tag.active {
  background: #6366f1;
  color: white;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.modal-input, .modal-textarea {
  width: 100%;
  padding: 12px 16px;
  font-size: 15px;
  background: #f3f4f6;
  border: none;
  border-radius: 12px;
}

.modal-textarea {
  resize: vertical;
}
</style>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase.js'

const scenes = [
  { value: 'diary', name: '日记', icon: '📝' },
  { value: 'academic', name: '学术笔记', icon: '📚' },
  { value: 'dream', name: '梦记', icon: '🌙' },
  { value: 'creation', name: '创作', icon: '✍️' },
  { value: 'reading', name: '读书笔记', icon: '📖' },
  { value: 'quote', name: '摘抄', icon: '✂️' }
]

const entries = ref([])
const filterType = ref('all')
const user = ref(null)
const showDetail = ref(false)
const selectedEntry = ref(null)
const showPublishDialog = ref(false)
const publishEntry = ref(null)
const publishTitle = ref('')
const publishContent = ref('')

const getSceneName = (type) => {
  const scene = scenes.find(s => s.value === type)
  return scene ? scene.name : type
}

const getSceneIcon = (type) => {
  const scene = scenes.find(s => s.value === type)
  return scene ? scene.icon : '📄'
}

const getPreview = (content) => {
  if (!content) return ''
  if (content.length <= 60) return content
  return content.substring(0, 60) + '...'
}

const filteredEntries = computed(() => {
  if (filterType.value === 'all') return entries.value
  return entries.value.filter(e => e.type === filterType.value)
})

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

const loadEntries = async () => {
  const { data, error } = await supabase
    .from('user_entries')
    .select('*')
    .eq('user_id', user.value.id)
    .order('created_at', { ascending: false })

  if (!error) entries.value = data || []
}

const deleteEntry = async (id) => {
  if (!confirm('确定要删除吗？')) return
  
  const { error } = await supabase
    .from('user_entries')
    .delete()
    .eq('id', id)

  if (!error) {
    entries.value = entries.value.filter(e => e.id !== id)
    alert('删除成功')
  }
}

const viewDetail = (entry) => {
  selectedEntry.value = entry
  showDetail.value = true
}

const deleteFromDetail = async () => {
  if (!selectedEntry.value) return
  await deleteEntry(selectedEntry.value.id)
  showDetail.value = false
  selectedEntry.value = null
}

// 发布到论坛
const publishToForum = (entry) => {
  publishEntry.value = entry
  publishTitle.value = entry.title
  publishContent.value = entry.content
  showPublishDialog.value = true
}

const publishFromDetail = () => {
  if (!selectedEntry.value) return
  showDetail.value = false
  publishToForum(selectedEntry.value)
}

const confirmPublish = async () => {
  if (!publishTitle.value || !publishContent.value) {
    alert('请填写标题和内容')
    return
  }

  const { error } = await supabase.from('forum_posts').insert([{
    user_id: user.value.id,
    title: publishTitle.value,
    content: publishContent.value
  }])

  if (!error) {
    alert('发布成功！')
    showPublishDialog.value = false
    publishEntry.value = null
    publishTitle.value = ''
    publishContent.value = ''
  } else {
    alert('发布失败')
  }
}

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
  await loadEntries()
})
</script>