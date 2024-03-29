import {
  keymap,
  highlightSpecialChars,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLineGutter,
  lineNumbers,
  EditorView,
  ViewPlugin
} from "@codemirror/view";
import { StreamLanguage } from "@codemirror/language";
import { ruby } from "@codemirror/legacy-modes/mode/ruby";
import { html } from "@codemirror/lang-html";
import { Extension, EditorState } from "@codemirror/state";
import {
  syntaxHighlighting,
  HighlightStyle,
  indentOnInput,
  bracketMatching,
  foldKeymap,
} from "@codemirror/language";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { highlightSelectionMatches } from "@codemirror/search";
import {
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap,
  acceptCompletion,
  autocompletion
} from "@codemirror/autocomplete";
import { lintKeymap } from "@codemirror/lint";
import { tags as t } from "@lezer/highlight";


let redpearTheme = EditorView.theme(
  {
    "&": {
      color: "black",
    },
    ".cm-content": {
      caretColor: "#333",
    },
    "&.cm-focused .cm-cursor": {
      borderLeftColor: "black",
    },
    "&.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "black",
      color: "white",
    },
  },
  { dark: false }
);

const black = "black",
  pink = "#ff306e",
  purple = "#673dc4",
  brown = "#6e4734",
  invalid = "red",
  grey = "#7d8799", // Brightened compared to original to increase contrast
  sage = "#98c379",
  coral = "#e06c75",
  whiskey = "#d19a66",
  ocean = "#2586a4";

export const redpearHighlighting = HighlightStyle.define([
  { tag: t.keyword, color: pink },
  {
    tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
    color: black,
  },
  { tag: [t.function(t.variableName), t.labelName], color: black },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: whiskey },
  { tag: [t.definition(t.name)], color: brown },
  { tag: [t.separator], color: sage },
  {
    tag: [
      t.typeName,
      t.className,
      t.number,
      t.changed,
      t.annotation,
      t.modifier,
      t.self,
      t.namespace,
    ],
    color: purple,
  },
  {
    tag: [
      t.operator,
      t.operatorKeyword,
      t.url,
      t.escape,
      t.regexp,
      t.link,
      // t.special(t.string),
    ],
    color: sage,
  },
  { tag: [t.meta, t.comment], color: grey },
  { tag: t.strong, fontWeight: "bold" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.strikethrough, textDecoration: "line-through" },
  { tag: t.link, color: grey, textDecoration: "underline" },
  { tag: t.heading, fontWeight: "bold", color: coral },
  {
    tag: [
      t.atom,
      t.bool,
      t.string,
      t.special(t.variableName),
      t.special(t.string),
    ],
    color: ocean,
  },
  {
    tag: [t.bool],
    color: purple,
  },
  { tag: [t.processingInstruction, t.inserted], color: sage },
  { tag: t.invalid, color: invalid },
]);

// let tableName = index.text.split(".")[0];
//   let tableNames = cards()
//     .filter(({ kind }) => kind === "table")
//     .map(({ name }) => name());
//   if (tableNames.includes(tableName)) {
//     return {
//       from: index.from + tableName.length + 1,
//       options: tableMethods.map((label) => {
//         return { label, detail: "(method)", type: "variable" };
//       }),
//     };
//   } else {
//     return null;
//   }

export function fancyCompletions(context) {
  let routeActions = pageContext.functions.filter((fn: any) => fn.route);

  let isAction = context.matchBefore(/action='?"?\w*/);
  if (isAction) {
    return {
      from: isAction.from + 'action='.length,
      options: routeActions.map((fn: any) => {
        return {
          label: `"${fn.route.pattern}"`,
          type: "variable",
        }
      })
    }
  }

  let isForm = context.matchBefore(/<?form?/);
  if (isForm) {
    return {
      from: isForm.from,
      options: routeActions.filter((fn) => fn.route.method === 'post').map((fn: any) => {
        return {
          label: `<form action="${fn.route.pattern}" method="${fn.route.method}">\n    \n</form>`,
          type: "text",
        }
      })
    }
  }

  let isButton = context.matchBefore(/<?butto?n?/);
  if (isButton) {
    return {
      from: isButton.from,
      options: [{
        label: `<button type="submit">Submit</button>`,
        type: "text",
      }],
    }
  }


  let isInput = context.matchBefore(/<?inpu?t?/);
  if (isInput) {
    return {
      from: isInput.from,
      options: [
        {
          label: `<input type="text" name="todo" />`,
          type: "text",
        },
      ],
    }
  }

  return null
}

export const functionSetup: Extension = [
  lineNumbers(),
  redpearTheme,
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  // foldGutter(),

  // // We shouldn't need this since we have autoformat
  // // though I suppose we could make it configurable
  EditorView.lineWrapping,

  // drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(redpearHighlighting, { fallback: true }),
  bracketMatching(),
  closeBrackets(),
  rectangularSelection(),
  crosshairCursor(),
  // highlightActiveLine(),
  // autoformatPlugin,
  highlightSelectionMatches(),
  autocompletion({ override: [fancyCompletions] }),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    // ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap,
    { key: "Tab", run: acceptCompletion },
  ]),
];

let previousName = null;

function parseName(view: any) {
  let str = view.state.doc.toString();
  let match = str.match(/def (\w*)/);
  if (match) {
    return match[1];
  } else {
    return null
  }
}

let saveOnBlur =
  ViewPlugin.fromClass(
    class {
      constructor() { }

      update(update) {
        let name = parseName(update);
        if (name) {
          dynamic.functionNameInput.setValue(name);
        }
      }
    },
    {
      eventHandlers: {
        blur: (e, view) => {
          dynamic.saveSource(view);
          window.getSelection()?.removeAllRanges();
        },
        focus: (e, view) => {
          previousName = parseName(view);
        },
      },
    }
  );

export function instantiateEditor(editor: Element, language: 'ruby' | 'html') {
  const source = editor.textContent!;
  editor.textContent = "";

  let languageExtension: Extension;
  if (language === 'ruby') {
    languageExtension = StreamLanguage.define(ruby);
  } else if (language === 'html') {
    languageExtension = html({ selfClosingTags: true }).extension
  } else {
    throw `language ${language} not supported`
  }
  let extensions = [
    functionSetup,
    saveOnBlur,
    languageExtension,
    keymap.of([indentWithTab])
  ];
  let view = new EditorView({
    state: EditorState.create({
      doc: source,
      extensions: extensions,
    }),
    parent: editor,
  });
  return view
}

// window.addEventListener('beforeunload', saveEditor)
