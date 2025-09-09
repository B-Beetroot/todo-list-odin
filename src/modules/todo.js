
export class TodoItem {
  constructor({ title, description, dueDate, priority, notes = "", checklist = [] }) {
    this.id = crypto.randomUUID();
    this.title = title;
    this.description = description;
    this.dueDate = new Date(dueDate);
    this.priority = priority;
    this.completed = false;
    this.notes = notes;
    this.checklist = checklist.map(item => ({
      text: item,
      done: false
    }));
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

  toggleChecklistItem(index) {
    if (this.checklist[index]) {
      this.checklist[index].done = !this.checklist[index].done;
    }
  }

  isChecklistComplete() {
    return this.checklist.length > 0 && this.checklist.every(item => item.done);
  }
  
/*
  updateTitle(newTitle) {
    this.title = newTitle;
  }

  updateDescription(newDescription) {
    this.description = newDescription;
  }

  updateDueDate(newDate) {
    this.dueDate = new Date(newDate);
  }

  updatePriority(newPriority) {
    this.priority = newPriority;
  }

  clearNotes() {
    this.notes = "";
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
*/

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
}
