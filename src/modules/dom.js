import { TodoItem, TodoStore } from "./todo.js"; 
import { saveProject, currentProjects, Project } from "./projects.js"; 
import * as domHelper from "./dom-helper.js";
import * as projectManager from "./project-manager.js";

export function renderCreateProject() {
	domHelper.clearContent();
	const content = domHelper.getContent();

	domHelper.clearPageHeader();
	const pageHeader = domHelper.getPageHeader();

	const pageHeaderContent = domHelper.createTitle("h1","Create Project");
	pageHeader.appendChild (pageHeaderContent);

	const { label: projectLabel, input: projectInput } = domHelper.createLabeledInput("Title:", "text")
	const { label: descLabel, input: descInput } = domHelper.createLabeledInput("Description:", "textarea")

	const projectBtn = domHelper.createButton(
	"Create Project",
	() => projectManager.createProject(projectInput, descInput),
	"",
	""
	);

	content.append(
	projectLabel, projectInput,
	descLabel, descInput, projectBtn,
	);
}

export function renderEditProject(projectId) {
	domHelper.clearContent();
	const content = domHelper.getContent();
	
	domHelper.clearPageHeader();
	const pageHeader = domHelper.getPageHeader();

	const pageHeaderContent = domHelper.createTitle("h1","Edit Project");
	pageHeader.appendChild (pageHeaderContent);


	const project = projectManager.getProjectById(projectId); 
	if (!project) {
		alert("Project not found.");
		return;
	}

	const { label: projectLabel, input: projectInput } = domHelper.createLabeledInput("Title:", "text");
	projectInput.value = project.name || ""; 

	const { label: descLabel, input: descInput } = domHelper.createLabeledInput("Description:", "textarea");
	descInput.value = project.description || ""; 

	const projectBtn = domHelper.createButton(
		"Update Project",
		() => projectManager.projectUpdate(projectId, projectInput, descInput),
		"",
		""
	);

	content.append(
		projectLabel, projectInput,
		descLabel, descInput,
		projectBtn
	);
}

export function renderCreateTodo() {

	domHelper.clearContent();
	const content = domHelper.getContent();
		
	domHelper.clearPageHeader();
	const pageHeader = domHelper.getPageHeader();

	const pageHeaderContent = domHelper.createTitle("h1","Create Todo");
	pageHeader.appendChild (pageHeaderContent);

	const { label: titleLabel, input: titleInput } = domHelper.createLabeledInput("Title:", "text")

	const { label: descLabel, input: descInput } = domHelper.createLabeledInput("Description:", "textarea")

	const { label: dueDateLabel, input: dueDateInput } = domHelper.createLabeledInput("Due Date:", "date")

	const { label: priorityLabel, select: prioritySelect } = domHelper.createLabeledSelect(
		"Priority: ",
		["Low", "Medium", "High"],
		"Medium"
	);

	const { label: notesLabel, input: notesInput } = domHelper.createLabeledInput("Notes:", "textarea")

	const createBtn = domHelper.createButton("Create Todo", () => {
		const title = titleInput.value.trim();
		const description = descInput.value.trim();
		const dueDate = dueDateInput.value;
		const priority = prioritySelect.value;
		const notes = notesInput.value.trim();

		if (!title) return titleInput.reportValidity();

		try {
			const newTodo = new TodoItem({
				title,
				description,
				dueDate,
				priority,
				notes
			});

			TodoStore.add(newTodo);
			alert("Todo created!");
			loadInbox();
		} catch (error) {
			alert(error.message);
		}
	});


	content.append(
		titleLabel, titleInput,
		descLabel, descInput,
		dueDateLabel, dueDateInput,
		priorityLabel, prioritySelect,
		notesLabel, notesInput,
		createBtn,
	);
}

export function renderEditTodo(todoId) {
    const todo = TodoStore.getById(todoId);
    if (!todo) return alert("Todo not found");

    domHelper.clearContent();
    const content = domHelper.getContent();

	domHelper.clearPageHeader();
	const pageHeader = domHelper.getPageHeader();

	const pageHeaderContent = domHelper.createTitle("h1","Edit Todo");
	pageHeader.appendChild (pageHeaderContent);

    const { label: titleLabel, input: titleInput } = domHelper.createLabeledInput("Title:", "text");
    titleInput.value = todo.title;

    const { label: descLabel, input: descInput } = domHelper.createLabeledInput("Description:", "textarea");
    descInput.value = todo.description;

    const { label: dueDateLabel, input: dueDateInput } = domHelper.createLabeledInput("Due Date:", "date");
    dueDateInput.value = todo.dueDate.toISOString().split("T")[0];

    const { label: priorityLabel, select: prioritySelect } = domHelper.createLabeledSelect(
        "Priority: ",
        ["Low", "Medium", "High"],
        todo.priority
    );

    const { label: notesLabel, input: notesInput } = domHelper.createLabeledInput("Notes:", "textarea");
    notesInput.value = todo.notes;

    const updateBtn = domHelper.createButton("Update Todo", () => {
        todo.updateTitle(titleInput.value.trim());
        todo.updateDescription(descInput.value.trim());
        todo.updateDueDate(dueDateInput.value);
        todo.updatePriority(prioritySelect.value);
        todo.addNote(notesInput.value.trim());

        TodoStore.update(todo);
        alert("Todo updated!");
		loadInbox();
    });

    content.append(
        titleLabel, titleInput,
        descLabel, descInput,
        dueDateLabel, dueDateInput,
        priorityLabel, prioritySelect,
        notesLabel, notesInput,
        updateBtn
    );
}


export function loadHome() {
	domHelper.clearContent();
	const content = domHelper.getContent();

	domHelper.clearPageHeader();
	const pageHeader = domHelper.getPageHeader();

	const pageHeaderContent = domHelper.createTitle("h1", "Home");
	pageHeader.appendChild (pageHeaderContent);
}

export function renderTodoList() {
    domHelper.clearContent();
    const content = domHelper.getContent();

    const todos = TodoStore.getAll();

    todos.forEach(todo => {
        const card = domHelper.createDiv("todo-card");

        const title = domHelper.createTitle("h3", todo.title);

        const due = document.createElement("p");
        due.textContent = `Due: ${todo.dueDate.toDateString()}`;

        const priority = document.createElement("p");
        priority.textContent = `Priority: ${todo.priority}`;

        const status = document.createElement("p");
        status.textContent = todo.completed ? "✅ Completed" : "🕒 Incomplete";
        status.className = todo.completed ? "status-complete" : "status-incomplete";

        const completeBtn = domHelper.createButton("Toggle Complete", () => {
            todo.toggleComplete();
            TodoStore.update(todo);
            renderTodoList();
        });

        const editBtn = domHelper.createButton("Edit", () => {
            renderEditTodo(todo.id);
        });

        const deleteBtn = domHelper.createButton("Delete", () => {
            if (confirm(`Are you sure you want to delete "${todo.title}"?`)) {
                TodoStore.delete(todo.id);
                renderTodoList();
            }
        });

        card.append(title, due, priority, status, completeBtn, editBtn, deleteBtn);
        content.appendChild(card);
    });
}


export function loadInbox() {
	domHelper.clearContent();
	domHelper.clearPageHeader();
	const content = domHelper.getContent();
	const pageHeader = domHelper.getPageHeader();

	const pageHeaderContent = domHelper.createTitle("h1", "Inbox");
	pageHeader.appendChild (pageHeaderContent);

	renderTodoList();
	
}

export function loadProjects() {
	domHelper.clearPageHeader();
	const pageHeader = domHelper.getPageHeader();
	
	const pageHeaderContent = domHelper.createTitle("h1", "Projects");
	pageHeader.appendChild (pageHeaderContent);

	const projectsPerPage = 5;
	let currentPage = 1;
	let projects = currentProjects().slice().reverse();

	function renderProjects(page) {
	domHelper.clearContent();
	const content = domHelper.getContent();

	const start = (page - 1) * projectsPerPage;
	const end = start + projectsPerPage;
	const pageProjects = projects.slice(start, end);

	const wrapper = domHelper.createDiv("project-list-wrapper");
	const projectList = domHelper.createDiv("project-list");

	pageProjects.forEach(project => {
		const title = domHelper.createTitle("h4", project.name);
		const description = document.createElement("p");
		description.textContent = project.description;

		const editBtn = domHelper.createButton(
		"Edit",
		() => renderEditProject(project.id),
		"edit-button"
		);

		const deleteBtn = domHelper.createButton(
		"Delete",
		() => {
			if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
			projectManager.deleteProject(project.id);
			projects = currentProjects().slice().reverse();

			const totalPages = Math.max(1, Math.ceil(projects.length / projectsPerPage));
			currentPage = Math.min(currentPage, totalPages);
			
			renderProjects(currentPage);
			}
		},
		"delete-button"
		);

		const projectCard = domHelper.createDiv(
		"project-card",
		"",
		[title, description, editBtn, deleteBtn]
		);

		projectList.appendChild(projectCard);

	});

	wrapper.appendChild(projectList);

	const totalPages = Math.max(1, Math.ceil(projects.length / projectsPerPage));

	if (totalPages > 1) {
		const paginationButtons = [];

		for (let i = 1; i <= totalPages; i++) {
		const button = domHelper.createButton(
			`${i}`,
			() => {
			currentPage = i;
			renderProjects(currentPage);
			},
			i === currentPage ? "active" : ""
		);
		paginationButtons.push(button);
		}

		const pagination = domHelper.createDiv("pagination", "", paginationButtons);

		wrapper.appendChild(pagination);
	}

	content.appendChild(wrapper);
}

	renderProjects(currentPage);
}
