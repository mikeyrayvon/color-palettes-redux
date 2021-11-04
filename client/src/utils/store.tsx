import { createContext, useContext, useEffect, useState } from 'react'
import { postData } from './api'
import { initialColor, initialPalette } from './constants'
import { hexToRGB, uniqueId } from './tools'
import { Color, Palette } from './types'

interface AppContextValue {
  palettes: Palette[] | []
  colors: Color[] | []
  addColor(paletteId: number): void
  addPalette(): void
  updateValues(color: Color, hex: string): void
  updateColor(color: Color): void
  deleteColor(deletedColor: Color, paletteId: number): void
  handleDroppedColor(dragColor: Color, dropColor: Color): void | null
  updateTitle(e: React.ChangeEvent<HTMLInputElement>, paletteId: number): void
  updatePalette(palette: Palette): void
  deletePalette(paletteId: number, colorIds: number[]): void
}

const AppContext = createContext<AppContextValue>({
  palettes: [],
  colors: [],
  addColor: () => {},
  addPalette: () => {},
  updateValues: () => {},
  updateColor: () => {},
  deleteColor: () => {},
  handleDroppedColor: () => {},
  updateTitle: () => {},
  updatePalette: () => {}, 
  deletePalette: () => {}
})

const AppContextProvider: React.FC = ({ children }) => {
  const [palettes, setPalettes] = useState<Palette[]>([])
  const [colors, setColors] = useState<Color[]>([])

  useEffect(() => {
    getInitialData()
  })

  const getInitialData = async () => {
    try {
      const colors = await fetch('/api/getColors')
      const colorsData = await colors.json()
      console.log(colorsData)
    } catch (err) {
      console.error(err)
    }
  }

  const setInitialData = (data: {
    colors: Color[],
    palettes: Palette[]
  }) => {
    console.log(colors, palettes)
    setColors(data.colors)
    setPalettes(data.palettes)
  }

  const addColor = (paletteId: number) => {
    const palette = palettes.find(p => {
      return p.id === paletteId
    })
    const colorId = uniqueId()
    const color = {
      ...initialColor,
      id: colorId,
      order: palette?.colors ? palette?.colors.length + 1 : 1
    }
    
    const updatedPalettes = palettes.map(p => {
      if (p.id === paletteId) {
        return {
          ...p, 
          colors: [
            ...p.colors,
            colorId
          ]
        }
      }
      return p
    })

    setColors((prevColors) => {
      return [
        ...prevColors,
        color
      ]
    })
    setPalettes(updatedPalettes)

    postData('/api/upsertPalette', { palette: {
      ...palette,
      colors: [
        ...palette?.colors || [],
        colorId
      ]
    } })
    postData('/api/upsertColor', { color })
  }

  const addPalette = () => {
    const palette = {
      ...initialPalette,
      id: uniqueId()
    }
    setPalettes((prevPalettes) => {
      return [
        ...prevPalettes,
        palette
      ]
    })
    postData('/api/upsertPalette', { palette })
  }

  const updateValues = (color: Color, hex: string) => {
    const rgb: number[] | boolean = hexToRGB(hex.slice(1))
    const updatedColor: Color = {
      ...color,
      name: '...',
      hex,
      rgb: rgb ? rgb.toString() : ''
    }    
    setColors(prevColors => {
      return prevColors.map(c => c.id === color.id ? updatedColor : c)
    })
  }

  const updateColor = (color: Color) => {
    let updatedColor = color
    postData('/api/getName', {
      hex: color.hex.slice(1)
    })
      .then((response) => {
        if (response?.colors) {
          updatedColor = {
            ...color, 
            name: response.colors[0].name
          }
          setColors(prevColors => {
            return prevColors.map(c => c.id === color.id ? updatedColor : c)
          })
          return updatedColor
        } else {
          throw new Error()
        }
      })
      .then(updatedColor => {
        return postData('/api/upsertColor', { color: updatedColor })
      })
      .catch(err => {
        console.error(err)
        return err
      })
    
  }

  const deleteColor = (deletedColor: Color, paletteId: number) => {
    const palette = palettes.find(p => p.id === paletteId)
    const filteredColors = palette?.colors.filter(id => id !== deletedColor.id)
    const updatedPalettes = palettes.map(p => {
      if (p.id === paletteId && filteredColors) {
        return {
          ...p,
          colors: filteredColors
        }
      }
      return p
    })
    const updatedColors = colors.filter(c => c.id !== deletedColor.id)
      .map(c => {
        if (c.order > deletedColor.order) {
          const updatedColor = {
            ...c,
            order: c.order - 1
          } 
          postData('/api/upsertColor', { color: updatedColor })
          return updatedColor
        }
        return c
      })
    setColors(updatedColors)
    setPalettes(updatedPalettes)
    
    postData('/api/deleteColor', { id: deletedColor.id })
    postData('/api/upsertPalette', { palette: {
      ...palette,
      colors: filteredColors
    } })
  } 

  const handleDroppedColor = (dragColor: Color, dropColor: Color) => {
    if (dragColor && dropColor) {
      const reordered = colors.map((c): Color => {
        if (c.id === dragColor.id) {
          const updatedColor = {
            ...c, 
            order: dropColor.order
          }
          postData('/api/upsertColor', { color: updatedColor })
          return updatedColor
        }
        if (c.id === dropColor.id) {
          const updatedColor = {
            ...c, 
            order: dragColor.order
          }
          postData('/api/upsertColor', { color: updatedColor })
          return updatedColor
        }
        return c
      })
      setColors(reordered)
    }
  }

  const updateTitle = (e: React.ChangeEvent<HTMLInputElement>, paletteId: number) => {
    const newTitle = e.currentTarget.value
    const updatedPalettes = palettes.map(p => {
      if (p.id === paletteId) {
        return {
          ...p,
          title: newTitle
        }
      }
      return p
    })
    setPalettes(updatedPalettes)
  }

  const updatePalette = (palette: Palette) => {
    postData('/api/upsertPalette', { palette })
  }

  const deletePalette = (paletteId: number, colorIds: number[]) => {
    const filteredPalettes = palettes.filter(p => p.id !== paletteId)
    const filteredColors = colors.filter(c => !colorIds.includes(c.id));
    setPalettes(filteredPalettes)
    setColors(filteredColors)
    for (const id of colorIds) {
      postData('/api/deleteColor', { id })
    }
    postData('/api/deletePalette', { id: paletteId })
  }
 
  return (
    <AppContext.Provider
      value={{
        palettes,
        colors,
        addColor,
        addPalette,
        updateValues,
        updateColor,
        deleteColor,
        handleDroppedColor,
        updateTitle,
        updatePalette,
        deletePalette
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

const useAppContext = () => useContext(AppContext)

export { AppContext as default, AppContextProvider, useAppContext }