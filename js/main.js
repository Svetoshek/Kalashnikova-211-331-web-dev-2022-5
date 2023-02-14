var field = document.querySelector(".search-field");
var ul = document.getElementById("list");
let autoCompleteList = document.querySelector(".list-auto-completion");
let factsList = document.querySelector(".facts-list");

function downloadData(page = 1) {
  let url = new URL(factsList.dataset.url);
  let perPage = document.querySelector(".per-page-btn").value;
  url.searchParams.append("page", page);
  url.searchParams.append("per-page", perPage);
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.responseType = "json";
  xhr.onload = function () {
    renderRecords(this.response.records);
    setPaginationInfo(this.response["_pagination"]);
    renderPaginationElement(this.response["_pagination"]);
  };
  xhr.send();
}

function createAuthorElement(record) {
  let user = record.user || { name: { first: "", last: "" } };
  let authorElement = document.createElement("div");
  authorElement.classList.add("author-name");
  authorElement.innerHTML = user.name.first + " " + user.name.last;
  return authorElement;
}

function createFooterElement(record) {
  let footerElement = document.createElement("div");
  footerElement.classList.add("item-footer");
  footerElement.append(createAuthorElement(record));
  return footerElement;
}

function createContentElement(record) {
  let contentElement = document.createElement("div");
  contentElement.classList.add("item-content");
  contentElement.innerHTML = record.text;
  return contentElement;
}

function createListItemElement(record) {
  let itemElement = document.createElement("div");
  itemElement.classList.add("facts-list-item");
  itemElement.append(createContentElement(record));
  itemElement.append(createFooterElement(record));
  return itemElement;
}

function renderRecords(records) {
  let factsList = document.querySelector(".facts-list");
  factsList.innerHTML = "";
  for (let i = 0; i < records.length; i++) {
    factsList.append(createListItemElement(records[i]));
  }
}

function setPaginationInfo(pagination) {
  document.querySelector(".total-count").innerHTML = pagination.total_count;
  let start =
    pagination.total_count &&
    (pagination.current_page - 1) * pagination.per_page + 1;
  document.querySelector(".current-interval-start").innerHTML = start;
  let end = Math.min(pagination.total_count, start + pagination.per_page - 1);
  document.querySelector(".current-interval-end").innerHTML = end;
}

function createPageBtn(page, classes = []) {
  let btn = document.createElement("button");
  classes.push("btn");
  for (cls of classes) {
    btn.classList.add(cls);
  }
  btn.dataset.page = page;
  btn.innerHTML = page;
  return btn;
}

function renderPaginationElement(pagination) {
  let btn;
  let paginationContainer = document.querySelector(".pagination");
  paginationContainer.innerHTML = "";

  btn = createPageBtn(1, ["first-page-btn"]);
  btn.innerHTML = "Первая страница";
  if (pagination.current_page == 1) {
    btn.style.visibility = "hidden";
  }
  paginationContainer.append(btn);

  let buttonsContainer = document.createElement("div");
  buttonsContainer.classList.add("pages-btns");
  paginationContainer.append(buttonsContainer);

  let start = Math.max(pagination.current_page - 2, 1);
  let end = Math.min(pagination.current_page + 2, pagination.total_pages);
  for (let i = start; i <= end; i++) {
    btn = createPageBtn(i, i == pagination.current_page ? ["active"] : []);
    buttonsContainer.append(btn);
  }

  btn = createPageBtn(pagination.total_pages, ["last-page-btn"]);
  btn.innerHTML = "Последняя страница";
  if (pagination.current_page == pagination.total_pages) {
    btn.style.visibility = "hidden";
  }
  if (pagination.total_count == 0) {
    btn.style.visibility = "hidden";
  }
  paginationContainer.append(btn);
}

function perPageBtnHandler(event) {
  downloadData(1, field.value);
}

function pageBtnHandler(event) {
  if (event.target.dataset.page) {
    downloadData(event.target.dataset.page, field.value);
    window.scrollTo(0, 0);
  }
}

function deleteArray() {
  ul.classList.add("hidden");
  while (ul.firstChild) {
    ul.removeChild(ul.firstChild);
  }
}

function searchButtonHandler(event) {
  downloadData(1, field.value);
  deleteArray();
}

function autocompleteLiHandler(event) {
  field.value = event.target.innerHTML;
  deleteArray();
}

function renderAutocompleat(list) {
  if (list.length == 0) {
    ul.classList.add("hidden");
  } else {
    ul.classList.remove("hidden");
  }
  let listItems = document.createElement("ul");
  for (let i = 0; i <= list.length - 1; i++) {
    let li = document.createElement("li");
    li.innerHTML = list[i];
    li.onclick = autocompleteLiHandler;
    listItems.append(li);
  }
  ul.append(listItems);
}

function autocompleteHandler() {
  deleteArray();
  let url = new URL(
    "http://cat-facts-api.std-900.ist.mospolytech.ru/autocomplete"
  );
  url.searchParams.append("q", field.value);
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.responseType = "json";
  xhr.onload = function (data) {
    renderAutocompleat(this.response);
  };
  xhr.send();
}

window.onload = function () {
  downloadData();
  let searchButton = document.querySelector(".search-btn");
  document.querySelector(".pagination").onclick = pageBtnHandler;
  document.querySelector(".per-page-btn").onchange = perPageBtnHandler;
  searchButton.onclick = searchButtonHandler;
  field.oninput = autocompleteHandler;
};
