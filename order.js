//從URL中提取桌號、人數跟內用外帶
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const tableNumber = urlParams.get('table');
    const headcount = urlParams.get('headcount');
    const choose = urlParams.get('choose');
    const total_price = urlParams.get('total_price');
    const items = urlParams.get('items');

    if (tableNumber && headcount && choose) {
        document.getElementById("table").textContent = `桌號:${tableNumber}`;
        document.getElementById("information").textContent = `${choose}${headcount}人`;
    }

    if (total_price) {
        document.querySelector('.total-price').textContent = total_price;
    }

    if (items) {
        const List = document.getElementById('yetOrderList');
        const parsedItems = JSON.parse(decodeURIComponent(items));
        parsedItems.forEach(item => {
            const itemElement = document.createElement('li');
            itemElement.className = "item";
            itemElement.setAttribute("data-id", item.name);
            itemElement.innerHTML = `
                <span class="name">${item.name}</span>
                x
                <span class="num">${item.quantity}</span>
                - 共
                <span class="amount">${item.amount}</span>
                元
                <button class="delete" onclick="removeItem('${item.name}')">刪除</button>
            `;
            List.appendChild(itemElement);

            const numberElem = document.getElementById(`${item.name}-number`);
            numberElem.textContent = parseInt(item.quantity);
            numberElem.style.display = 'block';
        });
    }

    restoreOrderState();
});

function restoreOrderState() {
    const savedState = sessionStorage.getItem('orderState');
    const List = document.getElementById('yetOrderList');
    
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // 確保 parsedState 是一個對象並且包含 items 陣列
        // if (parsedState && Array.isArray(parsedState.items)) {
        parsedState.items.forEach(item => {
            const itemElement = document.createElement('li');
            itemElement.className = "item";
            itemElement.setAttribute("data-id", item.name);
            itemElement.innerHTML = `
                <span class="name">${item.name}</span>
                x
                <span class="num">${item.quantity}</span>
                - 共
                <span class="amount">${item.amount}</span>
                元
                <button class="delete" onclick="removeItem('${item.name}')">刪除</button>
            `;
            List.appendChild(itemElement);

            const numberElem = document.getElementById(`${item.name}-number`);
            if (numberElem) {
                numberElem.textContent = parseInt(item.quantity);
                numberElem.style.display = 'block';
            }
        });

        // 恢復總價
        document.querySelector('.total-price').textContent = `總計${parsedState.totalPrice}元`;
    }
}

//從indexedDB抓資料
const request = window.indexedDB.open("OrderDatabase", 1);

request.onerror = function (event) {
    console.error("IndexedDB 錯誤", event.target.errorCode);
}

request.onsuccess = function (event) {
    const db = event.target.result;

    const transaction = db.transaction(['orders'], 'readonly');
    const objectStore = transaction.objectStore('orders');

    const getAllRequest = objectStore.getAll();
    
    getAllRequest.onsuccess = function (event) {
        const orders = event.target.result;

        const tableNumber = document.getElementById('table').textContent;
        const information = document.getElementById("information").textContent;

        orders.forEach(order => {
            if (order.tableNumber === tableNumber && order.information === information) {
                console.log("找到符合的訂單", order);

                const List = document.getElementById('haveOrderedList');
                order.items.forEach(item => {
                    let existingItem = List.querySelector(`[data-id="${item.name}"]`);
                    if(existingItem){
                        let quantityElement = existingItem.querySelector('.num');
                        let amountElem = existingItem.querySelector('.amount');
                        let currentQuantity = parseInt(quantityElement.textContent.replace('x', ''));
                        let currentAmount = parseInt(amountElem.textContent.replace('元', ''));

                        quantityElement.textContent = `${currentQuantity + item.quantity}`;
                        amountElem.textContent = `${currentAmount + item.amount}`;
                    }else{
                        const itemElement = document.createElement('li');
                        itemElement.className = "item";
                        itemElement.setAttribute("data-id", item.name);
                        itemElement.innerHTML = `
                            <span class="name">${item.name}</span>
                            x
                            <span class="num">${item.quantity}</span>
                            - 共
                            <span class="amount">${item.amount}</span>
                            元
                        `;
                        List.appendChild(itemElement);
                    }
                });
            }
        })
    }
}

// 離開點餐
function leave(){
    window.location.href = `index.html`;
}

// 搜尋
function searchitems(event) {
    event.preventDefault();
    const query = document.getElementById("search-input").value.toLowerCase();
    const cards = document.querySelectorAll(".card");
    cards.forEach(card => {
        const name = card.querySelector(".meal-name").textContent.toLowerCase();
        if (name.includes(query)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

//全部選擇
function allcard() {
    const cards = document.querySelectorAll(".card");
    cards.forEach(card => {
        card.style.display = 'block';
    });
}

//特餐選擇
function special() {
    const cards = document.querySelectorAll(".card");
    cards.forEach(card => {
        const name = card.querySelector(".meal-name").textContent.toLocaleLowerCase();
        if (name.includes("特餐")) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

//炸雞選擇
function chicken() {
    const cards = document.querySelectorAll(".card");
    cards.forEach(card => {
        const name = card.querySelector(".meal-name").textContent.toLocaleLowerCase();
        if (name.includes("炸雞")) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

//義大利麵選擇
function pasta() {
    const cards = document.querySelectorAll(".card");
    cards.forEach(card => {
        const name = card.querySelector(".meal-name").textContent.toLocaleLowerCase();
        if (name.includes("義大利麵")) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// 切換到"未點"清單
function ordering() {
    document.getElementById("yetOrderList").style.display = "block";
    document.getElementById("haveOrderedList").style.display = "none";
}

// 切換到"已點"清單
function ordered() {
    document.getElementById("yetOrderList").style.display = "none";
    document.getElementById("haveOrderedList").style.display = "block";
}

// 新增餐點到"未點"清單
function addItem(itemId) {
    // 根据 itemId 获取相关信息
    const button = document.querySelector(`button[data-id="${itemId}"]`);
    const title = button.getAttribute("data-title");
    const price = parseInt(button.getAttribute("data-price"));

    // 查找右侧餐点清单中是否已存在相同 itemId 的条目
    let listItem = document.querySelector(`#yetOrderList .item[data-id="${itemId}"]`);
    if (!listItem) {
        // 如果不存在，创建新条目并添加到右侧清单中
        listItem = document.createElement("li");
        listItem.className = "item";
        listItem.setAttribute("data-id", itemId);
        listItem.innerHTML = `
            <span class="name">${title}</span>
            x
            <span class="num">1</span>
            - 共
            <span class="amount">${price}</span>
            元
            <button class="delete" onclick="removeItem('${itemId}')">刪除</button>
        `;
        document.getElementById("yetOrderList").appendChild(listItem);
    } else {
        // 如果已存在，增加数量和金额
        const numElem = listItem.querySelector(".num");
        const amountElem = listItem.querySelector(".amount");
        const num = parseInt(numElem.textContent) + 1;
        numElem.textContent = num;
        amountElem.textContent = num * price;
    }

    // 更新餐点卡片上的数量显示
    const numberElem = document.getElementById(`${itemId}-number`);
    numberElem.textContent = parseInt(numberElem.textContent) + 1;
    numberElem.style.display = "block";

    // 更新总计金额
    updateTotalPrice();
    //保存狀態
    saveOrderState();
}

// 從"未點"清單中移除餐點
function removeItem(itemId) {
    const listItem = document.querySelector(`#yetOrderList .item[data-id="${itemId}"]`);
    if (listItem) {
        listItem.remove();
    }

    // 更新餐點卡片上的數量顯示
    const numberElem = document.getElementById(`${itemId}-number`);
    numberElem.textContent = 0;
    numberElem.style.display = "none";

    // 更新總計金額
    updateTotalPrice();
    //保存狀態
    saveOrderState();
}

function saveOrderState() {
    // const total_price = document.querySelector("total-price").textContent;

    // const items = document.querySelectorAll('#yetOrderList .item');
    // const orderState = [];

    // items.forEach(item => {
    //     const name = item.querySelector('.name').textContent.replace('總計','');
    //     const quantity = parseInt(item.querySelector(".num").textContent);
    //     const amount = parseInt(item.querySelector('.amount').textContent);

    //     orderState.push({ name, quantity, amount });
    // });

    // const state = {
    //     totalPrice: total_price,
    //     items: orderState
    // };

    // sessionStorage.setItem('orderState', JSON.stringify(state));

    const total_price = document.querySelector(".total-price").textContent.replace("總計", "").replace("元", "").trim();
    const items = document.querySelectorAll('#yetOrderList .item');
    const orderState = [];
    
    items.forEach(item => {
        const name = item.querySelector('.name').textContent;
        const quantity = parseInt(item.querySelector(".num").textContent);
        const amount = parseInt(item.querySelector('.amount').textContent);
    
        orderState.push({ name, quantity, amount });
    });

    const state = {
        totalPrice: total_price,
        items: orderState
    };
    
    sessionStorage.setItem('orderState', JSON.stringify(state));    
    
}

// 更新總計金額
function updateTotalPrice() {
    const items = document.querySelectorAll("#yetOrderList .item");
    let total = 0;
    items.forEach(item => {
        const amount = parseInt(item.querySelector(".amount").textContent);
        total += amount;
    });
    document.querySelector(".total-price").textContent = `總計${total}元`;
}

// 結帳
function checkout() {
    const selectedItems = [];
    const items = document.querySelectorAll('#yetOrderList .item');

    items.forEach(item => {
        const name = item.querySelector('.name').textContent;
        const quantity = parseInt(item.querySelector(".num").textContent);
        const amount = parseInt(item.querySelector('.amount').textContent);

        selectedItems.push({ name, quantity, amount });
    });

    const tableNumber = document.getElementById('table').textContent.trim();
    const information = document.getElementById('information').textContent.trim();
    const total_price = document.querySelector('.total-price').textContent.trim();

    const url = `checkout.html?table=${tableNumber}&information=${information}&total_price=${total_price}&items=${JSON.stringify(selectedItems)}`;

    window.location.href = url;
}