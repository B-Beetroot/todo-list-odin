import "./styles/styles.css";

class TodoItem {
  constructor({ title, description, dueDate, priority, notes = "", checklist = [] }) {
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
    this.notes += noteText;
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



}

const task = new TodoItem({
  title: "The title",
  description: "the description",
  dueDate: "2025-09-10",
  priority: "high",
  notes: "the note",
  checklist: ["first checklist ", "second checklist", "third checklist"],
});


task.completed = true;



task.addNote(" additional note");
task.toggleChecklistItem(0); 
task.toggleChecklistItem(1);
task.toggleChecklistItem(2);  

console.log(task.notes);
console.log(task.isChecklistComplete()); 