import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useAppContext } from '../utils/context'
import { hexToRGB } from '../utils/tools'
import type { Color } from '../utils/types'

interface Props {
  paletteId: string
  color: Color
  handleDrag(e: React.DragEvent): void
  handleDrop(e: React.DragEvent): void
}

const ColorPicker: React.FC<Props> = ({ 
  paletteId,
  color, 
  handleDrag,
  handleDrop
}) => {
  const [values, setValues] = useState({ rgb: '', hex: '' })
  const dispatch = useDispatch()

  useEffect(() => {
    setValues({
      rgb: color.rgb,
      hex: color.hex
    })
  }, [color])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rgb = hexToRGB(e.target.value.slice(1)).toString()
    setValues({
      rgb,
      hex: e.target.value
    })
  }

  const handleBlur = () => {
    dispatch({type: 'UPDATE_COLOR', payload: {...color, rgb: values.rgb, hex: values.hex}})
  }

  const handleDelete = () => {
    dispatch({type: 'REMOVE_COLOR', payload: {colorId: color.id, paletteId}})
  }

  return (
    <div 
      className='flex flex-col text-center items-center py-4 w-32 relative h-[190px] hover-parent'
      id={color.id.toString()}
      draggable={true}
      onDragOver={(e) => e.preventDefault()}
      onDragStart={handleDrag}
      onDrop={handleDrop}
      >
      <input 
        className='w-0 h-0 opacity-0 absolute left-0' 
        type='color' 
        id={`color_${color.id}`}
        name={`color_${color.id}`}
        value={color?.hex} 
        onInput={handleChange} 
        onBlur={handleBlur}
        />
      <label 
        className='block w-24 h-24 rounded-full shadow-xl mb-4' 
        style={{
          backgroundColor: color?.hex,
          cursor: 'move'
        }} 
        htmlFor={`color_${color.id}`} 
        />
      <div className='hover-child absolute top-0 right-0 flex'>
        <button className='text-gray-400 hover:text-black' onClick={handleDelete}>✕</button>
      </div>
      <div className='text-xs flex flex-col justify-between flex-grow'>
        {color?.name && 
          <div className='flex-grow flex flex-col justify-center'><span className='mb-2 font-bold text-gray-800'>{color.name}</span></div>
        }
        <div className='block'>
          {color?.hex && 
            <div><span className='text-gray-500'>{color.hex}</span></div>
          }
          {color?.rgb && 
            <div><span className='text-gray-500'>rgb({color.rgb})</span></div>
          }
        </div>
      </div>
    </div>
  )
}

export default ColorPicker