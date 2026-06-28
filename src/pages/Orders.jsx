import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Package, ArrowLeft, Clock, Truck, Check, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const statusConfig = {
  pending: { icon: Clock, color: "bg-yellow-600/20 text-yellow-500", label: "Pending" },
  confirmed: { icon: Check, color: "bg-green-600/20 text-green-500", label: "Confirmed" },
  shipped: { icon: Truck, color: "bg-blue-600/20 text-blue-500", label: "Shipped" },
  delivered: { icon: Package, color: "bg-emerald-600/20 text-emerald-500", label: "Delivered" },
};

export default function Orders() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => base44.entities.Order.list("-created_date", 50),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-5 py-8">
        <Link
          to={createPageUrl("Home")}
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>

        <h1 className="text-white font-black text-3xl mb-8">MY ORDERS</h1>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 font-medium text-lg">No orders yet</p>
            <Link to={createPageUrl("Shop")}>
              <Button className="mt-6 bg-red-600 hover:bg-red-700 rounded-full">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-zinc-900 rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-zinc-500 text-xs">
                        {format(new Date(order.created_date), "MMM d, yyyy")}
                      </p>
                      <p className="text-white font-bold mt-0.5">
                        Order #{order.id?.slice(-6).toUpperCase()}
                      </p>
                    </div>
                    <Badge className={`${status.color} border-0 font-bold text-xs`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {order.items?.map((item, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
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
                        <span className="text-zinc-300 text-sm font-bold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
                    <span className="text-zinc-400 text-sm">Total</span>
                    <span className="text-red-500 font-black text-lg">
                      ${order.total?.toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}