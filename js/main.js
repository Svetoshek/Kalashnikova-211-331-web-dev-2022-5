// получаем данные из запроса в буфер
// for await (const chunk of request) {
//   buffers.push(chunk);
let field = document.querySelector(".search-field");
let ul = document.getElementById("list");

function downloadData(page = 1, perPage = 5) {
  let xhr = new XMLHttpRequest();
  let url = new URL("http://cat-facts-api.std-900.ist.mospolytech.ru/facts");
  url.searchParams.append("page", page);
  url.searchParams.append("per-page", perPage);
  xhr.open("GET", url);
  xhr.responseType = "json";
  xhr.send();
  xhr.onload = function () {
    let data = xhr.response;
    renderRecords(data["records"]);
    setPaginationInfo(data["_pagination"]);
    renderPagination(data["_pagination"]);
  };
}

function renderRecords(records) {
  let recList = document.querySelector(".records-list");
  recList.innerHTML = "";
  records.forEach(function (record) {
    let createDiv = document.createElement("div");
    createDiv.classList.add("list-item");
    createDiv.append(createContent(record));
    createDiv.append(createFooter(record));
    recList.append(createDiv);
  });
}

function createContent(record) {
  let createDiv = document.createElement("div");
  createDiv.classList.add("item-content");
  createDiv.innerHTML = record.text;
  return createDiv;
}

function createFooter(record) {
  let createDiv = document.createElement("div");
  createDiv.classList.add("item-footer");
  createDiv.append(createFooterAuthor(record.user));
  createDiv.append(createFooterLike(record));
  return createDiv;
}

function createFooterAuthor(user) {
  let createDiv = document.createElement("div");
  createDiv.classList.add("item-footer-author");
  if (user) {
    createDiv.innerHTML = user.name.first + " " + user.name.last;
  }
  return createDiv;
}

function createFooterLike(record) {
  let createDiv = document.createElement("div");
  createDiv.classList.add("item-footer-like");
  createDiv.innerHTML = record.upvotes;
  return createDiv;
}

function setPaginationInfo(pagination) {
  let fromPage = document.querySelector(".from-page");
  let toPage = document.querySelector(".to-page");
  let allPage = document.querySelector(".all-page");
  if (pagination.total_count != 0) {
    fromPage.innerHTML =
      1 + (pagination.current_page - 1) * pagination.per_page;
    toPage.innerHTML = Math.min(
      pagination.current_page * pagination.per_page,
      pagination.total_count
    );
  } else {
    fromPage.innerHTML = 0;
    toPage.innerHTML = 0;
  }
  allPage.innerHTML = pagination.total_count;
}

function perPageSelector(event) {
  downloadData(1, event.target.value);
}

function createPageBtn(page, classes = []) {
  let button = document.createElement("button");
  classes.push("btn");
  button.classList.add(...classes);
  button.innerHTML = page;
  button.dataset.page = page;
  return button;
}

function renderPagination(pagination) {
  let paginationElement = document.querySelector(".pagination");
  paginationElement.innerHTML = "";
  let button = createPageBtn(1, ["first-page-btn"]);
  button.innerHTML = "Первая страница";
  paginationElement.append(button);

  if (pagination.current_page == 1) button.classList.add("hidden");

  let start, end;
  start = Math.max(pagination.current_page - 2, 1);
  end = Math.min(pagination.current_page + 2, pagination.total_pages);

  let createDiv = document.createElement("div");
  createDiv.classList.add("page-btn");
  paginationElement.append(createDiv);

  for (let i = start; i <= end; i++) {
    button = createPageBtn(i, pagination.current_page == i ? ["active"] : []);
    createDiv.append(button);
  }

  button = createPageBtn(pagination.total_pages, ["last-page-btn"]);
  button.innerHTML = "Последняя страница";
  paginationElement.append(button);

  if (pagination.current_page == pagination.total_pages)
    button.classList.add("hidden");
}

function pageBtnHandler(event) {
  if (event.target.tagName != "BUTTON") return;

  let page = event.target.dataset.page;
  downloadData(page, document.querySelector(".per-page").value);
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
  let perPage = document.querySelector(".per-page");
  let searchButton = document.querySelector(".search-btn");
  let paginationElement = document.querySelector(".pagination");
  perPage.addEventListener("change", perPageSelector);
    paginationElement.addEventListener("click", pageBtnHandler);
  searchButton.onclick = searchButtonHandler;
  field.oninput = autocompleteHandler;
};
