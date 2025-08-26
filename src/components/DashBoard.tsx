import React, { use, useEffect, useState } from 'react'
import { useAPICall } from '../hooks/apicall';
import api from '../service/api';
import { toast } from 'react-hot-toast';
import Project from './Project';


export type ProjectType = {
    id: string,
    name: string,
    created_by: string,
}
const DashBoard = () => {

    const [projectName, setProjectName] = useState<string>("");
    const [projects, setProjects] = useState<ProjectType[]>([]);
    const { loading, call } = useAPICall(api.createProject)
    const {call:getProjectsCall} = useAPICall(api.getProjects);

    async function handleSubmit(e: React.FormEvent){
        e.preventDefault();
        const response = await call({name: projectName})
        console.log(response);
        
        if(response.ok){
            setProjects((prev)=>[...prev, ...response.value.body.projectDetails])
            toast.success("Project created successfully");
        }
        else{
            toast.error(response.error.message);
        }
    }

    useEffect(()=>{
        const fetchProjects = async ()=>{
            const response = await getProjectsCall({})
            
            if(response.ok){
                setProjects(response.value.body.projects);
                toast.success("All projects fetched successfully")
            }
        }
        fetchProjects();
    },[])
    console.log(projects);
    
  return (
    <div className="flex flex-col gap-2 items-start mt-10 h-[100vh]">
        <form onSubmit={handleSubmit} className="max-w-170 flex flex-col gap-2 items-start mx-auto">
            <div className="w-100">
                <div className="flex flex-col " id='second-div'>
                    <label htmlFor="user-name">Project Name</label>
                    <input onChange={(e)=> setProjectName(e.target.value)} className="border p-1.5" type="text" id='user-email'/>
                </div>
            </div>
            <input className="border px-4 py-1 rounded" type="submit" value={loading?"Creating...":"Create"}/>
        </form>
        <div className='flex flex-col w-full items-center'>
            {
                projects.map((currProject)=>{
                    return <Project setProjects = {setProjects} currProject={currProject} projects={projects}/>
                })
            }
        </div>
    </div>
  )
}

export default DashBoard