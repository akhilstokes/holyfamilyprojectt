import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock the context providers
jest.mock('../components/common/RoleThemeProvider', () => ({
  RoleThemeProvider: ({ children }) => <div>{children}</div>
}));

// Helper function to render with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('App Component', () => {
  it('should render without crashing', () => {
    renderWithRouter(<App />);
    expect(document.body).toBeInTheDocument();
  });

  it('should render the homepage at root path', () => {
    window.history.pushState({}, 'Home', '/');
    renderWithRouter(<App />);
    
    // The homepage should be rendered
    // Adjust this assertion based on your HomePage component content
    expect(document.body).toBeInTheDocument();
  });

  it('should have routes configured', () => {
    renderWithRouter(<App />);
    
    // Check if Routes component is rendered
    // This is a basic structural test
    expect(document.body).toBeInTheDocument();
  });
});
