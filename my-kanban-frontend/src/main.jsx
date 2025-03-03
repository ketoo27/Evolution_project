import React from 'react'; // Keep this import
import ReactDOM from 'react-dom'; // Import ReactDOM (without /client)
import './index.css';
import './app.css';
import App from './App.jsx';

ReactDOM.render( // Use ReactDOM.render instead of createRoot
  <React.StrictMode> {/* Wrap App in StrictMode for development mode */}
    <App />
  </React.StrictMode>,
  document.getElementById('root') // Target the 'root' element
);