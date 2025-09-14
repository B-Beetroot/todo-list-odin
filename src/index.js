import "./styles/styles.css";
import { renderCreateProject, renderCreateTodo, loadHome, loadInbox, loadProjects } from "./modules/dom.js";

document.querySelector("#create-project").addEventListener("click", () => {
  renderCreateProject();
});

document.querySelector("#create-todo").addEventListener("click", () => {
  renderCreateTodo();
});

document.querySelector("#home").addEventListener("click", () => {
  loadHome();
});

document.querySelector("#inbox").addEventListener("click", () => {
  loadInbox();
});

document.querySelector("#projects").addEventListener("click", () => {
  loadProjects();
});

loadHome();