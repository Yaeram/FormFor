import './App.css';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { Main } from './pages/Page_Main/Main';
import New_Form from './pages/New_Form/New_Form';
import SavedForm from './pages/Saved_Form/Saved_Form';
import Form_Template from './pages/Form/Form_Template/Form_Template';
import Form from './pages/Form/Form';
import View_Form from './pages/Saved_Form/View_Form/View_Form';

function App() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('http://localhost:8000/ping');
        if (response.ok) {
          setIsOnline(true);
          localStorage.setItem('connected', 'true');
        } else {
          throw new Error('Server not OK');
        }
      } catch (error) {
        setIsOnline(false);
        localStorage.setItem('connected', 'false');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/new_form" element={<New_Form />} />
          <Route path="/Saved_Form" element={<SavedForm />} />
          <Route path="/Form_Template" element={<Form_Template />} />
          <Route path="/Form/:templateId" element={<Form />} />
          <Route path="/view/:formId" element={<View_Form />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
