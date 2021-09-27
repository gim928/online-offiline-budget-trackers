let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};
request.onsucess = function (event) {
  db = event.target.result;

  if (navigator.online) {
    checkDb();
  }
};

request.onerror = function (event) {
  db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

function checkDb() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();

  getAll.onsucess = function () {
    if (getAll.onsucess.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          // delete records if successful
          const transaction = db.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");
          store.clear();
        });
    }
  };
}
function deletePending() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  store.clear();
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);
