import { FaEdit, FaTrash } from 'react-icons/fa';
import { useAPICall } from '../hooks/apicall';
import api from '../service/api';
import toast from 'react-hot-toast';
import type { ProjectType } from './DashBoard';
import type React from 'react';
type ProjectProps = {
    currProject: {
        id: string,
        name: string,
        created_by: string,
    };
    projects: {
        id: string,
        name: string,
        created_by: string,
    }[];
    setProjects: React.Dispatch<React.SetStateAction<ProjectType[]>>;
}
const Project:React.FC<ProjectProps> = ({currProject, projects, setProjects}) => {


    const { loading, result, call } = useAPICall(api.deleteProject)

    async function handleDelete(){
        console.log(currProject);
        const id = currProject.id;
        const response = await call({id})
        if(response.ok){
            const updatedProjects = projects.filter((curr)=>{
                return curr.id !== id
            })
            setProjects(updatedProjects);
            toast.success("Project Deleted Successfully");
            console.log(response);
        } else{
            toast.error(response.error.message);
        }
        
    }
  return (
    <div className='flex justify-between items-center border w-100 p-4'>
        <div>
            {currProject.name}
        </div>
        <div className='flex gap-4'>
            <FaEdit className='cursor-pointer'/>
            <FaTrash onClick={handleDelete} className='cursor-pointer'/>
        </div>

    </div>
  )
}

export default Project