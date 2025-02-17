import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { SplitView } from './views/SplitView';

function App() {
  return (
    <Router>
      <SplitView />
    </Router>
  );
}

export default App