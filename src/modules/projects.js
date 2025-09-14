import { TodoItem } from './todo.js';
import { ProjectManager } from "./project-manager.js";

export class Project {
    constructor({ name, description = "" }) {
        this.id = crypto.randomUUID();
        this.name = name;
        this.description = description;
        this.todos = [];
    }

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

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            todos: this.todos.map(todo => todo.toJSON())
        };
    }

    static fromJSON(data) {
        const project = new Project({ name: data.name, description: data.description });
        project.id = data.id;
        project.todos = Array.isArray(data.todos)
            ? data.todos.map(todo => TodoItem.fromJSON(todo))
            : [];
        return project;
    }
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

const pm = new ProjectManager();
if (!localStorage.getItem(pm.getProjectKey())) {
    saveAllProjects(sampleProjects);
}

export function saveAllProjects(projects) {
    const pm = new ProjectManager();
    const serialized = projects.map(p => (typeof p.toJSON === "function" ? p.toJSON() : p));
    localStorage.setItem(pm.getProjectKey(), JSON.stringify(serialized));
}
