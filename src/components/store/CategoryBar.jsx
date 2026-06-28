import React from "react";
import { Shirt, Users, User, Sparkles, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "category_Shirts", label: "Shirts", icon: Shirt },
  { id: "category_Hoodies", label: "Hoodies", icon: Flame },
  { id: "style_v-neck", label: "V-Necks", icon: Shirt },
  { id: "gender_men", label: "Men's", icon: Users },
  { id: "gender_women", label: "Women's", icon: User },
];

export default function CategoryBar({ active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = active === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shrink-0",
              isActive
                ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            )}
          >
            <Icon className="w-4 h-4" />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}