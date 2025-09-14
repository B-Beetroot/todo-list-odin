
export function getContent() {
	return document.querySelector("#content");
}

export function clearContent() {
	const content = getContent();
	while (content.firstChild) {
		content.removeChild(content.firstChild); 
	}
}

export function getPageHeader() {
	return document.querySelector("#page-header");
}

export function clearPageHeader() {
	const content = getPageHeader();
	while (content.firstChild) {
		content.removeChild(content.firstChild); 
	}
}

export function createLabeledInput(labelText, type) {
	const label = document.createElement("label");
	label.textContent = labelText;
	const input = document.createElement(type === "textarea" ? "textarea" : "input");
	if (type !== "textarea") input.type = type;
	input.required = true;
	return { label, input };
}

export function createLabeledSelect(labelText, options = [], defaultValue = "") {
	const label = document.createElement("label");
	label.textContent = labelText;

	const select = document.createElement("select");

	options.forEach(level => {
		const option = document.createElement("option");
		option.value = level;
		option.textContent = level;
		if (level === defaultValue) {
			option.selected = true;
		}
		select.appendChild(option);
	});

	return { label, select };
}

export function createTitle(headerSize,pageTitleText) {
	const pageTitle = document.createElement(headerSize);
	pageTitle.textContent = pageTitleText;
	return pageTitle;
}

export function createButton(label, onClick, className = "", id = "") {
	const btn = document.createElement("button");
	btn.textContent = label;
	btn.onclick = onClick;

	if (className) btn.classList.add(...className.split(" "));
	if (id) btn.id = id;

	return btn;
}

export function createDiv(className = "", id = "", children = []) {
	const div = document.createElement("div");

	if (className) div.classList.add(...className.split(" "));
	if (id) div.id = id;

	children.forEach(child => {
		if (child instanceof Node) {
			div.appendChild(child);
		}
	});
	return div;
}

export function createListbox(options = [], className = "", size = 10) {
    const select = document.createElement("select");
    select.multiple = true;
    select.size = Math.min(size, options.length);

    if (className) select.classList.add(...className.split(" "));

    options.forEach(({ value, label }) => {
        const opt = document.createElement("option");
        opt.value = value;
        opt.textContent = label;
        select.appendChild(opt);
    });

    return select;
}

export function createSection(titleText, children = [], headerSize = "h3", className = "") {
    const section = createDiv(className);
    const title = createTitle(headerSize, titleText);
    section.appendChild(title);

    children.forEach(child => {
        if (child instanceof Node) section.appendChild(child);
    });

    return section;
}

export function createLabel(text) {
    const label = document.createElement("label");
    label.textContent = text;
    return label;
}

export function createSelect(options = [], defaultValue = "") {
    const select = document.createElement("select");

    options.forEach(optionText => {
        const option = document.createElement("option");
        option.value = optionText;
        option.textContent = optionText;
        if (optionText === defaultValue) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    return select;
}