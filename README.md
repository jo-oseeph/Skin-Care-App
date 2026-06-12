# Lumière Skin 🧴

A modern, full-featured skincare e-commerce mobile application built with React Native and Expo. Browse, shop, and manage skincare products with a beautiful UI, seamless authentication, and secure payment integration.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Core Modules](#core-modules)
- [Getting Started](#getting-started)
- [API Integration](#api-integration)
- [State Management](#state-management)
- [Navigation Flow](#navigation-flow)
- [Key Components & Screens](#key-components--screens)
- [Utility Functions](#utility-functions)
- [Scripts](#scripts)

---

## Overview

**Lumière Skin** is a React Native mobile application designed for IOS, and Android platforms. It provides a complete skincare shopping experience with:

- **User Authentication**: Secure login and registration with token-based authentication
- **Product Catalog**: Browse, search, and filter skincare products
- **Shopping Cart**: Add/remove items with real-time quantity management
- **Order Management**: Create orders, track order history, and view order details
- **User Profile**: Manage personal information and view order history
- **Payment Integration**: M-Pesa payment processing 

The app uses **Expo Router** for navigation, Context API for state management, and **Axios** for API communication with a backend server.

---

## Features

### Authentication

- User login and registration
- Session persistence with token-based auth
- Secure token storage using `expo-secure-store`
- Automatic session restoration on app launch
- Logout functionality with session cleanup

### Product Management

- Browse all skincare products
- View featured/new arrival products on home
- Product detail pages with specifications
- Search and filter capabilities
- Product categorization

### Shopping Cart

- Add/remove items from cart
- Update product quantities
- Real-time cart synchronization with backend
- Cart persistence (local storage + backend)
- Cart badge showing item count in navigation

### Orders & Checkout

- Secure checkout process
- Order creation with shipping details
- Order history and tracking
- Order status management
- Order confirmation screen

### User Profile

- View and edit user information
- Order history display
- Quick access to account settings
- Logout functionality

---

## Tech Stack

- **React**: 19.1.0 - UI framework
- **React Native**: 0.81.5 - Cross-platform mobile development
- **Expo**: ~54.0.33 - Development and deployment platform
- **Node.js and Express**: Backend API

### Navigation & UI

- **Expo Router**: ~6.0.23 - File-based routing
- **React Navigation**: ~7.1.8 - Navigation library
- **Bottom Tabs Navigation**: ~7.4.0 - Tab-based navigation
- **Expo Vector Icons**: ^15.0.3 - Icon library
- **Expo Linear Gradient**: ~15.0.8 - Gradient backgrounds
- **Expo Image**: ~3.0.11 - Image optimization

### State Management & Storage

- **Context API**: React built-in context for global state
- **useReducer**: State management for complex logic
- **Async Storage**: @react-native-async-storage/async-storage 2.2.0 - Local data persistence
- **Expo Secure Store**: ~15.0.8 - Secure credential storage

### API & Network

- **Axios**: ^1.16.0 - HTTP client with interceptors
- **Bearer Token Authentication**: Automatic auth header injection

### Utilities

- **Expo Constants**: ~18.0.13 - App configuration
- **Expo Haptics**: ~15.0.8 - Haptic feedback
- **Expo Web Browser**: ~15.0.10 - Web browser integration
- **Expo Linking**: ~8.0.12 - Deep linking support
- **React Native Gesture Handler**: ~2.28.0 - Gesture recognition
- **React Native Reanimated**: ~4.1.1 - Smooth animations

## 🧩 Core Modules

### 1. **AuthContext** - Authentication Management (`src/context/AuthContext.js`)

Manages user authentication state and login/logout logic.

**Key Actions:**

- `RESTORE_SESSION` - Restore saved session on app boot
- `LOGIN_SUCCESS` - Save token and user after login
- `LOGOUT` - Clear auth state
- `SET_ERROR` - Handle login errors
- `SET_LOADING` - Loading state management

**Exports:**

- `AuthProvider` - Context provider component
- `useAuth()` - Hook to access auth state and methods
- `login(email, password)` - Login function
- `register(email, password)` - Registration function
- `logout()` - Logout function

### 2. **CartContext** - Shopping Cart Management (`src/context/CartContext.js`)

Manages shopping cart state with local + backend synchronization.

**Key Actions:**

- `SET_ITEMS` - Sync cart with backend
- `ADD_ITEM` - Add item to cart (merges if exists)
- `UPDATE_QUANTITY` - Update item quantity
- `REMOVE_ITEM` - Remove item from cart
- `CLEAR_CART` - Clear entire cart
- `SET_LOADING` - Loading state

**Features:**

- Smart cart merging (local + backend items)
- Automatic backend synchronization on login
- Persistence to local storage
- Real-time cart badge in navigation

**Exports:**

- `CartProvider` - Context provider
- `useCart()` - Hook to access cart state and methods
- `addToCart(productId, quantity)` - Add item
- `removeFromCart(productId)` - Remove item
- `updateQuantity(productId, quantity)` - Update quantity
- `clearCart()` - Clear cart
- `totalItems` - Computed total items
- `totalPrice` - Computed total price

### 3. **Product Service** (`src/services/productService.js`)

API calls for product data fetching.

**Endpoints:**

- `GET /products` - Fetch all products with pagination & filtering
- `GET /products?sortBy=newest&limit=6` - Get featured products
- `GET /products/{id}` - Get single product details

### 4. **Cart Service** (`src/services/cartService.js`)

API calls for cart management (requires authentication).


### 5. **Order Service** (`src/services/orderService.js`)

API calls for order management (requires authentication).

**Functions:**

```javascript
createOrder(orderData);
getMyOrders();
getOrderById(id);

All functions include Bearer token authentication and error handling.


### 6. **Storage Utilities** (`src/utils/storage.js`)

Secure and persistent data storage.

**Token Management** (using `expo-secure-store`):

```javascript
saveToken(token); // Save JWT token securely
getToken(); // Retrieve JWT token
removeToken(); // Remove token
```

**User Data** (using `expo-secure-store`):

```javascript
saveUser(user); // Save user object
getUser(); // Get user object
removeUser(); // Remove user data
```

**Cart Storage** (using `AsyncStorage` - per user):

```javascript
saveCartToStorage(items, userId); // Save cart for user
getCartFromStorage(userId); // Load user's cart
removeCartFromStorage(userId); // Clear user's cart

**Cleanup:**

javascript
clearAll(); // Clear all auth data on logout

## 🚀 Getting Started
- Node.js 22 and npm
- Expo Go app on physical device (optional)

### Installation

1. **Clone or navigate to project:**

2. **Install dependencies:**

```bash
npm install
```

3. **Configure API URL:**
   Edit `src/constants/api.js` and update `BASE_URL` to match your backend server:

```javascript
export const BASE_URL = "http://192.168.100.11:5000/api";
```

### Development

**Start the development server:**

```bash
npm start
```

**Run on specific platform:**

```bash
npm run android    # Android Emulator
npm run ios        # iOS Simulator

### Endpoints Summary

 Method  Endpoint             Purpose                

| POST   | `/auth/login`        User login             
| POST   | `/auth/register`     User registration     
| GET    | `/products`          List all products      
| GET    | `/products/{id}`     Get product details    
| GET    | `/cart`              Fetch user cart        
| POST   | `/cart`              Add item to cart       
| PATCH  | `/cart`              Update cart item       
| DELETE | `/cart/{productId}`  Remove item            
| DELETE | `/cart`              Clear cart            
| POST   | `/orders/checkout`   Create order          
| GET    | `/orders/my`         Get user's orders      
| GET    | `/orders/{id}`       Get order details     


## State Management

### Context API Architecture

The app uses React Context API for state management:

## 📱 Key Components & Screens

### Components

**ProductCard** (`src/components/common/ProductCard.jsx`)

- Reusable card component for displaying products
- Shows product image, name, price, rating
- Quick "Add to Cart" button
- Used in home, products, and featured sections

### Screens

**Home Screen** (`app/(tabs)/home.jsx`)

- Welcome banner
- Featured/new arrival products (limited)
- Quick navigation to other sections
- Lightweight and performant

**Products Screen** (`app/(tabs)/products.jsx`)

- Full product catalog
- Search functionality
- Filtering options (category, price, etc.)
- Product grid layout
- Pagination support

**Product Detail** (`app/product/[id].jsx`)

- Full product information
- High-quality images/gallery
- Product specifications
- Customer reviews/ratings
- "Add to Cart" with quantity selector
- Related products

**Cart Screen** (`app/(tabs)/cart.jsx`)

- List of cart items
- Adjust quantities
- Remove items
- Cart summary (subtotal, tax, shipping, total)
- "Proceed to Checkout" button
- Cart badge in tab icon

**Checkout** (`app/checkout.jsx`)

- Shipping address form
- Billing information
- Order review
- Payment method selection (M-Pesa, card, etc.)
- Place order button

**Orders Screen** (`app/(tabs)/orders.jsx`)

- List of user's orders
- Order status badges
- Order date and total
- Quick access to order details

**Order Detail** (`app/order/[id].jsx`)

- Order timeline/status
- Items in order
- Shipping address
- Tracking information
- Reorder functionality

**Order Confirmation** (`app/order-confirmation/[id].jsx`)

- Success message
- Order summary
- Confirmation number
- Estimated delivery date
- Next steps and support info

**Profile Screen** (`app/(tabs)/profile.jsx`)

- User information display
- Edit profile button
- Order history summary
- Wishlist (if available)
- Settings/preferences
- Logout button

**Auth Screens** (`app/(auth)/login.jsx`, `app/(auth)/register.jsx`)

- Email/password forms
- Form validation
- Error handling
- Links between login and register
- Forgot password option (if available)

---

## 🛠️ Utility Functions

### Storage (`src/utils/storage.js`)

**Secure Storage (Tokens & User):**

```javascript
// Token operations
await saveToken(token);
const token = await getToken();
await removeToken();

// User operations
await saveUser(user);
const user = await getUser();
await removeUser();
```

**Local Storage (Cart - per user):**

```javascript
// Cart operations (userId = user.id, or null for guest)
await saveCartToStorage(items, userId);
const cart = await getCartFromStorage(userId);
await removeCartFromStorage(userId);
```

**Cleanup on logout:**

```javascript
await clearAll(); // Clears all auth data

## 🔐 Security

- **Tokens**: Stored securely using `expo-secure-store` (platform-native)
- **User Data**: Stored in secure storage, not in plain AsyncStorage
- **API Communication**: HTTPS should be used in production
- **Auth Headers**: Bearer tokens automatically injected in protected requests

---

## 📱 Supported Platforms

- **iOS** 12+
- **Android** 6+
- **Web** (via Expo Web)

---

## 🤝 Contributing

When adding new features:

1. Follow the existing folder structure
2. Add new services in `src/services/`
3. Add context providers for global state in `src/context/`
4. Create screen components in `src/screens/`
5. Add utility functions in `src/utils/`
6. Run `npm run lint` to check code quality

---

## 📄 License

This project is private and proprietary.

---

## 📞 Support

For issues or questions about the project structure, I'm open for a conversation.

**App Version:** 1.0.0
**Built with:** React Native + Expo
