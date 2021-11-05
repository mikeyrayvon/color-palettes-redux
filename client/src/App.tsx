import React, { useState } from 'react';
import Layout from './components/Layout';
import { useAppContext } from './utils/store';
import { Color, Palette } from './utils/types'
import ColorPalette from './components/ColorPalette';
import NewPalette from './components/NewPalette';

const App = () => {
  const { 
    palettes,
    colors,
    handleDroppedColor,
    loading
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
  );
}

export default App;
