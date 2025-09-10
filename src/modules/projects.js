import { TodoItem } from './todo.js';

function getProjectKey() {
	const STORAGE_KEY = "projects";
	return STORAGE_KEY
}

export class Project {
	constructor({ name, description = "" }) {
		this.id = crypto.randomUUID();
		this.name = name;
		this.description = description;
		this.todos = [];
	}
/*
	addTodo(todo) {
		if (todo instanceof TodoItem) {
			this.todos.push(todo);
		} else {
			throw new Error("Only TodoItem instances can be added.");
		}
	}

	removeTodo(todoId) {
		this.todos = this.todos.filter(todo => todo.id !== todoId);
	}

	getIncompleteTodos() {
		return this.todos.filter(todo => !todo.completed);
	}

	getCompletedTodos() {
		return this.todos.filter(todo => todo.completed);
	}

	updateName(newName) {
		this.name = newName;
	}

	updateDescription(newDescription) {
		this.description = newDescription;
	}
*/
}

const sampleProjects = [
	new Project({ name: "Website Redesign", description: "Revamp the company homepage" }),
	new Project({ name: "Marketing Campaign", description: "Launch fall social media ads" }),
	new Project({ name: "Mobile App", description: "Build MVP for Android and iOS" }),
	new Project({ name: "Data Migration", description: "Move legacy data to new system" }),
	new Project({ name: "Customer Survey", description: "Collect feedback from beta users" }),
	new Project({ name: "Internal Wiki", description: "Document team processes and tools" }),
	new Project({ name: "SEO Optimization", description: "Improve search rankings for blog" }),
	new Project({ name: "Bug Bash", description: "Team-wide bug fixing sprint" }),
	new Project({ name: "Hiring Pipeline", description: "Streamline candidate tracking" }),
	new Project({ name: "Quarterly Report", description: "Prepare slides for stakeholder review" }),
];

saveAllProjects(sampleProjects);

export function currentProjects() {
	const data = localStorage.getItem(getProjectKey());
	if (!data) return [];
	return JSON.parse(data);
}

export function saveProject(project) {
	const projects = currentProjects();
	projects.push(project);
	localStorage.setItem(getProjectKey(), JSON.stringify(projects));
}

export function saveAllProjects(projects) {
	localStorage.setItem(getProjectKey(), JSON.stringify(projects));
}
