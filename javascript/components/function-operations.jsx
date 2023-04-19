import { createNameInput } from "./name-input";


const [nameInput, measure] = createNameInput(pageContext.function.name, saveName)

function saveName() {
  const name = nameInput.value;
  if (name === '') {
    nameInput.value = pageContext.function.name;
  } else {
    fetchPost('/function/edit', { id: pageContext.function.id, name })
    pageContext.function.name = name;
  }
}

function FunctionName() {
  return <>
    {nameInput}
    {measure}
  </>;
}

function maybeDeleteFunction() {
  if (confirm("This will delete the function. Are you sure?")) {
    formPost('/function/delete', { id: pageContext.function.id });
  }
}


function FunctionOperations() {
  return <>
    <button onclick={maybeDeleteFunction}>Delete</button>
    <button onclick={() => nameInput.focus()}>Rename</button>
  </>
}

document.hotwire(FunctionName)
document.hotwire(FunctionOperations)
