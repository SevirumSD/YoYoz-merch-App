import React from "react";
import { Button } from "@/components/ui/button";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Trash } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function CartDrawer({ isOpen, onClose, cartItems, onUpdateQuantity, onRemove }) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleClearAll = async () => {
    for (const item of cartItems) {
      await onRemove(item.id);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950 border-l border-zinc-800 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-red-500" />
                  <h2 className="text-white font-black text-lg">YOUR CART</h2>
                  <span className="bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                    {cartItems.length}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              {cartItems.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-2 text-zinc-500 hover:text-red-500 transition-colors text-xs font-medium"
                >
                  <Trash className="w-3 h-3" />
                  Clear All
                </button>
              )}
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-zinc-700 mb-4" />
                  <p className="text-zinc-500 font-medium">Your cart is empty</p>
                  <p className="text-zinc-600 text-sm mt-1">Time to grab some merch!</p>
                  <Button
                    onClick={onClose}
                    className="mt-6 bg-red-600 hover:bg-red-700 rounded-full"
                  >
                    Browse Shop
                  </Button>
                </div>
              ) : (
                <AnimatePresence>
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4 bg-zinc-900 rounded-xl p-3"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-zinc-800">
                        <img
                          src={item.image_url || "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=200&q=80"}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-bold text-sm truncate">
                          {item.product_name}
                        </h4>
                        <div className="flex gap-2 mt-1">
                          {item.size && (
                            <span className="text-zinc-500 text-xs">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="text-zinc-500 text-xs">
                              Color: {item.color}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center hover:bg-zinc-700"
                            >
                              <Minus className="w-3 h-3 text-white" />
                            </button>
                            <span className="w-8 text-center text-white text-sm font-bold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center hover:bg-zinc-700"
                            >
                              <Plus className="w-3 h-3 text-white" />
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-red-500 font-black text-sm">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                            <button
                              onClick={() => onRemove(item.id)}
                              className="text-zinc-600 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-zinc-800 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-sm">Subtotal</span>
                  <span className="text-white font-black text-xl">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <Link to={createPageUrl("Checkout")} onClick={onClose}>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 rounded-xl text-base transition-all hover:shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                    Checkout
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <p className="text-zinc-600 text-xs text-center">
                  Shipping calculated at checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}