import React, { useState } from 'react'
import { useAPICall } from '../hooks/apicall';
import api from '../service/api';

const DashBoard = () => {
    const [projectName, setProjectName] = useState("");
    const { loading, result, call } = useAPICall(api.createProject)

    async function handleSubmit(e: React.FormEvent){
        e.preventDefault();
        const response = await call({name: projectName})
        if(response.ok){
            alert("yay");
        }
        else{
            alert(response.error.message);
        }
    }

  return (
    <div className="flex items-center h-[100vh]">
        <form onSubmit={handleSubmit} className="max-w-170 flex flex-col gap-2 justify-center items-center mx-auto">
            <div className="w-100">
                <div className="flex flex-col " id='second-div'>
                    <label htmlFor="user-name">Project Name</label>
                    <input onChange={(e)=> setProjectName(e.target.value)} className="border p-1.5" type="text" id='user-email'/>
                </div>
            </div>
            <input className="border px-4 py-1 rounded" type="submit" value={loading?"Creating...":"Create"}/>
        </form>
    </div>
  )
}

export default DashBoard