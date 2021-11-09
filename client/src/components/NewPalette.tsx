import React from 'react'
import { useAppContext } from '../utils/context'

const NewPalette: React.FC = () => {
  const { 
    addPalette
  } = useAppContext()

  return (
    <div className='pt-8'>
      <button className='py-1 px-2 rounded-lg bg-gray-400 hover:bg-gray-600 text-white' onClick={addPalette}>Add Palette</button>
    </div>
  )
}

export default NewPalette