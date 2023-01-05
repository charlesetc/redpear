export function sethtml(parent, ...children) {
  parent.innerHTML = "";
  for (let child of children) {
    parent.appendChild(child);
  }
}

export function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
