
function getTodoKey() {
	const STORAGE_KEY = "todos";
	return STORAGE_KEY
}

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

export const TodoStore = {
    getAll() {
        const raw = localStorage.getItem(getTodoKey());
        if (!raw) return [];
        return JSON.parse(raw).map(data => TodoItem.fromJSON(data));
    },

    getById(id) {
        return this.getAll().find(todo => todo.id === id);
    },

    add(todoItem) {
        const todos = this.getAll();
        todos.push(todoItem);
        this.saveAll(todos);
    },

    update(updatedItem) {
        const todos = this.getAll().map(todo =>
            todo.id === updatedItem.id ? updatedItem : todo
        );
        this.saveAll(todos);
    },

    delete(id) {
        const todos = this.getAll().filter(todo => todo.id !== id);
        this.saveAll(todos);
    },

    saveAll(todos) {
        localStorage.setItem(getTodoKey(), JSON.stringify(todos.map(todo => todo.toJSON())));
    }
};
