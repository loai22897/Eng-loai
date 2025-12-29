import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // هذا السطر هو الذي يضبط المقاسات

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);