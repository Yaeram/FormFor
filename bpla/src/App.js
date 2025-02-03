import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import { Main } from './pages/Page_Main/Main';
import New_Form from './pages/New_Form/New_Form';
import SavedForm from './pages/Saved_Form/Saved_Form';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/new_form" element={<New_Form></New_Form>}/>
          <Route path="/" element={<Main></Main>}/>
          <Route path ="/Saved_Form" element={<SavedForm></SavedForm>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
