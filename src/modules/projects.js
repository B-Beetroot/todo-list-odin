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

export function currentProjects() {
  const data = localStorage.getItem(getProjectKey());
  if (!data) return [];
  return JSON.parse(data);
}


export function saveProject(project) {
  const projects = currentProjects(); // get existing ones
  projects.push(project);
  localStorage.setItem(getProjectKey(), JSON.stringify(projects));
}

currentProjects().forEach(project => {
  console.log(`Project: ${project.name} — ${project.description}`);
});


export function saveAllProjects(projects) {
  localStorage.setItem(getProjectKey(), JSON.stringify(projects));
}