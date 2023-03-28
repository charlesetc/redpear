import { createSignal, createEffect } from "solid-js";


function RouteInput({ setRouteMode }) {
  const self = (
    <input
      onBlur={() => {
        if (self.value === "") {
          setRouteMode(false)
        }
        fetchPost('/function/edit', { id: pageContext.fn.id, route: self.value })
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.target.blur()
        }
      }}
      type='text' placeholder='Route' value={pageContext.fn.route} />
  )
  return self
}

function FunctionOperations() {
  let [routeMode, setRouteMode] = createSignal(pageContext.fn.route !== "");
  let routeButton = <button onClick={() => setRouteMode(true)}>Add Route</button>;
  let routeInput = <RouteInput setRouteMode={setRouteMode} />

  createEffect(() => {
    if (routeMode()) {
      routeInput.style.display = 'inline'
      routeButton.style.display = 'none'
      routeInput.focus()
    } else {
      routeInput.style.display = 'none'
      routeButton.style.display = 'inline'
    }
  })

  function saveEditor() {
    const editor = document.getElementById('editor');
    formPost('/function/edit', {
      source: editor.view.state.doc,
      route: routeInput.value,
      id: pageContext.fn.id,
    })
  }

  function maybeDeleteFunction() {
    if (confirm("This will delete this function. Are you sure")) {
      formPost('/function/delete', { id: pageContext.fn.id });
    }
  }


  return (
    <>
      {routeButton}
      {routeInput}
      <button onclick={maybeDeleteFunction}>Delete</button>
      <button onclick={saveEditor}>Save</button>
    </>
  )
}

document.hotwire(FunctionOperations)
