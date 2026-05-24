// 自动识别像素图案的外轮廓（四连通边界检测）
export function detectBorder(pixelData, size = 100) {
  // 解析像素数据
  let colors
  if (typeof pixelData === 'string') {
    colors = JSON.parse(pixelData)
  } else {
    colors = pixelData
  }
  
  // 第一步：找出所有非背景色像素
  const nonBackground = []
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const color = colors[y * size + x]
      if (color && color !== '#f3f4f6' && color !== '#FFFFFF') {
        nonBackground.push({ x, y, color })
      }
    }
  }
  
  if (nonBackground.length === 0) return []
  
  // 第二步：找出边界像素（至少有相邻的背景像素）
  const borderPixels = []
  for (const pixel of nonBackground) {
    let isBorder = false
    // 检查上下左右四个方向
    const neighbors = [
      { x: pixel.x, y: pixel.y - 1 }, // 上
      { x: pixel.x, y: pixel.y + 1 }, // 下
      { x: pixel.x - 1, y: pixel.y }, // 左
      { x: pixel.x + 1, y: pixel.y }  // 右
    ]
    
    for (const n of neighbors) {
      if (n.x < 0 || n.x >= size || n.y < 0 || n.y >= size) {
        isBorder = true
        break
      }
      const neighborColor = colors[n.y * size + n.x]
      if (neighborColor === '#f3f4f6' || neighborColor === '#FFFFFF') {
        isBorder = true
        break
      }
    }
    
    if (isBorder) {
      borderPixels.push({ x: pixel.x, y: pixel.y })
    }
  }
  
  return borderPixels
}

// 获取贴纸的边界框（最小外接矩形）
export function getBoundingBox(borderPixels, size = 100) {
  if (borderPixels.length === 0) return null
  
  let minX = size, minY = size, maxX = -1, maxY = -1
  for (const p of borderPixels) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2
  }
}

// 裁剪贴纸图像（根据边界框）
export function cropStickerImage(pixelData, borderPixels, size = 100) {
  if (borderPixels.length === 0) return pixelData
  
  const box = getBoundingBox(borderPixels, size)
  if (!box) return pixelData
  
  let colors
  if (typeof pixelData === 'string') {
    colors = JSON.parse(pixelData)
  } else {
    colors = pixelData
  }
  
  const cropped = []
  for (let y = box.y; y < box.y + box.height; y++) {
    for (let x = box.x; x < box.x + box.width; x++) {
      cropped.push(colors[y * size + x])
    }
  }
  
  return JSON.stringify(cropped)
}

// 生成贴纸的 SVG 预览（根据边界框裁剪）
export function generateStickerSVG(pixelData, targetSize = 80) {
  if (!pixelData) {
    return getEmptySVG(targetSize)
  }
  
  let colors
  if (typeof pixelData === 'string') {
    colors = JSON.parse(pixelData)
  } else {
    colors = pixelData
  }
  
  const size = 100
  
  // 找出实际内容边界
  let minX = size, minY = size, maxX = -1, maxY = -1
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const color = colors[y * size + x]
      if (color && color !== '#f3f4f6' && color !== '#FFFFFF') {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  
  if (minX > maxX || minY > maxY) {
    return getEmptySVG(targetSize)
  }
  
  const width = maxX - minX + 1
  const height = maxY - minY + 1
  const scale = Math.min(targetSize / width, targetSize / height)
  const scaledWidth = Math.floor(width * scale)
  const scaledHeight = Math.floor(height * scale)
  const offsetX = (targetSize - scaledWidth) / 2
  const offsetY = (targetSize - scaledHeight) / 2
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${targetSize}" height="${targetSize}" viewBox="0 0 ${targetSize} ${targetSize}" shape-rendering="crispEdges">`
  
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const color = colors[y * size + x]
      if (color && color !== '#f3f4f6' && color !== '#FFFFFF') {
        const px = offsetX + (x - minX) * scale
        const py = offsetY + (y - minY) * scale
        const pw = Math.ceil(scale)
        const ph = Math.ceil(scale)
        svg += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="${color}"/>`
      }
    }
  }
  
  svg += '</svg>'
  return svg
}

function getEmptySVG(size = 80) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">
    <rect width="${size}" height="${size}" fill="#f3f4f6"/>
    <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-size="12">空白</text>
  </svg>`
}