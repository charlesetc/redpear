import { createSignal, createEffect, onMount, on } from "solid-js";
import { sethtml, insertAfter } from "./helpers.js";

let initialValue = {
  stack: {
    type: "vertical",
    children: [
      { text: { content: "apple" } },
      { text: { content: "banana" } },
      {
        stack: {
          type: "horizontal",
          children: [
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

function box(div) {
  let [margin, setMargin] = createSignal(10);
  let [padding, setPadding] = createSignal(10);
  let [borderWidth, setBorderWidth] = createSignal(0);
  let [borderColor, setBorderColor] = createSignal("#666");
  let [backgroundColor, setBackgroundColor] = createSignal("#e4f7d5");
  let [borderRadius, setBorderRadius] = createSignal(4);

  createEffect(() => {
    div.style.margin = margin() + "px";
  });

  createEffect(() => {
    div.style.padding = padding() + "px";
  });

  createEffect(() => {
    div.style.border = `${borderWidth()}px solid ${borderColor()}`;
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

function Stack({ children, type: initialType }) {
  let label = <div class="label">stack</div>;
  // TODO: use properties on `div` to set type
  const [type, setType] = createSignal(initialType);
  let childElements = [];
  for (let child of children) {
    childElements.push(Value(child));
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
  createEffect(() =>
    div.classList.toggle("selected", div === currentlySelected())
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

function Chooser({ lastInput }) {
  let div;
  function closeChooser() {
    div.remove();
    lastInput.focus();
  }
  let input = <input type="text" onBlur={closeChooser} />;
  let lines = [<div class="line">line 1</div>, <div class="line">line 2</div>];
  div = <div class="chooser">{input}</div>;
  setTimeout(() => input.focus(), 10);
  return div;
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
      onKeyDown={(e) => {
        if (e.key === "Control") {
          controlPressed = true;
        } else if (e.key === "\\" && !controlPressed) {
          e.preventDefault();
          insertAfter(div, <Chooser lastInput={input} />);
        } else if (e.key === "\\" && controlPressed) {
          let start = input.selectionStart;
          let end = input.selectionEnd;
          let value = input.value;
          input.value = value.slice(0, start) + "\\" + value.slice(end);
          input.selectionStart = input.selectionEnd = start + 1;
        }
      }}
      onKeyUp={(e) => {
        if (e.key === "Control") {
          controlPressed = false;
        }
      }}
      onInput={(e) => {
        resizeToTextHeight();
      }}
    >
      {initialContent}
    </textarea>
  );

  let controlPressed = false;
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
  createEffect(() => {
    div.classList.toggle("selected", div === currentlySelected());
  });
  div.name = "text";
  // wait for it to mount...
  setTimeout(() => resizeToTextHeight(), 4);
  box(div);
  return div;
}

function Button({ content: initialContent }) {
  let div, button, input;
  let [content, setContent] = createSignal(initialContent);
  function onFocus() {
    if (currentlySelected() !== div) {
      setCurrentlySelected(div);
      sethtml(div, input);
      input.focus();
      input.select();
      resizeToTextWidth();
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
  createEffect(() =>
    div.classList.toggle("selected", div === currentlySelected())
  );
  div.name = "button";
  box(div);
  return div;
}

function Value(value) {
  if (value.stack) {
    return Stack(value.stack);
  } else if (value.text) {
    return Text(value.text);
  } else if (value.button) {
    return Button(value.button);
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
  document.addEventListener("keyup", (e) => {
    if (e.key === "Escape") setCurrentlySelected(null);
  });

  let properties = <div class="properties"></div>;
  createEffect(
    on(currentlySelected, (currentlySelected) => {
      sethtml(properties, <Properties currentlySelected={currentlySelected} />);
    })
  );

  return (
    <>
      <main>
        <h1 class="title">Apricot</h1>
        <div class="toplevel">
          <Value {...initialValue} />
        </div>
      </main>
      {properties}
    </>
  );
}

window.onload = () => {
  document.getElementById("root").appendChild(<Apricot />);
};
