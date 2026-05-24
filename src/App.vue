<template>
  <!-- 未登录时显示登录界面 -->
  <div v-if="!user" class="login-container">
    <!-- 登录界面保持不变 -->
    <div class="login-card pixel-modal">
      <div class="login-header">
        <div class="login-icon">📝✨</div>
        <h1 class="pixel-title">梦镜</h1>
        <p class="pixel-subtitle">从梦境到小说的AI创作伴侣</p>
      </div>
      
      <div class="login-tabs">
        <button :class="['pixel-btn', isLogin ? 'pixel-btn-primary' : '']" @click="isLogin = true">登录</button>
        <button :class="['pixel-btn', !isLogin ? 'pixel-btn-primary' : '']" @click="isLogin = false">注册</button>
      </div>

      <form @submit.prevent="handleAuth">
        <div class="input-group">
          <label>邮箱</label>
          <input type="email" v-model="email" class="pixel-input" placeholder="your@email.com" required>
        </div>
        <div class="input-group">
          <label>密码</label>
          <input type="password" v-model="password" class="pixel-input" placeholder="至少6位" required>
        </div>
        <button type="submit" class="pixel-btn pixel-btn-primary" style="width: 100%;">{{ isLogin ? '登录' : '注册' }}</button>
      </form>

      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
    </div>
  </div>

  <!-- 登录后显示主界面，带全局背景 -->
  <GlobalBackground v-else>
    <div class="app-content">
      <nav class="nav">
        <div class="nav-inner">
          <div class="logo">
            <span>📝✨</span>
            <span>梦镜</span>
          </div>
          <div class="nav-links">
            <router-link to="/writing">📝 写作</router-link>
            <router-link to="/my-content">📚 我的内容</router-link>
            <router-link to="/my-posts">📋 我的帖子</router-link>
            <router-link to="/forum">🌐 广场</router-link>
            <router-link to="/stickers">🎨 贴纸</router-link>
            <router-link to="/assistant">🤖 助手</router-link>
            <router-link to="/achievements">🏆 成就</router-link>
            <router-link to="/novel">✨ AI</router-link>
            <router-link to="/background">🖼️ 背景</router-link>
          </div>
          <div class="nav-user">
            <span>{{ user.email }}</span>
            <button @click="logout" class="logout-btn">退出</button>
          </div>
        </div>
      </nav>
      <div class="container" style="padding: 24px;">
        <router-view />
      </div>
    </div>
  </GlobalBackground>
</template>

<style scoped>
/* 样式保持不变 */
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logout-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 8px;
}

.logout-btn:hover {
  background: #fee2e2;
}

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 32px;
  padding: 48px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.login-header h1 {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 8px;
}

.login-header p {
  color: #6b7280;
  font-size: 14px;
}

.login-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
}

.pixel-btn {
  flex: 1;
  padding: 12px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 12px;
  background: #f3f4f6;
  cursor: pointer;
}

.pixel-btn-primary {
  background: #6366f1;
  color: white;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.pixel-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.error-msg {
  color: #ef4444;
  font-size: 14px;
  text-align: center;
  margin-top: 16px;
}

.nav {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #e5e7eb;
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 64px;
}

.nav-links {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.nav-links a {
  text-decoration: none;
  color: #4b5563;
  font-weight: 500;
  font-size: 15px;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.nav-links a:hover {
  color: #6366f1;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.app-content {
  min-height: 100vh;
  position: relative;
}

/* 响应式导航栏 */
@media (max-width: 900px) {
  .nav-inner {
    flex-direction: column;
    height: auto;
    padding: 12px 0;
    gap: 12px;
  }
  
  .nav-links {
    justify-content: center;
    gap: 12px;
  }
  
  .nav-user {
    justify-content: center;
  }
}

@media (max-width: 600px) {
  .nav-links {
    gap: 8px;
  }
  
  .nav-links a {
    font-size: 12px;
    padding: 4px 8px;
  }
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './lib/supabase.js'
import GlobalBackground from './components/GlobalBackground.vue'

const user = ref(null)
const email = ref('')
const password = ref('')
const isLogin = ref(true)
const errorMsg = ref('')

const handleAuth = async () => {
  errorMsg.value = ''
  
  if (isLogin.value) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })
    if (error) errorMsg.value = error.message
    else user.value = data.user
  } else {
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value
    })
    if (error) errorMsg.value = error.message
    else {
      errorMsg.value = '注册成功！请登录'
      isLogin.value = true
    }
  }
}

const logout = async () => {
  await supabase.auth.signOut()
  user.value = null
}

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
})
</script>