import { TodoManager } from "./todo-manager.js";

export class TodoItem {
    constructor({
        id = crypto.randomUUID(),
        title,
        description,
        dueDate,
        priority,
        notes = "",
        checklist = [],
        completed = false
    }) {
        if (!title || typeof title !== "string") {
            throw new Error("Title must be a non-empty string.");
        }

        const allowedPriorities = ["Low", "Medium", "High"];
        if (!allowedPriorities.includes(priority)) {
            throw new Error(`Priority must be one of: ${allowedPriorities.join(", ")}`);
        }

        this.id = id;
        this.title = title;
        this.description = description;
        this.dueDate = new Date(dueDate);
        this.priority = priority;
        this.completed = completed;
        this.notes = notes;

        this.checklist = checklist.map(item =>
            typeof item === "string"
                ? { text: item, done: false }
                : { text: item.text, done: !!item.done }
        );
    }

    toggleComplete() {
        this.completed = !this.completed;
    }

    addNote(noteText) {
        this.notes = noteText;
    }

    addChecklistItem(text) {
        this.checklist.push({ text, done: false });
    }

    removeChecklistItem(index) {
        if (index >= 0 && index < this.checklist.length) {
            this.checklist.splice(index, 1);
        }
    }

    editChecklistItem(index, newText) {
        if (this.checklist[index]) {
            this.checklist[index].text = newText;
        }
    }

    toggleChecklistItem(index) {
        if (this.checklist[index]) {
            this.checklist[index].done = !this.checklist[index].done;
        }
    }

    isChecklistComplete() {
        return this.checklist.length > 0 && this.checklist.every(item => item.done);
    }

    updateTitle(newTitle) {
        if (!newTitle || typeof newTitle !== "string") {
            throw new Error("Title must be a non-empty string.");
        }
        this.title = newTitle;
    }

    updateDescription(newDescription) {
        this.description = newDescription;
    }

    updateDueDate(newDate) {
        this.dueDate = new Date(newDate);
    }

    updatePriority(newPriority) {
        const allowedPriorities = ["Low", "Medium", "High"];
        if (!allowedPriorities.includes(newPriority)) {
            throw new Error(`Priority must be one of: ${allowedPriorities.join(", ")}`);
        }
        this.priority = newPriority;
    }

    isOverdue() {
        return !this.completed && new Date() > this.dueDate;
    }

    isDueToday() {
        const today = new Date();
        return this.dueDate.toDateString() === today.toDateString();
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            dueDate: this.dueDate.toISOString(),
            priority: this.priority,
            completed: this.completed,
            notes: this.notes,
            checklist: this.checklist
        };
    }

    static fromJSON(data) {
        return new TodoItem({
            id: data.id,
            title: data.title,
            description: data.description,
            dueDate: data.dueDate,
            priority: data.priority,
            completed: data.completed,
            notes: data.notes,
            checklist: data.checklist
        });
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
