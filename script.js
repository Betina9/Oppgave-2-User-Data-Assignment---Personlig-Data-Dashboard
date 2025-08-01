const STORAGE_KEY = "cosplay-projects-v1";
const getAll = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
const saveAll = (arr) => localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
const uid = () => Math.random().toString(36).slice(2, 9);

const form = document.getElementById("cosplay-form");
const resetFormBtn = document.getElementById("reset-form");
const el = {
  id: document.getElementById("id"),
  character: document.getElementById("character"),
  series: document.getElementById("series"),
  category: document.getElementById("category"),
  status: document.getElementById("status"),
  hours: document.getElementById("hours"),
  cost: document.getElementById("cost"),
  date: document.getElementById("date"),
  favorite: document.getElementById("favorite"),
  materials: document.getElementById("materials"),
  image: document.getElementById("image"),
  imagePreview: document.getElementById("image-preview"),
  imageClear: document.getElementById("image-clear"),
  list: document.getElementById("list"),
  stats: document.getElementById("stats"),
  filterCategory: document.getElementById("filter-category"),
  filterStatus: document.getElementById("filter-status"),
  sortBy: document.getElementById("sort-by"),
  seed: document.getElementById("seed"),
  clearAll: document.getElementById("clear-all"),
};

function elCreate(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on") && typeof v === "function")
      node.addEventListener(k.slice(2), v);
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
  const data = getAll();
  if (data.length === 0) {
    frag.appendChild(
      elCreate("div", { class: "empty", text: "Ingen prosjekter enda." })
    );
  } else {
    data.forEach((item) => frag.appendChild(toItemNode(item)));
  }
  el.list.appendChild(frag);
}

function toItemNode(item) {
  const { id, character, series, imageData } = item;
  const title = elCreate("h3", { text: character || "Uten navn" });
  const meta = elCreate("div", { class: "meta" }, [series || "—"]);
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
  return elCreate("div", { class: "item", dataset: { id } }, [left, right]);
}

function onDeleteById(id) {
  const next = getAll().filter((x) => x.id !== id);
  saveAll(next);
  renderList();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const idVal = el.id.value || uid();
  const reader = new FileReader();
  const file = el.image.files[0];

  reader.onload = () => {
    const item = {
      id: idVal,
      character: el.character.value.trim(),
      series: el.series.value.trim(),
      imageData: reader.result,
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
  };

  if (file) {
    reader.readAsDataURL(file);
  } else {
    const item = {
      id: idVal,
      character: el.character.value.trim(),
      series: el.series.value.trim(),
      imageData: null,
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

renderList();
