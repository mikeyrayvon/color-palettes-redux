import React, { ChangeEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAppContext } from "../utils/context";
import { AppState } from "../utils/reducers";
import { Color, Palette } from "../utils/types"
import ColorPicker from "./ColorPicker";
import NewColor from "./NewColor";

interface Props {
  palette: Palette
  handleDrag(e: React.DragEvent): void
  handleDrop(e: React.DragEvent): void
}

const ColorPalette: React.FC<Props> = ({ palette, handleDrag, handleDrop }) => {
  const colors = useSelector<AppState, AppState['colors']>(state => state.colors)
  const dispatch = useDispatch()

  const [title, setTitle] = useState('')

  useEffect(() => {
    setTitle(palette.title)
  }, [palette.title])

  /*const { 
    colors, 
    updateTitle,
    deletePalette
  } = useAppContext()*/

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const handleBlur = () => {
    dispatch({type: 'UPDATE_TITLE', payload: {title, paletteId: palette.id}})
  }

  const handleDelete = () => {
    dispatch({type: 'REMOVE_PALETTE', payload: {paletteId: palette.id, colorIds: palette.colors}})
  }
  
  return (
    <div 
      className='mb-8 group'
      >
      <div className='flex justify-between items-center'>
        <input 
          className='border-0 border-b border-transparent text-xl font-bold px-0 focus:ring-transparent hover:border-gray-300 focus:border-gray-500 pb-1' 
          value={palette.title} 
          type='text' 
          onChange={handleChange}
          onBlur={handleBlur}
          />
          <button 
            className='opacity-0 group-hover:opacity-100 py-1 px-2 rounded-lg bg-gray-400 hover:bg-gray-600 text-white' 
            onClick={handleDelete}
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
