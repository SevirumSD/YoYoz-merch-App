import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { resolveShopifyCheckoutUrl, isShopifyConfigured } from "@/lib/shopifyClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ShoppingBag, Check, Lock, CreditCard, ChevronRight, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Checkout() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState("shipping"); // shipping | payment | confirmation
  
  // Form states
  const [shipping, setShipping] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });

  const [payment, setPayment] = useState({
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  // Validation states
  const [errors, setErrors] = useState({});

  const { data: cartItems = [] } = useQuery({
    queryKey: ["cart-checkout"],
    queryFn: () => base44.entities.CartItem.list(),
  });

  // When every cart item maps to a real Shopify variant, checkout is handed
  // off to Shopify (real payments, shipping, taxes). Otherwise the in-app
  // sandbox flow below remains as the fallback.
  const { data: shopifyCheckoutUrl } = useQuery({
    queryKey: ["shopify-checkout-url", cartItems.map((i) => i.id).join(",")],
    queryFn: () => resolveShopifyCheckoutUrl(cartItems),
    enabled: isShopifyConfigured && cartItems.length > 0,
  });

  // Calculation Logic
  const TAX_RATE = 0.08;
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const getShippingCost = () => {
    if (subtotal >= 100) return 0;
    if (subtotal >= 50) return 5.99;
    return 9.99;
  };

  const shipping_cost = getShippingCost();
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + shipping_cost;

  // Real-time single field validation
  const validateField = (name, value) => {
    let error = "";
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) error = "Email is required";
      else if (!emailRegex.test(value)) error = "Please enter a valid email address";
    } else if (name === "zip") {
      if (!value) error = "ZIP Code is required";
      else if (value.length < 5) error = "ZIP Code must be at least 5 characters";
    } else if (name === "cardNumber") {
      const cleanVal = value.replace(/\s+/g, "");
      if (!cleanVal) error = "Card number is required";
      else if (cleanVal.length !== 16) error = "Card number must be 16 digits";
    } else if (name === "expiry") {
      const expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
      if (!value) error = "Expiry is required";
      else if (!expiryRegex.test(value)) error = "Use MM/YY format";
    } else if (name === "cvc") {
      if (!value) error = "CVC is required";
      else if (value.length !== 3) error = "Must be 3 digits";
    } else if (!value) {
      error = "This field is required";
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
    return !error;
  };

  const handleShippingChange = (field, value) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) validateField(field, value);
  };

  const handlePaymentChange = (field, value) => {
    let formattedValue = value;
    
    // Formatting credit card input
    if (field === "cardNumber") {
      formattedValue = value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
    }
    // Formatting expiry date
    if (field === "expiry") {
      formattedValue = value.replace(/\D/g, "");
      if (formattedValue.length > 2) {
        formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2, 4)}`;
      }
      formattedValue = formattedValue.slice(0, 5);
    }
    // Formatting CVC
    if (field === "cvc") {
      formattedValue = value.replace(/\D/g, "").slice(0, 3);
    }

    setPayment((prev) => ({ ...prev, [field]: formattedValue }));
    if (errors[field]) validateField(field, formattedValue);
  };

  const validateShippingForm = () => {
    const newErrors = {};
    let isValid = true;

    // Check all fields
    Object.keys(shipping).forEach((key) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!shipping[key]) {
        newErrors[key] = "This field is required";
        isValid = false;
      } else if (key === "email" && !emailRegex.test(shipping.email)) {
        newErrors.email = "Please enter a valid email address";
        isValid = false;
      } else if (key === "zip" && shipping.zip.length < 5) {
        newErrors.zip = "ZIP Code must be at least 5 characters";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const validatePaymentForm = () => {
    const newErrors = {};
    let isValid = true;
    
    const cleanCard = payment.cardNumber.replace(/\s+/g, "");
    const expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;

    if (!cleanCard) {
      newErrors.cardNumber = "Card number is required";
      isValid = false;
    } else if (cleanCard.length !== 16) {
      newErrors.cardNumber = "Card number must be 16 digits";
      isValid = false;
    }

    if (!payment.expiry) {
      newErrors.expiry = "Expiry date is required";
      isValid = false;
    } else if (!expiryRegex.test(payment.expiry)) {
      newErrors.expiry = "Use MM/YY format";
      isValid = false;
    }

    if (!payment.cvc) {
      newErrors.cvc = "CVC code is required";
      isValid = false;
    } else if (payment.cvc.length !== 3) {
      newErrors.cvc = "Must be 3 digits";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleContinueToPayment = (e) => {
    e.preventDefault();
    if (validateShippingForm()) {
      setStep("payment");
    }
  };

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      const order = await base44.entities.Order.create({
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          image_url: item.image_url,
        })),
        total,
        status: "confirmed",
        shipping_name: shipping.name,
        shipping_email: shipping.email,
        shipping_address: shipping.address,
        shipping_city: shipping.city,
        shipping_state: shipping.state,
        shipping_zip: shipping.zip,
        shipping_country: shipping.country,
      });

      // Clear cart
      for (const item of cartItems) {
        await base44.entities.CartItem.delete(item.id);
      }

      return order;
    },
    onSuccess: () => {
      setStep("confirmation");
      queryClient.invalidateQueries({ queryKey: ["cart-items"] });
      window.dispatchEvent(new Event("cart-updated"));
    },
  });

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (validatePaymentForm()) {
      placeOrderMutation.mutate();
    }
  };

  if (step === "confirmation") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center max-w-md bg-zinc-950/80 backdrop-blur-md border border-zinc-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Confetti effect helper ring */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-600/10 blur-[80px] pointer-events-none rounded-full" />
          
          <div className="relative">
            <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <Check className="w-10 h-10 text-red-500 animate-bounce" />
            </div>
            <h1 className="text-white font-black text-3xl mb-2 tracking-tight uppercase">ORDER CONFIRMED!</h1>
            <p className="text-zinc-400 text-sm mb-8 px-4 leading-relaxed">
              Thanks for rocking with Boogie & the Yo-Yoz! We're processing your order now. You'll receive an email confirmation shortly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={createPageUrl("Shop")} className="flex-1">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white rounded-full font-black text-sm uppercase py-4 transition-all hover:scale-[1.02]">
                  Keep Shopping
                </Button>
              </Link>
              <Link to={createPageUrl("Orders")} className="flex-1">
                <Button variant="outline" className="w-full border-zinc-800 text-white rounded-full font-black text-sm uppercase py-4 hover:bg-zinc-900 transition-all hover:scale-[1.02]">
                  View Orders
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <div className="w-16 h-16 rounded-full bg-zinc-900/60 flex items-center justify-center border border-zinc-800 mb-4">
          <ShoppingBag className="w-7 h-7 text-zinc-600" />
        </div>
        <p className="text-zinc-500 font-bold text-lg">Your cart is empty</p>
        <Link to={createPageUrl("Shop")}>
          <Button className="mt-6 bg-red-600 hover:bg-red-700 text-white rounded-full font-black uppercase text-sm py-5 px-8">
            Browse Shop
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="max-w-6xl mx-auto px-5 py-8">
        <button
          onClick={() => step === "payment" ? setStep("shipping") : window.history.back()}
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-red-500" />
          {step === "payment" ? "Back to Shipping" : "Back to Cart"}
        </button>

        <h1 className="text-white font-black text-3xl md:text-4xl tracking-tight uppercase mb-8">
          CHECKOUT
        </h1>

        {/* Numbered Progress Indicators */}
        <div className="flex items-center gap-3 mb-10 max-w-md">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
              step === "shipping" ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]" : "bg-zinc-800 text-zinc-400"
            }`}>
              1
            </div>
            <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${
              step === "shipping" ? "text-white" : "text-zinc-500"
            }`}>
              Shipping
            </span>
          </div>
          <div className="h-px flex-1 bg-zinc-800" />
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
              step === "payment" ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]" : "bg-zinc-800 text-zinc-400"
            }`}>
              2
            </div>
            <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${
              step === "payment" ? "text-white" : "text-zinc-500"
            }`}>
              Payment
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Main Checkout Step Content */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {step === "shipping" ? (
                <motion.div
                  key="shipping-step"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <form onSubmit={handleContinueToPayment} className="space-y-5">
                    <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-6 md:p-8 space-y-4">
                      <h2 className="text-white font-black text-xl tracking-tight uppercase border-b border-zinc-900 pb-3">Shipping Info</h2>

                      <div className="space-y-2">
                        <Label className="text-zinc-400 text-xs font-black uppercase tracking-wider">Full Name</Label>
                        <Input
                          required
                          value={shipping.name}
                          onChange={(e) => handleShippingChange("name", e.target.value)}
                          placeholder="John Doe"
                          className={`bg-zinc-900 border-zinc-850 text-white rounded-xl placeholder:text-zinc-600 focus-visible:ring-red-500 ${
                            errors.name ? "border-red-600 focus-visible:ring-red-600" : ""
                          }`}
                        />
                        {errors.name && <p className="text-red-500 text-xs font-medium">{errors.name}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-zinc-400 text-xs font-black uppercase tracking-wider">Email Address</Label>
                        <Input
                          type="email"
                          required
                          value={shipping.email}
                          onChange={(e) => handleShippingChange("email", e.target.value)}
                          placeholder="johndoe@example.com"
                          className={`bg-zinc-900 border-zinc-850 text-white rounded-xl placeholder:text-zinc-600 focus-visible:ring-red-500 ${
                            errors.email ? "border-red-600 focus-visible:ring-red-600" : ""
                          }`}
                        />
                        {errors.email && <p className="text-red-500 text-xs font-medium">{errors.email}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-zinc-400 text-xs font-black uppercase tracking-wider">Street Address</Label>
                        <Input
                          required
                          value={shipping.address}
                          onChange={(e) => handleShippingChange("address", e.target.value)}
                          placeholder="123 Gig Lane"
                          className={`bg-zinc-900 border-zinc-850 text-white rounded-xl placeholder:text-zinc-600 focus-visible:ring-red-500 ${
                            errors.address ? "border-red-600 focus-visible:ring-red-600" : ""
                          }`}
                        />
                        {errors.address && <p className="text-red-500 text-xs font-medium">{errors.address}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-zinc-400 text-xs font-black uppercase tracking-wider">City</Label>
                          <Input
                            required
                            value={shipping.city}
                            onChange={(e) => handleShippingChange("city", e.target.value)}
                            placeholder="Austin"
                            className={`bg-zinc-900 border-zinc-850 text-white rounded-xl placeholder:text-zinc-600 focus-visible:ring-red-500 ${
                              errors.city ? "border-red-600 focus-visible:ring-red-600" : ""
                            }`}
                          />
                          {errors.city && <p className="text-red-500 text-xs font-medium">{errors.city}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-zinc-400 text-xs font-black uppercase tracking-wider">State</Label>
                          <Input
                            required
                            value={shipping.state}
                            onChange={(e) => handleShippingChange("state", e.target.value)}
                            placeholder="TX"
                            className={`bg-zinc-900 border-zinc-850 text-white rounded-xl placeholder:text-zinc-600 focus-visible:ring-red-500 ${
                              errors.state ? "border-red-600 focus-visible:ring-red-600" : ""
                            }`}
                          />
                          {errors.state && <p className="text-red-500 text-xs font-medium">{errors.state}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-zinc-400 text-xs font-black uppercase tracking-wider">ZIP Code</Label>
                          <Input
                            required
                            value={shipping.zip}
                            onChange={(e) => handleShippingChange("zip", e.target.value)}
                            placeholder="78701"
                            className={`bg-zinc-900 border-zinc-850 text-white rounded-xl placeholder:text-zinc-600 focus-visible:ring-red-500 ${
                              errors.zip ? "border-red-600 focus-visible:ring-red-600" : ""
                            }`}
                          />
                          {errors.zip && <p className="text-red-500 text-xs font-medium">{errors.zip}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-zinc-400 text-xs font-black uppercase tracking-wider">Country</Label>
                          <Input
                            value={shipping.country}
                            onChange={(e) => handleShippingChange("country", e.target.value)}
                            className={`bg-zinc-900 border-zinc-850 text-white rounded-xl focus-visible:ring-red-500 ${
                              errors.country ? "border-red-600 focus-visible:ring-red-600" : ""
                            }`}
                          />
                          {errors.country && <p className="text-red-500 text-xs font-medium">{errors.country}</p>}
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase py-7 rounded-xl transition-all hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:scale-[1.01]"
                    >
                      Continue to Payment
                      <ChevronRight className="w-5 h-5 ml-1 inline" />
                    </Button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="payment-step"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {shopifyCheckoutUrl ? (
                    <div className="space-y-5">
                      <div className="bg-zinc-950/20 border border-zinc-900 rounded-3xl p-6 md:p-8 space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                          <h2 className="text-white font-black text-xl tracking-tight uppercase">Secure Checkout</h2>
                          <div className="flex items-center gap-1 bg-red-650/10 border border-red-500/20 px-2.5 py-1 rounded-full text-red-500 text-[10px] font-black uppercase tracking-widest">
                            <Lock className="w-3 h-3" />
                            Shopify
                          </div>
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                          Your cart is ready. You'll finish paying on our official Boogie &amp; The Yo-Yoz
                          Shopify checkout — cards, Shop Pay, Apple Pay, and Google Pay all work there.
                          Shipping and tax are calculated at checkout.
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => { window.location.href = shopifyCheckoutUrl; }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase py-7 rounded-xl transition-all hover:scale-[1.01] hover:shadow-[0_0_35px_rgba(220,38,38,0.4)]"
                      >
                        <Lock className="w-4 h-4 mr-2 inline" />
                        Pay Securely on Shopify — ${subtotal.toFixed(2)} + tax/shipping
                      </Button>
                    </div>
                  ) : (
                  <form onSubmit={handlePlaceOrder} className="space-y-5">
                    {/* Secure Badge */}
                    <div className="bg-zinc-950/20 border border-zinc-900 rounded-3xl p-6 md:p-8 space-y-4">
                      <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                        <h2 className="text-white font-black text-xl tracking-tight uppercase">Payment Info</h2>
                        <div className="flex items-center gap-1 bg-red-650/10 border border-red-500/20 px-2.5 py-1 rounded-full text-red-500 text-[10px] font-black uppercase tracking-widest">
                          <Lock className="w-3 h-3" />
                          Secure
                        </div>
                      </div>

                      {/* Mock credit card helper notice */}
                      <div className="bg-red-950/20 border border-red-600/30 rounded-2xl p-4 flex gap-3 text-red-400 text-xs">
                        <HelpCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                        <div>
                          <p className="font-bold uppercase tracking-wider mb-1">Sandbox Mode Active</p>
                          <p className="text-zinc-400">Use test card <code className="text-red-400 font-bold bg-zinc-950 px-1.5 py-0.5 rounded">4242 4242 4242 4242</code> with any future expiry date and any 3-digit CVC to proceed.</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-zinc-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
                          Card Number
                        </Label>
                        <Input
                          required
                          value={payment.cardNumber}
                          onChange={(e) => handlePaymentChange("cardNumber", e.target.value)}
                          placeholder="4242 4242 4242 4242"
                          className={`bg-zinc-900 border-zinc-850 text-white rounded-xl placeholder:text-zinc-650 focus-visible:ring-red-500 font-mono tracking-widest ${
                            errors.cardNumber ? "border-red-600 focus-visible:ring-red-600" : ""
                          }`}
                        />
                        {errors.cardNumber && <p className="text-red-500 text-xs font-medium">{errors.cardNumber}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-zinc-400 text-xs font-black uppercase tracking-wider">Expiry Date</Label>
                          <Input
                            required
                            value={payment.expiry}
                            onChange={(e) => handlePaymentChange("expiry", e.target.value)}
                            placeholder="MM/YY"
                            className={`bg-zinc-900 border-zinc-850 text-white rounded-xl placeholder:text-zinc-650 focus-visible:ring-red-500 text-center font-mono ${
                              errors.expiry ? "border-red-600 focus-visible:ring-red-600" : ""
                            }`}
                          />
                          {errors.expiry && <p className="text-red-500 text-xs font-medium">{errors.expiry}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-zinc-400 text-xs font-black uppercase tracking-wider">CVC Code</Label>
                          <Input
                            required
                            value={payment.cvc}
                            onChange={(e) => handlePaymentChange("cvc", e.target.value)}
                            placeholder="123"
                            className={`bg-zinc-900 border-zinc-850 text-white rounded-xl placeholder:text-zinc-650 focus-visible:ring-red-500 text-center font-mono ${
                              errors.cvc ? "border-red-600 focus-visible:ring-red-600" : ""
                            }`}
                          />
                          {errors.cvc && <p className="text-red-500 text-xs font-medium">{errors.cvc}</p>}
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={placeOrderMutation.isPending}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase py-7 rounded-xl transition-all hover:scale-[1.01] hover:shadow-[0_0_35px_rgba(220,38,38,0.4)]"
                    >
                      {placeOrderMutation.isPending ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2 inline" />
                          Pay & Place Order — ${total.toFixed(2)}
                        </>
                      )}
                    </Button>
                  </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sticky Order Summary Sidebar */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-6 space-y-5">
              <h2 className="text-white font-black text-xl tracking-tight uppercase border-b border-zinc-900 pb-3">Order Summary</h2>
              
              {/* Product list */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center justify-between border-b border-zinc-900/40 pb-3 last:border-0 last:pb-0">
                    <div className="flex gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800/40">
                        <img
                          src={item.image_url || "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=200&q=80"}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-black truncate uppercase">{item.product_name}</p>
                        <p className="text-zinc-500 text-[10px] font-black uppercase mt-0.5">
                          Qty: {item.quantity} {item.size && `· Size: ${item.size}`} {item.color && `· Color: ${item.color}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-white text-sm font-bold shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Subtotal, Shipping, Tax, Total calculations */}
              <div className="border-t border-zinc-900 pt-4 space-y-2.5">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-zinc-500">Subtotal</span>
                  <span className="text-white">${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-zinc-500">Estimated Tax (8%)</span>
                  <span className="text-white">${tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-zinc-500">Shipping</span>
                  <span className="text-white">
                    {shipping_cost === 0 ? (
                      <span className="text-red-500 font-black">FREE</span>
                    ) : (
                      `$${shipping_cost.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between pt-3 border-t border-zinc-900 items-baseline">
                  <span className="text-white font-black uppercase tracking-wider text-sm">Total</span>
                  <span className="text-red-500 font-black text-2xl tracking-tight">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Shipping progress notification bar */}
              {subtotal < 100 && (
                <div className="bg-zinc-900/60 rounded-2xl p-4 text-center text-xs">
                  <p className="text-zinc-400 font-medium">
                    Add <span className="text-red-500 font-black">${(100 - subtotal).toFixed(2)}</span> more for <span className="font-black text-white">FREE SHIPPING!</span>
                  </p>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-red-600 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min((subtotal / 100) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}