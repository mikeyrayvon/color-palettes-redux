export interface Color {
  id: number
  hex: string
  rgb: string
  name: string
  order: number
}

export interface Palette {
  id: number
  created_at?: Date
  title: string
  description: string
  colors: number[] | []
}