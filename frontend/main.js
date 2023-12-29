const habits = document.querySelector(".list_trackers");
const addButton = document.querySelector("#add_tracker");
const closeDialog = document.querySelector("#close_dialog");
const dialog = document.querySelector("dialog");
const closeDialogHistory = document.querySelector(".close");
const form = document.querySelector("form");
const input = document.querySelector("input");
const toggleHabbits = document.querySelector("ul");
const btnHistory = document.querySelector("#history");
const displayHistory = document.querySelector("#dialog_history");
const headerTable = document.querySelector("#header_date");
const tbody = document.querySelector("tbody");
const today = new Date();
const formattedToday = today.toISOString().split("T")[0];
const startDate = "2023-12-11";

const startHabits = async () => {
  try {
    const response = await fetch("http://127.0.0.1:3000/habits");
    const data = await response.json();
    const pathData = data.listTracker.habits;
    await displayHabits(data.listTracker);
    checkDate(pathData);
    checkToggle(data.listTracker);
  } catch (err) {
    console.log("List non trouvé : " + err);
  }
};

const checkDate = async (listDate) => {
  for (const index in listDate) {
    const dataList = listDate[index].daysDone;

    let startDate = "2023-12-11";

    for (const key in dataList) {
      startDate = key;
    }

    const startDateObject = new Date(startDate);
    startDateObject.setDate(startDateObject.getDate() + 1);

    const currentDate = new Date();

    const allDate = calculDate(startDateObject, currentDate);
    const data = { allDate, index };
    const date = data.allDate;

    if (!date || Object.keys(date).length === 0) {
      continue;
    }

    await postJSON(data, "habits/days");
    console.log(data);
  }
};

const checkToggle = (data) => {
  const listDate = data.habits;
  for (const list in listDate) {
    const today = listDate[list].daysDone[formattedToday];
    const id = listDate[list].id;
    addToggleHabits(today, id);
  }
};

const displayHabits = async (data) => {
  const listHabits = data.habits;

  for (const element of listHabits) {
    const li = document.createElement("li");
    li.setAttribute("id", `habit-${element.id}`);
    habits?.appendChild(li);
    li.textContent = element.title;
  }
};
const calculDate = (firstDate, currentDate) => {
  let dateObject = {};

  for (
    let date = new Date(firstDate);
    date <= currentDate;
    date.setDate(date.getDate() + 1)
  ) {
    const formattedDate = date.toISOString().split("T")[0];
    dateObject[formattedDate] = false;
  }

  return dateObject;
};
const addNewHabits = async (value) => {
  try {
    const response = await fetch("http://127.0.0.1:3000/habits");
    const data = await response.json();
    const pathData = data.listTracker.habits;
    const id = pathData.length + 1;
    const startDate = new Date("2023-12-11");
    const currentDate = new Date();
    const date = calculDate(startDate, currentDate);
    const dataList = { id: id, title: value, daysDone: date };
    await postJSON(dataList, "habits");
    console.log("ajouter");
  } catch (err) {
    console.log("Erreur addNewHabits : " + err);
  }
};

const addToggleHabits = (data, id) => {
  const idPath = document.querySelector(`#habit-${id}`);
  if (data) {
    idPath?.classList.add("check");
  }
};

const generateArray = async () => {
  try {
    const response = await fetch("http://127.0.0.1:3000/habits");
    const newResponse = await response.json();
    const data = newResponse.listTracker.habits;
    generateArrayDate();
    generateArrayHistory(data);
  } catch (err) {
    console.log(`Erreur : ${err}`);
  }
};

const generateArrayDate = () => {
  while (headerTable?.firstChild) {
    headerTable.removeChild(headerTable.firstChild);
  }
  const dates = calculDate(startDate, today);
  const reversedDates = Object.keys(dates).reverse();
  const th = document.createElement("th");
  th.textContent = "Habits";
  headerTable?.appendChild(th);

  for (const date of reversedDates) {
    const td = document.createElement("td");
    td.textContent = date;
    headerTable?.appendChild(td);
  }
};

const generateArrayHistory = (data) => {
  while (tbody?.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }
  for (const element of data) {
    const title = element.title;
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.textContent = title;

    tbody?.appendChild(tr);
    tr.appendChild(td);
    console.log(element);
    const reversedDates = Object.keys(element.daysDone).reverse();

    for (const date of reversedDates) {
      const td2 = document.createElement("td");

      if (element.daysDone[date]) {
        td2.textContent = "💚";
      } else {
        td2.textContent = "🟥";
      }

      tr.appendChild(td2);
    }
  }
};
const postJSON = async (data, path) => {
  try {
    await fetch(`http://127.0.0.1:3000/${path}`, {
      method: "POST", //
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("ERREUR:", error + data);
  }
};

addButton.addEventListener("click", () => {
  dialog.showModal();
});

closeDialog?.addEventListener("click", () => {
  dialog?.close();
  if (!input?.value) return;
  addNewHabits(input.value);
});

closeDialogHistory?.addEventListener("click", () => {
  displayHistory?.close();
});

btnHistory.addEventListener("click", (e) => {
  displayHistory.showModal();
  generateArray();
});

document.addEventListener("submit", (e) => {
  e.preventDefault();
});

toggleHabbits.addEventListener("click", (e) => {
  const li = e.target;
  if (!li.id) return;

  const lastCharacter = li.id.slice(-1);
  if (!li.classList.value) {
    li.classList.add("check");
    console.log("test");
  } else {
    li.classList.remove("check");
  }
  postJSON(lastCharacter, "habits/id");
});

startHabits();
