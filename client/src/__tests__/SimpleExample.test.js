/**
 * Simple Frontend Testing Examples
 * 
 * This file demonstrates basic frontend testing patterns
 * that work out of the box with your React app.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple component for testing
const SimpleButton = ({ onClick, children }) => (
  <button onClick={onClick}>{children}</button>
);

const SimpleInput = ({ label, value, onChange }) => (
  <div>
    <label htmlFor="test-input">{label}</label>
    <input 
      id="test-input"
      type="text" 
      value={value} 
      onChange={onChange}
    />
  </div>
);

describe('Simple Frontend Testing Examples', () => {
  describe('Basic Rendering', () => {
    it('should render a button', () => {
      render(<SimpleButton>Click Me</SimpleButton>);
      
      const button = screen.getByText('Click Me');
      expect(button).toBeInTheDocument();
    });

    it('should render an input with label', () => {
      render(<SimpleInput label="Username" value="" onChange={() => {}} />);
      
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Component Properties', () => {
    it('should have correct attributes', () => {
      render(<SimpleButton>Submit</SimpleButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Submit');
      expect(button.tagName).toBe('BUTTON');
    });

    it('should display input value', () => {
      render(<SimpleInput label="Email" value="test@example.com" onChange={() => {}} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('test@example.com');
    });
  });

  describe('Text Content Assertions', () => {
    it('should match exact text', () => {
      render(<div>Hello World</div>);
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('should match text with regex', () => {
      render(<div>Hello World</div>);
      expect(screen.getByText(/hello/i)).toBeInTheDocument();
    });

    it('should match partial text', () => {
      render(<div>The quick brown fox</div>);
      expect(screen.getByText(/quick/)).toBeInTheDocument();
    });
  });

  describe('Element Existence', () => {
    it('should find element that exists', () => {
      render(<div>Exists</div>);
      expect(screen.getByText('Exists')).toBeInTheDocument();
    });

    it('should not find element that does not exist', () => {
      render(<div>Something</div>);
      expect(screen.queryByText('Not There')).not.toBeInTheDocument();
    });
  });

  describe('Query Methods', () => {
    it('getBy - throws error if not found', () => {
      render(<div>Content</div>);
      expect(() => screen.getByText('Missing')).toThrow();
    });

    it('queryBy - returns null if not found', () => {
      render(<div>Content</div>);
      expect(screen.queryByText('Missing')).toBeNull();
    });

    it('getAllBy - finds multiple elements', () => {
      render(
        <div>
          <button>Button 1</button>
          <button>Button 2</button>
          <button>Button 3</button>
        </div>
      );
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });
  });

  describe('Class and Attribute Testing', () => {
    it('should have specific class', () => {
      render(<div className="test-class">Test</div>);
      expect(screen.getByText('Test')).toHaveClass('test-class');
    });

    it('should have specific attribute', () => {
      render(<a href="/home">Home</a>);
      expect(screen.getByText('Home')).toHaveAttribute('href', '/home');
    });

    it('should match attribute value', () => {
      render(<input type="email" placeholder="Email" />);
      const input = screen.getByPlaceholderText('Email');
      expect(input).toHaveAttribute('type', 'email');
    });
  });

  describe('Visibility Testing', () => {
    it('should be visible', () => {
      render(<div>Visible Content</div>);
      expect(screen.getByText('Visible Content')).toBeVisible();
    });

    it('should not be visible when hidden', () => {
      render(<div style={{ display: 'none' }}>Hidden</div>);
      const element = screen.getByText('Hidden');
      expect(element).not.toBeVisible();
    });
  });

  describe('List Testing', () => {
    it('should render list items', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];
      
      render(
        <ul>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
      
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('should count list items', () => {
      render(
        <ul>
          <li>One</li>
          <li>Two</li>
          <li>Three</li>
        </ul>
      );
      
      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(3);
    });
  });

  describe('Conditional Rendering', () => {
    const ConditionalComponent = ({ show }) => (
      <div>
        {show && <p>Conditional Content</p>}
        <p>Always Visible</p>
      </div>
    );

    it('should show content when condition is true', () => {
      render(<ConditionalComponent show={true} />);
      expect(screen.getByText('Conditional Content')).toBeInTheDocument();
    });

    it('should hide content when condition is false', () => {
      render(<ConditionalComponent show={false} />);
      expect(screen.queryByText('Conditional Content')).not.toBeInTheDocument();
      expect(screen.getByText('Always Visible')).toBeInTheDocument();
    });
  });
});

// Export for demonstration purposes
export { SimpleButton, SimpleInput };
