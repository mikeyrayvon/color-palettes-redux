import React, { useState } from "react";
import { useAppContext } from "../utils/store";
import { Color, Palette } from "../utils/types"
import ColorPicker from "./ColorPicker";
import NewColor from "./NewColor";

interface Props {
  palette: Palette
  handleDrag(e: React.DragEvent): void
  handleDrop(e: React.DragEvent): void
}

const ColorPalette: React.FC<Props> = ({ palette, handleDrag, handleDrop }) => {
  const { 
    colors, 
    changeTitle,
    updateTitle,
    deletePalette
  } = useAppContext()
  
  return (
    <div 
      className='mb-8 group'
      >
      <div className='flex justify-between items-center'>
        <input 
          className='border-0 border-b border-transparent text-xl font-bold px-0 focus:ring-transparent hover:border-gray-300 focus:border-gray-500 pb-1' 
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
        {
          palette?.colors?.map(colorId => {
            const color = colors.find(c => c.id === colorId)
            if (color) {
              return (
                <ColorPicker 
                  key={`${color.id}`}
                  paletteId={palette.id}
                  color={color} 
                  handleDrag={handleDrag}
                  handleDrop={handleDrop}
                  />
              )
            }
            return
          })
        }
        <NewColor paletteId={palette.id} />
      </div>
    </div>
  )
}

export default ColorPalette
