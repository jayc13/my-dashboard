import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './index.css';

const theme = createTheme({
  palette: {
    background: {
      default: '#e9e9e9',
      paper: '#ffffff',
    },
  },
  colorSchemes: {
    light: {
      palette: {
        background: {
          default: '#e9e9e9',
          paper: '#ffffff',
        },
      },
    },
    dark: {
      palette: {
        background: {
          default: '#3f3f3f',
          paper: '#1d1d1d',
        },
      },
    },
  },
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <ThemeProvider theme={theme} defaultMode="system" storageManager={null}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
