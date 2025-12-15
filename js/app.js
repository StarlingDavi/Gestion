document.addEventListener("DOMContentLoaded", () => {
    const LS_KEY = "campus_tasks_v1";
    const el = (id) => document.getElementById(id);

   
    const modal = el("modalBackdrop");
    const taskForm = el("taskForm");
    const addTaskBtn = el("addTaskBtn");
    const closeModalBtn = el("closeModalBtn");
    const cancelBtn = el("cancelBtn");
    const deleteBtn = el("deleteBtn");
    const saveBtn = el("saveBtn");

    const searchInput = el("searchInput");
    const filterSelect = el("filterSelect");
    const sortSelect = el("sortSelect");

    const colProgress = el("colProgress");
    const colCompleted = el("colCompleted");
    const colOverdue = el("colOverdue");

    const countProgress = el("countProgress");
    const countCompleted = el("countCompleted");
    const countOverdue = el("countOverdue");

    const required = {
        modal, taskForm, addTaskBtn, closeModalBtn, cancelBtn, deleteBtn, saveBtn,
        searchInput, filterSelect, sortSelect,
        colProgress, colCompleted, colOverdue,
        countProgress, countCompleted, countOverdue
    };

    const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
    if (missing.length) {
        console.error("Faltan IDs en el HTML:", missing);
        // Si falta algo, no seguimos para evitar que “se muera” todo.
        return;
    }

    
    let tasks = load() ?? seed();
    let editingId = null;

    
    function load() {
        try { return JSON.parse(localStorage.getItem(LS_KEY)); }
        catch { return null; }
    }
    function persist() {
        localStorage.setItem(LS_KEY, JSON.stringify(tasks));
    }

    
    function seed() {
        const today = new Date();
        const iso = (d) => d.toISOString().slice(0, 10);
        const addDays = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return iso(d); };

        return [
            { id: Date.now(), dueDate: addDays(1), time: "18:00", subject: "UX Design", category: "Proyecto", priority: "Alta", status: "In Progress", title: "User Flow", description: "Definir pantallas, estados y flujo principal del usuario en el dashboard.", progress: 3 },
            { id: Date.now() + 1, dueDate: addDays(-2), time: "09:00", subject: "Programación Web", category: "Development", priority: "Media", status: "Over-Due", title: "Website Design", description: "Estructurar layout responsive, componentes, y validación de formulario.", progress: 4 },
            { id: Date.now() + 2, dueDate: addDays(0), time: "18:00", subject: "Auditoría", category: "Lectura", priority: "Baja", status: "Completed Task", title: "Lectura NIC/NIIF", description: "Resumen + puntos clave para discusión en clase.", progress: 10 }
        ];
    }

    
    function openModal(title) {
        el("modalTitle").textContent = title;
        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false");
    }
    function closeModal() {
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
    }

    function unlockForm() {
        ["dueDate", "time", "subject", "category", "priority", "status", "progress", "title", "description"]
            .forEach(fid => el(fid).disabled = false);
        saveBtn.style.display = "inline-flex";
    }

    function resetForm() {
        taskForm.reset();
        el("taskId").value = "";
        editingId = null;
        deleteBtn.style.display = "none";
        saveBtn.textContent = "Guardar";
        saveBtn.style.display = "inline-flex";
        unlockForm();
    }

    
    function prioClass(p) {
        if (p === "Alta") return "prio-high";
        if (p === "Media") return "prio-med";
        return "prio-low";
    }
    function shortDate(iso) {
        const d = new Date(iso + "T00:00:00");
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yy = String(d.getFullYear()).slice(-2);
        return `${ dd } /${mm}/${ yy }`;
    }
    function formatTime(hhmm) {
        if (!hhmm) return "";
        const [h, m] = hhmm.split(":").map(Number);
        const ampm = h >= 12 ? "PM" : "AM";
        const hr = ((h + 11) % 12) + 1;
        return `${ hr }:${ String(m).padStart(2, "0") } ${ ampm }`;
    }
    function esc(s) {
        return String(s ?? "")
            .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
    }

    
    function getView() {
        let arr = [...tasks];

        const q = searchInput.value.trim().toLowerCase();
        if (q) {
            arr = arr.filter(t =>
                (t.title || "").toLowerCase().includes(q) ||
                (t.description || "").toLowerCase().includes(q) ||
                (t.subject || "").toLowerCase().includes(q) ||
                (t.category || "").toLowerCase().includes(q)
            );
        }

        const pf = filterSelect.value;
        if (pf) arr = arr.filter(t => t.priority === pf);

        const prioScore = (p) => (p === "Alta" ? 3 : p === "Media" ? 2 : 1);
        const sort = sortSelect.value;

        arr.sort((a, b) => {
            if (sort === "dateAsc") return (a.dueDate || "").localeCompare(b.dueDate || "");
            if (sort === "dateDesc") return (b.dueDate || "").localeCompare(a.dueDate || "");
            if (sort === "prioDesc") return prioScore(b.priority) - prioScore(a.priority);
            if (sort === "prioAsc") return prioScore(a.priority) - prioScore(b.priority);
            return 0;
        });

        return arr;
    }

    function card(t) {
        const dChip = t.dueDate ? `📅 ${shortDate(t.dueDate)}` : ""
        const tChip = t.time ? `🕒 ${formatTime(t.time)}` : "";

        const node = document.createElement("article");
        node.className = `card ${prioClass(t.priority)}`;

        node.innerHTML = `
        <div class="topline">
            <div class="chips">
            <span class="chip">${esc(t.priority)}</span>
            <span class="chip">${esc(t.status === "Over-Due" ? dChip : tChip)}</span>
            ${t.category ? `<span class="chip tag">${esc(t.category)}</span>` : ""}
            </div>
            <button class="ib" type="button" data-action="view" data-id="${t.id}" title="Ver">👁️</button>
        </div>

        <div class="title">${esc(t.title)}</div>
        <p class="desc">${esc(t.description)}</p>

        <div class="progress">☰ ${Number(t.progress || 0)}/10</div>

        <div class="foot">
            <span class="chip">${esc(t.subject)}</span>
            <div class="actions">
            <button class="ib" type="button" data-action="edit" data-id="${t.id}" title="Editar">✏️</button>
            <button class="ib danger" type="button" data-action="delete" data-id="${t.id}" title="Eliminar">🗑️</button>
            </div>
        </div>
            `;
        return node;
    }


    function render() {
        colProgress.innerHTML = "";
        colCompleted.innerHTML = "";
        colOverdue.innerHTML = "";

        const view = getView();
        const buckets = { "In Progress": [], "Completed Task": [], "Over-Due": [] };
        view.forEach(t => (buckets[t.status] ??= []).push(t));

        countProgress.textContent = buckets["In Progress"].length;
        countCompleted.textContent = buckets["Completed Task"].length;
        countOverdue.textContent = buckets["Over-Due"].length;

        const mount = (col, list) => {
            if (list.length === 0) {
                const e = document.createElement("div");
                e.className = "card prio-med";
                e.style.opacity = "0.7";
                e.innerHTML = `<div class="title">Sin tareas</div><p class="desc">Agrega una para verla aquí.</p>`;
                col.appendChild(e);
                return;
            }
            list.forEach(t => col.appendChild(card(t)));
        };

        mount(colProgress, buckets["In Progress"]);
        mount(colCompleted, buckets["Completed Task"]);
        mount(colOverdue, buckets["Over-Due"]);

        persist();
    }

    
    function addTask() {
        resetForm();
        openModal("Nueva tarea");
    }

    function editTask(id) {
        const t = tasks.find(x => x.id === id);
        if (!t) return;

        editingId = id;
        el("taskId").value = t.id;
        el("dueDate").value = t.dueDate || "";
        el("time").value = t.time || "";
        el("subject").value = t.subject || "";
        el("category").value = t.category || "";
        el("priority").value = t.priority || "Media";
        el("status").value = t.status || "In Progress";
        el("progress").value = Number(t.progress || 0);
        el("title").value = t.title || "";
        el("description").value = t.description || "";

        deleteBtn.style.display = "inline-flex";
        saveBtn.textContent = "Actualizar";
        openModal("Editar tarea");
    }

    function viewTask(id) {
        const t = tasks.find(x => x.id === id);
        if (!t) return;

        editTask(id);
        ["dueDate", "time", "subject", "category", "priority", "status", "progress", "title", "description"]
            .forEach(fid => el(fid).disabled = true);

        deleteBtn.style.display = "none";
        saveBtn.style.display = "none";
        el("modalTitle").textContent = "Detalles";
    }

    function removeTask(id) {
        if (!confirm("¿Eliminar esta tarea?")) return;
        tasks = tasks.filter(x => x.id !== id);
        render();
    }

    
    addTaskBtn.addEventListener("click", addTask);

    closeModalBtn.addEventListener("click", () => { closeModal(); resetForm(); });
    cancelBtn.addEventListener("click", () => { closeModal(); resetForm(); });

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeModal();
            resetForm();
        }
    });

    deleteBtn.addEventListener("click", () => {
        if (!editingId) return;
        removeTask(editingId);
        closeModal();
        resetForm();
    });

    taskForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const payload = {
            id: editingId ?? Date.now(),
            dueDate: el("dueDate").value,
            time: el("time").value,
            subject: el("subject").value.trim(),
            category: el("category").value.trim(),
            priority: el("priority").value,
            status: el("status").value,
            progress: Number(el("progress").value || 0),
            title: el("title").value.trim(),
            description: el("description").value.trim(),
        };

        if (editingId) {
            tasks = tasks.map(t => t.id === editingId ? payload : t);
        } else {
            tasks.unshift(payload);
        }

        render();
        closeModal();
        resetForm();
    });

    // Delegation: botones de cada card (view/edit/delete)
    document.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-action]");
        if (!btn) return;

        const id = Number(btn.dataset.id);
        const action = btn.dataset.action;

        if (action === "view") viewTask(id);
        if (action === "edit") { unlockForm(); saveBtn.style.display = "inline-flex"; editTask(id); }
        if (action === "delete") removeTask(id);
    });

    searchInput.addEventListener("input", render);
    filterSelect.addEventListener("change", render);
    sortSelect.addEventListener("change", render);

    // Init
    deleteBtn.style.display = "none";
    render();
});



