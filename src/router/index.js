import { createRouter, createWebHistory } from 'vue-router'
import Writing from '../views/Writing.vue'
import MyContent from '../views/MyContent.vue'
import MyPosts from '../views/MyPosts.vue'
import Forum from '../views/Forum.vue'
import PostDetail from '../views/PostDetail.vue'
import AssistantSettings from '../views/AssistantSettings.vue'
import Achievements from '../views/Achievements.vue'
import NovelGenerator from '../views/NovelGenerator.vue'
import StickerSlots from '../views/StickerSlots.vue'
import BackgroundEditor from '../views/BackgroundEditor.vue'
import NovelList from '../views/NovelList.vue'
import NovelEditor from '../views/NovelEditor.vue'
import BookLibrary from '../views/BookLibrary.vue'

const routes = [
  { path: '/', redirect: '/writing' },
  { path: '/writing', component: Writing },
  { path: '/my-content', component: MyContent },
  { path: '/my-posts', component: MyPosts },
  { path: '/forum', component: Forum },
  { path: '/post/:id', name: 'PostDetail', component: PostDetail },  
  { path: '/assistant', component: AssistantSettings },
  { path: '/achievements', component: Achievements },
  { path: '/novel', component: NovelGenerator },
  { path: '/stickers', component: StickerSlots },
  { path: '/background', component: BackgroundEditor },
  { path: '/novels', component: NovelList },
  { path: '/novel/:id', component: NovelEditor },
  { path: '/books', component: BookLibrary }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router