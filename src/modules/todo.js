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

    addNote(noteText) {
        this.notes = noteText;
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