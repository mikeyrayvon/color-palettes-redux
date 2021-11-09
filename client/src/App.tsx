import React, { useState } from 'react'
import Layout from './components/Layout'
import { useAppContext } from './utils/context'
import { Color, Palette } from './utils/types'
import ColorPalette from './components/ColorPalette'
import NewPalette from './components/NewPalette'
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from './utils/reducers'

const App = () => {
  const palettes = useSelector<AppState, AppState['palettes']>(state => state.palettes)
  const loading = useSelector<AppState, AppState['loading']>(state => state.loading)
  const dispatch = useDispatch()

  const [dragId, setDragId] = useState<null | string>(null)
  
  const handleDrag = (e: React.DragEvent) => {
    setDragId(e.currentTarget.id)
  }

  const handleDrop = (e: React.DragEvent) => {
    const dropId = e.currentTarget.id
    dispatch({type: 'REORDER_COLORS', payload: {dragId, dropId}})
  }

  return (
    <div className='App'>
      <Layout>
        <div className='max-w-[900px] mx-auto py-20 px-8'>
          <h1 className='text-3xl font-bold mb-12'>Color Palettes</h1>
          {loading ? (
            <div>Mixing colors...</div>
          ) : (
            <div>
              {
                palettes.sort((a: Palette, b: Palette) => {
                  if (a && b && a.id && b.id) {
                    return new Date(parseInt(a.id)).getTime() - new Date(parseInt(b.id)).getTime()
                  }
                  return 0
                })
                  .map((p: Palette, i) => {
                    return (
                      <ColorPalette 
                        key={p.id} 
                        palette={p} 
                        handleDrag={handleDrag}
                        handleDrop={handleDrop}
                      />
                    )
                  })
              }
              <NewPalette />
            </div>
          )}
        </div>
      </Layout>
    </div>
  )
}

export default App
