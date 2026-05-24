<template>
  <div>
    <h1 class="page-title">📋 我的帖子</h1>
    <p class="page-subtitle">管理你发布到作品广场的内容</p>

    <div class="posts-list">
      <div v-for="post in myPosts" :key="post.id" class="post-card" @click="goToPost(post.id)">
        <div class="post-header">
          <div class="post-info">
            <div class="title-row">
              <h3 class="post-title">{{ post.title }}</h3>
              <span v-if="post.is_ai_generated" class="ai-badge">🤖 AI 生成</span>
            </div>
            <div class="post-meta">
              <span>❤️ {{ post.likes || 0 }} 点赞</span>
              <span>💬 {{ getCommentCount(post.id) }} 评论</span>
              <span>📅 {{ formatDate(post.created_at) }}</span>
            </div>
          </div>
          <div class="post-actions" @click.stop>
            <button @click="confirmDelete(post)" class="delete-btn">🗑️ 删除</button>
          </div>
        </div>
        <p class="post-preview">{{ getPreview(post.content) }}</p>
      </div>
    </div>

    <div v-if="myPosts.length === 0" class="empty-state">
      <p>你还没有发布过帖子，去发布一篇吧～</p>
      <button @click="goToWriting" class="btn-primary" style="margin-top: 16px;">📝 去写作</button>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteDialog" class="modal-overlay" @click.self="showDeleteDialog = false">
      <div class="modal-card">
        <div class="modal-header">
          <h2>确认删除</h2>
          <button @click="showDeleteDialog = false" class="close-modal">✕</button>
        </div>
        <div class="modal-body">
          <p>确定要删除帖子「{{ postToDelete?.title }}」吗？</p>
          <p style="color: #ef4444; font-size: 14px; margin-top: 8px;">此操作不可恢复，所有评论和点赞也会被删除。</p>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteDialog = false" class="btn-secondary">取消</button>
          <button @click="deletePost" class="btn-danger">确认删除</button>
        </div>
      </div>
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

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  transition: all 0.2s;
  border: 1px solid #e5e7eb;
  cursor: pointer;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.post-info {
  flex: 1;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.post-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.ai-badge {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: white;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 500;
}

.post-meta {
  display: flex;
  gap: 20px;
  color: #6b7280;
  font-size: 13px;
}

.post-actions {
  display: flex;
  gap: 8px;
}

.delete-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 30px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #dc2626;
}

.post-preview {
  color: #4b5563;
  line-height: 1.5;
  font-size: 14px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
  font-size: 16px;
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
  max-width: 450px;
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

.close-modal:hover {
  background: #e5e7eb;
}

.modal-body {
  padding: 24px;
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
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-danger {
  background: #ef4444;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-primary {
  background: #6366f1;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase.js'

const router = useRouter()
const myPosts = ref([])
const user = ref(null)
const showDeleteDialog = ref(false)
const postToDelete = ref(null)
const commentCounts = ref({})

const getPreview = (content) => {
  if (!content) return ''
  if (content.length <= 150) return content
  return content.substring(0, 150) + '...'
}

const loadMyPosts = async () => {
  if (!user.value) return

  const { data, error } = await supabase
    .from('forum_posts')
    .select('*')
    .eq('user_id', user.value.id)
    .order('created_at', { ascending: false })

  if (!error) {
    myPosts.value = data || []
    await loadCommentCounts()
  }
}

const loadCommentCounts = async () => {
  for (const post of myPosts.value) {
    const { count, error } = await supabase
      .from('forum_comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id)
    
    if (!error) {
      commentCounts.value[post.id] = count || 0
    }
  }
}

const getCommentCount = (postId) => {
  return commentCounts.value[postId] || 0
}

const confirmDelete = (post) => {
  postToDelete.value = post
  showDeleteDialog.value = true
}

const deletePost = async () => {
  if (!postToDelete.value) return

  const postId = postToDelete.value.id

  await supabase.from('forum_comments').delete().eq('post_id', postId)
  await supabase.from('post_likes').delete().eq('post_id', postId)
  
  const { error } = await supabase
    .from('forum_posts')
    .delete()
    .eq('id', postId)

  if (!error) {
    myPosts.value = myPosts.value.filter(p => p.id !== postId)
    delete commentCounts.value[postId]
    alert('删除成功')
  } else {
    alert('删除失败')
  }

  showDeleteDialog.value = false
  postToDelete.value = null
}

const goToPost = (id) => {
  console.log('跳转到帖子:', id)
  router.push({ name: 'PostDetail', params: { id: id } })
}

const goToWriting = () => {
  router.push('/writing')
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
  await loadMyPosts()
})
</script>