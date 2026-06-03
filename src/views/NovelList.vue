<template>
  <div>
    <div class="header">
      <h1 class="page-title">📚 我的作品库</h1>
      <button @click="showCreateDialog = true" class="btn-primary">+ 新建作品</button>
    </div>

    <div class="novel-grid">
      <div v-for="novel in novels" :key="novel.id" class="novel-card" @click="openNovel(novel.id)">
        <div class="novel-cover">{{ novel.cover_emoji }}</div>
        <div class="novel-info">
          <h3>{{ novel.title }}</h3>
          <p class="novel-desc">{{ novel.description || '暂无描述' }}</p>
          <div class="novel-stats">
            <span>{{ getStatusText(novel.status) }}</span>
            <span>{{ formatDate(novel.updated_at) }}</span>
          </div>
        </div>
        <button @click.stop="deleteNovel(novel.id)" class="delete-btn">删除</button>
      </div>
    </div>

    <div v-if="novels.length === 0" class="empty-state">
      <p>还没有作品，点击「新建作品」开始创作吧～</p>
    </div>

    <!-- 新建作品弹窗 -->
    <div v-if="showCreateDialog" class="modal-overlay" @click.self="showCreateDialog = false">
      <div class="modal-card">
        <div class="modal-header">
          <h2>新建作品</h2>
          <button @click="showCreateDialog = false" class="close-modal">✕</button>
        </div>
        <div class="modal-body">
          <input v-model="newNovel.title" placeholder="作品名称" class="modal-input">
          <textarea v-model="newNovel.description" placeholder="作品简介（可选）" rows="3" class="modal-textarea"></textarea>
        </div>
        <div class="modal-footer">
          <button @click="showCreateDialog = false" class="btn-secondary">取消</button>
          <button @click="createNovel" class="btn-primary">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.btn-primary {
  background: #6366f1;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
}

.novel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.novel-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e5e7eb;
  position: relative;
}

.novel-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.novel-cover {
  font-size: 48px;
}

.novel-info {
  flex: 1;
}

.novel-info h3 {
  font-size: 18px;
  margin-bottom: 6px;
}

.novel-desc {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.novel-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #9ca3af;
}

.delete-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #ef4444;
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.novel-card:hover .delete-btn {
  opacity: 1;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: #9ca3af;
}

/* 弹窗样式 */
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

.modal-input, .modal-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 16px;
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
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase.js'

const router = useRouter()
const user = ref(null)
const novels = ref([])
const showCreateDialog = ref(false)
const newNovel = ref({ title: '', description: '' })

const loadNovels = async () => {
  const { data } = await supabase
    .from('novels')
    .select('*')
    .eq('user_id', user.value.id)
    .order('updated_at', { ascending: false })
  
  novels.value = data || []
}

const createNovel = async () => {
  if (!newNovel.value.title) {
    alert('请输入作品名称')
    return
  }

  const { data, error } = await supabase
    .from('novels')
    .insert({
      user_id: user.value.id,
      title: newNovel.value.title,
      description: newNovel.value.description
    })
    .select()
    .single()

  if (!error) {
    showCreateDialog.value = false
    newNovel.value = { title: '', description: '' }
    await loadNovels()
    openNovel(data.id)
  } else {
    alert('创建失败')
  }
}

const openNovel = (id) => {
  router.push(`/novel/${id}`)
}

const deleteNovel = async (id) => {
  if (!confirm('确定要删除这部作品吗？所有章节也会被删除')) return
  
  const { error } = await supabase.from('novels').delete().eq('id', id)
  if (!error) {
    await loadNovels()
  } else {
    alert('删除失败')
  }
}

const getStatusText = (status) => {
  const map = { planning: '规划中', writing: '写作中', revising: '修订中', completed: '已完成' }
  return map[status] || '写作中'
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
  await loadNovels()
})
</script>