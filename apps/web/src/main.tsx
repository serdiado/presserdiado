import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { ThemeInjector, applyTokensToDOM } from './components/ThemeInjector';
import { useThemeStore } from './stores/theme.store';
import './index.css';

// Apply tokens synchronously before first render to avoid flash
applyTokensToDOM(useThemeStore.getState().tokens);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeInjector />
      <App />
      <Toaster position="top-right" />
    </BrowserRouter>
  </React.StrictMode>,
);
