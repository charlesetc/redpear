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

function prodButtons() {
  const [deploying, setDeploying] = React.useState(false)
  const DeployButton = <button onClick={() => {
    setDeploying(true);
    setTimeout(() => setDeploying(false), 700);
    deployToProd();
  }} disabled={deploying}>{deploying ? <>&nbsp;&nbsp;&nbsp;Deploying...&nbsp;&nbsp;</> : "Deploy to Prod"}</button>;
  const ProdButton =
    <a className='prod' href={`/project/${pageContext.project.id}/prod`} target='_blank'>
      <button disabled={deploying}>Prod<span className='icon'><img src="/icons/external-link.svg" /></span></button>
    </a>;

  return [DeployButton, ProdButton]
}

function ProjectOps() {
  const [DeployButton, ProdButton] = prodButtons();
  return (
    <>
      <>
        <button onClick={maybeDeleteProject}>Delete</button>
        <button onClick={() => window.nameInput.focus()}>Rename</button>
        {DeployButton}
        <a href={`/project/${pageContext.project.id}/dev`} target='_blank'>
          <button>Dev<span className='icon'><img src="/icons/external-link.svg" /></span></button>
        </a >
        {ProdButton}
      </>
    </>
  );
}

wire(ProjectOps)
