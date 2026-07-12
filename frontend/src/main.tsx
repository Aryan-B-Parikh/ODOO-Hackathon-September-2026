/**
 * AssetFlow ERP
 *
 * Layer:
 * Presentation
 *
 * Responsibility:
 * Root Application Bootstrap
 *
 * Architectural Rules:
 * - No business logic.
 * - No direct HTTP implementation.
 * - No feature-specific state.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import './styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
