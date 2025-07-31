import { config } from '../config/index'

/**
 * 获取字体家族字符串
 * @param type 字体类型：'chinese' | 'english' | 'code'
 * @param variant 字体变体：'primary' | 'secondary' | 'system' | 'fallback'
 * @returns 字体家族字符串
 */
export const getFontFamily = (
  type: 'chinese' | 'english' | 'code',
  variant: string = 'primary'
): string => {
  const fontConfig = config.fonts[type]
  return fontConfig[variant as keyof typeof fontConfig] || fontConfig.primary
}

/**
 * 获取组合字体（中英文混合）
 * @param chineseVariant 中文字体变体
 * @param englishVariant 英文字体变体
 * @returns 组合字体字符串
 */
export const getMixedFontFamily = (
  chineseVariant: string = 'primary',
  englishVariant: string = 'primary'
): string => {
  const chinese = getFontFamily('chinese', chineseVariant)
  const english = getFontFamily('english', englishVariant)
  const system = config.fonts.english.system
  
  return `${chinese}, ${english}, ${system}`
}

/**
 * 获取颜色值
 * @param scale 颜色系列：'primary' | 'secondary' | 'gray'
 * @param shade 颜色深度：50-900
 * @returns 颜色值
 */
export const getColor = (
  scale: 'primary' | 'secondary' | 'gray',
  shade: number = 500
): string => {
  const colorScale = config.colors[scale]
  return colorScale[shade as keyof typeof colorScale] || colorScale[500]
}

/**
 * 获取强调色
 * @param variant 变体：'default' | 'hover' | 'active'
 * @returns 颜色值
 */
export const getAccentColor = (variant: 'default' | 'hover' | 'active' = 'default'): string => {
  return config.colors.accent[variant]
}

/**
 * 获取资源路径
 * @param category 资源类别
 * @param subcategory 子类别
 * @param item 具体项目
 * @returns 资源路径
 */
export const getAssetPath = (
  category: keyof typeof config.assets,
  subcategory?: string,
  item?: string
): string => {
  let asset = config.assets[category]
  
  if (subcategory && typeof asset === 'object' && asset !== null) {
    asset = asset[subcategory as keyof typeof asset]
  }
  
  if (item && typeof asset === 'object' && asset !== null) {
    asset = asset[item as keyof typeof asset]
  }
  
  return typeof asset === 'string' ? asset : ''
}

/**
 * 获取背景图片样式
 * @param imagePath 图片路径
 * @param size 背景尺寸
 * @param position 背景位置
 * @param repeat 背景重复
 * @returns 背景样式对象
 */
export const getBackgroundStyle = (
  imagePath: string,
  size: string = 'cover',
  position: string = 'center',
  repeat: string = 'no-repeat'
) => ({
  backgroundImage: `url(${imagePath})`,
  backgroundSize: size,
  backgroundPosition: position,
  backgroundRepeat: repeat
})

/**
 * 获取动画样式
 * @param property CSS属性
 * @param duration 持续时间类型
 * @param easing 缓动函数类型
 * @param delay 延迟类型
 * @returns 过渡样式字符串
 */
export const getTransition = (
  property: string = 'all',
  duration: keyof typeof config.animations.duration = 'normal',
  easing: keyof typeof config.animations.easing = 'default',
  delay: keyof typeof config.animations.delay = 'none'
): string => {
  return `${property} ${config.animations.duration[duration]} ${config.animations.easing[easing]} ${config.animations.delay[delay]}`
}

/**
 * 获取响应式断点
 * @param breakpoint 断点名称
 * @returns 媒体查询字符串
 */
export const getMediaQuery = (breakpoint: keyof typeof config.layout.breakpoints): string => {
  return `@media (min-width: ${config.layout.breakpoints[breakpoint]})`
}

/**
 * 获取间距值
 * @param spacing 间距名称
 * @returns 间距值
 */
export const getSpacing = (spacing: keyof typeof config.layout.spacing): string => {
  return config.layout.spacing[spacing]
}

/**
 * 获取阴影值
 * @param shadow 阴影名称
 * @returns 阴影值
 */
export const getShadow = (shadow: keyof typeof config.layout.shadows): string => {
  return config.layout.shadows[shadow]
}

/**
 * 获取圆角值
 * @param radius 圆角名称
 * @returns 圆角值
 */
export const getBorderRadius = (radius: keyof typeof config.layout.borderRadius): string => {
  return config.layout.borderRadius[radius]
}

/**
 * 获取按钮样式
 * @param size 按钮尺寸
 * @returns 按钮样式对象
 */
export const getButtonStyle = (size: keyof typeof config.ui.button.sizes = 'md') => {
  const sizeConfig = config.ui.button.sizes[size]
  return {
    padding: sizeConfig.padding,
    fontSize: sizeConfig.fontSize,
    borderRadius: config.ui.button.borderRadius,
    transition: getTransition('all', 'normal', 'smooth')
  }
}

/**
 * 获取输入框样式
 * @param size 输入框尺寸
 * @returns 输入框样式对象
 */
export const getInputStyle = (size: keyof typeof config.ui.input.sizes = 'md') => {
  const sizeConfig = config.ui.input.sizes[size]
  return {
    padding: sizeConfig.padding,
    fontSize: sizeConfig.fontSize,
    borderRadius: config.ui.input.borderRadius,
    transition: getTransition('border-color', 'normal', 'smooth')
  }
}

/**
 * 获取卡片样式
 * @returns 卡片样式对象
 */
export const getCardStyle = () => ({
  padding: config.ui.card.padding,
  borderRadius: config.ui.card.borderRadius,
  boxShadow: config.ui.card.shadow,
  transition: getTransition('all', 'normal', 'smooth')
})

/**
 * 检查文件类型是否允许上传
 * @param fileName 文件名
 * @param category 文件类别
 * @returns 是否允许上传
 */
export const isFileTypeAllowed = (
  fileName: string,
  category: keyof typeof config.upload.allowedTypes
): boolean => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  if (!extension) return false
  
  return config.upload.allowedTypes[category].includes(extension)
}

/**
 * 检查文件大小是否符合限制
 * @param fileSize 文件大小（字节）
 * @param category 文件类别
 * @returns 是否符合限制
 */
export const isFileSizeValid = (
  fileSize: number,
  category: keyof typeof config.upload.maxFileSize
): boolean => {
  const maxSizeInBytes = config.upload.maxFileSize[category] * 1024 * 1024 // 转换为字节
  return fileSize <= maxSizeInBytes
}

/**
 * 获取缓存TTL
 * @param level 缓存级别
 * @returns TTL毫秒数
 */
export const getCacheTTL = (level: keyof typeof config.cache.ttl): number => {
  return config.cache.ttl[level]
}

/**
 * 生成CSS变量
 * @returns CSS变量对象
 */
export const generateCSSVariables = () => {
  const variables: Record<string, string> = {}
  
  // 颜色变量
  Object.entries(config.colors).forEach(([colorName, colorValue]) => {
    if (typeof colorValue === 'object' && 'default' in colorValue) {
      // accent 颜色
      Object.entries(colorValue).forEach(([variant, value]) => {
        variables[`--color-${colorName}-${variant}`] = value
      })
    } else if (typeof colorValue === 'object') {
      // primary, secondary, gray 颜色
      Object.entries(colorValue).forEach(([shade, value]) => {
        variables[`--color-${colorName}-${shade}`] = value
      })
    }
  })
  
  // 字体大小变量
  Object.entries(config.fonts.sizes).forEach(([size, value]) => {
    variables[`--font-size-${size}`] = value
  })
  
  // 间距变量
  Object.entries(config.layout.spacing).forEach(([spacing, value]) => {
    variables[`--spacing-${spacing}`] = value
  })
  
  // 圆角变量
  Object.entries(config.layout.borderRadius).forEach(([radius, value]) => {
    variables[`--border-radius-${radius}`] = value
  })
  
  // 阴影变量
  Object.entries(config.layout.shadows).forEach(([shadow, value]) => {
    variables[`--shadow-${shadow}`] = value
  })
  
  // 动画变量
  Object.entries(config.animations.duration).forEach(([duration, value]) => {
    variables[`--duration-${duration}`] = value
  })
  
  Object.entries(config.animations.easing).forEach(([easing, value]) => {
    variables[`--easing-${easing}`] = value
  })
  
  return variables
} 