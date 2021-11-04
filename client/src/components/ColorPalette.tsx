import React, { useState } from "react";
import { useAppContext } from "../utils/store";
import { Color, Palette } from "../utils/types"
import ColorPicker from "./ColorPicker";
import NewColor from "./NewColor";

interface Props {
  palette: Palette
}

const ColorPalette: React.FC<Props> = ({ palette }) => {
  const { 
    colors, 
    handleDroppedColor,
    changeTitle,
    updateTitle,
    deletePalette
  } = useAppContext()

  const [dragId, setDragId] = useState<null | string>(null)
  
  const handleDrag = (e: React.DragEvent) => {
    setDragId(e.currentTarget.id)
  };

  const handleDrop = (e: React.DragEvent) => {
    const dragColor: Color | undefined = colors.find(c => c.id === dragId)
    const dropColor: Color | undefined = colors.find(c => c.id === e.currentTarget.id)

    if (dragColor && dropColor) {
      handleDroppedColor(dragColor, dropColor)
    }
  }

  const renderColors = () => {
    const paletteColors = palette?.colors?.map(colorId => {
      return colors.find(c => c.id === colorId)
    })
    const paletteOrdered = paletteColors?.sort((a, b) => {
      if (a && b)
        return a.order - b.order
      return 0
    })
    return (
      paletteOrdered?.map(c => {
        if (c !== undefined) {
          return (
            <ColorPicker 
              key={`${c.id}`}
              paletteId={palette.id}
              color={c} 
              handleDrag={handleDrag}
              handleDrop={handleDrop}
              />
          )
        }
        return
      })
    )
  } 
  
  return (
    <div 
      className='mb-8 group'
      >
      <div className='flex justify-between items-center'>
        <input 
          className='border-0 border-b border-transparent text-xl font-bold px-0 focus:ring-transparent hover:border-gray-200 focus:border-black' 
          value={palette.title} 
          type='text' 
          onChange={e => changeTitle(e, palette.id)}
          onBlur={() => updateTitle(palette)}
          />
          <button 
            className='opacity-0 group-hover:opacity-100 py-1 px-2 rounded-lg bg-gray-400 hover:bg-gray-600 text-white' 
            onClick={() => deletePalette(palette.id, palette.colors)}
            >Remove</button>
      </div>
      <div className='flex flex-wrap'>
        <p>{palette.description}</p>
        {renderColors()}
        <NewColor paletteId={palette.id} />
      </div>
    </div>
  )
}

export default ColorPalette
