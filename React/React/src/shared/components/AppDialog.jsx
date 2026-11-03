import "./AppDialog.css";
let queue = Promise.resolve();
function show(message, confirmation) {
  const request = () =>
    new Promise((resolve) => {
      const previous = document.activeElement;
      const dialog = document.createElement("dialog");
      dialog.className = "cn-app-dialog";
      const title = document.createElement("h2");
      title.textContent = confirmation ? "Confirm action" : "Information";
      const body = document.createElement("p");
      body.textContent = String(message);
      const actions = document.createElement("div");
      actions.className = "cn-dialog-actions";
      const finish = (value) => {
        dialog.close();
        dialog.remove();
        previous?.focus?.();
        resolve(value);
      };
      if (confirmation) {
        const cancel = document.createElement("button");
        cancel.textContent = "Cancel";
        cancel.onclick = () => finish(false);
        actions.append(cancel);
      }
      const ok = document.createElement("button");
      ok.className = "cn-dialog-primary";
      ok.textContent = confirmation ? "Confirm" : "OK";
      ok.onclick = () => finish(true);
      actions.append(ok);
      title.id = "cn-dialog-title";
      body.id = "cn-dialog-message";
      dialog.setAttribute("aria-labelledby", title.id);
      dialog.setAttribute("aria-describedby", body.id);
      dialog.append(title, body, actions);
      document.body.append(dialog);
      dialog.addEventListener("cancel", (e) => {
        e.preventDefault();
        finish(false);
      });
      dialog.showModal();
    });
  const result = queue.then(request);
  queue = result.then(() => undefined);
  return result;
}
export const infoDialog = (message) => show(message, false);
export const confirmDialog = (message) => show(message, true);
