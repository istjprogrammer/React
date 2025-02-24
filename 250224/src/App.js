// App.js
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { Provider, useDispatch, useSelector } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Redux Slice: Manage the shopping cart
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: {} // { [productId]: { product, quantity } }
  },
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      if (!state.items[product.id]) {
        state.items[product.id] = { product, quantity: 1 };
      }
    },
    incrementQuantity: (state, action) => {
      const id = action.payload;
      if (state.items[id]) {
        state.items[id].quantity += 1;
      }
    },
    decrementQuantity: (state, action) => {
      const id = action.payload;
      if (state.items[id] && state.items[id].quantity > 1) {
        state.items[id].quantity -= 1;
      }
    },
    removeFromCart: (state, action) => {
      delete state.items[action.payload];
    }
  }
});
const { addToCart, incrementQuantity, decrementQuantity, removeFromCart } = cartSlice.actions;

// Redux Store
const store = configureStore({
  reducer: {
    cart: cartSlice.reducer
  }
});

// Dummy product data (6 products, 3 categories)
// Thumbnail is replaced with a Bootstrap icon.
const products = [
  { id: '1', name: 'Monstera', price: 25000, category: 'Indoor', icon: 'bi bi-flower1' },
  { id: '2', name: 'Sansevieria', price: 15000, category: 'Office', icon: 'bi bi-flower2' },
  { id: '3', name: 'ZZ Plant', price: 20000, category: 'Outdoor', icon: 'bi bi-flower3' },
  { id: '4', name: 'Peperomia', price: 18000, category: 'Indoor', icon: 'bi bi-flower4' },
  { id: '5', name: 'Philodendron', price: 22000, category: 'Office', icon: 'bi bi-flower5' },
  { id: '6', name: 'Caladium', price: 27000, category: 'Outdoor', icon: 'bi bi-flower6' }
];

// Header Component: Common to all pages with navigation links and a cart icon displaying total items.
const Header = () => {
  const cartItems = useSelector((state) => state.cart.items);
  const totalQuantity = Object.values(cartItems).reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="d-flex justify-content-between align-items-center p-3 border-bottom">
      <div className="logo">
        <Link to="/" className="text-decoration-none fs-4">MyPlantStore</Link>
      </div>
      <nav>
        <Link to="/products" className="me-3 text-decoration-none">Products</Link>
        <Link to="/cart" className="position-relative text-decoration-none">
          <i className="bi bi-cart fs-4"></i>
          {totalQuantity > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {totalQuantity}
            </span>
          )}
        </Link>
      </nav>
    </header>
  );
};

// LandingPage Component: Simple introduction with company name, description, and a "Get Started" button.
const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="container text-center my-5">
      <h1 className="mb-3">MyPlantStore</h1>
      <p className="mb-4">We introduce unique houseplants to brighten up your daily life with quality and style.</p>
      <button className="btn btn-primary" onClick={() => navigate('/products')}>
        Get Started
      </button>
    </div>
  );
};

// ProductCard Component: Displays product icon (Bootstrap icon), name, price, and an "Add to Cart" button.
const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    dispatch(addToCart(product));
    setAdded(true);
  };

  return (
    <div className="card m-2 p-3" style={{ width: '14rem' }}>
      <div className="card-img-top text-center" style={{ fontSize: '3rem' }}>
        <i className={product.icon}></i>
      </div>
      <div className="card-body text-center">
        <h5 className="card-title">{product.name}</h5>
        <p className="card-text">{product.price.toLocaleString()} KRW</p>
        <button className="btn btn-outline-primary" onClick={handleAdd} disabled={added}>
          {added ? 'Added' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

// ProductListPage Component: Groups products by category and renders product cards with a button to view the cart.
const ProductListPage = () => {
  // Group products by category
  const categories = products.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {});

  return (
    <div className="container my-5">
      {Object.keys(categories).map((category) => (
        <div key={category} className="mb-4">
          <h3>{category}</h3>
          <div className="d-flex flex-wrap">
            {categories[category].map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ))}
      <div className="text-center mt-4">
        <Link to="/cart">
          <button className="btn btn-success">View Cart</button>
        </Link>
      </div>
    </div>
  );
};

// CartPage Component: Displays the products in the cart with options to adjust quantity, remove items,
// and shows total items and cost, along with a "Checkout" button and a "Continue Shopping" button.
const CartPage = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const itemsArray = Object.values(cartItems);

  const totalItems = itemsArray.reduce((sum, item) => sum + item.quantity, 0);
  const totalCost = itemsArray.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="container my-5">
      <h2 className="mb-4">Cart</h2>
      {itemsArray.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="mb-3">
            <p>Total Items: {totalItems}</p>
            <p>Total Cost: {totalCost.toLocaleString()} KRW</p>
          </div>
          {itemsArray.map(({ product, quantity }) => (
            <div key={product.id} className="d-flex align-items-center border p-2 mb-2">
              <div className="me-3" style={{ fontSize: '2rem' }}>
                <i className={product.icon}></i>
              </div>
              <div className="flex-grow-1">
                <h5>{product.name}</h5>
                <p>Unit Price: {product.price.toLocaleString()} KRW</p>
                <div className="d-flex align-items-center">
                  <button className="btn btn-secondary btn-sm me-2" onClick={() => dispatch(decrementQuantity(product.id))}>
                    -
                  </button>
                  <span>{quantity}</span>
                  <button className="btn btn-secondary btn-sm ms-2" onClick={() => dispatch(incrementQuantity(product.id))}>
                    +
                  </button>
                </div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => dispatch(removeFromCart(product.id))}>
                Remove
              </button>
            </div>
          ))}
          <div className="d-flex justify-content-between mt-4">
            <button className="btn btn-warning" onClick={() => alert("Coming Soon")}>
              Checkout
            </button>
            <Link to="/products">
              <button className="btn btn-outline-primary">Continue Shopping</button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

// Main App Component: Includes the Router and Redux Provider.
const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
