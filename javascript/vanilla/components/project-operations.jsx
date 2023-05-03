import { createSignal, createEffect } from "solid-js";
import { createNameInput } from "./name-input";

const [nameInput, measure] = createNameInput(pageContext.project.name, saveName, { allowSpaces: true })

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
    {measure}
  </>;
}

function deployToProd() {
  fetchPost('/project/deploy', { id: pageContext.project.id })
}

function ProjectOperations() {
  return (
    <>
      <button onclick={maybeDeleteProject}>Delete</button>
      <button onclick={() => nameInput.focus()}>Rename</button>
      <button onclick={deployToProd}>Deploy to Prod</button>
      <a href={`/project/${pageContext.project.id}/dev`} target='_blank'>
        <button>Dev<span class='icon'><img src="/icons/external-link.svg" /></span></button>
      </a >
      <a class='prod' href={`/project/${pageContext.project.id}/prod`} target='_blank'>
        <button>Prod<span class='icon'><img src="/icons/external-link.svg" /></span></button>
      </a>
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
      <td><a href={`/function/${fn.id}`}>{fn.name}</a>
        <button class='delete-button' onclick={() => maybeDelete('function', fn)}>x</button>
      </td>
      <td>
        {routeEditor}
        {addRouteButton}
      </td>
    </tr>
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
    </>
  )
}


function TemplateRow(template) {
  return (
    <tr>
      <td><a href={`/template/${template.id}`}>{template.name}</a>
        <button class='delete-button' onclick={() => maybeDelete('template', template)}>x</button>
      </td>
      <td>
        mustache
      </td>
    </tr>
  )
}

function TemplatesTable() {
  let rows = pageContext.templates.map(TemplateRow);
  return (
    <>
      <table>
        <tr>
          <th>name</th>
          <th>type</th>
        </tr>
        {rows}
      </table>
    </>
  )
}


function maybeDelete(thing, { id }) {
  if (confirm(`This will delete this ${thing}. Are you sure`)) {
    formPost(`/${thing}/delete `, { id });
  }
}

document.hotwire(ProjectName)
document.hotwire(ProjectOperations)
document.hotwire(FunctionsTable)
document.hotwire(TemplatesTable)
