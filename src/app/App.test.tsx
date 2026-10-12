import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('renders the timer setup and main navigation', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Plant a seed' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Plant' })).toBeInTheDocument();
  });
});
