import { createSignal, createEffect, on as solidOn } from "solid-js";

let doneButton = <button style='display:none'>Done</button>

function createNameInput() {
  const measure = <pre class='measure'></pre>

  function resizeToWidth() {
    measure.textContent = self.value;
    self.style.width = measure.offsetWidth + 4 + 'px'
  }

  const self =
    <input
      onBlur={() => {
        saveName();
        doneButton.style.display = 'none';
      }}
      onFocus={() => {
        resizeToWidth()
        doneButton.style.display = 'inline';
        self.select()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          self.blur()
          e.preventDefault()
          e.stopPropagation()
        }
      }}
      onInput={resizeToWidth}
      type='text'
      value={pageContext.project.name}
    />;
  return [self, measure]

}

const [nameInput, measure] = createNameInput()

function saveName() {
  const name = nameInput.value;
  if (name === '') {
    nameInput.value = pageContext.project.name;
  } else {
    fetchPost('/project/edit', { id: pageContext.project.id, name })
    pageContext.project.name = name;
  }
}

function maybeDeleteProject() {
  if (confirm("This will delete the entire project. Are you sure?")) {
    if (confirm("Really? All the functions will be deleted too. Last chance.")) {
      formPost('/project/delete', { id: pageContext.project.id });
    }
  }
}


function ProjectName() {
  return <>
    {nameInput}
    {doneButton}
    {measure}
  </>;
}

function ProjectOperations() {
  return (
    <>
      <button onclick={maybeDeleteProject}>Delete</button>
      <button onclick={() => nameInput.focus()}>Rename</button>
      <button>Project URL</button>
      <button>Deploy</button>
    </>
  )
}


function editFunction(fn, route) {
  fetchPost('/function/edit', { route, id: fn.id })
}

function RouteEditor({ setRouteMode, fn }) {

  const input = (
    <input
      onBlur={(e) => {
        if (e.relatedTarget !== closeButton) {
          editFunction(fn, { pattern: input.value, method: method.value })
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.target.blur()
        }
      }}
      type='text' placeholder='Route' value={fn.route ? fn.route.pattern : "/"} />
  )
  const closeButton = (
    <button class='close-button' onClick={() => {
      setRouteMode(false);
      editFunction(fn, null)
    }}>x</button>
  );
  const method = (
    <select onChange={() => editFunction(fn, { pattern: input.value, method: method.value })}>
      <option value='get'>GET</option>
      <option value='post'>POST</option>
    </select>
  )
  for (const option of method.children) {
    if (option.value === fn.route?.method) {
      option.selected = true;
    }
  }
  let self = (
    <div class='route-editor'>
      {method}
      {input}
      {closeButton}
    </div>
  )
  self.value = () => input.value
  self.focus = () => {
    input.focus();
    // move cursor to the end
    const value = input.value;
    input.value = '';
    input.value = value;
  }
  self.method = () => method.value
  return self
}


function FunctionRow(fn) {
  let [routeMode, setRouteMode] = createSignal(fn.route !== null);
  let routeEditor = <RouteEditor setRouteMode={setRouteMode} fn={fn} />
  let addRouteButton = (
    <button class='add-route'
      onClick={() => {
        setRouteMode(true);
        editFunction(fn, { pattern: routeEditor.value(), method: routeEditor.method() });
      }}>Add route</button>
  );

  // TODO: Simplify this effect
  createEffect(() => {
    if (routeMode()) {
      routeEditor.style.display = 'inline'
      addRouteButton.style.display = 'none'
      routeEditor.focus()
    } else {
      routeEditor.style.display = 'none'
      addRouteButton.style.display = 'inline'
    }
  })

  return (
    <tr>
      <td class='function-name' onClick={() => formPost('/function/open', { id: fn.id })}>
        <a>{fn.name}</a>
        <button class='delete-fn' onclick={() => maybeDeleteFunction(fn)}>x</button>
      </td>
      <td>
        {routeEditor}
        {addRouteButton}
      </td>
    </tr >
  )
}

function FunctionsTable() {
  let rows = pageContext.functions.map(FunctionRow);
  return (
    <>
      <table>
        <tr>
          <th>name</th>
          <th>route</th>
        </tr>
        {rows}
      </table>

      <form method='post' action='/function/new'>
        <input type="hidden" value={pageContext.project.id} name="project_id" />
        <button type='submit'>New</button>
      </form>
    </>
  )
}


function maybeDeleteFunction({ id }) {
  if (confirm("This will delete this function. Are you sure")) {
    formPost('/function/delete', { id });
  }
}

document.hotwire(ProjectName)
document.hotwire(ProjectOperations)
document.hotwire(FunctionsTable)
