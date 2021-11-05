export interface Color {
  id: string
  hex: string
  rgb: string
  name: string
}

export interface Palette {
  id: string
  title: string
  description: string
  colors: string[] | []
}