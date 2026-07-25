import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { ThemeInjector, applyTokensToDOM } from './components/ThemeInjector';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useThemeStore } from './stores/theme.store';
import './index.css';

// Apply tokens synchronously before first render to avoid flash
applyTokensToDOM(useThemeStore.getState().tokens);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeInjector />
        <App />
        {/* zIndex modal'ların (z-99999) üstünde olmalı, yoksa toast modal arkasında kalır. */}
        <Toaster position="top-right" containerStyle={{ zIndex: 100001 }} />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
