import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Color Palettes heading', () => {
  render(<App />);
  const heading = screen.getByText(/Color Palettes/i);
  expect(heading).toBeInTheDocument();
  screen.debug();
});