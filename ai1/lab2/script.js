document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const nameInput = document.getElementById('namebox');
    const dateInput = document.getElementById('datebox');
    const taskList = document.getElementById('tasklist');
    const searchBox = document.getElementById('searchbox');
    const taskCounter = document.getElementById('task-counter');

    document.getElementById("datebox").min = new Date().getFullYear() + "-" +  parseInt(new Date().getMonth() + 1 ) + "-" + new Date().getDate()

    const STORAGE_KEY = 'todo_tasks';

    let tasks = [];

    function saveTasks() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        } catch (e) {
            console.error('Failed to save tasks to localStorage', e);
        }
    }

    function loadTasks() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            tasks = raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Failed to load tasks from localStorage', e);
            tasks = [];
        }
    }

    function createTaskElement(task) {
        const container = document.createElement('div');
        container.className = 'task';
        container.dataset.id = task.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'checkboxclass';
        checkbox.checked = !!task.completed;
        checkbox.addEventListener('change', () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks(searchBox.value);
        });

        const content = document.createElement('div');
        content.className = 'task-content';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'task-name';
        nameSpan.textContent = task.name;
        nameSpan.tabIndex = 0;

        const dateSpan = document.createElement('span');
        dateSpan.className = 'task-date';
        dateSpan.textContent = task.date || '';
        dateSpan.tabIndex = 0;

        nameSpan.addEventListener('click', () => enableInlineEdit(task, nameSpan, 'name'));
        dateSpan.addEventListener('click', () => enableInlineEdit(task, dateSpan, 'date'));

        content.appendChild(nameSpan);
        content.appendChild(document.createTextNode(' '));
        content.appendChild(dateSpan);

        const trashBtn = document.createElement('button');
        trashBtn.type = 'button';
        trashBtn.className = 'trash-button';
        const img = document.createElement('img');
        img.src = 'images/trash.png';
        img.alt = 'Delete Button';
        img.className = 'trash-icon';
        trashBtn.appendChild(img);
        trashBtn.addEventListener('click', () => {
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            renderTasks(searchBox.value);
        });

        container.appendChild(checkbox);
        container.appendChild(content);
        container.appendChild(trashBtn);

        if (task.completed) container.classList.add('completed');

        return container;
    }

    function enableInlineEdit(task, spanElem, field) {
        if (spanElem.dataset.editing === '1') return;
        spanElem.dataset.editing = '1';

        let input;
        if (field === 'date') {
            input = document.createElement('input');
            input.type = 'date';
            input.value = task.date || '';
        } else {
            input = document.createElement('input');
            input.type = 'text';
            input.value = task.name;
            input.maxLength = 255;
        }

        const parent = spanElem.parentElement;
        parent.replaceChild(input, spanElem);
        input.focus();

        function finish(save) {
            if (save) {
                const v = input.value.trim();
                if (field === 'date') {
                    task.date = v;
                } else if (v.length > 0) {
                    task.name = v;
                }
                saveTasks();
            }

            if (field === 'date') spanElem.textContent = task.date || '';
            else spanElem.textContent = task.name;
            spanElem.dataset.editing = '0';
            parent.replaceChild(spanElem, input);
            renderTasks(searchBox.value);
        }

        input.addEventListener('blur', () => finish(true));

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                input.blur();
            } else if (e.key === 'Escape') {
                input.value = field === 'date' ? (task.date || '') : task.name;
                input.blur();
            }
        });
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    }

    function highlight(text, q) {
        if (!q) return escapeHtml(text);
        const re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
        return escapeHtml(text).replace(re, '<span class="highlight">$1</span>');
    }

    function renderTasks(filter = '') {
        const q = (filter || '').toLowerCase();
        taskList.innerHTML = '';
        const fragment = document.createDocumentFragment();
        tasks.forEach(task => {
            if (q && q.length >= 2) {
                if (!task.name.toLowerCase().includes(q)) return;
            }
            const el = createTaskElement(task);
            const nameSpan = el.querySelector('.task-name');
            if (nameSpan) {
                const original = task.name || '';
                if (q && q.length >= 2) {
                    nameSpan.innerHTML = highlight(original, q);
                } else {
                    nameSpan.textContent = original;
                }
            }
            fragment.appendChild(el);
        });
        taskList.appendChild(fragment);
        updateCounter();
    }

    function updateCounter() {
        if (!taskCounter) return;
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        if (total==0){
            taskCounter.textContent = `add a new task below`;
        } else {
            taskCounter.textContent = `${completed}/${total} tasks completed`;
        }
        if(completed==total && total!=0){
            taskCounter.textContent = `All tasks have been completed!`;
        }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = (nameInput.value || '').trim();
        const date = dateInput.value || '';
        if (name.length < 1) return;
        const task = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2,8),
            name,
            date,
            completed: false
        };
        tasks.push(task);
        saveTasks();
        renderTasks(searchBox.value);
        nameInput.value = '';
        dateInput.value = '';
        nameInput.focus();
    });

    searchBox.addEventListener('input', () => renderTasks(searchBox.value));

    loadTasks();
    renderTasks();
    updateCounter();
});