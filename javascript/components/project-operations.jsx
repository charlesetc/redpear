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

function maybeDeleteFunction() {
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
      <button onclick={maybeDeleteFunction}>Delete</button>
      <button onclick={() => nameInput.focus()}>Rename</button>
    </>
  )
}

document.hotwire(ProjectName)
document.hotwire(ProjectOperations)
