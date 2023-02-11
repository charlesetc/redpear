export function sethtml(parent, ...children) {
  parent.innerHTML = "";
  for (let child of children) {
    parent.appendChild(child);
  }
}

export function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

let words = [
  "air",
  "ash",
  "bay",
  "bee",
  "birch",
  "bird",
  "blue",
  "branch",
  "breeze",
  "brook",
  "bud",
  "cat",
  "clay",
  "cliff",
  "cloud",
  "clove",
  "coast",
  "crest",
  "dawn",
  "day",
  "doe",
  "dove",
  "dusk",
  "dust",
  "earth",
  "elm",
  "fawn",
  "fern",
  "fig",
  "finch",
  "fir",
  "fjord",
  "flax",
  "flint",
  "fox",
  "frost",
  "gale",
  "gem",
  "glow",
  "gold",
  "grain",
  "grey",
  "grove",
  "hawk",
  "hue",
  "ice",
  "ink",
  "jade",
  "koi",
  "lake",
  "lark",
  "leaf",
  "light",
  "lime",
  "loch",
  "lynx",
  "mars",
  "marsh",
  "may",
  "mist",
  "moon",
  "moss",
  "night",
  "north",
  "oak",
  "oat",
  "onyx",
  "ox",
  "peach",
  "pearl",
  "pine",
  "pink",
  "plum",
  "pond",
  "quartz",
  "quince",
  "rain",
  "ray",
  "rock",
  "rush",
  "rye",
  "sage",
  "sand",
  "sea",
  "shade",
  "shell",
  "silk",
  "sky",
  "snow",
  "spring",
  "spruce",
  "star",
  "stone",
  "storm",
  "teal",
  "tree",
  "vale",
  "vine",
  "wave",
  "wild",
  "wood",
];

export function creativeName() {
  let word = words[Math.floor(Math.random() * words.length)];
  let number = Math.floor(Math.random() * 10);
  return word + number;
}

export function inputCursorAtBeginning(input) {
  return input.selectionStart === 0 && input.selectionEnd === 0;
}

export function contentEditableCursorAtBeginning(div) {
  const selection = document.getSelection();
  console.log("selection", selection);
  return (
    selection.isCollapsed &&
    ((div.firstChild && div.firstChild.contains(selection.anchorNode)) ||
      div.firstChild === selection.anchorNode ||
      div === selection.anchorNode) &&
    selection.anchorOffset === 0
  );
}

export function insertTextAtCaret(text) {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  range.deleteContents();
  range.insertNode(document.createTextNode(text));
  selection.collapseToEnd();
}
