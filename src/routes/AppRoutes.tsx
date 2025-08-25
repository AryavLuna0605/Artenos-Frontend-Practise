import {Route, Routes} from 'react-router-dom';
import DashBoard from '../components/DashBoard';
import Form from '../components/Form';


const AppRoutes = () => {
  return (
    <Routes>
        <Route path='/' element={<Form/>}/>
        <Route path='/dashboard' element={<DashBoard/>} />
    </Routes>
  )
}

export default AppRoutes