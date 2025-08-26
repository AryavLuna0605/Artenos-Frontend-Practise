import { FaEdit, FaSave, FaTrash } from 'react-icons/fa';
import { useAPICall } from '../hooks/apicall';
import api from '../service/api';
import toast from 'react-hot-toast';
import type { ProjectType } from './DashBoard';
import React, { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

type ProjectProps = {
  currProject: ProjectType;
  projects: ProjectType[];
  setProjects: React.Dispatch<React.SetStateAction<ProjectType[]>>;
};

const Project: React.FC<ProjectProps> = ({ currProject, projects, setProjects }) => {
  const { loading, result, call } = useAPICall(api.deleteProject);
  const { call: updateProjectName } = useAPICall(api.updateProjectName);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currInputName, setCurrentInputName] = useState<string>(currProject.name);

  const inputRef = useRef<HTMLInputElement>(null);

  async function handleDelete(): Promise<void> {
    const id = currProject.id;
    const response = await call({ id });
    if (response.ok) {
      const updatedProjects = projects.filter((curr) => curr.id !== id);
      setProjects(updatedProjects);
      toast.success('Project Deleted Successfully');
    } else {
      toast.error(response.error.message);
    }
  }

  async function handleEdit(): Promise<void> {
    setIsEditing((prev) => !prev);
  }

  async function handleSave(): Promise<void> {
    setIsEditing(false);
    const response = await updateProjectName({ name: currInputName, id: currProject.id });

    if (response.ok) {
      currProject.name = response.value.body.name;
      toast.success('Project name updated successfully');
    } else {
      toast.error(response.error.message);
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>): void {
    setCurrentInputName(e.target.value);
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div className='flex justify-between items-center border w-100 p-4'>
      <div>
        {!isEditing ? (
          currProject.name
        ) : (
          <input
            ref={inputRef}
            type='text'
            value={currInputName}
            onChange={handleChange}
            className='border p-1'
          />
        )}
      </div>
      <div className='flex gap-4'>
        <FaEdit onClick={handleEdit} className='cursor-pointer' />
        {isEditing && <FaSave onClick={handleSave} className='cursor-pointer' />}
        <FaTrash onClick={handleDelete} className='cursor-pointer' />
      </div>
    </div>
  );
};

export default Project;
