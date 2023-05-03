import React from 'react';
import wire from './wire'
import useSWR from 'swr';
import { fetcher } from './helpers';


function ProjectList() {
  const { data, error, isLoading } = useSWR(`/api/project/list`, fetcher)
  const projects = data;

  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading projects...</div>

  return (
    <>
      <h4>Projects</h4>
      <ul className='project-index'>
        {projects.map((project) => (
          <li key={project.id}>
            <a href={`/project/${project.id}`}>{project.name}</a>
          </li>
        ))}
      </ul>
      <form method='post' action='/project/new'><button type='submit'
        disabled={
          projects.length >= 5
        }
      >New Project</button>
      </form>
      {projects.length >= 5 && <p>
        The maximum number of projects is 5. Please delete a project before creating a new one.
      </p>}
    </>
  );
}

wire(ProjectList)
