import { createSignal, createEffect } from "solid-js";

function Operations() {
  let [routeMode, setRouteMode] = createSignal(pageContext.fn.route !== "");
  let routeButton = <button onClick={() => setRouteMode(true)}>Add Route</button>;
  let routeInput = (
    <input
      onBlur={() => {
        if (routeInput.value === "") {
          setRouteMode(false)
        }
        fetchPost('/function/edit', { id: pageContext.fn.id, route: routeInput.value })
      }}
      type='text' placeholder='Route' value={pageContext.fn.route} />
  );

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

  function saveApricotEditor() {
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
      <button onclick={saveApricotEditor}>Save</button>
    </>
  )
}

document.hotwire(Operations)
