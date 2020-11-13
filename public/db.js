let db;
const request = window.indexedDB.open('budget', 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  // create object store called "pending" and set autoIncrement true
  db.createObjectStore('pending', {
    autoIncrement: true
  });
};

request.onsuccess = function(event) {
  db = event.target.result;

  if(navigator.onLine) {
    checkDatabase();
  }
};
// handle error
request.onerror = function (event) {
  console.log(event);
}

const saveRecord = (record) => {
  // create a transaction on the pending db with readwrite access
  const transaction = db.transaction(['pending'], 'readwrite');
  // access your pending object store
  const budgetStore = transaction.objectStore('pending');
  budgetStore.add(record);
}

const checkDatabase = () => {
  const transaction = db.transaction(['pending'], 'readwrite');
  const budgetStore = transaction.objectStore('pending');
  const getAll = budgetStore.getAll();
  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type' : 'application/json'
        }
      }).then(response => response.json())
        .then(() => {
          const transaction = db.transaction(['pending'], 'readwrite');
          const store = transaction.objectStore('pending');
          store.clear();
        });
    }
  };
}

window.addEventListener('online', checkDatabase);