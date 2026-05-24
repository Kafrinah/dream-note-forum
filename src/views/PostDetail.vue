<template>
  <div v-if="post">
    <button @click="$router.back()" class="back-btn">← 返回</button>
    
    <div class="post-detail-card">
      <div class="post-detail-header">
        <h1 class="post-detail-title">{{ post.title }}</h1>
        <span v-if="post.is_ai_generated" class="ai-badge-detail">🤖 AI 生成内容</span>
      </div>
      <div class="post-detail-meta">
        <span>👤 {{ post.user_id?.substring(0, 8) }}</span>
        <button @click="toggleLike" class="like-btn" :class="{ liked: hasLiked }">
          ❤️ {{ likeCount }}
        </button>
      </div>
      <div class="post-detail-content">{{ post.content }}</div>
    </div>

    <div class="comments-card">
      <h3 class="comments-title">💬 评论</h3>
      
      <div class="comments-list">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-user">👤 {{ comment.user_id?.substring(0, 8) }}</div>
          <p class="comment-text">{{ comment.content }}</p>
        </div>
      </div>

      <div class="comment-form">
        <textarea 
          v-model="newComment" 
          rows="3" 
          placeholder="写下你的评论..."
          class="comment-input"
        ></textarea>
        <button @click="addComment" class="btn-primary">发送评论</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.back-btn {
  background: none;
  border: none;
  color: #6366f1;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 20px;
}

.post-detail-card {
  background: white;
  border-radius: 32px;
  padding: 36px;
  margin-bottom: 28px;
}

.post-detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.post-detail-title {
  font-size: 32px;
  font-weight: 800;
  color: #1f2937;
  margin: 0;
}

.ai-badge-detail {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: white;
  font-size: 12px;
  padding: 6px 14px;
  border-radius: 24px;
  font-weight: 500;
}

.post-detail-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f2f5;
  color: #6b7280;
}

.like-btn {
  background: none;
  border: none;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s;
  color: #9ca3af;
}

.like-btn:hover {
  transform: scale(1.05);
}

.like-btn.liked {
  color: #ef4444;
}

.post-detail-content {
  font-size: 18px;
  line-height: 1.8;
  color: #374151;
  white-space: pre-wrap;
}

.comments-card {
  background: white;
  border-radius: 32px;
  padding: 36px;
}

.comments-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 24px;
}

.comments-list {
  margin-bottom: 28px;
  max-height: 400px;
  overflow-y: auto;
}

.comment-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f2f5;
}

.comment-user {
  font-weight: 700;
  color: #4f46e5;
  margin-bottom: 8px;
  font-size: 14px;
}

.comment-text {
  color: #4b5563;
  line-height: 1.5;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
}

.comment-input {
  width: 100%;
  padding: 16px 20px;
  font-size: 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 20px;
  resize: vertical;
  font-family: inherit;
}

.btn-primary {
  background: #6366f1;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 40px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabase.js'

const route = useRoute()
const post = ref(null)
const comments = ref([])
const newComment = ref('')
const user = ref(null)
const hasLiked = ref(false)
const likeCount = ref(0)

// 获取点赞数
const fetchLikeCount = async () => {
  const { count, error } = await supabase
    .from('post_likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', route.params.id)
  
  if (!error) {
    likeCount.value = count || 0
  }
}

// 检查用户是否已点赞
const fetchUserLike = async () => {
  const { data, error } = await supabase
    .from('post_likes')
    .select('*')
    .eq('post_id', route.params.id)
    .eq('user_id', user.value?.id)
    .maybeSingle()
  
  if (!error) {
    hasLiked.value = !!data
  }
}

// 加载所有数据
const loadData = async () => {
  if (!user.value) return

  // 加载帖子
  const { data: postData, error: postError } = await supabase
    .from('forum_posts')
    .select('*')
    .eq('id', route.params.id)
    .single()
  
  if (postError) {
    console.error('加载帖子失败:', postError)
    return
  }
  post.value = postData

  // 加载评论
  const { data: commentData } = await supabase
    .from('forum_comments')
    .select('*')
    .eq('post_id', route.params.id)
    .order('created_at')
  comments.value = commentData || []

  // 加载点赞信息
  await Promise.all([fetchLikeCount(), fetchUserLike()])
}

// 切换点赞
const toggleLike = async () => {
  if (!user.value) return

  if (hasLiked.value) {
    // 取消点赞
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', post.value.id)
      .eq('user_id', user.value.id)

    if (!error) {
      hasLiked.value = false
      likeCount.value = likeCount.value - 1
    }
  } else {
    // 添加点赞
    const { error } = await supabase
      .from('post_likes')
      .insert({
        post_id: post.value.id,
        user_id: user.value.id
      })

    if (!error) {
      hasLiked.value = true
      likeCount.value = likeCount.value + 1
    }
  }
}

// 添加评论
const addComment = async () => {
  if (!newComment.value) return
  
  const { error } = await supabase.from('forum_comments').insert([{
    post_id: post.value.id,
    user_id: user.value.id,
    content: newComment.value
  }])
  
  if (!error) {
    newComment.value = ''
    await loadData()
  } else {
    alert('评论失败: ' + error.message)
  }
}

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
  await loadData()
})
</script>