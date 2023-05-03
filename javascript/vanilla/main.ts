import { instantiateEditor } from "./editor";
import { fetchPost, formPost } from "../shared/helpers";

window.formPost = formPost
window.fetchPost = fetchPost
window.instantiateEditor = instantiateEditor

function camelToKebab(str: string) {
  return str[0].toLowerCase() + str.slice(1, str.length).replace(/[A-Z]/g, (letter: string) => `-${letter.toLowerCase()}`);
}

document.hotwire = (component: () => Element) => {
  document.addEventListener('DOMContentLoaded', () => {
    let elements = document.getElementsByTagName(camelToKebab(component.name));
    for (const element of elements) {
      element.appendChild(component())
    }
  })
}
