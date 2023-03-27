import { instantiateEditor } from "./editor";

function formPost(path: string, params: Map<string, any>) {
  const form = document.createElement('form');
  // form.method = method;
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

document.hotwire = (component: () => Element) => {
  document.addEventListener('DOMContentLoaded', () => {
    let elements = document.getElementsByTagName(component.name.toLowerCase());
    for (const element of elements) {
      element.appendChild(component())
    }
  })
}
