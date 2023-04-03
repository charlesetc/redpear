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
// import { autocompletion } from "@codemirror/autocomplete";
import { StreamLanguage } from "@codemirror/language"
import { ruby } from "@codemirror/legacy-modes/mode/ruby"
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
} from "@codemirror/autocomplete";
import { lintKeymap } from "@codemirror/lint";
import { tags as t } from "@lezer/highlight";


let birchTheme = EditorView.theme(
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

export const birchHighlighting = HighlightStyle.define([
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
    color: black,
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

export const functionSetup: Extension = [
  lineNumbers(),
  birchTheme,
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
  syntaxHighlighting(birchHighlighting, { fallback: true }),
  bracketMatching(),
  closeBrackets(),
  rectangularSelection(),
  crosshairCursor(),
  // highlightActiveLine(),
  // autoformatPlugin,
  highlightSelectionMatches(),
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


let saveOnBlur =
  ViewPlugin.fromClass(
    class {
      constructor(_) { }

      update() { }
    },
    {
      eventHandlers: {
        blur: (e, view) => {
          fetchPost('/function/edit', {
            source: view.state.doc.toString(),
            id: pageContext.fn.id,
          })
        },
      },
    }
  );

export function instantiateEditor(editor: Element) {
  const source = editor.textContent!;
  editor.textContent = "";
  let extensions = [
    functionSetup,
    saveOnBlur,
    StreamLanguage.define(ruby),
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


async function saveEditor() {
  const editor = document.getElementById('editor')!;
  await fetchPost('/function/edit', {
    source: editor.view.state.doc.toString(),
    id: pageContext.fn.id,
  })
  // debugger
}

window.saveEditor = saveEditor

window.addEventListener('beforeunload', saveEditor)
