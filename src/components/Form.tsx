import { useState } from "react"
import { useAPICall } from "../hooks/apicall";
import api from "../service/api";
import { useNavigate } from "react-router-dom";


const Form = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { loading, call } = useAPICall(api.loginUser)
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const response = await call({ email, password })

    if (response.ok) {
      navigate('/dashboard')
    } else {
      alert(`Error: ${response.error.message}`)
    }
  }
  return (
    <div className="flex items-center h-[100vh]">
        <form className="max-w-170 flex flex-col gap-2 justify-center items-center mx-auto" onSubmit={handleSubmit}>
            <div className="w-100">
                <div className="flex flex-col " id='second-div'>
                    <label htmlFor="user-name">Email</label>
                    <input onChange={(e)=> setEmail(e.target.value)} className="border p-1.5" type="email" id='user-email'/>
                </div>
                <div className="flex flex-col " id='third-div'>
                    <label htmlFor="user-password">Password</label>
                    <input onChange={(e)=> setPassword(e.target.value)} className="border p-1.5" type="password" id='user-password'/>
                </div>
            </div>
            <input className="border px-4 py-1 rounded" type="submit" value={loading?"Logging":"Login"}/>
        </form>
    </div>
  )
}

export default Form