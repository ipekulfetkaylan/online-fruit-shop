const client = contentful.createClient({

    space: "ngezd70cfqbz",

    accessToken: "uS4zT8Zaid9keXBywlpJ2h9_P1oJzpC7X_N4DdaV7Hg"
  });

const backTopBtn= document.querySelector("[data-back-top-btn]");
const searchContainer= document.querySelector("[data-search-wrapper]");
const searchBtn= document.querySelector("[data-search-btn]");
const navOpenBtn = document.querySelector("[data-nav-open-btn]");
const navbar = document.querySelector("[data-navbar]");
const navCloseBtn = document.querySelector("[data-nav-close-btn]");

const heartBtn= document.querySelectorAll('.heart-btn');
const shoppingBtn= document.getElementById('bag-btn');
const closeBtn= document.getElementById('close-btn');
const clearCartBtn= document.querySelector('.clear-btn');
const sideCart= document.querySelector('.side-cart');
const asideEl= document.querySelector('.aside');
const subTotal= document.querySelector('.subtotal-value');
const btnItem= document.querySelector('.btn-badge');
const panelList= document.querySelector('.panel-list');
const productList= document.querySelector('.grid-list');
const sideContainer= document.querySelector('side-container');





let cart= [];
let buttonsDom= [];

class Product{
    async getProduct(){
        try{
            let contentful= await client.getEntries({
                content_type: 'fruitProduct',
            })
            

            let products= contentful.items;

            products= products.map(item => {
                const {price,title}= item.fields;
                const {id}= item.sys;
                const image= item.fields.images.fields.file.url;
                return{title, price, id, image}
            })
            return products;
        }catch(error){
            console.log(error)
        }
    }
}


class UI{
    navbarToggle(){
      const navElems = [navOpenBtn, navCloseBtn];

      for (let i = 0; i < navElems.length; i++) {
        navElems[i].addEventListener("click", function () {
          navbar.classList.toggle("active");
        });
    }
    }
    backToTop(){
      window.addEventListener("scroll", function(){
        window.scrollY >= 100 ? backTopBtn.classList.add("active") : backTopBtn.classList.remove("active");
    })
    }
    search(){
    searchBtn.addEventListener("click", function(){
    searchContainer.classList.toggle("active");
    })
    }
    displayProduct(products){
       let result= "";
       products.forEach(product => {
         result += `
         <li>
         <div class="product-card">

           <figure class="card-banner">
             <img src="${product.image}" width="189" height="189" loading="lazy" alt="Fresh Orangey">
           </figure>
           
           <h3 class="h4 card-title">
             <a href="">${product.title}</a>
           </h3>

           <div class="price-wrapper">
             <data class="price">${product.price} TL</data>
           </div>

           <button class="btn bag-btn btn-primary" data-id=${product.id}>Sepete Ekle</button>

         </div>
       </li>
         `
       });
       productList.innerHTML= result;

    }

    

    getBagButtons(){
        const buttons=[...document.querySelectorAll('.bag-btn')];
            //butonları direkt olarak aldığımızda bize nodelist dönüyor. Biz bunun olmasını istemiyoruz çünkü butonları forEach ile döneceğiz bu yüzden Array a çevirmemiz gerekiyor. ...operatör ile aldığımızda artık bize nodelist değil array dönüyor. 
        buttonsDom= buttons;
        

        buttons.forEach(button =>{
            let id= button.dataset.id;
            let inCart= cart.find(item => item.id === id);
      
            if(inCart){
                button.innerHTML= 'Sepette';
                button.disabled= true;

            }
             button.addEventListener('click', (event)=>{
                event.target.innerHTML= 'Sepette';
                event.target.disabled= true;

                let cartItem= {...Storage.getProduct(id), amount:1};
                

                cart= [...cart, cartItem];
              
               
                Storage.saveCart(cart);

                this.setCartValues(cart)

                this.addCartItem(cartItem);
               
                this.showCart();
            })
            
        })
    }
    setCartValues(cart){
      let tempTotal= 0;
        let itemsTotal= 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
      subTotal.innerHTML=parseFloat(tempTotal.toFixed(2));
      btnItem.innerHTML= itemsTotal
    }

    addCartItem(item){
      const li= document.createElement('li');
      li.classList.add('panel-item');
      li.innerHTML= `
      <a href="#" class="panel-card">
        <figure class="item-banner">
          <img
            src="${item.image}"
            alt=""
            width="46"
            height="46"
          />
        </figure>
        <div>
          <p class="item-title">${item.title}</p>
          <span class="item-value">${item.price} ₺</span>
          <span class="remove-item item-value" data-id=${item.id}>sil</span>
        </div>
      </a>
      `
      panelList.appendChild(li);
    }

    showCart(){
      sideCart.classList.add('active');
    }

    setUppApp(){
      cart= Storage.getCart();
      this.setCartValues(cart);
      this.populateCart();
      shoppingBtn.addEventListener('click',this.showCart);
      closeBtn.addEventListener('click',this.hideCart);

    }

    populateCart(){
      cart.forEach(item => this.addCartItem(item));
    }

    hideCart(){
      sideCart.classList.remove('active');
    }

    cartLogic(){
      clearCartBtn.addEventListener('click',()=>{
        this.clearCart();
      });
      panelList.addEventListener('click', event => {
        if(event.target.classList.contains('remove-item')){
          let removeItem= event.target;
          let id= removeItem.dataset.id;
          panelList.removeChild(removeItem.parentElement.parentElement.parentElement);
          this.removeItem(id)
        }
      })
      
    }

    clearCart(){
      let cartItems= cart.map(item => item.id);
      cartItems.forEach(id => this.removeItem(id));

      while(panelList.children.length >0){
        panelList.removeChild(panelList.children[0])
      }
    }

    removeItem(id){
      cart= cart.filter(item => item.id !== id);
      this.setCartValues(cart);
      Storage.saveCart(cart);
      let button= this.getSingleButton(id);
      button.disabled= false;
      button.innerHTML= `Sepete Ekle`
    }

    getSingleButton(id){
      return buttonsDom.find(button => button.dataset.id === id);

    }

    

   
}

class Storage{
    static saveProducts(products){
        localStorage.setItem('products', JSON.stringify(products));
    }

    static getProduct(id){
        let products= JSON.parse(localStorage.getItem('products'));
        return products.find(product=> product.id === id);
    }

    static saveCart(cart){
      localStorage.setItem('cart', JSON.stringify(cart));
    }

    static getCart(){
      return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}

document.addEventListener('DOMContentLoaded', ()=> {
    const ui= new UI;
    const products= new Product;
    ui.backToTop();
    ui.search();
    ui.navbarToggle();
    ui.setUppApp();
    

    products.getProduct().then(products => {
        ui.displayProduct(products);
        Storage.saveProducts(products);
    }).then(()=> {
        ui.getBagButtons();
        ui.cartLogic();
    })
})






