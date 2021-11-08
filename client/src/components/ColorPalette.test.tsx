import React from 'react';
import { render, screen } from '@testing-library/react';
import ColorPalette from './ColorPalette';
import { AppContextProvider } from '../utils/store';

const componentWithProps = () => {
  return (
    <ColorPalette 
    palette={{
      id: '123',
      title: 'Title',
      description: '',
      colors: ['456']
    }} 
    handleDrag={() => {}}
    handleDrop={() => {}}
    />
  )
}

test('renders palette title', () => {
  render(componentWithProps());
  const titleInput = screen.getByDisplayValue('Title')
  expect(titleInput).toBeInTheDocument();
  screen.debug();
});