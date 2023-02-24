import { createSignal, createEffect, onMount, on } from "solid-js";
import {
  sethtml,
  insertAfter,
  creativeName,
  inputCursorAtBeginning,
  contentEditableCursorAtBeginning,
  insertTextAtCaret,
} from "./helpers.js";

import * as compiler from "./compiler.js";

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
const [historyUp, setHistoryUp] = createSignal(false);

let lastSelected = null;
createEffect(
  on(currentlySelected, (currentlySelected) => {
    lastSelected?.classList?.remove("selected");
    currentlySelected?.classList?.add("selected");
    if (currentlySelected?.onSelected) currentlySelected.onSelected();
    lastSelected = currentlySelected;
    if (currentlySelected) setHistoryUp(false);
  })
);

function removeWidget(div) {
  if (div.previousSibling) {
    setCurrentlySelected(div.previousSibling);
  } else {
    if (div.parentNode.classList.contains("component")) {
      setCurrentlySelected(div.parentNode);
    } else {
      return;
    }
  }
  div.remove();
}

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
  // TODO: use properties on `div` to set type
  const [type, setType] = createSignal(initialType);
  let childElements = [];
  for (let child of contents) {
    childElements.push(<Value {...child} />);
  }

  let div = (
    <div
      class="component stack"
      tabIndex="0"
      onFocus={() => setCurrentlySelected(div)}
      onClick={(e) => {
        if (e.target === div) {
          setCurrentlySelected(div);
        }
      }}
      // TODO: control styles
      // style={boxStyles(self)}
    >
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
  div.backspacePressed = (e) => {
    removeWidget(div);
    e.preventDefault();
  };
  div.ondblclick = (e) => {
    if (e.target === div) {
      let chooser = Chooser({ lastSelected: div });
      div.appendChild(chooser);
    }
  };
  box(div);
  return div;
}

function Chooser({ lastSelected }) {
  let div, input;
  function closeChooser() {
    setCurrentlySelected(lastSelected);
    try {
      div.remove();
    } catch (e) {
      console.log("error removing chooser", e);
    }
  }

  function insertStack() {
    let stack = <Stack type="vertical" contents={[]} />;
    insertAfter(div, stack);
    try {
      div.remove();
    } catch (e) {
      console.log("error removing chooser", e);
    }
    window.getSelection().removeAllRanges();
    setCurrentlySelected(stack);
  }

  function insertText() {
    let text = <Text content="" />;
    insertAfter(div, text);
    try {
      div.remove();
    } catch (e) {
      console.log("error removing chooser", e);
    }
    window.getSelection().removeAllRanges();
    setCurrentlySelected(text);
  }

  function insertButton() {
    console.log("trying to insert a button!");
    let button = <Button content="submit" />;
    insertAfter(div, button);
    try {
      div.remove();
    } catch (e) {
      console.log("error removing chooser", e);
    }
    window.getSelection().removeAllRanges();
    setCurrentlySelected(button);
  }

  let lines = [
    <div
      class="line"
      onMouseDown={(e) => {
        insertStack();
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      stack
    </div>,
    <div
      class="line"
      onMouseDown={(e) => {
        insertText();
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      text
    </div>,
    <div
      class="line"
      onMouseDown={(e) => {
        insertButton();
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      button
    </div>,
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
          closeChooser();
          e.preventDefault();
        } else if (e.key === "Backspace" && input.value === "") {
          closeChooser();
          e.preventDefault();
          e.stopPropagation();
        } else if (e.key === "Enter") {
          e.preventDefault();
          let results = filterLines();
          if (results.length > 0) {
            let choice = results[0];
            if (choice.textContent === "stack") {
              insertStack();
            } else if (choice.textContent === "text") {
              insertText();
            } else if (choice.textContent === "button") {
              insertButton();
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
  if (e.key === "\\" && !controlPressed) {
    e.preventDefault();
    insertAfter(div, <Chooser lastSelected={div} />);
  } else if (e.key === "\\" && controlPressed) {
    let start = input.selectionStart;
    let end = input.selectionEnd;
    let value = input.value;
    input.value = value.slice(0, start) + "\\" + value.slice(end);
    input.selectionStart = input.selectionEnd = start + 1;
  }
}

function slashOpensChooserContentEditable(e, div) {
  if (e.key === "\\" && !controlPressed) {
    e.preventDefault();
    e.stopPropagation();
    console.log("here now");
    insertAfter(div, <Chooser lastSelected={div} />);
  } else if (e.key === "\\" && controlPressed) {
    insertTextAtCaret("\\");
    e.preventDefault();
    e.stopPropagation();
  }
}

function doubleClickOpensChooser(div) {
  div.ondblclick = (e) => {
    console.log("doubleclick");
    insertAfter(div, <Chooser lastSelected={div} />);
  };
}

function Text({ content: initialContent }) {
  let div;

  div = (
    <div
      class="component text"
      contentEditable="true"
      onClick={(e) => setCurrentlySelected(div)}
      onFocus={() => setCurrentlySelected(div)}
      onKeyDown={(e) => {
        if (e.key === "Backspace" && contentEditableCursorAtBeginning(div)) {
          removeWidget(div);
          e.preventDefault(e);
          e.stopPropagation();
        } else if (e.key === "Enter" && !e.customDispatch) {
          const newEvent = new KeyboardEvent("keydown", { key: "Enter" });
          newEvent.customDispatch = true;
          div.dispatchEvent(newEvent);
          // all the above just to run this code after the event:
          // nothing yet, delete above if still around later
        } else {
          if (window.getSelection().type !== "None")
            slashOpensChooserContentEditable(e, div);
        }
      }}
      // style={boxStyles(self)}
    >
      {initialContent}
    </div>
  );
  div.name = "text";

  box(div);
  doubleClickOpensChooser(div);
  div.onSelected = () => {
    const selection = window.getSelection();
    if (!div.contains(selection.anchorNode) && div !== selection.anchorNode) {
      console.log("doing the range thing!!");
      const range = document.createRange();
      let endIndex = div.lastChild ? div.lastChild.length : 0;
      let endNode = div.lastChild || div;
      range.setStart(endNode, endIndex);
      range.setEnd(endNode, endIndex);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };
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
    input.style.width = input.scrollWidth - 20 + "px";
  }

  input = (
    <input
      value={content()}
      onBlur={(e) => sethtml(div, button)}
      onKeyDown={(e) => {
        if (e.key === "Backspace" && inputCursorAtBeginning(input)) {
          removeWidget(div);
          e.preventDefault(e);
          e.stopPropagation();
        } else {
          if (window.getSelection().type !== "None")
            slashOpensChooser(e, div, input);
        }
      }}
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
  doubleClickOpensChooser(div);
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
    throw "not a valid name";
  }
}

function HistoryItem({ input, output }) {
  return (
    <div class="history-item">
      <div class="input">{input}</div>

      <div class="output">{output}</div>
    </div>
  );
}

function Repl() {
  let historyValues = [];
  let history = <div class="history"></div>;

  // createEffect(
  //   on(historyUp, (historyUp) => {
  //     if (historyUp) {
  //       history.style.display = "block";
  //     } else {
  //       history.style.display = "none";
  //     }
  //   })
  // );

  let historyIndex = 0;
  let input = (
    <input
      class="repl-input"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          historyIndex = 0;
          let input = e.target.value;
          let output = compiler.parse(input);
          if (output.success) {
            const ast = output.success;
            output = compiler.evaluate_and_save(ast);
            console.info("🐷 success:", output);
          } else {
            console.error("🙈 errors:", output);
          }
          historyValues.push({ input, output });
          history.appendChild(<HistoryItem input={input} output={output} />);
          history.scrollBy(0, 10000);
          e.target.value = "";
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          if (historyIndex < historyValues.length) {
            historyIndex += 1;
            e.target.value = historyValues.at(-historyIndex).input;
          }
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          if (historyIndex > 1) {
            historyIndex -= 1;
            e.target.value = historyValues.at(-historyIndex).input;
          } else if (historyIndex <= 1) {
            historyIndex = 0;
            e.target.value = "";
          }
        } else if (e.key === "Escape") {
          input.blur();
          setHistoryUp(false);
        } else if (e.key === "l" && e.ctrlKey) {
          history.innerHTML = "";
          historyIndex = 0;
        }
      }}
      onFocus={(e) => {
        setHistoryUp(true);
      }}
    />
  );
  return (
    <div class="repl">
      {history}
      <span class="input-strawberry">🍓</span> {input}
    </div>
  );
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
        {/* <div class="vars"></div> */}
        {/* <LocalVars /> */}
        <br />
        <p>Page</p>
        <div class="toplevel">{value}</div>
        <Repl />
      </main>
      {/* {properties} */}
    </>
  );
}

window.onload = () => {
  document.getElementById("root").appendChild(<Apricot />);
};

document.addEventListener("keydown", (e) => {
  if (e.key === "Control") {
    controlPressed = true;
  } else if (
    e.key === "h" &&
    e.ctrlKey &&
    currentlySelected()?.parentNode.classList.contains("component")
  ) {
    let type = currentlySelected().parentNode.type();
    let newType = type === "horizontal" ? "vertical" : "horizontal";
    console.log(type, newType);
    currentlySelected().parentNode.setType(newType);
    e.preventDefault();
  } else if (currentlySelected()?.name === "stack") {
    if (e.key === "\\") {
      e.preventDefault();

      currentlySelected().appendChild(
        <Chooser lastSelected={currentlySelected()} />
      );
    } else if (e.key === "Backspace") {
      if (currentlySelected() && currentlySelected().backspacePressed)
        currentlySelected().backspacePressed(e);
    }
  } else if (e.key === "Escape") {
    setCurrentlySelected(null);
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "Control") {
    controlPressed = false;
  }
});

document.addEventListener("click", (e) => {
  let toplevelValues = document.getElementsByClassName("toplevel");
  let inAToplevel = Array.from(toplevelValues).some((value) =>
    value.contains(e.target)
  );
  if (!inAToplevel) {
    setCurrentlySelected(null);
  }

  let repl = document.getElementsByClassName("repl")[0];
  let inRepl = repl.contains(e.target);
  // if (!inRepl) {
  // setHistoryUp(false);
  // }
});
