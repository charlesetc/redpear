import { createNameInput } from "./name-input";


const [nameInput, measure] = createNameInput(pageContext.function.name, saveName, { onInput: onNameInput })

dynamic.functionNameInput = nameInput;

function onNameInput() {
  const editor = document.getElementById('editor');
  let str = editor.view.state.doc.toString();
  let match = str.match(/def (\w*)/);
  if (match) {
    const from = match.index + 4; // for def
    const to = match.index + 4 + match[1].length;

    editor.view.dispatch({
      changes: {
        from,
        to,
        insert: nameInput.value
      }
    });
  }
}

function saveName() {
  const name = nameInput.value;
  if (name === '') {
    nameInput.value = pageContext.function.name;
  } else {
    const editor = document.getElementById('editor');
    fetchPost('/function/edit', { id: pageContext.function.id, name, source: editor.view.state.doc.toString() })
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
    <a href={`/project/${pageContext.project.id}/prod`} target='_blank'>
      <button>Prod<span class='icon'><img src="/icons/external-link.svg" /></span></button>
    </a>
  </>
}

document.hotwire(FunctionName)
document.hotwire(FunctionOperations)
