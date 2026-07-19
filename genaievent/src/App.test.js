import { render, screen } from '@testing-library/react';
import Input from './components/Input';
import { BrowserRouter as Router } from 'react-router';

jest.mock('react-google-recaptcha-v3', () => ({
  useGoogleReCaptcha: () => ({
    executeRecaptcha: jest.fn().mockResolvedValue('fake-token'),
  }),
  GoogleReCaptchaProvider: ({ children }) => <div>{children}</div>,
}));

jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return {
    ...actual,
    useNavigate: () => jest.fn(),
    useLocation: () => ({ pathname: '/' }),
  };
});

test('renders Input component and verifies ECE branch option exists', () => {
  render(
    <Router>
      <Input handleevent={() => {}} />
    </Router>
  );
  
  // Verify that the branch select element has ECE option
  const selectElement = screen.getByLabelText(/Branch/i);
  expect(selectElement).toBeInTheDocument();
  
  const options = screen.getAllByRole('option');
  const optionValues = options.map(opt => opt.value);
  expect(optionValues).toContain('ECE');
});
