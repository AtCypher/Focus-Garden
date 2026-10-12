import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('hydrates from storage, then renders the timer setup and main navigation', async () => {
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Plant a seed' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Plant' })).toBeInTheDocument();
  });
});
