import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Trash,
  Zap,
  Tag,
  Truck,
  ShieldCheck,
  ChevronLeft,
  Lock,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { redirectToShopifyCheckout } from "@/lib/shopifyClient";

const FREE_SHIPPING_THRESHOLD = 75.0;

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemove,
}) {
  const [activeTab, setActiveTab] = useState("cart"); // "cart" | "checkout"
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);

  // Quick shipping details pre-fill
  const [shippingInfo, setShippingInfo] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address1: "",
    city: "",
    province: "WI",
    zip: "",
  });

  const [shippingMethod, setShippingMethod] = useState("standard"); // standard | express

  // Calculations
  const rawSubtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountAmount = (rawSubtotal * discountPercent) / 100;
  const subtotalAfterDiscount = Math.max(0, rawSubtotal - discountAmount);

  const isFreeShipping = subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD;
  const shippingCost =
    cartItems.length === 0
      ? 0
      : shippingMethod === "express"
      ? 12.99
      : isFreeShipping
      ? 0
      : 5.99;

  const estimatedTax = subtotalAfterDiscount * 0.055; // WI average tax estimate
  const finalTotal = subtotalAfterDiscount + shippingCost + estimatedTax;

  const freeShippingLeft = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - subtotalAfterDiscount
  );
  const freeShippingProgress = Math.min(
    100,
    (subtotalAfterDiscount / FREE_SHIPPING_THRESHOLD) * 100
  );

  const handleClearAll = async () => {
    for (const item of cartItems) {
      await onRemove(item.id);
    }
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const clean = promoCode.trim().toUpperCase();
    if (clean === "BOOGIE10" || clean === "VIP10") {
      setDiscountPercent(10);
      setPromoMessage("✓ 10% Band VIP Discount Applied!");
    } else if (clean === "ROCKON" || clean === "CREW15") {
      setDiscountPercent(15);
      setPromoMessage("✓ 15% Crew Discount Applied!");
    } else if (clean) {
      setDiscountPercent(0);
      setPromoMessage("Coupon code not found, but we'll check on Shopify!");
    }
  };

  const handleLaunchShopifyCheckout = (expressPayType = null) => {
    const options = {
      discount: promoCode.trim() || undefined,
      note: orderNote.trim() || undefined,
      email: shippingInfo.email.trim() || undefined,
      shippingAddress: {
        firstName: shippingInfo.firstName.trim() || undefined,
        lastName: shippingInfo.lastName.trim() || undefined,
        address1: shippingInfo.address1.trim() || undefined,
        city: shippingInfo.city.trim() || undefined,
        province: shippingInfo.province.trim() || undefined,
        zip: shippingInfo.zip.trim() || undefined,
        country: "US",
      },
    };
    redirectToShopifyCheckout(cartItems, options);
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
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-zinc-950 border-l border-zinc-900 z-50 flex flex-col shadow-2xl overflow-hidden"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {/* Header */}
            <div className="p-5 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {activeTab === "checkout" ? (
                    <button
                      onClick={() => setActiveTab("cart")}
                      className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  )}

                  <div>
                    <h2 className="text-white font-black text-lg tracking-tight uppercase">
                      {activeTab === "checkout"
                        ? "Interactive Checkout"
                        : "Your Merch Cart"}
                    </h2>
                    <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
                      {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"} Selected
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {cartItems.length > 0 && activeTab === "cart" && (
                    <button
                      onClick={handleClearAll}
                      className="text-zinc-500 hover:text-red-500 transition-colors text-xs font-bold uppercase tracking-wider px-2 py-1"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Free Shipping Progress Indicator */}
              {cartItems.length > 0 && (
                <div className="mt-3 bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-3">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="flex items-center gap-1.5 text-zinc-300">
                      <Truck className="w-3.5 h-3.5 text-red-500" />
                      {isFreeShipping ? (
                        <span className="text-green-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> FREE US Shipping Unlocked!
                        </span>
                      ) : (
                        <span>
                          Add <span className="text-red-500">${freeShippingLeft.toFixed(2)}</span> for Free Shipping
                        </span>
                      )}
                    </span>
                    <span className="text-zinc-500 text-[10px]">{Math.round(freeShippingProgress)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${freeShippingProgress}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full"
                    />
                  </div>
                </div>
              )}

              {/* Interactive Tabs Header */}
              {cartItems.length > 0 && (
                <div className="grid grid-cols-2 gap-1 bg-zinc-900/60 p-1 rounded-xl mt-3 border border-zinc-800/60">
                  <button
                    onClick={() => setActiveTab("cart")}
                    className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                      activeTab === "cart"
                        ? "bg-zinc-800 text-white shadow-md"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    1. Items ({cartItems.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("checkout")}
                    className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === "checkout"
                        ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Zap className="w-3 h-3 fill-current" />
                    2. Express Checkout
                  </button>
                </div>
              )}
            </div>

            {/* Body Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-zinc-600">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                  <h3 className="text-white font-black text-xl uppercase mb-1">
                    Your Cart is Empty
                  </h3>
                  <p className="text-zinc-500 text-sm max-w-xs mb-6">
                    Check out the latest tour tees, hoodies, beanies, and custom accessories!
                  </p>
                  <Button
                    onClick={onClose}
                    className="bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs tracking-wider px-6 py-4 rounded-xl shadow-[0_0_25px_rgba(220,38,38,0.4)]"
                  >
                    Browse Merch Catalog
                  </Button>
                </div>
              ) : activeTab === "cart" ? (
                /* TAB 1: CART ITEMS & CUSTOMIZATIONS */
                <>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {cartItems.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex gap-4 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-3.5 hover:border-zinc-700 transition-colors"
                        >
                          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-black border border-zinc-800">
                            <img
                              src={
                                item.image_url ||
                                "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=200&q=80"
                              }
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-white font-bold text-sm leading-snug line-clamp-2">
                                  {item.product_name}
                                </h4>
                                <button
                                  onClick={() => onRemove(item.id)}
                                  className="text-zinc-500 hover:text-red-500 transition-colors p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="flex flex-wrap gap-2 mt-1.5">
                                {item.size && (
                                  <span className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                    Size: {item.size}
                                  </span>
                                )}
                                {item.color && (
                                  <span className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                    {item.color}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800/60">
                              <div className="flex items-center bg-black border border-zinc-800 rounded-lg overflow-hidden h-7">
                                <button
                                  onClick={() =>
                                    onUpdateQuantity(
                                      item.id,
                                      Math.max(1, item.quantity - 1)
                                    )
                                  }
                                  className="w-7 h-full text-zinc-400 hover:text-white flex items-center justify-center hover:bg-zinc-800 transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center text-white text-xs font-bold">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    onUpdateQuantity(item.id, item.quantity + 1)
                                  }
                                  className="w-7 h-full text-zinc-400 hover:text-white flex items-center justify-center hover:bg-zinc-800 transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <span className="text-white font-black text-sm">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Promo Code Input Accordion */}
                  <div className="bg-zinc-900/50 border border-zinc-800/70 rounded-2xl p-4 space-y-3">
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Promo / VIP Code (e.g. VIP10)"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="w-full bg-black border border-zinc-800 text-white rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold uppercase focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <Button
                        type="submit"
                        variant="outline"
                        className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase shrink-0 px-4"
                      >
                        Apply
                      </Button>
                    </form>
                    {promoMessage && (
                      <p
                        className={`text-[11px] font-bold ${
                          discountPercent > 0 ? "text-green-400" : "text-amber-400"
                        }`}
                      >
                        {promoMessage}
                      </p>
                    )}

                    {/* Band Gift Note Toggle */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowNoteInput(!showNoteInput)}
                        className="text-zinc-400 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <span>{showNoteInput ? "− Hide Order Note" : "+ Add Delivery / Band Note"}</span>
                      </button>
                      {showNoteInput && (
                        <textarea
                          rows={2}
                          placeholder="Special delivery instructions or note for the crew..."
                          value={orderNote}
                          onChange={(e) => setOrderNote(e.target.value)}
                          className="w-full mt-2 bg-black border border-zinc-800 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-red-500"
                        />
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* TAB 2: INTERACTIVE EXPRESS CHECKOUT */
                <div className="space-y-4">
                  {/* Express 1-Tap Payment Options */}
                  <div className="space-y-2">
                    <p className="text-zinc-400 text-[10px] uppercase font-black tracking-wider">
                      Express 1-Tap Checkout
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Shop Pay */}
                      <button
                        onClick={() => handleLaunchShopifyCheckout("shoppay")}
                        className="flex items-center justify-center gap-1.5 bg-[#5a31f4] hover:bg-[#4b27d4] text-white font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md hover:scale-[1.01]"
                      >
                        <span className="font-bold">Shop</span>
                        <span className="bg-white text-[#5a31f4] px-1 rounded text-[10px] font-black">
                          Pay
                        </span>
                      </button>

                      {/* Apple / Google Pay */}
                      <button
                        onClick={() => handleLaunchShopifyCheckout("applepay")}
                        className="flex items-center justify-center gap-1.5 bg-black border border-zinc-700 hover:bg-zinc-900 text-white font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all hover:scale-[1.01]"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Instant Pay</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative flex items-center justify-center my-3">
                    <div className="border-t border-zinc-800 w-full" />
                    <span className="bg-zinc-950 px-3 text-[10px] font-black uppercase text-zinc-600 tracking-widest">
                      Or Enter Shipping Info
                    </span>
                  </div>

                  {/* Pre-fill Shipping Address Form */}
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 space-y-3">
                    <div>
                      <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                        Email for Order Receipt
                      </label>
                      <input
                        type="email"
                        placeholder="you@email.com"
                        value={shippingInfo.email}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, email: e.target.value })
                        }
                        className="w-full bg-black border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          placeholder="First"
                          value={shippingInfo.firstName}
                          onChange={(e) =>
                            setShippingInfo({
                              ...shippingInfo,
                              firstName: e.target.value,
                            })
                          }
                          className="w-full bg-black border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          placeholder="Last"
                          value={shippingInfo.lastName}
                          onChange={(e) =>
                            setShippingInfo({
                              ...shippingInfo,
                              lastName: e.target.value,
                            })
                          }
                          className="w-full bg-black border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                        Shipping Address
                      </label>
                      <input
                        type="text"
                        placeholder="Street Address or P.O. Box"
                        value={shippingInfo.address1}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            address1: e.target.value,
                          })
                        }
                        className="w-full bg-black border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          placeholder="City"
                          value={shippingInfo.city}
                          onChange={(e) =>
                            setShippingInfo({
                              ...shippingInfo,
                              city: e.target.value,
                            })
                          }
                          className="w-full bg-black border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          placeholder="WI"
                          maxLength={2}
                          value={shippingInfo.province}
                          onChange={(e) =>
                            setShippingInfo({
                              ...shippingInfo,
                              province: e.target.value.toUpperCase(),
                            })
                          }
                          className="w-full bg-black border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs font-medium uppercase focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          placeholder="ZIP"
                          maxLength={5}
                          value={shippingInfo.zip}
                          onChange={(e) =>
                            setShippingInfo({
                              ...shippingInfo,
                              zip: e.target.value,
                            })
                          }
                          className="w-full bg-black border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Speed Option */}
                  <div className="space-y-2">
                    <p className="text-zinc-400 text-[10px] uppercase font-black tracking-wider">
                      Shipping Speed
                    </p>
                    <div className="space-y-1.5">
                      <div
                        onClick={() => setShippingMethod("standard")}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          shippingMethod === "standard"
                            ? "bg-red-600/10 border-red-500/50 text-white"
                            : "bg-zinc-900/40 border-zinc-800 text-zinc-400"
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <input
                            type="radio"
                            checked={shippingMethod === "standard"}
                            onChange={() => setShippingMethod("standard")}
                            className="text-red-600"
                          />
                          <span>Standard US Ground (3-5 Days)</span>
                        </div>
                        <span className="font-black text-xs">
                          {isFreeShipping ? "FREE" : "$5.99"}
                        </span>
                      </div>

                      <div
                        onClick={() => setShippingMethod("express")}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          shippingMethod === "express"
                            ? "bg-red-600/10 border-red-500/50 text-white"
                            : "bg-zinc-900/40 border-zinc-800 text-zinc-400"
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <input
                            type="radio"
                            checked={shippingMethod === "express"}
                            onChange={() => setShippingMethod("express")}
                            className="text-red-600"
                          />
                          <span className="flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-amber-500" />
                            Band Tour VIP Rush (1-2 Days)
                          </span>
                        </div>
                        <span className="font-black text-xs">$12.99</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Summary & Action Button */}
            {cartItems.length > 0 && (
              <div className="border-t border-zinc-900 p-5 bg-zinc-950/95 space-y-3">
                {/* Cost Breakdown */}
                <div className="space-y-1 text-xs font-medium text-zinc-400">
                  <div className="flex justify-between">
                    <span>Merch Subtotal:</span>
                    <span className="text-white font-bold">
                      ${rawSubtotal.toFixed(2)}
                    </span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount ({discountPercent}%):</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span className="text-white font-bold">
                      {shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Tax:</span>
                    <span className="text-white font-bold">
                      ${estimatedTax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-zinc-800 text-base">
                    <span className="text-white font-black uppercase">Total:</span>
                    <span className="text-red-500 font-black text-2xl">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Main Action Button */}
                {activeTab === "cart" ? (
                  <Button
                    onClick={() => setActiveTab("checkout")}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-wider py-6 rounded-xl text-base transition-all hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:scale-[1.01]"
                  >
                    Proceed to Express Checkout
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleLaunchShopifyCheckout()}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-wider py-6 rounded-xl text-base transition-all hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:scale-[1.01]"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Complete Order on Shopify
                  </Button>
                )}

                <div className="flex items-center justify-center gap-1.5 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                  <span>Shopify 256-Bit SSL • Shop Pay • Apple Pay • Google Pay • Cards</span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}