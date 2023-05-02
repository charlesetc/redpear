import { instantiateEditor } from "./editor";

function formPost(path: string, params: Map<string, any>) {
  const form = document.createElement('form');
  form.method = "POST"
  form.action = path;
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const hiddenField = document.createElement('input');
      hiddenField.type = 'hidden';
      hiddenField.name = key;
      hiddenField.value = params[key];
      form.appendChild(hiddenField);
    }
  }
  document.body.appendChild(form);
  form.submit();
}

async function fetchPost(path: string, params: Map<string, any>) {
  let response = await fetch(path, {
    method: "POST",
    body: JSON.stringify(params),
  });
  return response;
};


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
