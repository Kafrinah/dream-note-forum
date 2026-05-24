<template>
  <div>
    <div class="forum-header">
      <div>
        <h1 class="page-title">🌐 作品广场</h1>
        <p class="page-subtitle">分享你的创作，发现更多灵感</p>
      </div>
      <button @click="showNewPost = true" class="btn-primary">
        ✨ 发布作品
      </button>
    </div>

    <div class="posts-list">
      <div v-for="post in posts" :key="post.id" class="post-card" @click="goToPost(post.id)">
        <div class="post-header">
          <div class="post-title-section">
            <div class="title-row">
              <h3 class="post-title">{{ post.title }}</h3>
              <span v-if="post.is_ai_generated" class="ai-badge">🤖 AI 生成</span>
            </div>
            <div class="post-meta">
              <span>👤 {{ post.user_id?.substring(0, 8) || '匿名' }}</span>
              <span>❤️ {{ post.likes || 0 }}</span>
              <span>📅 {{ formatDate(post.created_at) }}</span>
            </div>
          </div>
          <div class="post-actions" @click.stop>
            <button 
              v-if="post.user_id === user?.id" 
              @click="deletePost(post.id)" 
              class="delete-btn"
            >
              删除
            </button>
          </div>
        </div>
        <p class="post-preview">{{ getPreview(post.content) }}</p>
      </div>
    </div>

    <div v-if="posts.length === 0" class="empty-state">
      <p>还没有作品，快来发布第一篇吧～</p>
    </div>

    <!-- 发布弹窗 -->
    <div v-if="showNewPost" class="modal-overlay" @click.self="showNewPost = false">
      <div class="modal-card">
        <div class="modal-header">
          <h2>✨ 发布新作品</h2>
          <button @click="showNewPost = false" class="close-modal">✕</button>
        </div>
        <div class="modal-body">
          <input 
            v-model="newPostTitle" 
            type="text" 
            placeholder="作品标题"
            class="modal-input"
          >
          <textarea 
            v-model="newPostContent" 
            rows="8" 
            placeholder="写下你的作品..."
            class="modal-textarea"
          ></textarea>
        </div>
        <div class="modal-footer">
          <button @click="showNewPost = false" class="btn-secondary">取消</button>
          <button @click="publishPost" class="btn-primary">发布</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.forum-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 20px;
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
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-card {
  background: white;
  border-radius: 24px;
  padding: 24px;
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

.post-title-section {
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
  font-size: 20px;
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
  max-width: 550px;
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

.modal-input {
  width: 100%;
  padding: 14px 18px;
  font-size: 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 16px;
  margin-bottom: 16px;
}

.modal-textarea {
  width: 100%;
  padding: 14px 18px;
  font-size: 15px;
  background: #f3f4f6;
  border: none;
  border-radius: 16px;
  resize: vertical;
  font-family: inherit;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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

.btn-primary:hover {
  background: #4f46e5;
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
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase.js'

const posts = ref([])
const showNewPost = ref(false)
const newPostTitle = ref('')
const newPostContent = ref('')
const router = useRouter()
const user = ref(null)

const getPreview = (content) => {
  if (!content) return ''
  if (content.length <= 150) return content
  return content.substring(0, 150) + '...'
}

const loadPosts = async () => {
  // 获取所有帖子
  const { data: postsData } = await supabase
    .from('forum_posts')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (!postsData) {
    posts.value = []
    return
  }
  
  // 为每个帖子获取点赞数
  const postsWithLikes = await Promise.all(
    postsData.map(async (post) => {
      const { count } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id)
      
      return {
        ...post,
        likes: count || 0
      }
    })
  )
  
  posts.value = postsWithLikes
}

const publishPost = async () => {
  if (!newPostTitle.value || !newPostContent.value) {
    alert('请填写完整')
    return
  }
  
  const { error } = await supabase.from('forum_posts').insert([{
    user_id: user.value.id,
    title: newPostTitle.value,
    content: newPostContent.value,
    is_ai_generated: false
  }])
  
  if (!error) {
    alert('发布成功！')
    showNewPost.value = false
    newPostTitle.value = ''
    newPostContent.value = ''
    loadPosts()
  } else {
    alert('发布失败')
  }
}

const deletePost = async (postId) => {
  if (!confirm('确定要删除这篇帖子吗？')) return
  
  const { error } = await supabase
    .from('forum_posts')
    .delete()
    .eq('id', postId)
  
  if (!error) {
    posts.value = posts.value.filter(p => p.id !== postId)
    alert('删除成功')
  } else {
    alert('删除失败')
  }
}

const goToPost = (id) => {
  console.log('跳转到帖子:', id)
  router.push({ name: 'PostDetail', params: { id: id } })
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
  await loadPosts()
})
</script>