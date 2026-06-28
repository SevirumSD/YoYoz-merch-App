import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Bell, ArrowLeft, Zap, Tag, Music, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { motion } from "framer-motion";

const typeConfig = {
  new_merch: { icon: Zap, color: "bg-red-600/20 text-red-500" },
  sale: { icon: Tag, color: "bg-red-600/20 text-red-500" },
  tour: { icon: Music, color: "bg-red-600/20 text-red-500" },
  restock: { icon: Package, color: "bg-red-600/20 text-red-500" },
};

export default function Notifications() {
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => base44.entities.Notification.list("-created_date", 50),
  });

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto px-5 py-8">
        <Link
          to={createPageUrl("Home")}
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-red-500" />
          </div>
          <h1 className="text-white font-black text-3xl">ALERTS</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 font-medium">No alerts yet</p>
            <p className="text-zinc-600 text-sm mt-1">
              We'll notify you about new merch drops & deals
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif, i) => {
              const config = typeConfig[notif.type] || typeConfig.new_merch;
              const Icon = config.icon;
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-zinc-900 rounded-2xl p-5 flex gap-4"
                >
                  <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-sm">{notif.title}</h3>
                    <p className="text-zinc-400 text-sm mt-1">{notif.message}</p>
                    <p className="text-zinc-600 text-xs mt-2">
                      {format(new Date(notif.created_date), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  {notif.image_url && (
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                      <img src={notif.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}