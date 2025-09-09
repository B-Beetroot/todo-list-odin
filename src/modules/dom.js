import { TodoItem } from './todo.js'; 
import { saveProject, currentProjects, Project } from './projects.js'; 
import * as domHelper from "./dom-helper.js";
import * as projectManager from "./project-manager.js";

export function renderCreateProject() {
  domHelper.clearContent();
  const content = domHelper.getContent();

  const title = domHelper.createTitle("h3","Create Project");

  const { label: projectLabel, input: projectInput } = domHelper.createLabeledInput('Title:', 'input')
  const { label: descLabel, input: descInput } = domHelper.createLabeledInput('Description:', 'textarea')

  const projectBtn = domHelper.createButton(
  "Submit Project",
  () => projectManager.projectSubmit(projectInput, descInput),
  "",
  ""
  );

  content.append(
  title, 
  projectLabel, projectInput,
  descLabel, descInput, projectBtn,
  );

}


export function renderEditProject(projectId) {
  domHelper.clearContent();
  const content = domHelper.getContent();

  const project = projectManager.getProjectById(projectId); 

  const title = domHelper.createTitle("h3", "Edit Project");

  const { label: projectLabel, input: projectInput } = domHelper.createLabeledInput('Title:', 'input');
  projectInput.value = project.name || ''; 

  const { label: descLabel, input: descInput } = domHelper.createLabeledInput('Description:', 'textarea');
  descInput.value = project.description || ''; 

  const projectBtn = domHelper.createButton(
    "Update Project",
    () => projectManager.projectUpdate(projectId, projectInput, descInput),
    "",
    ""
  );

  content.append(
    title,
    projectLabel, projectInput,
    descLabel, descInput,
    projectBtn
  );
}



export function renderCreateTodo() {

  domHelper.clearContent();
  const content = domHelper.getContent();
    
  const title = domHelper.createTitle("h3","Create Todo");

  const { label: titleLabel, input: titleInput } = domHelper.createLabeledInput('Title:', 'input')

  const { label: descLabel, input: descInput } = domHelper.createLabeledInput('Description:', 'textarea')

  const { label: dueDateLabel, input: dueDateInput } = domHelper.createLabeledInput('Due Date:', 'date')

  const { label: priorityLabel, select: prioritySelect } = domHelper.createLabeledSelect(
    'Priority: ',
    ['Low', 'Medium', 'High'],
    'Medium'
  );

  const { label: notesLabel, input: notesInput } = domHelper.createLabeledInput('Notes:', 'textarea')

  content.append(
    title,
    titleLabel, titleInput,
    descLabel, descInput,
    dueDateLabel, dueDateInput,
    priorityLabel, prioritySelect,
    notesLabel, notesInput,
  );

}

export function loadHome() {
  const content = domHelper.getContent();
  const pageHeader = domHelper.getPageHeader();

  const homePageHeader = domHelper.createTitle("h1", "Home");
  pageHeader.appendChild (homePageHeader);

  const createProject = domHelper.createButton('Create Project', renderCreateProject, '', '');
  content.appendChild(createProject);

  const createTodo = domHelper.createButton('Create Todo', renderCreateTodo, '', '');
  content.appendChild(createTodo);


}

export function loadInbox() {
  const content = domHelper.getContent();
  const pageHeader = domHelper.getPageHeader();

  const homePageHeader = domHelper.createTitle("h1", "Inbox");
  pageHeader.appendChild (homePageHeader);
  
}

export function loadProjects() {
  const content = domHelper.getContent();

  const pageHeader = domHelper.getPageHeader();
  const homePageHeader = domHelper.createTitle("h1", "Projects");
  pageHeader.appendChild (homePageHeader);

  const projects = currentProjects().slice().reverse();
  const projectsPerPage = 8;
  let currentPage = 1;

function renderProjects(page) {
  domHelper.clearContent(); 

  const start = (page - 1) * projectsPerPage;
  const end = start + projectsPerPage;
  const pageProjects = projects.slice(start, end);

  pageProjects.forEach(project => {
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card';

    const title = domHelper.createTitle("h4",project.name);
 
    const description = document.createElement('p');
    description.textContent = project.description || 'No description provided.';

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'edit-button';
    editBtn.addEventListener('click', () => {
      renderEditProject(project.id); 
    });

  const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-button';
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
        projectManager.deleteProject(project.id);
      }
  });


    projectCard.appendChild(title);
    projectCard.appendChild(description);
    projectCard.appendChild(editBtn);
    projectCard.appendChild(deleteBtn);

    content.appendChild(projectCard);
  });

  if (projects.length >= 9) {
    renderPaginationControls();
  }
}

function renderPaginationControls() {
  const totalPages = Math.ceil(projects.length / projectsPerPage);
  const pagination = document.createElement('div');
  pagination.className = 'pagination';

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement('button');
    button.textContent = i;

    if (i === currentPage) {
      button.classList.add('active');
    }

    button.addEventListener('click', () => {
      currentPage = i;
      renderProjects(currentPage);
    });

    pagination.appendChild(button);
  }

  content.appendChild(pagination);
}

renderProjects(currentPage);

}

export function loadNotes() {
  const content = domHelper.getContent();
  const pageHeader = domHelper.getPageHeader();

  const homePageHeader = domHelper.createTitle("h1", "Notes");
  pageHeader.appendChild (homePageHeader);
}
