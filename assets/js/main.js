// funcion local storage
function updateLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// funcion tomar API
async function getProducts() {
  try {
    const data = await fetch(
      "https://ecommercebackend.fundamentos-29.repl.co/"
    );
    const res = await data.json();
    updateLocalStorage("products", res);
    return res;
  } catch (error) {
    console.error(error);
  }
}

// funcion para el  menu responsive
function menuBotton() {
  const menuHtml = document.querySelector(".menu");
  const bxsDashboardHtml = document.querySelector(".bxs-dashboard");

  bxsDashboardHtml.addEventListener("click", function () {
    menuHtml.classList.toggle("menu_show");
  });
}

//  direccional desde el menu de celular
function direcctionPhone() {
  const menuItems = document.querySelectorAll(".menu li a");
  menuItems.forEach(function (item) {
    item.addEventListener("click", function () {
      const menu = document.querySelector(".menu");
      menu.classList.remove("menu_show");
      const dashboardIcon = document.getElementById("dashboard-icon");
      dashboardIcon.classList.remove("bx-x");
      dashboardIcon.classList.add("bxs-dashboard");
      Icon = false;
    });
  });
}

// FUNCION PARA SCROLL DEL NAV
function scrollNav() {
  window.addEventListener("scroll", function () {
    if (window.scrollY >= 80) {
      document.querySelector("header").classList.add("scrolled");
    } else {
      document.querySelector("header").classList.remove("scrolled");
    }
  });
}

// esta funcion  me cambia el icono del menu
function changeIconMenu() {
  const dashboardIcon = document.getElementById("dashboard-icon");

  let Icon = false;

  dashboardIcon.addEventListener("click", function () {
    if (Icon) {
      dashboardIcon.classList.remove("bx-x");
      dashboardIcon.classList.add("bxs-dashboard");
    } else {
      dashboardIcon.classList.remove("bxs-dashboard");
      dashboardIcon.classList.add("bx-x");
    }
    Icon = !Icon;
  });
}

// function que me cambia el icono del cart shopping
function changeIconMenuCart() {
  const dashboardIconCart = document.getElementById("iconCart");

  let menu = false;

  dashboardIconCart.addEventListener("click", function () {
    if (menu) {
      dashboardIconCart.classList.remove("bx-x");
      dashboardIconCart.classList.add("iconCart");
    } else {
      dashboardIconCart.classList.remove("iconCart");
      dashboardIconCart.classList.add("bx-x");
    }
    menu = !menu;
  });
}

function printProducts(db) {
  let html = "";
  db.products.forEach(({ image, name, price, quantity, id, category }) => {
    html += `
        <div class="product ${category}">
            <div class="product_img">
                <img src="${image}" alt="${name}" />
            </div>

            <div class="product_body">
                <h4>${name}</h4>
                <p>
                  $${price}.00
                </p>
                <p class="${quantity ? "" : "SoldOut"} stock">
                    <b> Stock:</b> ${quantity ? quantity : "SoldOut"} 
                </p>
                ${
                  quantity
                    ? `<i class = 'bx bx-plus' id='${id}'></i>`
                    : "<di></di>"
                }
            </div>
        </div>
        `;
  });
  document.querySelector(".products").innerHTML = html;
}

// funcion desplegable del menu compras
function shopMenu() {
  const iconCartHTML = document.querySelector("#iconCart");
  const cartHTML = document.querySelector(".cart");

  iconCartHTML.addEventListener("click", function () {
    cartHTML.classList.toggle("cart_show");
  });
}

// funcion imprimir productos en el carrito
function printProductsInCart(db) {
  let html = "";

  Object.values(db.cart).forEach((item) => {
    html += `
          <div class="cartItem">
          <div class="cartItem_img">
            <img src="${item.image}" alt="${item.name}"/>
          </div>
          <div class="cardItem_body">
            <h4>${item.name}</h4>
              <div class="stock_price">
              <p>Stock: ${item.quantity} </p>
              <p>|  $${item.price}.00</p>
              </div>
              <p class="subtotal">Subtotal: $${item.price * item.amount}.00
              <div class="cartItem_options" data-id="${item.id}">
                <i class="bx bx-minus"></i>
                <span>${item.amount}</span>
                <i class="bx bx-plus"></i>
                <i class="bx bx-trash"></i>
              </div>
          </div>
          </div>
        `;
  });
  document.querySelector(".cart_products").innerHTML = html;
}

// funcion  para agregar al carrito desde el contenedor de los productos
function addCartFromProducts(db) {
  const productsHTML = document.querySelector(".products");
  productsHTML.addEventListener("click", function (e) {
    if (e.target.classList.contains("bx-plus")) {
      const productId = Number(e.target.id);

      const productFind = db.products.find(function (product) {
        return product.id === productId;
      });

      if (db.cart[productId]) {
        if (db.cart[productId].amount === db.cart[productId].quantity)
          return alert("ya no contamos con mas disponibilidad");

        db.cart[productId].amount += 1;
      } else {
        db.cart[productId] = structuredClone(productFind);
        db.cart[productId].amount = 1;
      }
      updateLocalStorage("cart", db.cart);
      totalPrice(db);
      printProductsInCart(db);
    }
  });
}

// con esta funcion hago la logica del carrito restar sumar eliminar y alertas
function handleCart(db) {
  const cartProductsHTML = document.querySelector(".cart_products");

  cartProductsHTML.addEventListener("click", function (e) {
    //este elimina los productos
    if (e.target.classList.contains("bx-minus")) {
      const productId = e.target.parentElement.dataset.id;
      if (db.cart[productId].amount === 1) {
        const response = confirm("deseas eliminar el producto de tu compra?");
        if (!response) return;
        delete db.cart[productId];
      } else {
        db.cart[productId].amount -= 1;
      }
    }

    // este agrega mas productos al carrito
    if (e.target.classList.contains("bx-plus")) {
      const productId = e.target.parentElement.dataset.id;
      if (db.cart[productId].amount === db.cart[productId].quantity)
        return alert("ya no contamos con mas disponibilidad");

      db.cart[productId].amount += 1;
    }

    //este elimina el producto del carrito
    if (e.target.classList.contains("bx-trash")) {
      const productId = e.target.parentElement.dataset.id;
      const response = confirm("deseas eliminar el producto de tu compra?");
      if (!response) return;
      delete db.cart[productId];
    }

    printProductsInCart(db);
    updateLocalStorage("cart", db.cart);
    totalPrice(db);
  });
}

// con esta funcion hago el total de productos  y el total del precio
function totalPrice(db) {
  const amountItemsHTML = document.querySelector("#amountItems");
  const cartTotalInfoHTML = document.querySelector(".cart_total-info");
  let amountProducts = 0;
  let priceTotal = 0;

  Object.values(db.cart).forEach((item) => {
    amountProducts += item.amount;
    priceTotal += item.amount * item.price;
  });
  let html = `
        <p>${amountProducts} item</p>
        <p>$${priceTotal}.00</p>
  `;

  cartTotalInfoHTML.innerHTML = html;
  amountItemsHTML.textContent = amountProducts;
}
// con esta funcion hago  lo del la compra y  el sold Out de  las compras
function handleBuy(db) {
  document.querySelector("#btn_buy").addEventListener("click", function () {
    if (!Object.values(db.cart).length)
      return alert(
        "para realizar la compra tienes que tener productos en el carrito "
      );
    const newProducts = [];
    for (const product of db.products) {
      const productCart = db.cart[product.id];
      if (product.id === productCart?.id) {
        newProducts.push({
          ...product,
          quantity: product.quantity - productCart.amount,
        });
      } else {
        newProducts.push(product);
      }
    }
    db.products = newProducts;
    db.cart = {};
    updateLocalStorage("products", db.products);
    updateLocalStorage("cart", db.cart);
    printProducts(db);
    printProductsInCart(db);
    totalPrice(db);
    alert("gracias por su compra");

    window.location.reload();
  });
}

// esta funcion es para el dark mode
function handleDarkMode() {
  const btnDarkMode = document.querySelector(".bx-moon");
  const bodyHTML = document.querySelector(".body");
  let isDarkMode = localStorage.getItem("isDarkMode");

  if (isDarkMode === "true") {
    bodyHTML.classList.add("dark-theme");
    btnDarkMode.classList.add("bx-sun");
  }
  btnDarkMode.addEventListener("click", function () {
    bodyHTML.classList.toggle("dark-theme");
    btnDarkMode.classList.toggle("bx-sun");
  });
}

// funcion que cambia la luna por el sol
function changeIconMoon() {
  const MoonIconCart = document.getElementById("moon");

  let dark = false;

  MoonIconCart.addEventListener("click", function () {
    if (dark) {
      MoonIconCart.classList.remove("bx-sun");
      MoonIconCart.classList.add("bx-moon");
    } else {
      MoonIconCart.classList.remove("bx-moon");
      MoonIconCart.classList.add("bx-sun");
    }
    dark = !dark;
  });
}

// funcion active botton
function activeButtons() {
  const filterButtons = document.querySelectorAll(".filter-button");

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      filterButtons.forEach((btn) => btn.classList.remove("active"));

      button.classList.add("active");
    });
  });
}

// funcion salva boton de ellecion
function locabutton() {
  const activeButton = localStorage.getItem("activeButton");

  if (activeButton) {
    const button = document.querySelector(
      `button[data-filter="${activeButton}"]`
    );
    if (button) {
      button.classList.add("active");
    }
  }

  const filterButtons = document.querySelectorAll(".filter-button");

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      filterButtons.forEach((btn) => btn.classList.remove("active"));

      button.classList.add("active");
    });
  });
}

//mi funcion principal
async function main() {
  const db = {
    products:
      JSON.parse(localStorage.getItem("products")) || (await getProducts()),
    cart: JSON.parse(localStorage.getItem("cart")) || {},
  };
  menuBotton();
  changeIconMenu();
  scrollNav();
  changeIconMenuCart();
  shopMenu();
  direcctionPhone();
  printProducts(db);
  printProductsInCart(db);
  addCartFromProducts(db);
  handleCart(db);
  totalPrice(db);
  handleBuy(db);
  handleDarkMode();
  changeIconMoon();
  activeButtons();
  locabutton();

  mixitup(".products", {
    selectors: {
      target: ".product",
    },
    animation: {
      duration: 300,
    },
  });
}
main();

window.addEventListener("load", function () {
  setTimeout(function () {
    const countentLoadingHTML = document.querySelector(".countentLoading");
    countentLoadingHTML.classList.add("countentLoading_none");
  }, 1000);
});
