import { createContext, useContext, useEffect, useState } from 'react'
import { postData } from './api'
import { initialColor, initialPalette } from './constants'
import { hexToRGB, uniqueId } from './tools'
import { Color, Palette } from './types'

interface AppContextValue {
  palettes: Palette[] | []
  colors: Color[] | []
  addColor(paletteId: string): void
  addPalette(): void
  updateValues(color: Color, hex: string): void
  updateColor(color: Color): void
  deleteColor(deletedColor: Color, paletteId: string): void
  handleDroppedColor(dragColor: Color, dropColor: Color): void | null
  changeTitle(e: React.ChangeEvent<HTMLInputElement>, paletteId: string): void
  updateTitle(palette: Palette): void
  deletePalette(paletteId: string, colorIds: string[]): void
  loading: boolean
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
  changeTitle: () => {},
  updateTitle: () => {}, 
  deletePalette: () => {},
  loading: true
})

const AppContextProvider: React.FC = ({ children }) => {
  const [palettes, setPalettes] = useState<Palette[]>([])
  const [colors, setColors] = useState<Color[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    getInitialData()
  }, [])

  const getInitialData = async () => {
    try {
      const colors = await postData('api/getData', {
        table: 'colors'
      })
      setColors(colors)
      const palettes = await postData('api/getData', {
        table: 'palettes'
      })
      if (palettes.length > 0) {
        setPalettes(palettes)
      } else {
        addPalette()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const addColor = (paletteId: string) => {
    const palette = palettes.find(p => {
      return p.id === paletteId
    })
    const colorId = uniqueId()
    const color = {
      ...initialColor,
      id: colorId,
      palette: paletteId
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

    postData('api/addItem', {
      table: 'colors',
      item: color
    })
    postData('api/updateItem', {
      table: 'palettes',
      id: palette?.id,
      updates: [
        {
          key: 'colors',
          value: [
            ...palette?.colors || [],
            colorId
          ]
        }
      ]
    })
  }

  const addPalette = () => {
    // Assemble new palette from inital props and unique ID
    const palette = {
      ...initialPalette,
      id: uniqueId()
    }
    // Concat new palette to palettes state
    setPalettes((prevPalettes) => {
      return [
        ...prevPalettes,
        palette
      ]
    })
    // Post new palette to database
    postData('api/addItem', {
      table: 'palettes',
      item: palette
    })
  }

  /**
   * Update color hex in app state
   * @param color Color to update
   * @param hex New hexidecimal value of color
   */
  const updateValues = (color: Color, hex: string) => {
    // update color with RGB value
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

  /**
   * Get color name and update color in 
   * database with name, hex, and rgb
   * @param color Color to update
   */
  const updateColor = (color: Color) => {
    let updatedColor = color
    postData('api/getName', {
      hex: color.hex.slice(1)
    })
      .then((data) => {
        if (data?.colors) {
          updatedColor = {
            ...color, 
            name: data.colors[0].name
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
        return postData('api/updateItem', { 
          table: 'colors',
          id: color?.id,
          updates: [
            {
              key: 'name',
              value: updatedColor.name
            },
            {
              key: 'hex',
              value: updatedColor.hex
            },
            {
              key: 'rgb',
              value: updatedColor.rgb
            }
          ]
        })
      })
      .catch(err => {
        console.error(err)
        return err
      })
    
  }

  /**
   * Delete color from colors and corresponding palette
   * @param color Color to delete
   * @param paletteId ID of palette the color is on
   */
  const deleteColor = (color: Color, paletteId: string) => {
    const palette = palettes.find(p => p.id === paletteId)
    const filteredColors = palette?.colors.filter(id => id !== color.id)
    const updatedPalettes = palettes.map(p => {
      if (p.id === paletteId && filteredColors) {
        return {
          ...p,
          colors: filteredColors
        }
      }
      return p
    })
    const updatedColors = colors.filter(c => c.id !== color.id)

    setColors(updatedColors)
    setPalettes(updatedPalettes)
    
    postData('api/deleteItem', { 
      table: 'colors',
      id: color.id
    })
    postData('api/updateItem', {
      table: 'palettes',
      id: palette?.id,
      updates: [
        {
          key: 'colors',
          value: updatedColors
        }
      ]
    })
  }

  const handleDroppedColor = (dragColor: Color, dropColor: Color) => {
    if (dragColor && dropColor) {
      let dragPaletteId, 
        dropPaletteId,
        dragPaletteColors,
        dropPaletteColors

      const updatedPalettes = palettes.map(p => {
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

      setPalettes(updatedPalettes)

      postData('api/updateItem', {
        table: 'palettes',
        id: dragPaletteId,
        updates: [
          {
            key: 'colors',
            value: dragPaletteColors
          }
        ]
      })
      if (dragPaletteId !== dropPaletteId) {
        postData('api/updateItem', {
          table: 'palettes',
          id: dropPaletteId,
          updates: [
            {
              key: 'colors',
              value: dropPaletteColors
            }
          ]
        })
      }
    }
  }

  const changeTitle = (e: React.ChangeEvent<HTMLInputElement>, paletteId: string) => {
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

  const updateTitle = (palette: Palette) => {
    postData('api/updateItem', { 
      table: 'palettes',
      id: palette.id,
      updates: [
        {
          key: 'title',
          value: palette.title
        }
      ]
    })
  }

  const deletePalette = (paletteId: string, colorIds: string[]) => {
    const filteredPalettes = palettes.filter(p => p.id !== paletteId)
    const filteredColors = colors.filter(c => !colorIds.includes(c.id));
    
    setColors(filteredColors)
    setPalettes(filteredPalettes)
    
    for (const id of colorIds) {
      postData('api/deleteItem', { 
        table: 'colors',
        id
      })
    }
    postData('api/deleteItem', { 
      table: 'palettes',
      id: paletteId
    })
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
        changeTitle,
        updateTitle,
        deletePalette,
        loading
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

const useAppContext = () => useContext(AppContext)

export { AppContext as default, AppContextProvider, useAppContext }