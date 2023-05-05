import React from 'react';
import wire from './wire'
import useSWR, { mutate } from 'swr';
import { fetcher } from './helpers';
import { fetchPost, formPost } from "../shared/helpers";


function maybeDeleteProject() {
  if (confirm("This will delete the entire project. Are you sure?")) {
    if (confirm("Really? All the functions will be deleted too. Last chance.")) {
      formPost('/project/delete', { id: pageContext.project.id });
    }
  }
}

function deployToProd() {
  fetchPost('/project/deploy', { id: pageContext.project.id })
}

function ProjectOps() {
  return (
    <>
      <>
        <button onClick={maybeDeleteProject}>Delete</button>
        <button onClick={() => window.nameInput.focus()}>Rename</button>
        <button onClick={deployToProd}>Deploy to Prod</button>
        <a href={`/project/${pageContext.project.id}/dev`} target='_blank'>
          <button>Dev<span className='icon'><img src="/icons/external-link.svg" /></span></button>
        </a >
        <a className='prod' href={`/project/${pageContext.project.id}/prod`} target='_blank'>
          <button>Prod<span className='icon'><img src="/icons/external-link.svg" /></span></button>
        </a>
      </>
    </>
  );
}

wire(ProjectOps)
