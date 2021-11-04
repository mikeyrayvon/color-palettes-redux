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
  deletePalette: () => {}
})

const AppContextProvider: React.FC = ({ children }) => {
  const [palettes, setPalettes] = useState<Palette[]>([])
  const [colors, setColors] = useState<Color[]>([])

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
      setPalettes(palettes)
    } catch (err) {
      console.error(err)
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
    }).then(response => {
      console.log(response)
    })
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

  const deleteColor = (deletedColor: Color, paletteId: string) => {
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
          const updatedColor: Color = {
            ...c,
            order: c.order - 1
          } 
          postData('api/updateItem', { 
            table: 'colors',
            id: updatedColor.id,
            updates: [
              {
                key: 'order',
                value: updatedColor.order
              },
            ]
          })
          return updatedColor
        }
        return c
      })
    setColors(updatedColors)
    setPalettes(updatedPalettes)
    
    postData('api/deleteItem', { 
      table: 'colors',
      id: deletedColor.id
    })
    postData('api/updateItem', {
      table: 'palettes',
      id: palette?.id,
      updates: [
        {
          key: 'colors',
          value: filteredColors
        }
      ]
    })
  }

  const handleDroppedColor = (dragColor: Color, dropColor: Color) => {
    if (dragColor && dropColor) {
      const reordered = colors.map((c): Color => {
        if (c.id === dragColor.id) {
          const updatedColor = {
            ...c, 
            order: dropColor.order
          }
          postData('api/updateItem', { 
            table: 'colors',
            id: updatedColor.id,
            updates: [
              {
                key: 'order',
                value: updatedColor.order
              }
            ]
          })
          return updatedColor
        }
        if (c.id === dropColor.id) {
          const updatedColor = {
            ...c, 
            order: dragColor.order
          }
          postData('api/updateItem', { 
            table: 'colors',
            id: updatedColor.id,
            updates: [
              {
                key: 'order',
                value: updatedColor.order
              }
            ]
          })
          return updatedColor
        }
        return c
      })
      setColors(reordered)
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
    setPalettes(filteredPalettes)
    setColors(filteredColors)
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
        deletePalette
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

const useAppContext = () => useContext(AppContext)

export { AppContext as default, AppContextProvider, useAppContext }