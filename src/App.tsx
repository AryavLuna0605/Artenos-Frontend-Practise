import { BrowserRouter } from "react-router-dom"
import { Toaster } from 'react-hot-toast';
import AppRoutes from "./routes/AppRoutes"

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <AppRoutes/>
        <Toaster/>
      </BrowserRouter>
    </div>
  )
}

export default App