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
	projectInput.maxLength = 90;
	const { label: descLabel, input: descInput } = domHelper.createLabeledInput("Description:", "textarea");
	descInput.maxLength = 240;

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
	defaultOption.textContent = "Select a Todo";
	todoSelect.appendChild(defaultOption);

	function refreshDropdown() {
		todoSelect.textContent = "";
		todoSelect.appendChild(defaultOption);
		unattachedTodosArr.forEach(todo => {
			const option = document.createElement("option");
			option.value = String(todo.id);
			option.textContent = `${todo.title} - Due Date: ${new Date(todo.dueDate).toDateString()}`;
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

	renderProjectTodos();

	function renderProjectTodos() {
		projectTodosEl.textContent = "";
		if (projectTodos.length === 0) {
			const empty = domHelper.createTitle("div", "No todos attached to this project yet.");
			empty.classList.add("empty-line");
			projectTodosEl.appendChild(empty);
			return;
		}
		projectTodos.forEach(todo => {
			const item = domHelper.createDiv("project-todo-item");
			const title = domHelper.createTitle("div", `${todo.title} - Due Date: ${new Date(todo.dueDate).toDateString()}`);
			title.classList.add("project-todo-title");
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

	const todosSection = domHelper.createSection("Todos:", [projectTodosEl], "label", "project-todos");

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

			const dialog = document.createElement("dialog");
			dialog.classList.add("custom-dialog");

			const message = document.createElement("p");
			message.textContent =  `Project "${projectInput.value.trim()}" Created!`;

			const closeBtn = document.createElement("button");
			closeBtn.textContent = "OK";
			closeBtn.addEventListener("click", () => {
				dialog.close();
				dialog.remove();
			});

			dialog.appendChild(message);
			dialog.appendChild(closeBtn);
			document.body.appendChild(dialog);

			dialog.showModal();

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
		console.log("Project Not Found!");
		return;
	}

	const { label: projectLabel, input: projectInput } = domHelper.createLabeledInput("Title:", "text");
	projectInput.value = project.name || "";
	projectInput.maxLength = 90;

	const { label: descLabel, input: descInput } = domHelper.createLabeledInput("Description:", "textarea");
	descInput.value = project.description || "";
	descInput.maxLength = 240;

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

	const todoLabel = domHelper.createLabel("Inbox:");
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
			option.textContent = `${todo.title} - Due Date: ${new Date(todo.dueDate).toDateString()}`;
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

	const dropdownRow = domHelper.createDiv("dropdown-row", "", [todoSelect, addTodoBtn]);

	const projectTodosEl = domHelper.createDiv("project-todos-list");

	function renderProjectTodos() {
		projectTodosEl.textContent = "";
		if (projectTodos.length === 0) {
			const empty = domHelper.createTitle("div", "No todos attached to this project yet.");
			empty.classList.add("empty-line");
			projectTodosEl.appendChild(empty);
			return;
		}
		projectTodos.forEach(todo => {
			const item = domHelper.createDiv("project-todo-item");
			const title = domHelper.createTitle("div", `${todo.title} - Due Date: ${new Date(todo.dueDate).toDateString()}`);
			title.classList.add("project-todo-title");
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

	const todosSection = domHelper.createSection("Todos:", [projectTodosEl], "label", "project-todos");

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

			const dialog = document.createElement("dialog");
			dialog.classList.add("custom-dialog");

			const message = document.createElement("p");
			message.textContent =  `Project: ${projectInput.value.trim()} Updated!`;

			const closeBtn = document.createElement("button");
			closeBtn.textContent = "OK";
			closeBtn.addEventListener("click", () => {
				dialog.close();
				dialog.remove();
			});

			dialog.appendChild(message);
			dialog.appendChild(closeBtn);
			document.body.appendChild(dialog);

			dialog.showModal();

			loadProjects();
		}
	);

	content.append(
		projectLabel, projectInput,
		descLabel, descInput,
		todoLabel, dropdownRow,
		todosSection,
		updateBtn
	);
}


export function renderCreateTodo() {
	domHelper.clearContent();
	const content = domHelper.getContent();

	domHelper.clearPageHeader();
	const pageHeader = domHelper.getPageHeader();
	pageHeader.appendChild(domHelper.createTitle("h1", "Create Todo"));

	const { label: titleLabel, input: titleInput } = domHelper.createLabeledInput("Title:", "text");
	titleInput.required = true;
	titleInput.maxLength = 60;

	const { label: descLabel, input: descInput } = domHelper.createLabeledInput("Description:", "textarea");
	descInput.maxLength = 240;
	const { label: dueDateLabel, input: dueDateInput } = domHelper.createLabeledInput("Due Date:", "date");
	const { label: notesLabel, input: notesInput } = domHelper.createLabeledInput("Notes:", "textarea");
	notesInput.maxLength = 240;

	const priorityLabel = domHelper.createLabel("Priority:");
	const prioritySelect = domHelper.createSelect(["Low", "Medium", "High"], "Medium");

	const projectManager = new ProjectManager();
	const projects = projectManager.getAllProjects();

	const projectLabelEl = domHelper.createLabel("Attach to a Project:");
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

	const checklistContainer = document.createElement("div");
	checklistContainer.className = "checklist-container";

	const checklistTitle = domHelper.createTitle("h3", "Checklist");
	const checklistItems = document.createElement("div");
	checklistItems.className = "checklist-items";

	const addChecklistBtn = domHelper.createButton("+", () => addChecklistInput(), "small-btn add");

	checklistItems.appendChild(addChecklistBtn);

	function addChecklistInput(value = "") {
		const item = document.createElement("div");
		item.className = "todo-checklist-item";

		const index = checklistItems.querySelectorAll(".todo-checklist-item").length + 1;

		const numberLabel = document.createElement("span");
		numberLabel.className = "checklist-number";
		numberLabel.textContent = `${index}.`;

		const input = document.createElement("input");
		input.classList.add("checklist-input");
		input.type = "text";
		input.value = value;
		input.maxLength = 60;

		const removeBtn = domHelper.createButton("−", () => {
			item.remove();

			const updatedItems = checklistItems.querySelectorAll(".todo-checklist-item");
			updatedItems.forEach((el, i) => {
				const label = el.querySelector(".checklist-number");
				if (label) label.textContent = `${i + 1}.`;
			});

			if (updatedItems.length > 0) {
				addChecklistBtn.remove();
				updatedItems[updatedItems.length - 1].appendChild(addChecklistBtn);
			}

			if (updatedItems.length === 1) {
				const btn = updatedItems[0].querySelector(".remove");
				if (btn) btn.remove();
			}
		}, "small-btn danger remove");

		removeBtn.classList.add("remove");

		item.append(numberLabel, input);

		const allItems = checklistItems.querySelectorAll(".todo-checklist-item");
		if (allItems.length > 0) {
			item.appendChild(removeBtn);

			const lastItem = allItems[allItems.length - 1];
			if (!lastItem.querySelector(".remove")) {
				const prevRemoveBtn = domHelper.createButton("−", () => {
					lastItem.remove();

					const updatedItems = checklistItems.querySelectorAll(".todo-checklist-item");
					updatedItems.forEach((el, i) => {
						const label = el.querySelector(".checklist-number");
						if (label) label.textContent = `${i + 1}.`;
					});

					if (updatedItems.length > 0) {
						addChecklistBtn.remove();
						updatedItems[updatedItems.length - 1].appendChild(addChecklistBtn);
					}

					if (updatedItems.length === 1) {
						const btn = updatedItems[0].querySelector(".remove");
						if (btn) btn.remove();
					}
				}, "small-btn danger remove");
				prevRemoveBtn.classList.add("remove");
				lastItem.appendChild(prevRemoveBtn);
			}
		}

		addChecklistBtn.remove();
		item.appendChild(addChecklistBtn);

		checklistItems.appendChild(item);
	}

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

			const dialog = document.createElement("dialog");
			dialog.classList.add("custom-dialog");

			const message = document.createElement("p");
			message.textContent =  `Todo "${titleInput.value.trim()}" created!`;

			const closeBtn = document.createElement("button");
			closeBtn.textContent = "OK";
			closeBtn.addEventListener("click", () => {
				dialog.close();
				dialog.remove();
			});

			dialog.appendChild(message);
			dialog.appendChild(closeBtn);
			document.body.appendChild(dialog);

			dialog.showModal();

			loadInbox();
		} catch (error) {
			console.log(error.message || "An error occurred while creating the todo.");
		}
	});

	content.append(
		titleLabel, titleInput,
		descLabel, descInput,
		dueDateLabel, dueDateInput,
		priorityLabel, prioritySelect,
		notesLabel, notesInput,
		checklistContainer,
		projectLabelEl, projectSelect,
		createBtn
	);
}

export function renderEditTodo(todoId) {
	const manager = new TodoManager();
	const todo = manager.getTodoById(todoId);
	if (!todo) return console.log("Todo not found");

	domHelper.clearContent();
	const content = domHelper.getContent();

	domHelper.clearPageHeader();
	const pageHeader = domHelper.getPageHeader();
	pageHeader.appendChild(domHelper.createTitle("h1", "Edit Todo"));

	const { label: titleLabel, input: titleInput } = domHelper.createLabeledInput("Title:", "text");
	titleInput.required = true;
	titleInput.value = todo.title;
	titleInput.maxLength = 60;

	const { label: descLabel, input: descInput } = domHelper.createLabeledInput("Description:", "textarea");
	descInput.value = todo.description;
	descInput.maxLength = 240;

	const { label: dueDateLabel, input: dueDateInput } = domHelper.createLabeledInput("Due Date:", "date");
	dueDateInput.value = todo.dueDate.toISOString().split("T")[0];

	const priorityLabel = domHelper.createLabel("Priority:");
	const prioritySelect = domHelper.createSelect(["Low", "Medium", "High"], todo.priority);

	const { label: notesLabel, input: notesInput } = domHelper.createLabeledInput("Notes:", "textarea");
	notesInput.value = todo.notes;
	notesInput.maxLength = 240;

	const checklistContainer = document.createElement("div");
	checklistContainer.className = "checklist-container";

	const checklistTitle = domHelper.createTitle("h3", "Checklist");
	const checklistItems = document.createElement("div");
	checklistItems.className = "checklist-items";

	const addChecklistBtn = domHelper.createButton("+", () => addChecklistInput(), "small-btn add");
	checklistItems.appendChild(addChecklistBtn);

	function addChecklistInput(value = "", done = false) {
	const item = document.createElement("div");
	item.className = "todo-checklist-item";

	const index = checklistItems.querySelectorAll(".todo-checklist-item").length + 1;

	const numberLabel = document.createElement("span");
	numberLabel.className = "checklist-number";
	numberLabel.textContent = `${index}.`;

	const doneCheckbox = document.createElement("input");
	doneCheckbox.type = "checkbox";
	doneCheckbox.checked = !!done;
	doneCheckbox.className = "checklist-done";

	const input = document.createElement("input");
	input.classList.add("checklist-input");
	input.type = "text";
	input.value = value;
	input.maxLength = 60;

	const removeBtn = domHelper.createButton("−", () => {
		item.remove();

		const updatedItems = checklistItems.querySelectorAll(".todo-checklist-item");
		updatedItems.forEach((el, i) => {
			const label = el.querySelector(".checklist-number");
			if (label) label.textContent = `${i + 1}.`;
		});

		if (updatedItems.length > 0) {
			addChecklistBtn.remove();
			updatedItems[updatedItems.length - 1].appendChild(addChecklistBtn);
		}

		if (updatedItems.length === 1) {
			const btn = updatedItems[0].querySelector(".remove");
			if (btn) btn.remove();
		}
	}, "small-btn danger remove");
	removeBtn.classList.add("remove");

	item.append(numberLabel, doneCheckbox, input);

	const allItems = checklistItems.querySelectorAll(".todo-checklist-item");
	if (allItems.length > 0) {
		item.appendChild(removeBtn);

		const lastItem = allItems[allItems.length - 1];
		if (!lastItem.querySelector(".remove")) {
			const prevRemoveBtn = domHelper.createButton("−", () => {
				lastItem.remove();

				const updatedItems = checklistItems.querySelectorAll(".todo-checklist-item");
				updatedItems.forEach((el, i) => {
					const label = el.querySelector(".checklist-number");
					if (label) label.textContent = `${i + 1}.`;
				});

				if (updatedItems.length > 0) {
					addChecklistBtn.remove();
					updatedItems[updatedItems.length - 1].appendChild(addChecklistBtn);
				}

				if (updatedItems.length === 1) {
					const btn = updatedItems[0].querySelector(".remove");
					if (btn) btn.remove();
				}
			}, "small-btn danger remove");
			prevRemoveBtn.classList.add("remove");
			lastItem.appendChild(prevRemoveBtn);
		}
	}

	addChecklistBtn.remove();
	item.appendChild(addChecklistBtn);

	checklistItems.appendChild(item);
	}

	if (todo.checklist?.length > 0) {
		todo.checklist.forEach(it => addChecklistInput(it.text, !!it.done));
	} else {
		addChecklistInput();
	}

	checklistContainer.append(checklistTitle, checklistItems);

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

			const list = Array.from(checklistItems.querySelectorAll(".todo-checklist-item")).map(div => {
				const text = div.querySelector("input[type='text']").value.trim();
				const done = div.querySelector("input[type='checkbox']")?.checked;
				return text ? { text, done } : null;
			}).filter(Boolean);

			todo.checklist = list;

			manager.updateTodo(todo);

		const dialog = document.createElement("dialog");
		dialog.classList.add("custom-dialog");

		const message = document.createElement("p");
		message.textContent =  `${titleInput.value.trim()} Updated!`;

		const closeBtn = document.createElement("button");
		closeBtn.textContent = "OK";
		closeBtn.addEventListener("click", () => {
			dialog.close();
			dialog.remove();
		});

		dialog.appendChild(message);
		dialog.appendChild(closeBtn);
		document.body.appendChild(dialog);

		dialog.showModal();

			loadInbox();
		} catch (error) {
			console.log(error.message || "An error occurred while updating the todo.");
		}
	});

	content.append(
		titleLabel, titleInput,
		descLabel, descInput,
		dueDateLabel, dueDateInput,
		priorityLabel, prioritySelect,
		notesLabel, notesInput,
		checklistContainer,
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

		if (todo.description) {
			const descEl = document.createElement("p");
			descEl.className = "todo-description";
			descEl.textContent = todo.description;
			card.appendChild(descEl);
		}

		if (todo.notes) {
			const notesEl = document.createElement("p");
			notesEl.className = "todo-notes";
			notesEl.textContent = todo.notes;
			card.appendChild(notesEl);
		}

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

				const dialog = document.createElement("dialog");
				dialog.classList.add("custom-dialog");

				const message = document.createElement("p");
				message.textContent = `🗑️ Are you sure you want to delete "${todo.title}"?`;

				const confirmBtn = document.createElement("button");
				confirmBtn.textContent = "Yes";
				confirmBtn.style.marginRight = "10px";

				const cancelBtn = document.createElement("button");
				cancelBtn.textContent = "Cancel";

				confirmBtn.addEventListener("click", () => {
					new TodoManager().deleteTodo(todo.id);
					renderTodoList(unattachedOnly);
					dialog.close();
					dialog.remove();
				});

				cancelBtn.addEventListener("click", () => {
					dialog.close();
					dialog.remove();
				});

				dialog.appendChild(message);
				dialog.appendChild(confirmBtn);
				dialog.appendChild(cancelBtn);
				document.body.appendChild(dialog);
				dialog.showModal();
			},
			"small-btn danger"
		);

		actions.append(editBtn, deleteBtn);

		const footer = domHelper.createDiv("todo-card-footer");
		const due = domHelper.createDiv("todo-due");
		due.textContent = todo.dueDate && !isNaN(new Date(todo.dueDate))
			? `Due Date: ${new Date(todo.dueDate).toDateString()}`
			: "";

		footer.append(due, actions);
		card.appendChild(footer);

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

	content.classList.add("inbox");

	renderTodoList(true);
}

export function loadProjects() {
	domHelper.clearPageHeader();
	const pageHeader = domHelper.getPageHeader();
	pageHeader.appendChild(domHelper.createTitle("h1", "Projects"));

	const projectsPerPage = 5;
	let currentPage = 1;

	const manager = new ProjectManager();
	let projects = manager.getAllProjects().slice().reverse();

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
					const dialog = document.createElement("dialog");
					dialog.classList.add("custom-dialog");

					const message = document.createElement("p");
					message.textContent = `🗑️ Are you sure you want to delete "${project.name}"?`;

					const confirmBtn = document.createElement("button");
					confirmBtn.textContent = "Yes";
					confirmBtn.style.marginRight = "10px";

					const cancelBtn = document.createElement("button");
					cancelBtn.textContent = "Cancel";

					confirmBtn.addEventListener("click", () => {
						manager.deleteProject(project.id);
						projects = manager.getAllProjects().slice().reverse();

						const totalPages = Math.max(1, Math.ceil(projects.length / projectsPerPage));
						currentPage = Math.min(currentPage, totalPages);

						renderProjects(currentPage);

						dialog.close();
						dialog.remove();
					});

					cancelBtn.addEventListener("click", () => {
						dialog.close();
						dialog.remove();
					});

					dialog.appendChild(message);
					dialog.appendChild(confirmBtn);
					dialog.appendChild(cancelBtn);
					document.body.appendChild(dialog);
					dialog.showModal();
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


