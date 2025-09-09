import { saveAllProjects, saveProject, currentProjects, Project } from './projects.js'; 
import * as domHelper from "./dom-helper.js";
import { loadHome, loadInbox, loadProjects, loadNotes } from "./dom.js";

export function projectSubmit (projectInput, descInput){
    const name = projectInput.value.trim();
    const description = descInput.value.trim();
    
    if (!name) return projectInput.reportValidity();
    if (!description) return descInput.reportValidity();

    const newProject = new Project({ name, description });

    saveProject(newProject);

    domHelper.clearContent();
    domHelper.clearPageHeader();
    loadProjects();
}

export function getProjectById(projectId) {
  const allProjects = currentProjects(); 
  return allProjects.find(project => project.id === projectId);
}



export function projectUpdate(projectId, projectInput, descInput) {
  const name = projectInput.value.trim();
  const description = descInput.value.trim();

  if (!name) return projectInput.reportValidity();
  if (!description) return descInput.reportValidity();

  const allProjects = currentProjects();
  const index = allProjects.findIndex(project => project.id === projectId);

  if (index === -1) {
    console.error("Project not found");
    return;
  }

  allProjects[index].name = name;
  allProjects[index].description = description;

  saveAllProjects(allProjects); 

  domHelper.clearContent();
  domHelper.clearPageHeader();
  loadProjects(); 
}


export function deleteProject(projectId) {
  const allProjects = currentProjects();
  const updatedProjects = allProjects.filter(project => project.id !== projectId);
  saveAllProjects(updatedProjects); 

  domHelper.clearContent();
  domHelper.clearPageHeader();
  loadProjects(); 
}
