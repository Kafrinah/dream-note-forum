<template>
  <!-- 未登录时显示登录界面 -->
  <div v-if="!user" class="login-container">
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
            <router-link to="/writing">⚪ 写作</router-link> 
            <router-link to="/novels">📚 作品库</router-link>       
            <router-link to="/forum">⚪ 广场</router-link>
            <router-link to="/novel">⚪ AI</router-link>
             
            <div class="dropdown" :class="{ 'mobile-open': mobileDropdownOpen }">
              <span class="dropdown-trigger" @click="toggleMobileDropdown">⚪ 我的</span>
              <div class="dropdown-menu" v-show="!isMobile || mobileDropdownOpen">
                <router-link to="/my-content" @click="closeMobileDropdown">📚 我的内容</router-link>
                <router-link to="/my-posts" @click="closeMobileDropdown">📋 我的帖子</router-link>
                <router-link to="/stickers" @click="closeMobileDropdown">🎨 贴纸</router-link>
                <router-link to="/assistant" @click="closeMobileDropdown">🤖 助手</router-link>
                <router-link to="/achievements" @click="closeMobileDropdown">🏆 成就</router-link>
                <router-link to="/background" @click="closeMobileDropdown">🖼️ 背景</router-link>
                <router-link to="/books" @click="closeMobileDropdown">📚 电子书库</router-link>
              </div>
            </div>
          </div>
          <div class="nav-user">
            <span class="user-email">{{ user.email }}</span>
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

/* 下拉菜单 - 桌面端 */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-trigger {
  padding: 8px 16px;
  color: #475569;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  border-radius: 10px;
  transition: all 0.2s;
  cursor: pointer;
  display: inline-block;
}

.dropdown-trigger:hover {
  background: #f1f5f9;
  color: #6366f1;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  min-width: 160px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
  z-index: 100;
}

/* 桌面端 hover 展开 */
@media (min-width: 769px) {
  .dropdown:hover .dropdown-menu {
    opacity: 1;
    visibility: visible;
  }
}

/* 移动端样式 - 保持一行 */
@media (max-width: 768px) {
  .nav-inner {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .nav-links {
    flex: 1;
    justify-content: flex-end;
  }
  
  .dropdown {
    position: relative;
  }
  
  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    left: auto;
    background: white;
    min-width: 160px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s;
  }
  
  .dropdown.mobile-open .dropdown-menu {
    opacity: 1;
    visibility: visible;
  }
  
  .dropdown-menu a {
    padding: 10px 16px;
  }
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 手机端隐藏邮箱 */
@media (max-width: 480px) {
  .nav-user .user-email {
    display: none;
  }
  
  .nav-user {
    /* 确保退出按钮不会太挤 */
    margin-left: 0;
  }
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
  gap: 16px;
}

.nav-links {
  display: flex;
  gap: 20px;
  align-items: center;
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
</style>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from './lib/supabase.js'
import GlobalBackground from './components/GlobalBackground.vue'

const user = ref(null)
const email = ref('')
const password = ref('')
const isLogin = ref(true)
const errorMsg = ref('')
const mobileDropdownOpen = ref(false)
const isMobile = ref(false)

// 检测是否为移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 切换移动端下拉菜单
const toggleMobileDropdown = () => {
  if (isMobile.value) {
    mobileDropdownOpen.value = !mobileDropdownOpen.value
  }
}

// 关闭移动端下拉菜单
const closeMobileDropdown = () => {
  mobileDropdownOpen.value = false
}

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
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>