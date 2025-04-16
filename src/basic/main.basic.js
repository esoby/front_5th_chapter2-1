import {
  addButton_class,
  cartList_class,
  container_class,
  select_class,
  span_class,
  stockInfo_class,
  title_class,
  wrapper_class,
} from '../style/class';

var select, addBtn, cartList, cartTotal, stockInfo;
var lastSel,
  bonusPoints = 0,
  totalAmount = 0,
  itemCount = 0;

var prodList = [
  { id: 'p1', name: '상품1', price: 10000, quantity: 50 },
  { id: 'p2', name: '상품2', price: 20000, quantity: 30 },
  { id: 'p3', name: '상품3', price: 30000, quantity: 20 },
  { id: 'p4', name: '상품4', price: 15000, quantity: 0 },
  { id: 'p5', name: '상품5', price: 25000, quantity: 10 },
];

// * HTML 요소 생성 함수
// 태그 이름 문자열, 속성 객체 -> HTML 요소
function generateElement(tagName, attributes) {
  let element = document.createElement(tagName);

  for (const key in attributes) {
    element[key] = attributes[key];
  }
  return element;
}

// * 레이아웃 렌더링 함수
function renderLayout() {
  const root = document.getElementById('app');
  const cont = generateElement('div', { id: 'container', className: container_class });
  const wrap = generateElement('div', { id: 'wrapper', className: wrapper_class });
  const title = generateElement('h1', { id: 'title', className: title_class, textContent: '장바구니' });

  cartList = generateElement('div', { id: 'cart-items' });
  cartTotal = generateElement('div', { id: 'cart-total', className: cartList_class });
  select = generateElement('select', { id: 'product-select', className: select_class });
  addBtn = generateElement('button', { id: 'add-to-cart', className: addButton_class, textContent: '추가' });
  stockInfo = generateElement('div', { id: 'stock-status', className: stockInfo_class });

  wrap.appendChild(title);
  wrap.appendChild(cartList);
  wrap.appendChild(cartTotal);
  wrap.appendChild(select);
  wrap.appendChild(addBtn);
  wrap.appendChild(stockInfo);
  cont.appendChild(wrap);
  root.appendChild(cont);
}

// * 상품 select option 렌더링 함수
function renderSelectOptions() {
  select.innerHTML = '';
  prodList.forEach(function (item) {
    const option = generateElement('option', {
      value: item.id,
      textContent: item.name + ' - ' + item.price + '원',
      disabled: item.quantity === 0,
    });
    select.appendChild(option);
  });
}

// * interval 세팅 함수
function initInterval(timeoutDelay, intervalDelay, callback) {
  setTimeout(function () {
    setInterval(callback, intervalDelay);
  }, timeoutDelay);
}

function initLuckyItemInterval() {
  initInterval(Math.random() * 10000, 30000, setLuckyItem);
}

function setLuckyItem() {
  var luckyItem = prodList[Math.floor(Math.random() * prodList.length)];
  if (Math.random() < 0.3 && luckyItem.quantity > 0) {
    luckyItem.price = Math.round(luckyItem.price * 0.8);
    alert('번개세일! ' + luckyItem.name + '이(가) 20% 할인 중입니다!');
    renderSelectOptions();
  }
}

function initDiscountItemInterval() {
  initInterval(Math.random() * 20000, 60000, setDiscountItem);
}

function setDiscountItem() {
  if (lastSel) {
    var suggest = prodList.find(function (item) {
      return item.id !== lastSel && item.quantity > 0;
    });
    if (suggest) {
      alert(suggest.name + '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!');
      suggest.price = Math.round(suggest.price * 0.95);
      renderSelectOptions();
    }
  }
}

// * 상품별 할인율 반환 함수
function getDiscountRate(id) {
  let discountRate = 0;

  if (id === 'p1') discountRate = 0.1;
  else if (id === 'p2') discountRate = 0.15;
  else if (id === 'p3') discountRate = 0.2;
  else if (id === 'p4') discountRate = 0.05;
  else if (id === 'p5') discountRate = 0.25;

  return discountRate;
}

// * 장바구니 총액 계산 함수
function calcCart() {
  totalAmount = 0;
  itemCount = 0;
  let preDiscountTotal = 0;

  const cartItems = cartList.children;

  for (let i = 0; i < cartItems.length; i++) {
    const curItem = prodList.find((v) => v.id === cartItems[i].id);

    const quantity = parseInt(cartItems[i].querySelector('span').textContent.split('x ')[1]);
    const itemTotal = curItem.price * quantity;

    let discountRate = 0;
    itemCount += quantity;
    preDiscountTotal += itemTotal;

    if (quantity >= 10) {
      discountRate = getDiscountRate(curItem.id);
    }
    totalAmount += itemTotal * (1 - discountRate);
  }

  // 대량 구매 할인
  let discountRate = 0;

  if (itemCount >= 30) {
    var bulkDisc = totalAmount * 0.25;
    var itemDisc = preDiscountTotal - totalAmount;
    if (bulkDisc > itemDisc) {
      totalAmount = preDiscountTotal * (1 - 0.25);
      discountRate = 0.25;
    } else {
      discountRate = (preDiscountTotal - totalAmount) / preDiscountTotal;
    }
  } else {
    discountRate = (preDiscountTotal - totalAmount) / preDiscountTotal;
  }

  // 화요일 할인
  if (new Date().getDay() === 2) {
    totalAmount *= 1 - 0.1;
    discountRate = Math.max(discountRate, 0.1);
  }

  return discountRate;
}

const renderCartTotal = (discountRate) => {
  cartTotal.textContent = '총액: ' + Math.round(totalAmount) + '원';
  if (discountRate > 0) {
    const span = generateElement('span', {
      className: span_class,
      textContent: '(' + (discountRate * 100).toFixed(1) + '% 할인 적용)',
    });
    cartTotal.appendChild(span);
  }
};

// * 포인트 렌더링 함수
const renderBonusPts = () => {
  bonusPoints = Math.floor(totalAmount / 1000);
  const ptsTag = generateElement('span', {
    id: 'loyalty-points',
    className: span_class,
    textContent: '(포인트: ' + bonusPoints + ')',
  });
  cartTotal.appendChild(ptsTag);
};

// * 품절 목록 렌더링 함수
function renderStockInfo() {
  var infoMsg = '';
  prodList.forEach(function (item) {
    if (item.quantity < 5) {
      infoMsg += item.name + ': ' + (item.quantity > 0 ? '재고 부족 (' + item.quantity + '개 남음)' : '품절') + '\n';
    }
  });
  stockInfo.textContent = infoMsg;
}

// * main
function main() {
  renderLayout();

  renderSelectOptions();

  const discountRate = calcCart();

  renderCartTotal(discountRate);
  renderStockInfo();
  renderBonusPts();

  initLuckyItemInterval();
  initDiscountItemInterval();
}

main();

addBtn.addEventListener('click', function () {
  var selItem = select.value;
  var itemToAdd = prodList.find(function (p) {
    return p.id === selItem;
  });
  if (itemToAdd && itemToAdd.quantity > 0) {
    var item = document.getElementById(itemToAdd.id);
    if (item) {
      var newQty = parseInt(item.querySelector('span').textContent.split('x ')[1]) + 1;
      if (newQty <= itemToAdd.quantity) {
        item.querySelector('span').textContent = itemToAdd.name + ' - ' + itemToAdd.price + '원 x ' + newQty;
        itemToAdd.quantity--;
      } else {
        alert('재고가 부족합니다.');
      }
    } else {
      var newItem = document.createElement('div');
      newItem.id = itemToAdd.id;
      newItem.className = 'flex justify-between items-center mb-2';
      newItem.innerHTML =
        '<span>' +
        itemToAdd.name +
        ' - ' +
        itemToAdd.price +
        '원 x 1</span><div>' +
        '<button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="' +
        itemToAdd.id +
        '" data-change="-1">-</button>' +
        '<button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="' +
        itemToAdd.id +
        '" data-change="1">+</button>' +
        '<button class="remove-item bg-red-500 text-white px-2 py-1 rounded" data-product-id="' +
        itemToAdd.id +
        '">삭제</button></div>';
      cartList.appendChild(newItem);
      itemToAdd.quantity--;
    }
    const discountRate = calcCart();
    renderCartTotal(discountRate);
    renderStockInfo();
    renderBonusPts();
    lastSel = selItem;
  }
});

cartList.addEventListener('click', function (event) {
  var tgt = event.target;
  if (tgt.classList.contains('quantity-change') || tgt.classList.contains('remove-item')) {
    var prodId = tgt.dataset.productId;
    var itemElem = document.getElementById(prodId);
    var prod = prodList.find(function (p) {
      return p.id === prodId;
    });
    if (tgt.classList.contains('quantity-change')) {
      var qtyChange = parseInt(tgt.dataset.change);
      var newQty = parseInt(itemElem.querySelector('span').textContent.split('x ')[1]) + qtyChange;
      if (newQty > 0 && newQty <= prod.quantity + parseInt(itemElem.querySelector('span').textContent.split('x ')[1])) {
        itemElem.querySelector('span').textContent =
          itemElem.querySelector('span').textContent.split('x ')[0] + 'x ' + newQty;
        prod.quantity -= qtyChange;
      } else if (newQty <= 0) {
        itemElem.remove();
        prod.quantity -= qtyChange;
      } else {
        alert('재고가 부족합니다.');
      }
    } else if (tgt.classList.contains('remove-item')) {
      var remQty = parseInt(itemElem.querySelector('span').textContent.split('x ')[1]);
      prod.quantity += remQty;
      itemElem.remove();
    }
    const discountRate = calcCart();
    renderCartTotal(discountRate);
    renderStockInfo();
    renderBonusPts();
  }
});
