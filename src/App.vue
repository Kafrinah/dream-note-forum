<template>
  <div v-if="!user" class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="login-icon">📝✨</div>
        <h1>梦镜</h1>
        <p>从梦境到小说的AI创作伴侣</p>
      </div>
      
      <div class="login-tabs">
        <button :class="['tab-btn', isLogin ? 'active' : '']" @click="isLogin = true">登录</button>
        <button :class="['tab-btn', !isLogin ? 'active' : '']" @click="isLogin = false">注册</button>
      </div>

      <form @submit.prevent="handleAuth">
        <div class="input-group">
          <label>邮箱</label>
          <input type="email" v-model="email" placeholder="your@email.com" required>
        </div>
        <div class="input-group">
          <label>密码</label>
          <input type="password" v-model="password" placeholder="至少6位" required>
        </div>
        <button type="submit" class="btn-submit">{{ isLogin ? '登录' : '注册' }}</button>
      </form>

      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
    </div>
  </div>

  <div v-else>
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
          <router-link to="/forum">🌐 作品广场</router-link>
          <router-link to="/assistant">🎨 我的助手</router-link>
          <router-link to="/achievements">🏆 成就</router-link>
          <router-link to="/novel">✨ AI 创作</router-link>
        </div>
        <div class="nav-user">
          <span>{{ user.email }}</span>
          <button @click="logout" class="logout-btn">退出</button>
        </div>
      </div>
    </nav>
    <div class="container" style="padding: 32px 24px;">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
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
  transition: background 0.2s;
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

.tab-btn {
  flex: 1;
  padding: 12px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 12px;
  background: #f3f4f6;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
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

.input-group input {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.btn-submit {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.error-msg {
  color: #ef4444;
  font-size: 14px;
  text-align: center;
  margin-top: 16px;
}

.nav {
  background: white;
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
  height: 64px;
}

.nav-links {
  display: flex;
  gap: 32px;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: #4b5563;
  font-weight: 500;
  font-size: 16px;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-links a:hover {
  color: #6366f1;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './lib/supabase.js'

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