import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('voltkart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('voltkart_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('voltkart_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('voltkart_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Error saving wishlist:', e);
    }
  }, [wishlist]);

  const addToCart = (device, chosenEdition = 'VoltKart Kids') => {
    const cartId = `${device._id || device.id}_${chosenEdition}`;
    setCart(prev => {
      const existing = prev.find(item => item.cartId === cartId);
      if (existing) {
        return prev.map(item =>
          item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          ...device,
          cartId,
          chosenEdition,
          quantity: 1,
        },
      ];
    });
    toast.success(`Added ${device.model || 'Device'} (${chosenEdition}) to Bag!`);
    setIsCartOpen(true);
  };

  const removeFromCart = (cartId) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
    toast('Item removed from Bag');
  };

  const updateQuantity = (cartId, delta) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.cartId === cartId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (device) => {
    const devId = device._id || device.id;
    setWishlist(prev => {
      const exists = prev.some(item => (item._id || item.id) === devId);
      if (exists) {
        toast('Removed from saved list');
        return prev.filter(item => (item._id || item.id) !== devId);
      } else {
        toast.success(`Saved ${device.model || 'Device'} to Wishlist!`);
        return [...prev, device];
      }
    });
  };

  const isInWishlist = (deviceId) => {
    return wishlist.some(item => (item._id || item.id) === deviceId);
  };

  const moveToCart = (device, edition = 'VoltKart Kids') => {
    addToCart(device, edition);
    const devId = device._id || device.id;
    setWishlist(prev => prev.filter(item => (item._id || item.id) !== devId));
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + (item.sellingPrice || 0) * item.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        wishlist,
        wishlistCount,
        toggleWishlist,
        isInWishlist,
        moveToCart,
        isWishlistOpen,
        setIsWishlistOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
