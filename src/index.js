import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId="919221796917-m8cva45pvbt4og9qe2kbu0bc71b2bbee.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);