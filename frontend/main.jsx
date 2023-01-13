import { createSignal, createEffect, onMount, on } from "solid-js";
import { sethtml, insertAfter, creativeName } from "./helpers.js";

let initialValue = {
  stack: {
    type: "vertical",
    contents: [
      { text: { content: "apple" } },
      { text: { content: "banana" } },
      {
        stack: {
          type: "horizontal",
          contents: [
            { text: { content: "pear" } },
            { text: { content: "orange" } },
            { button: { content: "submit" } },
          ],
        },
      },
    ],
  },
};

const [currentlySelected, setCurrentlySelected] = createSignal(null);

let lastSelected = null;
createEffect(
  on(currentlySelected, (currentlySelected) => {
    lastSelected?.classList?.remove("selected");
    currentlySelected?.classList?.add("selected");
    if (currentlySelected?.onSelected) currentlySelected.onSelected();
    lastSelected = currentlySelected;
  })
);

function box(div) {
  let [margin, setMargin] = createSignal(20);
  let [padding, setPadding] = createSignal(10);
  let [borderWidth, setBorderWidth] = createSignal(1);
  let [borderColor, setBorderColor] = createSignal("#ffdb29");
  let [backgroundColor, setBackgroundColor] = createSignal();
  let [borderRadius, setBorderRadius] = createSignal(4);

  createEffect(() => {
    div.style.margin = margin() + "px";
  });

  createEffect(() => {
    div.style.padding = padding() + "px";
  });

  createEffect(() => {
    div.style.border = `${borderWidth()}px solid ${borderColor()}`;
    if (borderWidth() > 3) {
      div.classList.remove("no-border");
      div.classList.add("big-border");
    } else if (borderWidth() <= 0) {
      div.classList.remove("big-border");
      div.classList.add("no-border");
    } else {
      div.classList.remove("no-border");
      div.classList.remove("big-border");
    }
  });

  createEffect(() => {
    div.style.borderRadius = borderRadius() + "px";
  });

  createEffect(() => {
    div.style.backgroundColor = backgroundColor();
  });

  div.margin = margin;
  div.setMargin = setMargin;
  div.padding = padding;
  div.setPadding = setPadding;
  div.borderWidth = borderWidth;
  div.setBorderWidth = setBorderWidth;
  div.borderColor = borderColor;
  div.setBorderColor = setBorderColor;
  div.backgroundColor = backgroundColor;
  div.setBackgroundColor = setBackgroundColor;
  div.borderRadius = borderRadius;
  div.setBorderRadius = setBorderRadius;
}

// function boxStyles(self) {
//   return {
//     margin: self.margin() + "px",
//     padding: self.padding() + "px",
//     border: `${self.borderWidth()}px solid ${self.borderColor()}`,
//     "border-radius": self.borderRadius() + "px",
//     "background-color": self.backgroundColor(),
//   };
// }

function Stack({ contents, type: initialType }) {
  let label = <div class="label">stack</div>;
  // TODO: use properties on `div` to set type
  const [type, setType] = createSignal(initialType);
  let childElements = [];
  for (let child of contents) {
    childElements.push(<Value {...child} />);
  }

  let div = (
    <div
      class="component stack"
      onClick={(e) => {
        if (e.target === div || e.target === label) {
          setCurrentlySelected(div);
        }
      }}
      // TODO: control styles
      // style={boxStyles(self)}
    >
      {label}
      {childElements}
    </div>
  );
  createEffect(() => {
    div.classList.toggle("vertical", type() === "vertical");
    div.classList.toggle("horizontal", type() !== "vertical");
  });
  div.setType = setType;
  div.type = type;
  div.name = "stack";
  box(div);
  return div;
}

function Chooser({ lastSelected }) {
  let div, input;
  function closeChooser() {
    setCurrentlySelected(lastSelected);
    div.remove();
  }
  let lines = [
    <div class="line">stack</div>,
    <div class="line">text</div>,
    <div class="line">button</div>,
  ];
  let linesContainer = <div class="lines">{lines}</div>;
  let filterLines = () =>
    lines.filter((line) => line.textContent.includes(input.value));
  input = (
    <input
      type="text"
      onBlur={closeChooser}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          closeChooser();
        } else if (e.key === "Backspace" && input.value === "") {
          e.preventDefault();
          closeChooser();
        } else if (e.key === "Enter") {
          e.preventDefault();
          let results = filterLines();
          if (results.length > 0) {
            let choice = results[0];
            if (choice.textContent === "stack") {
              let stack = <Stack type="vertical" contents={[]} />;
              insertAfter(div, stack);
              div.remove();
              setCurrentlySelected(stack);
            } else if (choice.textContent === "text") {
              let text = <Text content="" />;
              insertAfter(div, text);
              div.remove();
              setCurrentlySelected(text);
            } else if (choice.textContent === "button") {
              let button = <Button content="submit" />;
              insertAfter(div, button);
              div.remove();
              setCurrentlySelected(button);
            }
          }
        }
      }}
      onKeyUp={(e) => {
        // filter lines in chooser based on input
        let value = e.target.value;
        let results = filterLines();
        if (results.length === 0) {
          sethtml(linesContainer, <div>no results</div>);
        } else {
          sethtml(linesContainer, ...results);
        }
      }}
    />
  );

  div = (
    <div class="chooser">
      {input}
      {linesContainer}
    </div>
  );

  setCurrentlySelected(null);
  setTimeout(() => input.focus(), 10);
  return div;
}

let controlPressed = false;
function slashOpensChooser(e, div, input) {
  console.log("wow", e, div, input);
  if (e.key === "Control") {
    controlPressed = true;
  } else if (e.key === "\\" && !controlPressed) {
    e.preventDefault();
    console.log("here", div);
    insertAfter(div, <Chooser lastSelected={div} />);
  } else if (e.key === "\\" && controlPressed) {
    let start = input.selectionStart;
    let end = input.selectionEnd;
    let value = input.value;
    input.value = value.slice(0, start) + "\\" + value.slice(end);
    input.selectionStart = input.selectionEnd = start + 1;
  }
}

function Text({ content: initialContent }) {
  let div, input;

  function resizeToTextHeight() {
    // input.focus();
    input.style.height = 0;
    input.style.height = input.scrollHeight + "px";
    // TODO: this doesn't quite work.
    // input.style.width =
    //   input.parentNode.scrollWidth - (div.padding || (() => 0))() * 2 + "px";
  }

  input = (
    <textarea
      onFocus={() => setCurrentlySelected(div)}
      onKeyDown={(e) => slashOpensChooser(e, div, input)}
      onKeyUp={(e) => {
        if (e.key === "Control") {
          controlPressed = false;
        }
      }}
      onInput={resizeToTextHeight}
    >
      {initialContent}
    </textarea>
  );

  div = (
    <div
      class="component text"
      onClick={() => {
        setCurrentlySelected(div);
        if (input !== document.activeElement) {
          input.focus();
          input.selectionStart = input.selectionEnd = input.value.length;
        }
      }}
      // style={boxStyles(self)}
    >
      {input}
    </div>
  );
  div.name = "text";
  // wait for it to mount...
  setTimeout(() => resizeToTextHeight(), 4);
  box(div);
  div.onSelected = () => {
    input.focus();
    resizeToTextHeight();
  };
  div.input = input;
  return div;
}

function Button({ content: initialContent }) {
  let div, button, input;
  let [content, setContent] = createSignal(initialContent);
  function editingMode() {
    sethtml(div, input);
    input.focus();
    input.select();
    resizeToTextWidth();
  }
  function onFocus() {
    if (currentlySelected() !== div) {
      setCurrentlySelected(div);
      editingMode();
    }
  }
  button = <button onFocus={onFocus}>{content()}</button>;

  function resizeToTextWidth() {
    input.style.width = 0;
    // TODO: this doesn't quite work.
    input.style.width = input.scrollWidth - 20 + "px";
  }

  input = (
    <input
      value={content()}
      onBlur={(e) => sethtml(div, button)}
      onKeyDown={(e) => slashOpensChooser(e, div, input)}
      onInput={(e) => {
        setContent(e.target.value);
        resizeToTextWidth();
      }}
    />
  );

  createEffect(() => {
    button.textContent = content();
  });
  div = (
    <div
      class="component button"
      onClick={onFocus}
      // style={boxStyles(self)}
    >
      {button}
    </div>
  );
  div.name = "button";
  box(div);
  div.onSelected = () => {
    editingMode();
  };
  return div;
}

function Value(value) {
  if (value.stack) {
    return <Stack {...value.stack} />;
  } else if (value.text) {
    return <Text {...value.text} />;
  } else if (value.button) {
    return <Button {...value.button} />;
  } else {
    throw "no such element type";
  }
}

function BoxProperties() {
  return (
    <>
      <label>
        margin
        <input
          type="number"
          value={currentlySelected()?.margin()}
          onInput={(e) =>
            currentlySelected()?.setMargin(parseInt(e.target.value))
          }
        />
      </label>
      <label>
        padding
        <input
          type="number"
          value={currentlySelected()?.padding()}
          onInput={(e) =>
            currentlySelected()?.setPadding(parseInt(e.target.value))
          }
        />
      </label>
      <label>
        border width
        <input
          type="number"
          value={currentlySelected()?.borderWidth()}
          onInput={(e) =>
            currentlySelected()?.setBorderWidth(parseInt(e.target.value))
          }
        />
      </label>
      <label>
        border color
        <input
          type="color"
          value={currentlySelected()?.borderColor()}
          onInput={(e) => currentlySelected()?.setBorderColor(e.target.value)}
        />
      </label>
      <label>
        border radius
        <input
          type="number"
          onLoad={(e) => {
            e.target.value = currentlySelected()?.borderRadius();
          }}
          value={currentlySelected()?.borderRadius()}
          onInput={(e) =>
            currentlySelected()?.setBorderRadius(parseInt(e.target.value))
          }
        />
      </label>
      <label>
        background color
        <input
          type="color"
          value={currentlySelected()?.backgroundColor()}
          onInput={(e) =>
            currentlySelected()?.setBackgroundColor(e.target.value)
          }
        />
      </label>
    </>
  );
}

function Var({ name }) {
  let initialValue = "";
  let input, textarea;
  function resizeToTextHeight() {
    textarea.style.height = 0 + "px";
    textarea.style.height = textarea.scrollHeight - 20 + "px";
  }
  function resizeToTextWidth() {
    input.style.width = 0 + "px";
    input.style.width = Math.max(input.scrollWidth, 20) + "px";
  }
  textarea = <textarea onInput={resizeToTextHeight}>{initialValue}</textarea>;
  // wait for it to mount...

  input = (
    <input
      value={name}
      onInput={(e) => {
        resizeToTextWidth();
      }}
    />
  );
  let div = (
    <div class="var">
      let {input} = {textarea}
    </div>
  );

  setTimeout(() => {
    resizeToTextHeight();
    resizeToTextWidth();
  }, 4);
  return div;
}

function LocalVars() {
  let vars = <div class="vars"></div>;
  function newVar() {
    vars.appendChild(<Var name={creativeName()} />);
  }
  return (
    <>
      <p>
        Local vars{" "}
        <button onClick={newVar} class="new-var">
          + new
        </button>
      </p>
      {vars}
    </>
  );
}

function Properties({ currentlySelected }) {
  if (currentlySelected === null) {
    return <></>;
  } else if (currentlySelected.name === "stack") {
    let select = (
      <select
        onInput={(e) => {
          currentlySelected.setType(e.target.value);
        }}
      >
        <option value="vertical">vertical</option>
        <option value="horizontal">horizontal</option>
      </select>
    );
    onMount(() => {
      select.value = currentlySelected.type();
    });
    return (
      <>
        <h2>stack</h2>
        <label>
          type
          {select}
        </label>
        <BoxProperties />
      </>
    );
  } else if (currentlySelected.name === "text") {
    return (
      <>
        <h2>text</h2>
        <BoxProperties />
      </>
    );
  } else if (currentlySelected.name === "button") {
    return (
      <>
        <h2>button</h2>
        <BoxProperties />
      </>
    );
  } else {
    debugger;
    throw "not a valid name";
  }
}

export default function Apricot() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setCurrentlySelected(null);
  });

  // let properties = <div class="properties"></div>;
  // createEffect(
  //   on(currentlySelected, (currentlySelected) => {
  //     sethtml(properties, <Properties currentlySelected={currentlySelected} />);
  //   })
  // );

  let hovered = null;
  function setHovered(target) {
    if (target.classList.contains("component") && target !== hovered) {
      // TODO: Maybe do this with a timeout for the toplevel component or for lists?
      hovered?.classList.remove("hovered");
      target.classList.add("hovered");
      hovered = target;
    }
  }

  let value = <Value {...initialValue} />;
  setCurrentlySelected(value);

  return (
    <>
      <main onMouseMove={(e) => setHovered(e.target)}>
        <h1 class="title">Apricot</h1>
        {/* <p>
          Global vars <button class="new-var">+ new</button>
        </p>
        <div class="vars"></div>
        <p>
          User vars &nbsp;&nbsp;<button class="new-var">+ new</button>
        </p> */}
        <div class="vars"></div>
        <LocalVars />
        <br />
        <p>Page</p>
        <div class="toplevel">{value}</div>
      </main>
      <p style="display: none">hi</p>
      {/* {properties} */}
    </>
  );
}

window.onload = () => {
  document.getElementById("root").appendChild(<Apricot />);
};

document.addEventListener("keydown", (e) => {
  console.log(e.key);
  if (e.key === "\\") {
    e.preventDefault();
    currentlySelected()?.appendChild(
      <Chooser lastSelected={currentlySelected()} />
    );
  }
});
