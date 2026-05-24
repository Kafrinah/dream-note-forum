// 自动裁剪像素图的空白边缘
export function cropPixelAvatar(pixelData, size = 100) {
  // 解析像素数据
  let colors
  if (typeof pixelData === 'string') {
    colors = JSON.parse(pixelData)
  } else {
    colors = pixelData
  }
  
  // 找出有内容的边界
  let minX = size, minY = size, maxX = -1, maxY = -1
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const color = colors[y * size + x]
      // 不是空白背景（背景色是 #f3f4f6）
      if (color && color !== '#f3f4f6' && color !== '#FFFFFF') {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  
  // 如果没有内容，返回默认区域
  if (minX > maxX || minY > maxY) {
    return { x: 0, y: 0, width: size, height: size, cropX: 0, cropY: 0, cropSize: size }
  }
  
  // 计算裁剪后的尺寸
  let width = maxX - minX + 1
  let height = maxY - minY + 1
  let cropSize = Math.max(width, height)
  
  // 添加少量内边距（10%）
  const padding = Math.floor(cropSize * 0.1)
  cropSize = cropSize + padding * 2
  
  // 计算居中裁剪区域
  let cropX = Math.max(0, minX - padding)
  let cropY = Math.max(0, minY - padding)
  
  // 确保不超出边界
  if (cropX + cropSize > size) {
    cropX = size - cropSize
  }
  if (cropY + cropSize > size) {
    cropY = size - cropSize
  }
  if (cropX < 0) cropX = 0
  if (cropY < 0) cropY = 0
  
  return { x: minX, y: minY, width, height, cropX, cropY, cropSize }
}

// 生成裁剪后的 SVG
export function generateCroppedAvatarSVG(pixelData, targetSize = 80) {
  if (!pixelData) {
    return getDefaultAvatarSVG(targetSize)
  }
  
  const size = 100
  let colors
  if (typeof pixelData === 'string') {
    colors = JSON.parse(pixelData)
  } else {
    colors = pixelData
  }
  
  const crop = cropPixelAvatar(colors, size)
  const svgSize = targetSize
  
  // 计算缩放比例
  const scale = svgSize / crop.cropSize
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}" shape-rendering="crispEdges">`
  
  // 绘制裁剪后的像素
  for (let y = 0; y < crop.cropSize; y++) {
    for (let x = 0; x < crop.cropSize; x++) {
      const srcY = crop.cropY + y
      const srcX = crop.cropX + x
      if (srcY >= 0 && srcY < size && srcX >= 0 && srcX < size) {
        const color = colors[srcY * size + srcX]
        if (color && color !== '#f3f4f6') {
          const px = Math.floor(x * scale)
          const py = Math.floor(y * scale)
          const pw = Math.ceil(scale)
          const ph = Math.ceil(scale)
          svg += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="${color}"/>`
        }
      }
    }
  }
  
  svg += '</svg>'
  return svg
}

// 默认头像 SVG
function getDefaultAvatarSVG(size = 80) {
  const pixelSize = size / 10
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">
    <rect width="${size}" height="${size}" fill="#f3f4f6"/>
    <rect x="${pixelSize * 3}" y="${pixelSize * 3.5}" width="${pixelSize}" height="${pixelSize}" fill="#000000"/>
    <rect x="${pixelSize * 6}" y="${pixelSize * 3.5}" width="${pixelSize}" height="${pixelSize}" fill="#000000"/>
    <rect x="${pixelSize * 4}" y="${pixelSize * 6}" width="${pixelSize}" height="${pixelSize}" fill="#000000"/>
    <rect x="${pixelSize * 5}" y="${pixelSize * 6}" width="${pixelSize}" height="${pixelSize}" fill="#000000"/>
    <rect x="${pixelSize * 4.5}" y="${pixelSize * 7}" width="${pixelSize}" height="${pixelSize}" fill="#000000"/>
  </svg>`
}