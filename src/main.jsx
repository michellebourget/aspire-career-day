import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import RoutesWithAuth from './RoutesWithAuth'; // You can move the code you had into this new file
import './index.css'; // if you have global styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <RoutesWithAuth />
    </BrowserRouter>
  </React.StrictMode>
);
