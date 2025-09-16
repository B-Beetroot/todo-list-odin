import { TodoItem } from "./todo.js";
import { ProjectManager } from "./project-manager.js";
import { TodoManager } from "./todo-manager.js";

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

const sampleTodos = [
    new TodoItem({
        title: "Buy groceries",
        description: "Pick up essentials from the supermarket",
        dueDate: "2025-09-14T17:00:00",
        priority: "Medium",
        checklist: ["Milk", "Eggs", "Bread", "Coffee"]
    }),
    new TodoItem({
        title: "Finish project report",
        description: "Complete and submit the final draft of the Q3 report",
        dueDate: "2025-09-15T09:00:00",
        priority: "High",
        notes: "Include updated revenue figures and client feedback",
        checklist: [
            { text: "Update financials", done: true },
            { text: "Review client notes", done: false },
            { text: "Proofread", done: false }
        ]
    }),
    new TodoItem({
        title: "Call plumber",
        description: "Fix the leaking kitchen faucet",
        dueDate: "2025-09-16T12:00:00",
        priority: "Low"
    }),
    new TodoItem({
        title: "Plan weekend trip",
        description: "Organize itinerary for hiking trip",
        dueDate: "2025-09-18T20:00:00",
        priority: "Medium",
        checklist: ["Book accommodation", "Pack gear", "Check weather"]
    }),
    new TodoItem({
        title: "Renew car insurance",
        description: "Policy expires soon—renew online",
        dueDate: "2025-09-20T23:59:00",
        priority: "High",
        notes: "Compare rates from at least 3 providers"
    }),

    new TodoItem({
        title: "Schedule annual health checkup",
        description: "Book appointment with GP and get blood work done",
        dueDate: "2026-03-10T10:30:00",
        priority: "High",
        checklist: ["Call clinic", "Fasting before test", "Bring insurance card"]
    }),
    new TodoItem({
        title: "Organize digital photo archive",
        description: "Sort and back up photos from the last 5 years",
        dueDate: "2026-07-01T18:00:00",
        priority: "Medium",
        notes: "Use external drive and cloud storage",
        checklist: [
            { text: "Sort by year", done: false },
            { text: "Delete duplicates", done: false },
            { text: "Upload to cloud", done: false }
        ]
    }),
    new TodoItem({
        title: "Renew passport",
        description: "Passport expires next year—start renewal process",
        dueDate: "2027-01-15T09:00:00",
        priority: "High",
        checklist: ["Fill application", "Take new photo", "Submit documents"]
    }),
    new TodoItem({
        title: "Start garden project",
        description: "Build raised beds and plant vegetables",
        dueDate: "2026-04-20T14:00:00",
        priority: "Medium",
        notes: "Focus on tomatoes, herbs, and leafy greens"
    }),
    new TodoItem({
        title: "Write personal memoir",
        description: "Begin outlining chapters for life story",
        dueDate: "2027-11-01T08:00:00",
        priority: "Low",
        checklist: [
            { text: "Draft childhood chapter", done: false },
            { text: "Outline major life events", done: false },
            { text: "Set writing schedule", done: false }
        ]
    })
];

const tm = new TodoManager();
if (!localStorage.getItem(tm.getTodoKey())) {
    saveAllTodos(sampleTodos);
}


export function saveAllTodos(todos) {
    const tm = new TodoManager();
    const serialized = todos.map(t => (typeof t.toJSON === "function" ? t.toJSON() : t));
    localStorage.setItem(tm.getTodoKey(), JSON.stringify(serialized));
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

sampleProjects.find(p => p.name === "Website Redesign").addTodo(
    sampleTodos.find(t => t.title === "Finish project report")
);

sampleProjects.find(p => p.name === "Mobile App").addTodo(
    sampleTodos.find(t => t.title === "Organize digital photo archive")
);

sampleProjects.find(p => p.name === "Bug Bash").addTodo(
    sampleTodos.find(t => t.title === "Call plumber")
);

sampleProjects.find(p => p.name === "Quarterly Report").addTodo(
    sampleTodos.find(t => t.title === "Renew car insurance")
);

sampleProjects.find(p => p.name === "Customer Survey").addTodo(
    sampleTodos.find(t => t.title === "Write personal memoir")
);

const pm = new ProjectManager();
if (!localStorage.getItem(pm.getProjectKey())) {
    saveAllProjects(sampleProjects);
}

export function saveAllProjects(projects) {
    const pm = new ProjectManager();
    const serialized = projects.map(p => (typeof p.toJSON === "function" ? p.toJSON() : p));
    localStorage.setItem(pm.getProjectKey(), JSON.stringify(serialized));
}
