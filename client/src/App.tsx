import React from 'react';
import Layout from './components/Layout';
import { useAppContext } from './utils/store';
import { Palette } from './utils/types'
import ColorPalette from './components/ColorPalette';
import NewPalette from './components/NewPalette';

const App = () => {
  const { 
    palettes
  } = useAppContext()

  return (
    <div className='App'>
      <Layout>
        <div className='container mx-auto py-20'>
          <h1 className='text-3xl font-bold mb-12'>Color Palettes</h1>
          <div>
            {palettes && palettes.length > 0 &&
              palettes.sort((a: Palette, b: Palette) => {
                if (a && b && a.id && b.id) {
                  return new Date(parseInt(a.id)).getTime() - new Date(parseInt(b.id)).getTime()
                }
                return 0
              })
                .map((p: Palette) => {
                  return (
                    <ColorPalette key={p.id} palette={p} />
                  )
                })
            }
            <NewPalette />
          </div>
        </div>
      </Layout>
    </div>
  );
}

export default App;
