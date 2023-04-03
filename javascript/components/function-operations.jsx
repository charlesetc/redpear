

function editFunction(route) {
  fetchPost('/function/edit', { route, id: pageContext.fn.id })
}

function RouteEditor({ setRouteMode }) {
  const input = (
    <input
      onBlur={(e) => {
        if (e.relatedTarget !== closeButton) {
          editFunction({ pattern: input.value, method: method.value })
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.target.blur()
        }
      }}
      type='text' placeholder='Route' value={pageContext.fn.route ? pageContext.fn.route.pattern : "/"} />
  )
  const closeButton = (
    <button class='close-button' onClick={() => {
      setRouteMode(false);
      editFunction(null)
    }}>x</button>
  );
  const method = (
    <select onChange={() => editFunction({ pattern: input.value, method: method.value })}>
      <option value='get'>GET</option>
      <option value='post'>POST</option>
    </select>
  )
  for (const option of method.children) {
    if (option.value === pageContext.fn.method) {
      option.selected = true;
    }
  }
  let self = (
    <div class='route-editor'>
      {closeButton}
      {method}
      {input}
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

function FunctionOperations() {
  let [routeMode, setRouteMode] = createSignal(pageContext.fn.route !== null);
  let routeEditor = <RouteEditor setRouteMode={setRouteMode} />

  let addRoute = <button onClick={() => {
    setRouteMode(true);
    editFunction({ pattern: routeEditor.value(), method: routeEditor.method() })
  }}>Add Route</button>;


  createEffect(() => {
    if (routeMode()) {
      routeEditor.style.display = 'inline'
      addRoute.style.display = 'none'
      routeEditor.focus()
    } else {
      routeEditor.style.display = 'none'
      addRoute.style.display = 'inline'
    }
  })

  function maybeDeleteFunction() {
    if (confirm("This will delete this function. Are you sure?")) {
      formPost('/function/delete', { id: pageContext.fn.id });
    }
  }


  return (
    <>
      {addRoute}
      {routeEditor}
      <button onclick={maybeDeleteFunction}>Delete</button>
    </>
  )
}

document.hotwire(FunctionOperations)
