export function formPost(path: string, params: Map<string, any>) {
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

export async function fetchPost(path: string, params = {}) {
  let response = await fetch(path, {
    method: "POST",
    body: JSON.stringify(params),
  });
  return response;
};
