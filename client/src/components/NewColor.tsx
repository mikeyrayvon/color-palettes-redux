import React from 'react'
import { useDispatch } from 'react-redux'

interface Props {
  paletteId: string
}

const NewColor: React.FC<Props> = ({paletteId}) => {
  const dispatch = useDispatch()

  const handleClick = () => {
    dispatch({type: 'ADD_COLOR', payload: paletteId})
  }

  return (
    <div className='pb-12 h-[190px]'>
      <button className='m-4 w-24 h-24 rounded-full bg-gray-200 text-3xl font-bold text-gray-500 flex justify-center items-center shadow-xl' onClick={handleClick}>+</button>
    </div>
  )
}

export default NewColor