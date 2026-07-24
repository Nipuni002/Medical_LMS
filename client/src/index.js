import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Intercept localStorage to isolate Admin session from User session on the same origin
(function() {
  const originalGetItem = localStorage.getItem;
  const originalSetItem = localStorage.setItem;
  const originalRemoveItem = localStorage.removeItem;

  const isAdminRoute = () => 
    window.location.pathname === '/admin' || 
    window.location.pathname.startsWith('/admin/');

  localStorage.getItem = function(key) {
    if (isAdminRoute() && (key === 'token' || key === 'user')) {
      return originalGetItem.call(localStorage, 'admin_' + key);
    }
    return originalGetItem.call(localStorage, key);
  };

  localStorage.setItem = function(key, value) {
    if (isAdminRoute() && (key === 'token' || key === 'user')) {
      return originalSetItem.call(localStorage, 'admin_' + key, value);
    }
    return originalSetItem.call(localStorage, key, value);
  };

  localStorage.removeItem = function(key) {
    if (isAdminRoute() && (key === 'token' || key === 'user')) {
      return originalRemoveItem.call(localStorage, 'admin_' + key);
    }
    return originalRemoveItem.call(localStorage, key);
  };
})();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
