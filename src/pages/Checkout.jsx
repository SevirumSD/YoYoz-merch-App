import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ShoppingBag, Check, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function Checkout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState("shipping"); // shipping | confirmation
  const [shipping, setShipping] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });

  const { data: cartItems = [] } = useQuery({
    queryKey: ["cart-checkout"],
    queryFn: () => base44.entities.CartItem.list(),
  });

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping_cost = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + shipping_cost;

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

  const handleSubmit = (e) => {
    e.preventDefault();
    placeOrderMutation.mutate();
  };

  if (step === "confirmation") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-white font-black text-3xl mb-2">ORDER CONFIRMED!</h1>
          <p className="text-zinc-400 mb-8">
            Thanks for rocking with Boogie & the Yo-Yoz! You'll receive an email confirmation soon.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to={createPageUrl("Shop")}>
              <Button className="bg-red-600 hover:bg-red-700 rounded-full px-8">
                Keep Shopping
              </Button>
            </Link>
            <Link to={createPageUrl("Orders")}>
              <Button variant="outline" className="border-zinc-700 text-white rounded-full px-8 hover:bg-zinc-800">
                View Orders
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
        <ShoppingBag className="w-16 h-16 text-zinc-700 mb-4" />
        <p className="text-zinc-500 font-medium text-lg">Your cart is empty</p>
        <Link to={createPageUrl("Shop")}>
          <Button className="mt-6 bg-red-600 hover:bg-red-700 rounded-full">
            Browse Shop
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-5 py-8">
        <Link
          to={createPageUrl("Shop")}
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>

        <h1 className="text-white font-black text-3xl mb-8">CHECKOUT</h1>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Shipping Form */}
          <form onSubmit={handleSubmit} className="md:col-span-3 space-y-5">
            <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
              <h2 className="text-white font-bold text-lg mb-2">Shipping Info</h2>

              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs font-medium">Full Name</Label>
                <Input
                  required
                  value={shipping.name}
                  onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs font-medium">Email</Label>
                <Input
                  type="email"
                  required
                  value={shipping.email}
                  onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs font-medium">Address</Label>
                <Input
                  required
                  value={shipping.address}
                  onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs font-medium">City</Label>
                  <Input
                    required
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs font-medium">State</Label>
                  <Input
                    required
                    value={shipping.state}
                    onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs font-medium">ZIP Code</Label>
                  <Input
                    required
                    value={shipping.zip}
                    onChange={(e) => setShipping({ ...shipping, zip: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs font-medium">Country</Label>
                  <Input
                    value={shipping.country}
                    onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white rounded-xl"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={placeOrderMutation.isPending}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-7 rounded-xl text-lg transition-all hover:shadow-[0_0_30px_rgba(220,38,38,0.3)]"
            >
              {placeOrderMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Place Order — ${total.toFixed(2)}
                </>
              )}
            </Button>
          </form>

          {/* Order Summary */}
          <div className="md:col-span-2">
            <div className="bg-zinc-900 rounded-2xl p-6 sticky top-24">
              <h2 className="text-white font-bold text-lg mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                      <img
                        src={item.image_url || "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=200&q=80"}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.product_name}</p>
                      <p className="text-zinc-500 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-white text-sm font-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-800 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Shipping</span>
                  <span className="text-white">
                    {shipping_cost === 0 ? "FREE" : `$${shipping_cost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-zinc-800">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-red-500 font-black text-xl">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {subtotal < 50 && (
                <p className="text-zinc-500 text-xs mt-4 text-center">
                  Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}