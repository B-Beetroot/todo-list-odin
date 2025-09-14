import { TodoItem } from "./todo.js";
import { TodoManager } from "./todo-manager.js";
import { Project } from "./projects.js"; 
import { ProjectManager } from "./project-manager.js";
import * as domHelper from "./dom-helper.js";

export function renderCreateProject() {
    domHelper.clearContent();
    const content = domHelper.getContent();
    domHelper.clearPageHeader();

    const pageHeader = domHelper.getPageHeader();
    pageHeader.appendChild(domHelper.createTitle("h1", "Create Project"));

    const { label: projectLabel, input: projectInput } = domHelper.createLabeledInput("Title:", "text");
    const { label: descLabel, input: descInput } = domHelper.createLabeledInput("Description:", "textarea");

    const todoManager = new TodoManager();
    const projectManager = new ProjectManager();

    const allTodos = todoManager.getAllTodo();
    const allProjects = projectManager.getAllProjects();

    const attachedIds = new Set();
    allProjects.forEach(p => {
        (p.todos || []).forEach(t => {
            if (t?.id) attachedIds.add(t.id);
        });
    });

    let unattachedTodosArr = allTodos.filter(t => !attachedIds.has(t.id));
    const projectTodos = [];

    const todoLabel = domHelper.createLabel("Inbox:");
    const todoSelect = document.createElement("select");

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "-- Select a Todo --";
    todoSelect.appendChild(defaultOption);

    function refreshDropdown() {
        todoSelect.textContent = "";
        todoSelect.appendChild(defaultOption);
        unattachedTodosArr.forEach(todo => {
            const option = document.createElement("option");
            option.value = String(todo.id);
            option.textContent = `${todo.title} — Due date: ${new Date(todo.dueDate).toDateString()}`;
            todoSelect.appendChild(option);
        });
    }

    refreshDropdown();

    const addTodoBtn = domHelper.createButton("+", () => {
        const selectedId = todoSelect.value;
        if (!selectedId) return;

        const selectedTodo = unattachedTodosArr.find(t => String(t.id) === selectedId);
        if (!selectedTodo) return;

        unattachedTodosArr = unattachedTodosArr.filter(t => t.id !== selectedId);
        projectTodos.push(selectedTodo);
        refreshDropdown();
        renderProjectTodos();
    }, "small-btn add");

    const dropdownRow = domHelper.createDiv("dropdown-row", "", [todoSelect, addTodoBtn]);

    const projectTodosEl = domHelper.createDiv("project-todos-list");

    function renderProjectTodos() {
        projectTodosEl.textContent = "";
        if (projectTodos.length === 0) {
            projectTodosEl.textContent = "No todos attached to project yet.";
            return;
        }
        projectTodos.forEach(todo => {
            const item = domHelper.createDiv("project-todo-item");
            const title = domHelper.createTitle("div", `${todo.title} — due ${new Date(todo.dueDate).toDateString()}`);
            const removeBtn = domHelper.createButton("−", () => {
                const idx = projectTodos.findIndex(t => t.id === todo.id);
                if (idx !== -1) {
                    projectTodos.splice(idx, 1);
                    unattachedTodosArr.push(todo);
                    refreshDropdown();
                    renderProjectTodos();
                }
            }, "small-btn remove");
            item.append(title, removeBtn);
            projectTodosEl.appendChild(item);
        });
    }

    const todosSection = domHelper.createSection("Todos", [projectTodosEl], "h3", "project-todos");

    const projectBtn = domHelper.createButton(
        "Create Project",
        () => {
            const name = projectInput.value.trim();
            const description = descInput.value.trim();

            if (!name) {
                projectInput.reportValidity();
                return;
            }
            if (!description) {
                descInput.reportValidity();
                return;
            }

            const project = new Project({ name, description });

            projectTodos.forEach(todo => {
                const t = todoManager.getTodoById(todo.id) || todo;
                if (t) project.addTodo(t);
            });

            projectManager.createProject(project);

            domHelper.clearContent();
            domHelper.clearPageHeader();
            loadProjects();
        }
    );

    content.append(
            projectLabel, projectInput,
            descLabel, descInput,
            todoLabel,dropdownRow,
            todosSection,
            projectBtn
    );

}



export function renderEditProject(projectId) {
    domHelper.clearContent();
    const content = domHelper.getContent();
    domHelper.clearPageHeader();

    const pageHeader = domHelper.getPageHeader();
    pageHeader.appendChild(domHelper.createTitle("h1", "Edit Project"));

    const manager = new ProjectManager();
    const project = manager.getProjectById(projectId);

    if (!project) {
        alert("Project not found.");
        return;
    }

    const { label: projectLabel, input: projectInput } = domHelper.createLabeledInput("Title:", "text");
    projectInput.value = project.name || "";

    const { label: descLabel, input: descInput } = domHelper.createLabeledInput("Description:", "textarea");
    descInput.value = project.description || "";

    const todoManager = new TodoManager();
    const allTodos = todoManager.getAllTodo();
    const allProjects = manager.getAllProjects();

    const attachedIds = new Set();
    allProjects.forEach(p => {
        if (p.id !== projectId) {
            (p.todos || []).forEach(t => {
                if (t?.id) attachedIds.add(t.id);
            });
        }
    });

    let unattachedTodosArr = allTodos.filter(t => !attachedIds.has(t.id) && !project.todos.some(pt => pt.id === t.id));
    const projectTodos = [...project.todos];

    // Dropdown select for unattached todos
    const todoLabel = domHelper.createLabel("Select Todo to Attach:");
    const todoSelect = document.createElement("select");
    todoSelect.classList.add("todo-dropdown");

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "-- Select a Todo --";
    todoSelect.appendChild(defaultOption);

    function refreshDropdown() {
        todoSelect.textContent = "";
        todoSelect.appendChild(defaultOption);
        unattachedTodosArr.forEach(todo => {
            const option = document.createElement("option");
            option.value = String(todo.id);
            option.textContent = `${todo.title} — due ${new Date(todo.dueDate).toDateString()}`;
            todoSelect.appendChild(option);
        });
    }

    refreshDropdown();

    const addTodoBtn = domHelper.createButton("+", () => {
        const selectedId = todoSelect.value;
        if (!selectedId) return;

        const selectedTodo = unattachedTodosArr.find(t => String(t.id) === selectedId);
        if (!selectedTodo) return;

        unattachedTodosArr = unattachedTodosArr.filter(t => t.id !== selectedTodo.id);
        projectTodos.push(selectedTodo);
        refreshDropdown();
        renderProjectTodos();
    }, "small-btn add");

    const dropdownRow = domHelper.createDiv("dropdown-row", "", [todoLabel, todoSelect, addTodoBtn]);

    // Project todos list
    const projectTodosEl = domHelper.createDiv("project-todos-list");

    function renderProjectTodos() {
        projectTodosEl.textContent = "";
        if (projectTodos.length === 0) {
            projectTodosEl.textContent = "No todos attached to project yet.";
            return;
        }
        projectTodos.forEach(todo => {
            const item = domHelper.createDiv("project-todo-item");
            const title = domHelper.createTitle("div", `${todo.title} — due ${new Date(todo.dueDate).toDateString()}`);
            const removeBtn = domHelper.createButton("−", () => {
                const idx = projectTodos.findIndex(t => t.id === todo.id);
                if (idx !== -1) {
                    projectTodos.splice(idx, 1);
                    unattachedTodosArr.push(todo);
                    refreshDropdown();
                    renderProjectTodos();
                }
            }, "small-btn remove");
            item.append(title, removeBtn);
            projectTodosEl.appendChild(item);
        });
    }

    renderProjectTodos();

    const todosSection = domHelper.createSection("Todos", [projectTodosEl], "h3", "project-todos");

    const updateBtn = domHelper.createButton(
        "Update Project",
        () => {
            const name = projectInput.value.trim();
            const description = descInput.value.trim();

            if (!name) {
                projectInput.reportValidity();
                return;
            }
            if (!description) {
                descInput.reportValidity();
                return;
            }

            const updatedProject = {
                name,
                description,
                todos: projectTodos
            };

            manager.updateProject(projectId, updatedProject);

            domHelper.clearContent();
            domHelper.clearPageHeader();
            loadProjects();
        }
    );

    const formSection = domHelper.createSection(
        "Project Details",
        [
            projectLabel, projectInput,
            descLabel, descInput,
            dropdownRow,
            todosSection,
            updateBtn
        ],
        "h3",
        "edit-project-form"
    );

    content.appendChild(formSection);
}



export function renderCreateTodo() {
    domHelper.clearContent();
    const content = domHelper.getContent();

    domHelper.clearPageHeader();
    const pageHeader = domHelper.getPageHeader();
    pageHeader.appendChild(domHelper.createTitle("h1", "Create Todo"));

    const { label: titleLabel, input: titleInput } = domHelper.createLabeledInput("Title:", "text");
    titleInput.required = true;

    const { label: descLabel, input: descInput } = domHelper.createLabeledInput("Description:", "textarea");
    const { label: dueDateLabel, input: dueDateInput } = domHelper.createLabeledInput("Due Date:", "date");
    const { label: notesLabel, input: notesInput } = domHelper.createLabeledInput("Notes:", "textarea");

    // Priority select
    const priorityLabel = domHelper.createLabel("Priority:");
    const prioritySelect = domHelper.createSelect(["Low", "Medium", "High"], "Medium");

    // Project selection
    const projectManager = new ProjectManager();
    const projects = projectManager.getAllProjects();

    const projectLabelEl = domHelper.createLabel("Attach to Project:");
    const projectSelect = document.createElement("select");

    const noneOption = document.createElement("option");
    noneOption.value = "";
    noneOption.textContent = "No project";
    projectSelect.appendChild(noneOption);

    projects.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.name;
        projectSelect.appendChild(opt);
    });

 // Checklist UI
const checklistContainer = document.createElement("div");
checklistContainer.className = "checklist-container";

const checklistTitle = domHelper.createTitle("h3", "Checklist");
const checklistItems = document.createElement("div");
checklistItems.className = "checklist-items"; // ✅ matches your CSS

// Create "+" button first
const addChecklistBtn = domHelper.createButton("+", () => addChecklistInput(), "small-btn add");

// Append "+" button as last child
checklistItems.appendChild(addChecklistBtn);

function addChecklistInput(value = "") {
    const item = document.createElement("div");
    item.className = "todo-checklist-item";
    item.style.display = "flex";
    item.style.alignItems = "center";
    item.style.gap = "8px"; // Adjust spacing as needed

    const index = checklistItems.querySelectorAll(".todo-checklist-item").length + 1;

    const numberLabel = document.createElement("span");
    numberLabel.className = "checklist-number";
    numberLabel.textContent = `${index}.`;

    const input = document.createElement("input");
    input.classList.add("checklist-input");
    input.type = "text";
    input.value = value;

    const removeBtn = domHelper.createButton("−", () => {
        item.remove();

        // Reassign numbers after removal
        const allItems = checklistItems.querySelectorAll(".todo-checklist-item");
        allItems.forEach((el, i) => {
            const label = el.querySelector(".checklist-number");
            if (label) label.textContent = `${i + 1}.`;
        });

        // Move "+" button to the last item
        if (allItems.length > 0) {
            addChecklistBtn.remove();
            allItems[allItems.length - 1].appendChild(addChecklistBtn);
        }
    }, "small-btn danger remove");

    item.append(numberLabel, input, removeBtn);

    // Remove "+" from wherever it is and append to this new item
    addChecklistBtn.remove();
    item.appendChild(addChecklistBtn);

    checklistItems.appendChild(item);
    return input;
}



// Add initial checklist item
addChecklistInput();

checklistContainer.append(checklistTitle, checklistItems);


    const createBtn = domHelper.createButton("Create Todo", () => {
        if (!titleInput.reportValidity()) return;
        if (!descInput.reportValidity()) return;
        if (!dueDateInput.reportValidity()) return;

        const title = titleInput.value.trim();
        const description = descInput.value.trim();
        const dueDate = dueDateInput.value;
        const priority = prioritySelect.value;
        const notes = notesInput.value.trim();
        const projectId = projectSelect.value;

        try {
            const checklist = Array.from(checklistItems.querySelectorAll("input[type='text']"))
                .map(i => i.value.trim())
                .filter(Boolean);

            const newTodo = new TodoItem({
                title,
                description,
                dueDate,
                priority,
                notes,
                checklist
            });

            const manager = new TodoManager();
            manager.addTodo(newTodo);

            const verifyMgr = new TodoManager();
            if (!verifyMgr.getTodoById(newTodo.id)) {
                throw new Error("Failed to save todo. Please try again.");
            }

            if (projectId) {
                const pm = new ProjectManager();
                const project = pm.getProjectById(projectId);
                if (project) {
                    project.addTodo(newTodo);
                    pm.updateProject(project.id, { todos: project.todos });
                }
            }

            alert("Todo created!");
            loadInbox();
        } catch (error) {
            alert(error.message || "An error occurred while creating the todo.");
        }
    });

    content.append(
        titleLabel, titleInput,
        descLabel, descInput,
        dueDateLabel, dueDateInput,
        priorityLabel, prioritySelect,
        notesLabel, notesInput,
        projectLabelEl, projectSelect,
        checklistContainer,
        createBtn
    );
}




export function renderEditTodo(todoId) {
    const manager = new TodoManager();
    const todo = manager.getTodoById(todoId);
    if (!todo) return alert("Todo not found");

    domHelper.clearContent();
    const content = domHelper.getContent();

    domHelper.clearPageHeader();
    const pageHeader = domHelper.getPageHeader();
    pageHeader.appendChild(domHelper.createTitle("h1", "Edit Todo"));

    // Inputs
    const { label: titleLabel, input: titleInput } = domHelper.createLabeledInput("Title:", "text");
    titleInput.value = todo.title;

    const { label: descLabel, input: descInput } = domHelper.createLabeledInput("Description:", "textarea");
    descInput.value = todo.description;

    const { label: dueDateLabel, input: dueDateInput } = domHelper.createLabeledInput("Due Date:", "date");
    dueDateInput.value = todo.dueDate.toISOString().split("T")[0];

    const priorityLabel = domHelper.createLabel("Priority:");
    const prioritySelect = domHelper.createSelect(["Low", "Medium", "High"], todo.priority);

    const { label: notesLabel, input: notesInput } = domHelper.createLabeledInput("Notes:", "textarea");
    notesInput.value = todo.notes;

    // Checklist
    const checklistItems = domHelper.createDiv("checklist-items");

    function addChecklistItem(value = "", done = false) {
        const item = domHelper.createDiv("checklist-item");

        const doneCheckbox = document.createElement("input");
        doneCheckbox.type = "checkbox";
        doneCheckbox.checked = !!done;
        doneCheckbox.className = "checklist-done";

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Checklist item";
        input.value = value;

        const removeBtn = domHelper.createButton("−", () => item.remove(), "remove-checklist");
        item.append(doneCheckbox, input, removeBtn);
        checklistItems.appendChild(item);
        return { input, doneCheckbox };
    }

    if (todo.checklist?.length > 0) {
        todo.checklist.forEach(it => addChecklistItem(it.text, !!it.done));
    } else {
        addChecklistItem();
    }

    const addChecklistBtn = domHelper.createButton("+", () => addChecklistItem(), "add-checklist");
    const checklistContainer = domHelper.createSection(
        "Checklist",
        [checklistItems, addChecklistBtn],
        "h3",
        "checklist-container"
    );

    // Update button
    const updateBtn = domHelper.createButton("Update Todo", () => {
        if (!titleInput.reportValidity()) return;
        if (!descInput.reportValidity()) return;
        if (!dueDateInput.reportValidity()) return;

        try {
            todo.updateTitle(titleInput.value.trim());
            todo.updateDescription(descInput.value.trim());
            todo.updateDueDate(dueDateInput.value);
            todo.updatePriority(prioritySelect.value);
            todo.addNote(notesInput.value.trim());

            const list = Array.from(checklistItems.querySelectorAll(".checklist-item")).map(div => {
                const text = (div.querySelector("input[type='text']").value || "").trim();
                const done = !!div.querySelector("input[type='checkbox']")?.checked;
                return text ? { text, done } : null;
            }).filter(Boolean);

            todo.checklist = list;

            manager.updateTodo(todo);
            alert("Todo updated!");
            loadInbox();
        } catch (error) {
            alert(error.message);
        }
    });

    // Group all form elements
    const formSection = domHelper.createSection(
        "Todo Details",
        [
            titleLabel, titleInput,
            descLabel, descInput,
            dueDateLabel, dueDateInput,
            priorityLabel, prioritySelect,
            notesLabel, notesInput,
            checklistContainer,
            updateBtn
        ],
        "h3",
        "edit-todo-form"
    );

    content.appendChild(formSection);
}



export function loadHome() {
    domHelper.clearContent();
    const content = domHelper.getContent();

    domHelper.clearPageHeader();
    const pageHeader = domHelper.getPageHeader();

    const pageHeaderContent = domHelper.createTitle("h1", "Home");
    pageHeader.appendChild (pageHeaderContent);
}

export function renderTodoList(unattachedOnly = false) {
    domHelper.clearContent();
    const content = domHelper.getContent();
    const manager = new TodoManager();
    let todos = manager.getAllTodo();

    if (unattachedOnly) {
        const pm = new ProjectManager();
        const projects = pm.getAllProjects();
        const attachedIds = new Set();
        projects.forEach(p => {
            (p.todos || []).forEach(t => {
                if (!t) return;
                const id = typeof t === "string" ? t : (t.id || null);
                if (id) attachedIds.add(id);
            });
        });
        todos = todos.filter(t => !attachedIds.has(t.id));

        const prioRank = p => (p === "High" ? 0 : p === "Medium" ? 1 : 2);
        todos.sort((a, b) => {
            const da = new Date(a.dueDate);
            const db = new Date(b.dueDate);
            const aInvalid = isNaN(da);
            const bInvalid = isNaN(db);
            if (aInvalid && bInvalid) {
                const pr = prioRank(a.priority) - prioRank(b.priority);
                return pr !== 0 ? pr : a.title.localeCompare(b.title);
            }
            if (aInvalid) return 1;
            if (bInvalid) return -1;
            if (da - db !== 0) return da - db;
            const pr = prioRank(a.priority) - prioRank(b.priority);
            return pr !== 0 ? pr : a.title.localeCompare(b.title);
        });
    }

    todos.forEach(todo => {
        const card = domHelper.createDiv("todo-card");

        const prClass = `priority-${(todo.priority || "Low").toLowerCase()}`;
        card.classList.add(prClass);
        if (todo.completed) card.classList.add("completed");
        card.classList.add("collapsed");

        // Header
        const headerRow = domHelper.createDiv("todo-card-header");
        const leftGroup = domHelper.createDiv("todo-card-header-left");

        const arrow = document.createElement("span");
        arrow.className = "card-arrow";
        arrow.textContent = "▾";

        const titleWrapper = domHelper.createDiv("todo-title-wrapper");
        const title = domHelper.createTitle("h3", todo.title);
        titleWrapper.appendChild(title);

        leftGroup.append(arrow, titleWrapper);
        headerRow.appendChild(leftGroup);

        const switchLabel = document.createElement("label");
        switchLabel.className = "toggle-switch";

        const switchInput = document.createElement("input");
        switchInput.type = "checkbox";
        switchInput.checked = !!todo.completed;

        // prevent clicks on the input/label from triggering parent handlers
        switchInput.addEventListener("click", (evt) => {
            evt.stopPropagation();
        });

        switchInput.addEventListener("change", () => {
            todo.completed = switchInput.checked;
            new TodoManager().updateTodo(todo);
            card.classList.toggle("completed", switchInput.checked);
        });

        const slider = document.createElement("span");
        slider.className = "slider";

        switchLabel.append(switchInput, slider);
        headerRow.appendChild(switchLabel);
        card.appendChild(headerRow);

        // Description
        if (todo.description) {
            const descEl = document.createElement("p");
            descEl.className = "todo-description";
            descEl.textContent = todo.description;
            card.appendChild(descEl);
        }

        // Notes
        if (todo.notes) {
            const notesEl = document.createElement("p");
            notesEl.className = "todo-notes";
            notesEl.textContent = todo.notes;
            card.appendChild(notesEl);
        }

        // Checklist
        if (todo.checklist?.length > 0) {
            const checklistEl = document.createElement("ul");
            checklistEl.className = "todo-checklist";

            todo.checklist.forEach(item => {
                const li = document.createElement("li");
                li.className = "todo-checklist-item";

                const chk = document.createElement("input");
                chk.type = "checkbox";
                chk.checked = !!item.done;
                chk.className = "todo-checklist-checkbox";

                const textSpan = document.createElement("span");
                textSpan.textContent = item.text;
                if (item.done) textSpan.classList.add("done");

                chk.addEventListener("change", (evt) => {
                    evt.stopPropagation();
                    item.done = chk.checked;
                    new TodoManager().updateTodo(todo);
                    textSpan.classList.toggle("done", chk.checked);
                });

                li.append(chk, textSpan);
                checklistEl.appendChild(li);
            });

            card.appendChild(checklistEl);
        }

        // Actions
        const actions = domHelper.createDiv("todo-actions");

        const editBtn = domHelper.createButton(
            "Edit",
            (evt) => {
                evt.stopPropagation();
                renderEditTodo(todo.id);
            },
            "small-btn"
        );

        const deleteBtn = domHelper.createButton(
            "Delete",
            (evt) => {
                evt.stopPropagation();
                if (confirm(`Are you sure you want to delete "${todo.title}"?`)) {
                    new TodoManager().deleteTodo(todo.id);
                    renderTodoList(unattachedOnly);
                }
            },
            "small-btn danger"
        );

        actions.append(editBtn, deleteBtn);

        // Footer
        const footer = domHelper.createDiv("todo-card-footer");
        const due = domHelper.createDiv("todo-due");
        due.textContent = todo.dueDate && !isNaN(new Date(todo.dueDate))
            ? `Due: ${new Date(todo.dueDate).toDateString()}`
            : "";

        footer.append(due, actions);
        card.appendChild(footer);

        // Expand/collapse toggle
        leftGroup.addEventListener("click", (evt) => {
            evt.stopPropagation();
            const isExpanded = card.classList.toggle("expanded");
            card.classList.toggle("collapsed", !isExpanded);
        });

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

    // mark content as inbox so we can scope inbox-specific styles
    content.classList.add("inbox");

    // show only unattached todos in inbox, and include notes/checklist as rendered above
    renderTodoList(true);
    
}

export function loadProjects() {
    domHelper.clearPageHeader();
    const pageHeader = domHelper.getPageHeader();
    pageHeader.appendChild(domHelper.createTitle("h1", "Projects"));

    const projectsPerPage = 5;
    let currentPage = 1;

    const manager = new ProjectManager(); // Use instance-based manager
    let projects = manager.getAllProjects().slice().reverse(); // Latest first

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
                        manager.deleteProject(project.id);
                        projects = manager.getAllProjects().slice().reverse();

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

