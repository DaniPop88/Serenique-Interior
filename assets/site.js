(function () {
  'use strict';

  var CATALOG = {
    1: { name: 'Modern Sofa Set', price: 16999, stock: 10, img: 'image/site/products/01-sofa-thumb.webp' },
    2: { name: 'Wooden Dining Table Set', price: 11299, stock: 7, img: 'image/site/products/02-dining-thumb.webp' },
    3: { name: 'Accent Chair', price: 3499, stock: 4, img: 'image/site/products/03-chair-thumb.webp' },
    4: { name: 'Solid Wood Bed Frame', price: 8990, stock: 8, img: 'image/site/products/04-bed-thumb.webp' },
    5: { name: 'Abstract Wall Art', price: 1099, stock: 6, img: 'image/site/products/05-wallart-thumb.webp' },
    6: { name: 'Decorative Wall Mirror', price: 2199, stock: 9, img: 'image/site/products/06-mirror-thumb.webp' },
    7: { name: 'Ceramic Tableware Set', price: 1799, stock: 12, img: 'image/site/products/07-tableware-thumb.webp' }
  };
  var CART_KEY = 'checkoutCart';
  var ORDER_EMAIL = 'hello@sereniquehaven.site';

  function $(id) { return document.getElementById(id); }
  function peso(n) { return '₱' + n.toLocaleString('en-PH'); }
  function priceHTML(n) { return '<span class="cur">₱</span>' + n.toLocaleString('en-PH'); }
  function icon(name) { return '<svg class="icon" aria-hidden="true"><use href="#i-' + name + '"></use></svg>'; }

  function readCart() {
    try {
      var items = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      if (!Array.isArray(items)) return [];
      return items.filter(function (i) { return CATALOG[i.id] && i.qty > 0; }).map(function (i) {
        return { id: i.id, qty: Math.min(Math.floor(i.qty), CATALOG[i.id].stock) };
      });
    } catch (e) { return []; }
  }
  var cart = readCart();
  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* cart still works for this page view */ }
  }
  function line(id) { return cart.filter(function (i) { return i.id === id; })[0]; }
  function cartQty() { return cart.reduce(function (t, i) { return t + i.qty; }, 0); }
  function cartTotal() { return cart.reduce(function (t, i) { return t + i.qty * CATALOG[i.id].price; }, 0); }

  function setQty(id, qty) {
    var item = line(id);
    qty = Math.min(qty, CATALOG[id].stock);
    if (qty <= 0) cart = cart.filter(function (i) { return i.id !== id; });
    else if (item) item.qty = qty;
    else cart.push({ id: id, qty: qty });
    saveCart();
    renderCart();
    renderAddButtons();
  }

  /* Mobile menu */
  var navList = $('nav-list');
  var navToggle = $('nav-toggle');
  function closeNav() {
    if (!navList || !navList.classList.contains('open')) return;
    navList.classList.remove('open');
    document.body.style.overflow = '';
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.focus();
  }
  if (navList && navToggle) {
    navToggle.addEventListener('click', function () {
      navList.classList.add('open');
      document.body.style.overflow = 'hidden';
      navToggle.setAttribute('aria-expanded', 'true');
      $('nav-close').focus();
    });
    $('nav-close').addEventListener('click', closeNav);
    navList.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
  }

  /* Cart drawer */
  var sidebar = $('cart-sidebar');
  var overlay = $('cart-overlay');
  var cartBtn = $('cart-btn');
  function openCart() {
    sidebar.classList.add('open');
    overlay.classList.add('active');
    sidebar.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    $('cart-close-btn').focus();
  }
  function closeCart() {
    if (!sidebar.classList.contains('open')) return;
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    sidebar.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    cartBtn.focus();
  }
  function renderCart() {
    document.querySelectorAll('.cart-count').forEach(function (el) { el.textContent = cartQty(); });
    if (!sidebar) return;
    var box = $('cart-items');
    box.innerHTML = '';
    var foot = $('cart-foot');
    foot.hidden = cart.length === 0;
    if (!cart.length) {
      box.innerHTML = '<div class="cart-empty"><p>Your cart is empty.</p><a class="plaque plaque--green" href="#shop" id="cart-empty-shop">Browse the collection</a></div>';
      $('cart-empty-shop').addEventListener('click', closeCart);
      return;
    }
    cart.forEach(function (item) {
      var p = CATALOG[item.id];
      var row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML =
        '<img src="' + p.img + '" alt="" width="72" height="72">' +
        '<div><h3>' + p.name + '</h3>' +
        '<div class="cart-item-row"><span class="qty">' +
        '<button type="button" data-a="dec" aria-label="Decrease quantity of ' + p.name + '">' + icon('minus') + '</button>' +
        '<output aria-label="Quantity">' + item.qty + '</output>' +
        '<button type="button" data-a="inc" aria-label="Increase quantity of ' + p.name + '"' + (item.qty >= p.stock ? ' disabled' : '') + '>' + icon('plus') + '</button>' +
        '</span><span class="cart-item-sub">' + peso(p.price * item.qty) + '</span></div>' +
        '<button type="button" class="cart-remove" data-a="rm">Remove</button></div>';
      row.querySelector('[data-a=dec]').addEventListener('click', function () { setQty(item.id, item.qty - 1); focusLine(item.id, 'dec'); });
      row.querySelector('[data-a=inc]').addEventListener('click', function () { setQty(item.id, item.qty + 1); focusLine(item.id, 'inc'); });
      row.querySelector('[data-a=rm]').addEventListener('click', function () { setQty(item.id, 0); $('cart-close-btn').focus(); });
      row.dataset.id = item.id;
      box.appendChild(row);
    });
    $('cart-total').innerHTML = priceHTML(cartTotal());
  }
  function focusLine(id, action) {
    var row = document.querySelector('.cart-item[data-id="' + id + '"]');
    var btn = row && row.querySelector('[data-a=' + action + ']');
    if (btn && !btn.disabled) btn.focus(); else $('cart-close-btn').focus();
  }
  if (sidebar) {
    sidebar.setAttribute('aria-hidden', 'true');
    cartBtn.addEventListener('click', openCart);
    $('cart-close-btn').addEventListener('click', closeCart);
    overlay.addEventListener('click', closeCart);
    sidebar.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = sidebar.querySelectorAll('a[href], button:not([disabled])');
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
    $('checkout-btn').addEventListener('click', function () {
      saveCart();
      window.location.href = 'order-summary.html';
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (sidebar) closeCart();
    closeNav();
  });

  /* Product cards */
  var addTimers = {};
  function renderAddButtons() {
    document.querySelectorAll('.product-card').forEach(function (card) {
      var id = Number(card.dataset.id);
      var btn = card.querySelector('.product-add');
      var inCart = line(id) ? line(id).qty : 0;
      var full = inCart >= CATALOG[id].stock;
      btn.disabled = full;
      if (full) { btn.classList.remove('is-added'); btn.textContent = 'All in your cart'; }
      else if (!addTimers[id]) btn.textContent = 'Add to cart';
    });
  }
  document.querySelectorAll('.product-card').forEach(function (card) {
    var id = Number(card.dataset.id);
    var btn = card.querySelector('.product-add');
    btn.addEventListener('click', function () {
      var item = line(id);
      setQty(id, (item ? item.qty : 0) + 1);
      if (btn.disabled) return;
      btn.textContent = 'Added';
      btn.classList.add('is-added');
      clearTimeout(addTimers[id]);
      addTimers[id] = setTimeout(function () {
        addTimers[id] = null;
        btn.classList.remove('is-added');
        renderAddButtons();
      }, 1400);
      var live = $('cart-live');
      if (live) live.textContent = CATALOG[id].name + ' added. ' + cartQty() + ' items in cart.';
    });
    var closer = card.querySelector('.closer');
    closer.addEventListener('click', function () {
      var on = card.classList.toggle('is-close');
      closer.setAttribute('aria-pressed', String(on));
      closer.textContent = on ? 'See the room' : 'Look closer';
    });
  });

  /* Order page */
  function renderOrder() {
    var body = $('summary-cart-body');
    if (!body) return;
    var empty = $('order-empty');
    var order = $('order-layout');
    if (!cart.length) { order.hidden = true; empty.hidden = false; return; }
    order.hidden = false;
    empty.hidden = true;
    body.innerHTML = '';
    cart.forEach(function (item) {
      var p = CATALOG[item.id];
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>' + p.name + '<small>' + item.qty + ' × ' + peso(p.price) + '</small></td><td>' + peso(p.price * item.qty) + '</td>';
      body.appendChild(tr);
    });
    $('summary-cart-total').innerHTML = priceHTML(cartTotal());
  }

  var MESSAGES = {
    'customer-name': 'Please enter your full name.',
    'customer-address': 'Please enter your delivery address.',
    'customer-contact': 'Enter a mobile number like 09171234567 or +639171234567.',
    'customer-payment': 'Please choose how you would like to pay.'
  };
  function checkField(el) {
    var err = $(el.id + '-error');
    if (!err) return true;
    var ok = el.value.trim() !== '' && el.checkValidity();
    err.textContent = ok ? '' : MESSAGES[el.id];
    if (ok) el.removeAttribute('aria-invalid'); else el.setAttribute('aria-invalid', 'true');
    return ok;
  }
  function orderText(data) {
    var lines = ['New order from sereniquehaven.site', ''];
    cart.forEach(function (i) {
      var p = CATALOG[i.id];
      lines.push(i.qty + ' x ' + p.name + ' - PHP ' + (p.price * i.qty).toLocaleString('en-PH'));
    });
    lines.push('', 'Total: PHP ' + cartTotal().toLocaleString('en-PH'), '');
    lines.push('Name: ' + data.name, 'Address: ' + data.address, 'Mobile: ' + data.contact, 'Payment: ' + data.payment);
    if (data.notes) lines.push('Notes: ' + data.notes);
    return lines.join('\n');
  }
  var form = $('checkout-form');
  if (form) {
    form.noValidate = true;
    Object.keys(MESSAGES).forEach(function (id) {
      function recheck() { if ($(id).hasAttribute('aria-invalid')) checkField($(id)); }
      $(id).addEventListener('input', recheck);
      $(id).addEventListener('change', recheck);
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      Object.keys(MESSAGES).forEach(function (id) {
        if (!checkField($(id)) && !firstBad) firstBad = $(id);
      });
      if (firstBad) { firstBad.focus(); return; }
      var pay = $('customer-payment');
      var text = orderText({
        name: $('customer-name').value.trim(),
        address: $('customer-address').value.trim(),
        contact: $('customer-contact').value.trim(),
        payment: pay.options[pay.selectedIndex].text,
        notes: $('customer-notes').value.trim()
      });
      var href = 'mailto:' + ORDER_EMAIL + '?subject=' + encodeURIComponent('New order: ' + $('customer-name').value.trim()) + '&body=' + encodeURIComponent(text);
      $('sent-email').href = href;
      $('sent-text').textContent = text;
      $('order-layout').hidden = true;
      $('order-intro').hidden = true;
      $('order-sent').hidden = false;
      $('order-sent-title').focus();
      window.scrollTo(0, 0);
      window.location.href = href;
    });
    $('sent-copy-btn').addEventListener('click', function () {
      var btn = this;
      var text = $('sent-text').textContent;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () { btn.textContent = 'Copied'; }, function () { btn.textContent = 'Select the text below to copy'; });
      } else { btn.textContent = 'Select the text below to copy'; }
    });
  }

  document.querySelectorAll('.footer-year').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  renderCart();
  renderAddButtons();
  renderOrder();
})();
