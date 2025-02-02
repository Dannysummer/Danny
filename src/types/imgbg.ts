export interface ImgBgItem {
  url: string
}

export interface ImgBgRow {
  items: ImgBgItem[]
}

export interface ImgBgConfig {
  translateX?: boolean
  skewX?: boolean
  contrast?: boolean
  scale?: boolean
  brightness?: boolean
} 