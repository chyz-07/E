let urlParams; // 定義為全局變量

document.addEventListener('DOMContentLoaded', function () {
    urlParams = new URLSearchParams(window.location.search);
    const tableNumber = urlParams.get("table");
    const information = urlParams.get('information');
    const total_price = urlParams.get('total_price');
    const items = urlParams.get('items');

    document.getElementById('table').textContent = tableNumber;
    document.getElementById('information').textContent = information;

    const itemsContainer = document.getElementById('finishOrderList');
    const parsedItems = JSON.parse(decodeURIComponent(items));
    parsedItems.forEach(item => {
        const itemElement = document.createElement('li');
        itemElement.innerHTML = `<b><span class="name">${item.name}</span><span class="num">X${item.quantity}</span><br><span class="amount">${item.amount}元</span></b><hr>`;
        itemsContainer.appendChild(itemElement);
    });

    const totalElement = document.createElement('li');
    totalElement.innerHTML = `<b><span class="total">${total_price}</span></b>`;
    itemsContainer.appendChild(totalElement);
});

function leave() {
    window.location.href = "index.html";
}

function order() {
    const orderData = {
        tableNumber: document.getElementById('table').textContent,
        items: JSON.parse(decodeURIComponent(urlParams.get('items'))),
        total_price: urlParams.get('total_price'),
        information: urlParams.get('information')
    };

    // 打開 IndexedDB 數據庫
    const request = window.indexedDB.open('OrderDatabase', 1);

    request.onerror = function(event) {
        console.error('IndexedDB 錯誤:', event.target.errorCode);
    };

    request.onupgradeneeded = function(event) {
        const db = event.target.result;

        // 創建對象存儲器存儲訂單數據
        db.createObjectStore('orders', { keyPath: 'id', autoIncrement: true });
    };

    request.onsuccess = function(event) {
        const db = event.target.result;

        // 開啟一個新的事務並添加數據
        const transaction = db.transaction(['orders'], 'readwrite');
        const objectStore = transaction.objectStore('orders');

        const addRequest = objectStore.add(orderData);

        addRequest.onsuccess = function (event) {
            tableNumber = document.getElementById('table').textContent;
            information = document.getElementById("information").textContent;

            newtable = tableNumber.replace("桌號:", '');
            headcount = information.substring(2).replace("人", "");
            choose = information.substring(0, 2);

            console.log('訂單數據已成功添加到 IndexedDB');
            // 跳轉回 order.html
            window.location.href = `order.html?table=${newtable}&headcount=${headcount}&choose=${choose}`;
        };

        addRequest.onerror = function(event) {
            console.error('添加訂單數據到 IndexedDB 時出錯:', event.target.errorCode);
        };
    };
}