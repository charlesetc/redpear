import React from 'react';
import wire from './wire'
import useSWR, { mutate } from 'swr';
import { fetcher } from './helpers';
import { fetchPost } from '../shared/helpers';

function ProjectList() {
  const { data, error, isLoading } = useSWR(`/api/project/list`, fetcher)
  const projects = data;
  const [secondPassed, setSecondPassed] = React.useState(false);
  setTimeout(() => setSecondPassed(true), 1000);

  if (error) return <div>failed to load</div>
  if (isLoading) return <div>{secondPassed ? "loading..." : ""}</div>

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
      <form method='post' onSubmit={async (e) => {
        e.preventDefault()
        await fetchPost(`/project/new`)
        mutate(`/api/project/list`)
      }}><button type='submit'
        disabled={
          projects.length >= 5
        }
      >New Project</button>
      </form >
      {
        projects.length >= 5 && <p>
          The maximum number of projects is 5. Please delete a project before creating a new one.
        </p>
      }
    </>
  );
}

wire(ProjectList)
