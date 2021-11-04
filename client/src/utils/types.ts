export interface Color {
  id: string
  hex: string
  rgb: string
  name: string
  order: number
}

export interface Palette {
  id: string
  title: string
  description: string
  colors: string[] | []
}