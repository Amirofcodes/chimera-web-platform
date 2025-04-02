import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../components/shared/Button';
import { ThemeProvider } from '../../context/ThemeContext';

describe('Button Component', () => {
  test('renders button with text', () => {
    render(
      <ThemeProvider>
        <Button>Test Button</Button>
      </ThemeProvider>
    );
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(
      <ThemeProvider>
        <Button onClick={handleClick}>Click Me</Button>
      </ThemeProvider>
    );
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies the correct variant classes', () => {
    const { container } = render(
      <ThemeProvider>
        <Button variant="primary">Primary</Button>
      </ThemeProvider>
    );
    expect(container.firstChild).toHaveClass('bg-blue-600');
  });
});
