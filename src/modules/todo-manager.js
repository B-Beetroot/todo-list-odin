import { TodoItem } from "./todo.js";

export class TodoManager {
    constructor(storageKey = "todos") {
        this.storageKey = storageKey;
    }

    _loadTodos() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (!raw) return [];
            return JSON.parse(raw).map(data => TodoItem.fromJSON(data));
        } catch (e) {
            console.error("Failed to load todos:", e);
            return [];
        }
    }

    _saveTodos(todos) {
        try {
            const serialized = todos.map(todo => todo.toJSON());
            localStorage.setItem(this.storageKey, JSON.stringify(serialized));
        } catch (e) {
            console.error("Failed to save todos:", e);
        }
    }

	getTodoKey(){
		return this.storageKey;
	}

    getAllTodo() {
        return this._loadTodos();
    }

    getTodoById(id) {
        return this.getAllTodo().find(todo => todo.id === id);
    }

    addTodo(todoItem) {
        const todos = this.getAllTodo();
        todos.push(todoItem);
        this._saveTodos(todos);
    }

    updateTodo(updatedItem) {
        const todos = this.getAllTodo().map(todo =>
            todo.id === updatedItem.id ? updatedItem : todo
        );
        this._saveTodos(todos);
    }

    deleteTodo(id) {
        const todos = this.getAllTodo().filter(todo => todo.id !== id);
        this._saveTodos(todos);
    }
}
