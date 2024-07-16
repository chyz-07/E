let db;
const request = indexedDB.open('restaurantDB', 1);

request.onupgradeneeded = function (event) {
    const dbInstance = event.target.result;

    const mealsStore = dbInstance.createObjectStore('meals', { keyPath: 'id', autoIncrement: true });

    mealsStore.createIndex('name', 'name', { unique: false });
    mealsStore.createIndex('price', 'price', { unique: false });
};

request.onsuccess = function(event){
    db = event.target.result;
    console.log('成功打開數據庫');
};

request.onerror = function (event) {
    console.error("打開數據庫失敗", event.target.errorCode);
};

document.getElementById('orderForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const table = event.target.table.value;
    const headcount = event.target.headcount.value;
    const choose = event.target.choose.value;

    const transaction = db.transaction(['meals'], 'readwrite');
    const mealsStore = transaction.objectStore('meals');

    const meal = {
        table: table,
        headcount: headcount,
        choose: choose,
    }

    const request = mealsStore.add(meal);

    request.onsuccess = function () {
        console.log("成功添加到數據庫");
    };

    request.onerror = function (event) {
        console.log("添加到數據庫失敗", event.target.errorCode);
    };
});