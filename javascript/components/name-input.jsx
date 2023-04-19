
export function createNameInput(initialValue, saveName) {
  const measure = <pre class='measure'></pre>
  const doneButton = <button style='display:none'>Done</button>;

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
      value={initialValue}
    />;
  return [self, <>{doneButton}{measure}</>]

}
