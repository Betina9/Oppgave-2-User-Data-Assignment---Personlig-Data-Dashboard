const STORAGE_KEY = "cosplay-projects-v1";
const getAll = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
const saveAll = (arr) => localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
const uid = () => Math.random().toString(36).slice(2, 9);

const form = document.getElementById("cosplay-form");
const resetFormBtn = document.getElementById("reset-form");
const sortBy = document.getElementById("sort-by");
const summary = document.getElementById("summary");
const el = {
  id: document.getElementById("id"),
  character: document.getElementById("character"),
  series: document.getElementById("series"),
  status: document.getElementById("status"),
  hours: document.getElementById("hours"),
  cost: document.getElementById("cost"),
  date: document.getElementById("date"),
  materials: document.getElementById("materials"),
  image: document.getElementById("image"),
  list: document.getElementById("list"),
};

function elCreate(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on") && typeof v === "function")
      node.addEventListener(k.slice(2), v);
    else if (k === "src") node.src = v;
    else node.setAttribute(k, v);
  }
  children.flat().forEach((child) => {
    if (child)
      node.appendChild(
        typeof child === "string" ? document.createTextNode(child) : child
      );
  });
  return node;
}

function clearNode(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function renderList() {
  clearNode(el.list);
  const frag = document.createDocumentFragment();
  let data = getAll();

  // sort()
  data.sort((a, b) => {
    switch (sortBy.value) {
      case "date-asc":
        return (a.date || "") > (b.date || "") ? 1 : -1;
      case "date-desc":
        return (a.date || "") < (b.date || "") ? 1 : -1;
      case "character-asc":
        return (a.character || "").localeCompare(b.character || "");
      case "character-desc":
        return (b.character || "").localeCompare(a.character || "");
      case "hours-asc":
        return (a.hours || 0) - (b.hours || 0);
      case "hours-desc":
        return (b.hours || 0) - (a.hours || 0);
      case "cost-asc":
        return (a.cost || 0) - (b.cost || 0);
      case "cost-desc":
        return (b.cost || 0) - (a.cost || 0);
      default:
        return 0;
    }
  });

  if (data.length === 0) {
    frag.appendChild(
      elCreate("div", { class: "empty", text: "Ingen prosjekter enda." })
    );
  } else {
    data.forEach((item) => frag.appendChild(toItemNode(item)));
  }
  el.list.appendChild(frag);

  // reduce() til oppsummering
  const summaryData = data.reduce(
    (acc, cur) => {
      acc.count++;
      acc.hours += Number(cur.hours) || 0;
      acc.cost += Number(cur.cost) || 0;
      return acc;
    },
    { count: 0, hours: 0, cost: 0 }
  );
  summary.textContent = `${summaryData.count} prosjekter • ${summaryData.hours} timer • ${summaryData.cost} kr`;
}

function toItemNode(item) {
  const {
    id,
    character,
    series,
    status,
    hours,
    cost,
    date,
    materials,
    imageData,
  } = item;
  const title = elCreate("h3", { text: character || "Uten navn" });
  const meta = elCreate(
    "div",
    { class: "meta" },
    [
      `Serie: ${series || "—"}`,
      `Status: ${status || "—"}`,
      `Timer: ${hours || 0}`,
      `Kostnad: ${cost || 0} kr`,
      date ? `Dato: ${date}` : null,
      materials ? `Materialer: ${materials}` : null,
    ]
      .filter(Boolean)
      .map((t) => elCreate("div", { text: t }))
  );

  const left = elCreate("div", {}, [title, meta]);
  if (imageData) {
    const img = elCreate("img", {
      class: "thumb",
      src: imageData,
      alt: character,
    });
    left.appendChild(img);
  }
  const btnDel = elCreate("button", {
    class: "btn danger",
    text: "Slett",
    onclick: () => onDeleteById(id),
  });
  const right = elCreate("div", { class: "right" }, [btnDel]);

  const node = elCreate("div", { class: "item", dataset: { id } }, [
    left,
    right,
  ]);
  node.addEventListener("click", () => onEditById(id));
  return node;
}

function onDeleteById(id) {
  const next = getAll().filter((x) => x.id !== id);
  saveAll(next);
  renderList();
}

function onEditById(id) {
  const item = getAll().find((x) => x.id === id);
  if (!item) return;
  el.id.value = item.id;
  el.character.value = item.character || "";
  el.series.value = item.series || "";
  el.status.value = item.status || "";
  el.hours.value = item.hours || 0;
  el.cost.value = item.cost || 0;
  el.date.value = item.date || "";
  el.materials.value = item.materials || "";
  // bilde kan ikke lastes tilbake i file input, men beholdes ved lagring
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const idVal = el.id.value || uid();
  const file = el.image.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => saveItem(reader.result);
    reader.readAsDataURL(file);
  } else {
    const existing = getAll().find((d) => d.id === idVal);
    saveItem(existing ? existing.imageData : null);
  }

  function saveItem(imageData) {
    const item = {
      id: idVal,
      character: el.character.value.trim(),
      series: el.series.value.trim(),
      status: el.status.value.trim(),
      hours: Number(el.hours.value) || 0,
      cost: Number(el.cost.value) || 0,
      date: el.date.value,
      materials: el.materials.value.trim(),
      imageData,
    };
    const data = getAll();
    const exists = data.some((d) => d.id === idVal);
    const next = exists
      ? data.map((d) => (d.id === idVal ? item : d))
      : [...data, item];
    saveAll(next);
    form.reset();
    el.id.value = "";
    renderList();
  }
});

resetFormBtn.addEventListener("click", () => {
  form.reset();
  el.id.value = "";
});
sortBy.addEventListener("change", renderList);

renderList();
