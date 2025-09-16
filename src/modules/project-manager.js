import { Project } from "./projects.js";

export class ProjectManager {
    constructor(storageKey = "projects") {
        this.storageKey = storageKey;
    }

    getProjectKey() {
        return this.storageKey;
    }

    createProject(project) {
        const projects = this.getAllProjects();
        projects.push(project);
        this._saveProjects(projects);
    }

    getAllProjects() {
        try {
            const raw = localStorage.getItem(this.getProjectKey());
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return parsed.map(Project.fromJSON);
        } catch (e) {
            console.error("Failed to load projects:", e);
            return [];
        }
    }

    getProjectById(id) {
        return this.getAllProjects().find(p => p.id === id);
    }

    updateProject(id, updates) {
        const projects = this.getAllProjects();
        const index = projects.findIndex(p => p.id === id);
        if (index === -1) return null;
        Object.assign(projects[index], updates);
        this._saveProjects(projects);
        return projects[index];
    }

    deleteProject(id) {
        const projects = this.getAllProjects().filter(p => p.id !== id);
        this._saveProjects(projects);
    }

    _saveProjects(projects) {
        try {
            const serialized = projects.map(p => p.toJSON());
            localStorage.setItem(this.getProjectKey(), JSON.stringify(serialized));
        } catch (e) {
            console.error("Failed to save projects:", e);
        }
    }
}