<template>
  <div>
    <div class="forum-header">
      <div>
        <h1 class="page-title">🌐 论坛</h1>
        <p class="page-subtitle">分享你的创作，发现更多灵感</p>
      </div>
      <button @click="showNewPost = true" class="btn-primary">
        发布作品
      </button>
    </div>

    <!-- 双列瀑布流 -->
    <div class="waterfall">
      <div v-for="post in posts" :key="post.id" class="post-card" @click="goToPost(post.id)">
        <!-- 标题和标签 -->
        <div class="post-header">
          <h3 class="post-title">{{ post.title }}</h3>
          <span v-if="post.is_ai_generated" class="ai-badge">AI生成</span>
        </div>
        
        <!-- 文字预览 -->
        <p class="post-preview">{{ getPreview(post.content) }}</p>
        
        <!-- 底部信息 -->
        <div class="post-footer">
          <div class="post-meta">
            <span class="post-likes">{{ post.likes || 0 }}</span>
            <span class="post-comments">{{ getCommentCount(post.id) }}</span>
          </div>
          <div class="post-author">
            <span class="author-name">{{ post.user_id?.substring(0, 8) }}</span>
            <span class="post-time">{{ formatDate(post.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="posts.length === 0" class="empty-state">
      <p>还没有作品，快来发布第一篇吧～</p>
    </div>

    <!-- 发布弹窗 -->
    <div v-if="showNewPost" class="modal-overlay" @click.self="showNewPost = false">
      <div class="modal-card">
        <div class="modal-header">
          <h2>发布新作品</h2>
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
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 20px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #A9C9C4, #A9C9C4);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.page-subtitle {
  font-size: 14px;
  color: #6b7280;
}

.btn-primary {
  background: #614A44;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #A9C9C4;
}

/* 双列瀑布流 */
.waterfall {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.post-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

/* 标题区域 */
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.post-title {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  color: #1f2937;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  flex: 1;
}

.ai-badge {
  background: linear-gradient(135deg, #614A44, #614A44);
  color: white;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 500;
  white-space: nowrap;
}

/* 文字预览 */
.post-preview {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  min-height: 63px;
}

/* 底部信息 */
.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #f0f2f5;
}

.post-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #6b7280;
}

.post-author {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #9ca3af;
}

.author-name {
  font-weight: 500;
  color: #4b5563;
}

/* 响应式：手机单列 */
@media (max-width: 640px) {
  .waterfall {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .post-title {
    font-size: 16px;
  }
  
  .post-preview {
    font-size: 13px;
    -webkit-line-clamp: 2;
    min-height: 52px;
  }
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

.modal-body {
  padding: 24px;
}

.modal-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 15px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 16px;
}

.modal-textarea {
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
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

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
  font-size: 16px;
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase.js'
import { findFirstBadWord } from '../lib/badWords.js'

const posts = ref([])
const showNewPost = ref(false)
const newPostTitle = ref('')
const newPostContent = ref('')
const router = useRouter()
const user = ref(null)
const commentCounts = ref({})

// 获取文字预览（最多100字）
const getPreview = (content) => {
  if (!content) return ''
  if (content.length <= 100) return content
  return content.substring(0, 100) + '...'
}

// 获取评论数
const getCommentCount = (postId) => {
  return commentCounts.value[postId] || 0
}

const loadCommentCounts = async () => {
  for (const post of posts.value) {
    const { count } = await supabase
      .from('forum_comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id)
    
    if (count !== null) {
      commentCounts.value[post.id] = count
    }
  }
}

const loadPosts = async () => {
  const { data } = await supabase
    .from('forum_posts')
    .select('*')
    .order('created_at', { ascending: false })
  
  posts.value = data?.map(post => ({
    ...post,
    likes: post.likes || 0
  })) || []
  
  await loadCommentCounts()
}

const publishPost = async () => {
  if (!newPostTitle.value || !newPostContent.value) {
    alert('请填写完整')
    return
  }
  
  const titleBadWord = await findFirstBadWord(newPostTitle.value)
  if (titleBadWord) {
    alert(`标题包含敏感词「${titleBadWord}」，请修改后重试`)
    return
  }
  
  const contentBadWord = await findFirstBadWord(newPostContent.value)
  if (contentBadWord) {
    alert(`内容包含敏感词「${contentBadWord}」，请修改后重试`)
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

const goToPost = (id) => {
  router.push(`/post/${id}`)
}

const formatDate = (date) => {
  if (!date) return ''
  const now = new Date()
  const postDate = new Date(date)
  const diff = now - postDate
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) return '刚刚'
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return postDate.toLocaleDateString()
  }
}

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
  await loadPosts()
})
</script>