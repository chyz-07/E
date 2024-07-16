//從url提取資料
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const tableNumber = urlParams.get('table');
    const information = urlParams.get('information');
    const total_price = urlParams.get('total_price');
    const items = urlParams.get('items');

    if (tableNumber) {
        document.getElementById('table').textContent = tableNumber;
    }
    if (information) {
        document.getElementById('information').textContent = information;
    }
    if (items) {
        const itemsContainer = document.getElementById('orderList');
        const parsedItems = JSON.parse(decodeURIComponent(items));
        parsedItems.forEach(item => {
            const itemElement = document.createElement('li');
            itemElement.innerHTML = `<b><span class="name">${item.name}</span><span class="num">X${item.quantity}</span><br><span class="amount">${item.amount}元</span></b><hr>`;
            itemsContainer.appendChild(itemElement);
        });

        const totalElement = document.createElement('li');
        totalElement.innerHTML = `<b><span class="total">${total_price}</span></b>`;
        itemsContainer.appendChild(totalElement);
    }
});

function leave() {
    window.location.href = "index.html";
}

function back() {
    const url = new URL(window.location.href);

    url.pathname = url.pathname.replace('checkout.html', 'order.html');

    const information = url.searchParams.get('information');

    if (information) {
        const choose = information.substring(0, 2);
        const headcount = information.substring(2);

        const newheadcount = headcount.replace('人', '');

        url.searchParams.set('headcount', newheadcount);
        url.searchParams.set('choose', choose);

        url.searchParams.delete('information');
    }

    const params = new URLSearchParams(url.search);

    const tableNumber = params.get('table');
    const newtalbeNumber = tableNumber.replace('桌號:', '');
    params.set('table', newtalbeNumber);

    url.search = params.toString();

    window.location.href = url.href;
}

function byCash() {
    const url = window.location.href;

    const newurl = url.replace('checkout.html', 'finish.html');

    window.location.href = newurl;
}