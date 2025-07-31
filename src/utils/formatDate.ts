/**
 * 时间格式化工具函数
 */

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param dateString - ISO时间字符串或时间戳
 * @returns 格式化后的日期字符串
 */
export function formatDate(dateString: string | number | Date | undefined): string {
  if (!dateString) {
    return '未知时间'
  }

  try {
    const date = new Date(dateString)
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '无效时间'
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('日期格式化错误:', error)
    return '格式错误'
  }
}

/**
 * 格式化日期为 YYYY-MM-DD HH:mm 格式
 * @param dateString - ISO时间字符串或时间戳
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(dateString: string | number | Date | undefined): string {
  if (!dateString) {
    return '未知时间'
  }

  try {
    const date = new Date(dateString)
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '无效时间'
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}`
  } catch (error) {
    console.error('日期时间格式化错误:', error)
    return '格式错误'
  }
}

/**
 * 格式化为相对时间（如：2天前、1小时前）
 * @param dateString - ISO时间字符串或时间戳
 * @returns 相对时间字符串
 */
export function formatRelativeTime(dateString: string | number | Date | undefined): string {
  if (!dateString) {
    return '未知时间'
  }

  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInSeconds = Math.floor(diffInMs / 1000)
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)
    const diffInMonths = Math.floor(diffInDays / 30)
    const diffInYears = Math.floor(diffInDays / 365)

    if (diffInYears > 0) {
      return `${diffInYears}年前`
    } else if (diffInMonths > 0) {
      return `${diffInMonths}个月前`
    } else if (diffInDays > 0) {
      return `${diffInDays}天前`
    } else if (diffInHours > 0) {
      return `${diffInHours}小时前`
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes}分钟前`
    } else {
      return '刚刚'
    }
  } catch (error) {
    console.error('相对时间格式化错误:', error)
    return '格式错误'
  }
} 