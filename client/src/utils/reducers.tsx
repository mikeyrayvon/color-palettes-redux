import { postData } from "./api";
import { initialColor, initialPalette } from "./constants";
import { hexToRGB, uniqueId } from "./tools";
import { Color, Palette } from "./types";

export interface AppState {
  palettes: Palette[] | []
  colors: Color[] | []
  loading: boolean
}

const initialState = {
  palettes: [],
  colors: [],
  loading: true
}

type Action = {
  type: string,
  payload: any
}

export const rootReducer = (state: AppState = initialState, action: Action) => {
  switch (action.type) {
    case 'SET_DATA': {
      const {colors, palettes} = action.payload
      return { colors, palettes, loading: false }
    }
    case 'ADD_COLOR': {
      const color = {
        ...initialColor,
        id: uniqueId()
      }
      const palettes = state.palettes.map(p => p.id === action.payload ? {
          ...p, 
          colors: [
            ...p.colors,
            color.id
          ]
        } : p)
      return { ...state, colors: [ ...state.colors, color ], palettes }
    }
    case 'ADD_PALETTE': {
      const newPalette = { ...initialPalette, id: uniqueId() }
      return {...state, palettes: {...state.palettes, newPalette}}
    }
    case 'UPDATE_COLOR': {
      const updatedColor = action.payload
      const colors = state.colors.map(c => c.id === updatedColor.id ? updatedColor : c)
      return {...state, colors}
    }
    case 'REORDER_COLORS': {
      const { dragId, dropId } = action.payload
      const dragColor: Color | undefined = state.colors.find(c => c.id === dragId)
      const dropColor: Color | undefined = state.colors.find(c => c.id === dropId)
      let palettes = state.palettes
      
      if (dragColor && dropColor) {
        let dragPaletteId, 
          dropPaletteId,
          dragPaletteColors,
          dropPaletteColors
        palettes = state.palettes.map(p => {
          const updated = {...p}
          const dragIndex: number = p.colors.findIndex(id => id === dragColor.id)
          const dropIndex: number = p.colors.findIndex(id => id === dropColor.id)
          if (dragIndex > -1) {
            updated.colors[dragIndex] = dropColor.id
            dragPaletteId = p.id 
            dragPaletteColors = updated.colors
          }
          if (dropIndex > -1) {
            updated.colors[dropIndex] = dragColor.id
            dropPaletteId = p.id 
            dropPaletteColors = updated.colors
          }
          return updated
        })
      }

      return { ...state, palettes }
    }
    case 'REMOVE_COLOR': {
      const {colorId, paletteId} = action.payload
      const palette = state.palettes.find(p => p.id === paletteId)
      const paletteColors = palette?.colors.filter(id => id !== colorId)
      const palettes = state.palettes.map(p => p.id === paletteId && paletteColors ? {
          ...p,
          colors: paletteColors
        } : p)
      const colors = state.colors.filter(c => c.id !== colorId)
      return { ...state, palettes, colors }
    }
    case 'REMOVE_PALETTE': {
      const {paletteId, colorIds} = action.payload
      const palettes = state.palettes.filter(p => p.id !== paletteId)
      const colors = state.colors.filter(c => !colorIds.includes(c.id))
      return { ...state, palettes, colors }
    }
    case 'UPDATE_TITLE': {
      const {title, paletteId} = action.payload
      const palettes = state.palettes.map(p => p.id === paletteId ? {
          ...p,
          title
        } : p)
      return { ...state, palettes }
    }
    default: 
      return state
  }
}

const loadData = () => async (dispatch, getState) => {
  const colors = await postData('api/getData', { table: 'colors' })
  const palettes = await postData('api/getData', { table: 'palettes' })
  dispatch({type: 'SET_DATA', payload: {colors, palettes}})
}