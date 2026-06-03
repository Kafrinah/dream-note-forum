<template>
  <div>
    <div class="header">
      <h1 class="page-title">📚 电子书库</h1>
      <button @click="showUploadDialog = true" class="btn-primary">+ 上传书籍</button>
    </div>

    <!-- 书库网格 -->
    <div class="books-grid">
      <div v-for="book in books" :key="book.id" class="book-card" @click="openBook(book)">
        <div class="book-cover">
          <div class="cover-placeholder">
            {{ getFileIcon(book.file_type) }}
          </div>
        </div>
        <div class="book-info">
          <h3>{{ book.title }}</h3>
          <p class="book-author">{{ book.author || '未知作者' }}</p>
          <div class="book-progress" v-if="book.progress > 0">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: book.progress + '%' }"></div>
            </div>
            <span>{{ Math.round(book.progress) }}%</span>
          </div>
        </div>
        <button @click.stop="deleteBook(book.id)" class="delete-btn">删除</button>
      </div>
    </div>

    <div v-if="books.length === 0" class="empty-state">
      <p>还没有电子书，点击「上传书籍」开始添加～</p>
    </div>

    <!-- 上传弹窗 -->
    <div v-if="showUploadDialog" class="modal-overlay" @click.self="showUploadDialog = false">
      <div class="modal-card">
        <div class="modal-header">
          <h2>上传电子书</h2>
          <button @click="showUploadDialog = false" class="close-modal">✕</button>
        </div>
        <div class="modal-body">
          <div class="upload-area" @dragover.prevent @drop="handleDrop" @click="triggerFileInput">
            <input type="file" ref="fileInput" accept=".pdf,.epub,.txt" @change="handleFileSelect" style="display: none">
            <div v-if="!uploadFile" class="upload-placeholder">
              <span class="upload-icon">📁</span>
              <p>点击或拖拽文件到此处</p>
              <p class="upload-hint">支持 PDF、EPUB、TXT 格式</p>
            </div>
            <div v-else class="upload-preview">
              <span class="file-icon">{{ getFileIcon(uploadFile.name.split('.').pop()) }}</span>
              <p>{{ uploadFile.name }}</p>
              <p class="file-size">{{ formatFileSize(uploadFile.size) }}</p>
            </div>
          </div>
          <input v-model="bookTitle" placeholder="书名" class="modal-input">
          <input v-model="bookAuthor" placeholder="作者（可选）" class="modal-input">
          <textarea v-model="bookDescription" placeholder="简介（可选）" rows="3" class="modal-textarea"></textarea>
        </div>
        <div class="modal-footer">
          <button @click="showUploadDialog = false" class="btn-secondary">取消</button>
          <button @click="uploadBook" :disabled="isUploading" class="btn-primary">
            {{ isUploading ? '上传中...' : '上传' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 阅读器弹窗 -->
    <div v-if="readingBook" class="reader-modal" @click.self="closeReader">
      <div class="reader-container">
        <div class="reader-header">
          <h3>{{ readingBook.title }}</h3>
          <button @click="closeReader" class="close-reader">✕</button>
        </div>
        <div class="reader-content">
          <!-- TXT 阅读器 -->
          <div v-if="readingBook.file_type === 'txt'" class="txt-reader" ref="txtReaderRef" @scroll="saveTxtScrollProgress">
            <div class="txt-content">{{ readingBook.content }}</div>
          </div>
          <!-- PDF 阅读器 -->
          <div v-else-if="readingBook.file_type === 'pdf'" class="pdf-reader" ref="pdfContainer">
            <div v-if="pdfLoading" class="pdf-loading">加载中...</div>
            <canvas v-for="pageNum in pdfPageCount" :key="pageNum" :id="`pdf-canvas-${pageNum}`" class="pdf-canvas" style="display: none;"></canvas>
            <div class="pdf-controls">
              <button @click="prevPage" :disabled="currentPage <= 1" class="pdf-nav-btn">◀ 上一页</button>
              <span>第 {{ currentPage }} / {{ pdfPageCount }} 页</span>
              <button @click="nextPage" :disabled="currentPage >= pdfPageCount" class="pdf-nav-btn">下一页 ▶</button>
              <button @click="savePDFProgress" class="save-progress-btn">💾 保存进度</button>
              <span v-if="showSaveHint" class="save-hint">✓ 已保存</span>
            </div>
          </div>
          <div v-else class="other-reader">
            <div class="download-hint">
              <p>📄 EPUB 文件暂不支持在线阅读</p>
              <button @click="downloadBook" class="download-btn">⬇️ 下载文件</button>
            </div>
          </div>
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
  font-size: 14px;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
}

.book-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e5e7eb;
  position: relative;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.book-cover {
  width: 100%;
  height: 160px;
  border-radius: 12px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-placeholder {
  font-size: 48px;
}

.book-info {
  margin-top: 12px;
}

.book-info h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-author {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}

.book-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #6366f1;
  border-radius: 2px;
}

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ef4444;
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.book-card:hover .delete-btn {
  opacity: 1;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: #9ca3af;
}

/* 上传区域 */
.upload-area {
  border: 2px dashed #e5e7eb;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 16px;
  transition: all 0.2s;
}

.upload-area:hover {
  border-color: #6366f1;
  background: #f9fafb;
}

.upload-icon, .file-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.upload-hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 8px;
}

.file-size {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

/* 阅读器模态框 */
.reader-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.reader-container {
  width: 90%;
  height: 85%;
  background: white;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.reader-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.reader-header h3 {
  font-size: 18px;
  font-weight: 600;
}

.close-reader {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
}

.reader-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.txt-reader {
  white-space: pre-wrap;
  font-family: 'Courier New', monospace;
  line-height: 1.6;
  font-size: 14px;
  height: 100%;
  overflow-y: auto;
}

.pdf-reader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.pdf-canvas {
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  height: auto;
}

.pdf-controls {
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 12px 20px;
  background: #f3f4f6;
  border-radius: 12px;
  position: sticky;
  bottom: 10px;
}

.pdf-nav-btn {
  background: #6366f1;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
}

.pdf-nav-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.save-progress-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
}

.save-hint {
  color: #10b981;
  font-size: 12px;
  margin-left: 8px;
  animation: fadeOut 1s ease-out forwards;
}

@keyframes fadeOut {
  0% { opacity: 1; }
  70% { opacity: 1; }
  100% { opacity: 0; }
}

.pdf-loading {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.download-hint {
  text-align: center;
  padding: 60px;
  color: #6b7280;
}

.download-btn {
  margin-top: 16px;
  background: #6366f1;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
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

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
}

.close-modal {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 24px;
}

.modal-input, .modal-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  margin-bottom: 16px;
  font-size: 14px;
}

.modal-textarea {
  resize: vertical;
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
import { ref, onMounted, nextTick } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'

// 设置 PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

const books = ref([])
const showUploadDialog = ref(false)
const isUploading = ref(false)
const uploadFile = ref(null)
const bookTitle = ref('')
const bookAuthor = ref('')
const bookDescription = ref('')
const fileInput = ref(null)
const readingBook = ref(null)
const txtReaderRef = ref(null)
const pdfLoading = ref(false)
const pdfPageCount = ref(0)
const currentPage = ref(1)
const showSaveHint = ref(false)
let pdfDoc = null
let pdfSaveTimeout = null
let saveHintTimeout = null

// IndexedDB 操作
const DB_NAME = 'BookLibraryDB'
const DB_VERSION = 1
const STORE_NAME = 'books'
let db = null

const openDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
        store.createIndex('title', 'title', { unique: false })
        store.createIndex('created_at', 'created_at', { unique: false })
      }
    }
  })
}

const loadBooks = async () => {
  await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()
    request.onsuccess = () => {
      books.value = request.result.sort((a, b) => b.created_at - a.created_at)
      resolve()
    }
    request.onerror = () => reject(request.error)
  })
}

const saveBook = (bookData) => {
  return new Promise(async (resolve, reject) => {
    await openDB()
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.add(bookData)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

const updateBookProgress = (id, progress) => {
  return new Promise(async (resolve, reject) => {
    await openDB()
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    
    const getRequest = store.get(id)
    getRequest.onsuccess = () => {
      const book = getRequest.result
      if (book) {
        book.progress = progress
        book.updated_at = Date.now()
        const putRequest = store.put(book)
        putRequest.onsuccess = () => resolve()
        putRequest.onerror = () => reject(putRequest.error)
      } else {
        resolve()
      }
    }
    getRequest.onerror = () => reject(getRequest.error)
  })
}

const deleteBookById = (id) => {
  return new Promise(async (resolve, reject) => {
    await openDB()
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

const getFileIcon = (fileType) => {
  const icons = { pdf: '📕', epub: '📘', txt: '📄' }
  return icons[fileType] || '📚'
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const handleDrop = (e) => {
  e.preventDefault()
  const file = e.dataTransfer.files[0]
  if (file && (file.type === 'application/pdf' || file.name.endsWith('.epub') || file.name.endsWith('.txt'))) {
    uploadFile.value = file
    bookTitle.value = file.name.replace(/\.[^/.]+$/, '')
  } else {
    alert('请上传 PDF、EPUB 或 TXT 文件')
  }
}

const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (file) {
    uploadFile.value = file
    bookTitle.value = file.name.replace(/\.[^/.]+$/, '')
  }
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file, 'UTF-8')
  })
}

const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}

const uploadBook = async () => {
  if (!uploadFile.value) {
    alert('请选择文件')
    return
  }
  if (!bookTitle.value) {
    alert('请输入书名')
    return
  }

  isUploading.value = true

  const fileExt = uploadFile.value.name.split('.').pop().toLowerCase()
  let content = null
  let arrayBuffer = null
  
  if (fileExt === 'txt') {
    try {
      content = await readFileAsText(uploadFile.value)
    } catch (err) {
      alert('读取文件失败')
      isUploading.value = false
      return
    }
  } else if (fileExt === 'pdf') {
    try {
      arrayBuffer = await readFileAsArrayBuffer(uploadFile.value)
    } catch (err) {
      alert('读取PDF失败')
      isUploading.value = false
      return
    }
  }

  const newBook = {
    title: bookTitle.value,
    author: bookAuthor.value || '未知作者',
    description: bookDescription.value,
    file_type: fileExt,
    file_size: uploadFile.value.size,
    file_name: uploadFile.value.name,
    content: content,
    arrayBuffer: arrayBuffer ? Array.from(new Uint8Array(arrayBuffer)) : null,
    progress: 0,
    created_at: Date.now(),
    updated_at: Date.now()
  }

  try {
    await saveBook(newBook)
    alert('上传成功！')
    showUploadDialog.value = false
    uploadFile.value = null
    bookTitle.value = ''
    bookAuthor.value = ''
    bookDescription.value = ''
    await loadBooks()
  } catch (err) {
    console.error('保存失败:', err)
    alert('保存失败: ' + err.message)
  } finally {
    isUploading.value = false
  }
}

const deleteBook = async (id) => {
  if (!confirm('确定要删除这本书吗？')) return

  try {
    await deleteBookById(id)
    await loadBooks()
  } catch (err) {
    alert('删除失败')
  }
}

const savePDFProgress = async () => {
  if (!readingBook.value || readingBook.value.file_type !== 'pdf') return
  
  const progress = (currentPage.value / pdfPageCount.value) * 100
  readingBook.value.progress = progress
  
  try {
    await updateBookProgress(readingBook.value.id, progress)
    showSaveHint.value = true
    if (saveHintTimeout) clearTimeout(saveHintTimeout)
    saveHintTimeout = setTimeout(() => {
      showSaveHint.value = false
    }, 1000)
  } catch (err) {
    console.error('保存失败:', err)
  }
}

const saveTxtScrollProgress = async () => {
  if (!readingBook.value || readingBook.value.file_type !== 'txt') return
  if (!txtReaderRef.value) return
  
  if (pdfSaveTimeout) clearTimeout(pdfSaveTimeout)
  pdfSaveTimeout = setTimeout(async () => {
    const scrollPercent = (txtReaderRef.value.scrollTop / (txtReaderRef.value.scrollHeight - txtReaderRef.value.clientHeight)) * 100
    const progress = Math.min(99, Math.max(0, scrollPercent))
    readingBook.value.progress = progress
    try {
      await updateBookProgress(readingBook.value.id, progress)
      console.log('TXT进度已保存:', progress.toFixed(1) + '%')
    } catch (err) {
      console.error('保存失败:', err)
    }
  }, 1000)
}

const openBook = async (book) => {
  readingBook.value = { ...book }
  currentPage.value = 1
  pdfPageCount.value = 0
  showSaveHint.value = false
  
  if (book.file_type === 'pdf' && book.arrayBuffer) {
    await renderPDF(book)
    if (book.progress > 0 && pdfPageCount.value > 0) {
      const savedPage = Math.floor((book.progress / 100) * pdfPageCount.value)
      currentPage.value = Math.max(1, Math.min(savedPage, pdfPageCount.value))
      await nextTick()
      await renderPage(currentPage.value)
    }
  } else if (book.file_type === 'txt') {
    await nextTick()
    if (book.progress > 0 && txtReaderRef.value) {
      const scrollHeight = txtReaderRef.value.scrollHeight
      const clientHeight = txtReaderRef.value.clientHeight
      const scrollTop = (book.progress / 100) * (scrollHeight - clientHeight)
      txtReaderRef.value.scrollTop = scrollTop
    }
  }
}

const renderPDF = async (book) => {
  pdfLoading.value = true
  try {
    const uint8Array = new Uint8Array(book.arrayBuffer)
    pdfDoc = await pdfjsLib.getDocument(uint8Array).promise
    pdfPageCount.value = pdfDoc.numPages
    await renderPage(1)
  } catch (err) {
    console.error('PDF渲染失败:', err)
    alert('PDF渲染失败: ' + err.message)
  } finally {
    pdfLoading.value = false
  }
}

const renderPage = async (pageNum) => {
  if (!pdfDoc) return
  
  const page = await pdfDoc.getPage(pageNum)
  const canvas = document.getElementById(`pdf-canvas-${pageNum}`)
  if (!canvas) return
  
  const context = canvas.getContext('2d')
  const viewport = page.getViewport({ scale: 1.5 })
  
  canvas.width = viewport.width
  canvas.height = viewport.height
  canvas.style.display = 'block'
  
  const renderContext = {
    canvasContext: context,
    viewport: viewport
  }
  
  await page.render(renderContext).promise
  
  const allCanvases = document.querySelectorAll('.pdf-canvas')
  allCanvases.forEach(c => {
    if (c.id !== `pdf-canvas-${pageNum}`) {
      c.style.display = 'none'
    }
  })
}

const prevPage = async () => {
  if (currentPage.value > 1) {
    currentPage.value--
    await renderPage(currentPage.value)
  }
}

const nextPage = async () => {
  if (currentPage.value < pdfPageCount.value) {
    currentPage.value++
    await renderPage(currentPage.value)
  }
}

const closeReader = () => {
  readingBook.value = null
  pdfDoc = null
  pdfPageCount.value = 0
  currentPage.value = 1
  showSaveHint.value = false
}

const downloadBook = () => {
  if (readingBook.value && readingBook.value.arrayBuffer) {
    const blob = new Blob([new Uint8Array(readingBook.value.arrayBuffer)], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = readingBook.value.file_name
    a.click()
    URL.revokeObjectURL(url)
  } else {
    alert('无法下载')
  }
}

onMounted(async () => {
  await loadBooks()
})
</script>