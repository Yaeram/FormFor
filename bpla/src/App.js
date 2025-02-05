import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import { Main } from './pages/Page_Main/Main';
import New_Form from './pages/New_Form/New_Form';
import SavedForm from './pages/Saved_Form/Saved_Form';
import FormTemplate from './pages/Form_Template/Form_Template';
import Form from './pages/Form/Form';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main></Main>}/>
          <Route path="/new_form" element={<New_Form></New_Form>}/>
          <Route path ="/Saved_Form" element={<SavedForm></SavedForm>}></Route>
          <Route path ="/Form_Template" element={<FormTemplate></FormTemplate>}></Route>
          <Route path ="/Form/:templateId" element={<Form></Form>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
