import { createNameInput } from "./name-input";


const [nameInput, measure] = createNameInput(pageContext.template.name, saveName)

function saveName() {
  const name = nameInput.value;
  if (name === '') {
    nameInput.value = pageContext.template.name;
  } else {
    fetchPost('/template/edit', { id: pageContext.template.id, name })
    pageContext.template.name = name;
  }
}

function TemplateName() {
  return <>
    {nameInput}
    {measure}
  </>;
}

function maybeDeleteTemplate() {
  if (confirm("This will delete the template. Are you sure?")) {
    formPost('/template/delete', { id: pageContext.template.id });
  }
}


function TemplateOperations() {
  return <>
    <button onclick={maybeDeleteTemplate}>Delete</button>
    <button onclick={() => nameInput.focus()}>Rename</button>
  </>
}

document.hotwire(TemplateName)
document.hotwire(TemplateOperations)
