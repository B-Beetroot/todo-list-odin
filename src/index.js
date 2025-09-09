import "./styles/styles.css";
import * as domHelper from "./modules/dom-helper.js";
import { loadHome, loadInbox, loadProjects, loadNotes } from "./modules/dom.js";

document.querySelector("#home").addEventListener("click", () => {
  domHelper.clearContent();
  domHelper.clearPageHeader();
  loadHome();
});

document.querySelector("#inbox").addEventListener("click", () => {
  domHelper.clearContent();
  domHelper.clearPageHeader();
  loadInbox();
});

document.querySelector("#projects").addEventListener("click", () => {
  domHelper.clearContent();
  domHelper.clearPageHeader();
  loadProjects();
});

document.querySelector("#notes").addEventListener("click", () => {
  domHelper.clearContent();
  domHelper.clearPageHeader();
  loadNotes();
});

loadHome();