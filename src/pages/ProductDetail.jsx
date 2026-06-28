import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { getProduct } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Zap, ArrowLeft, Check, Sparkles, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ImageZoomModal from "../components/store/ImageZoomModal";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function ProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [added, setAdded] = useState(false);
  
  // Customization States inspired by 24hourwristband.com
  const [customText, setCustomText] = useState("");
  const [selectedFont, setSelectedFont] = useState("modern");
  const [printPosition, setPrintPosition] = useState("front");
  const [quantity, setQuantity] = useState(1);
  const [uploadedLogo, setUploadedLogo] = useState(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId),
    enabled: !!productId,
  });

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedLogo(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculate pricing based on custom options and quantity bulk discount tiers
  const { unitPrice, totalPrice, discountPercent } = useMemo(() => {
    if (!product) return { unitPrice: 0, totalPrice: 0, discountPercent: 0 };
    
    const basePrice = product.price;
    
    // Custom print position fee adjustments (additional print setup fee for logo if uploaded)
    const positionExtra = printPosition === "both" ? 2.00 : printPosition === "wrap" ? 4.00 : 0.00;
    const logoExtra = uploadedLogo ? 1.50 : 0.00; // Extra $1.50 per unit for custom logo print setup
    const singleItemPrice = basePrice + positionExtra + logoExtra;

    // Bulk quantity pricing discount tiers
    let discount = 0;
    if (quantity >= 50) {
      discount = 30; // 30% off for 50+ units
    } else if (quantity >= 10) {
      discount = 15; // 15% off for 10-49 units
    }

    const calculatedUnit = Number((singleItemPrice * (1 - discount / 100)).toFixed(2));
    const calculatedTotal = Number((calculatedUnit * quantity).toFixed(2));

    return {
      unitPrice: calculatedUnit,
      totalPrice: calculatedTotal,
      discountPercent: discount
    };
  }, [product, printPosition, quantity, uploadedLogo]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    // Construct descriptive name indicating custom prints
    let displayName = product.name;
    const details = [];
    if (customText) details.push(`Text: "${customText}"`);
    if (uploadedLogo) details.push("Custom Logo Printed");
    if (printPosition !== "front") details.push(`Position: ${printPosition}`);
    if (selectedFont !== "modern" && customText) details.push(`Font: ${selectedFont}`);
    
    if (details.length > 0) {
      displayName += ` (Custom: ${details.join(", ")})`;
    }

    await base44.entities.CartItem.create({
      product_id: product.id,
      product_name: displayName,
      price: unitPrice,
      quantity: quantity,
      size: selectedSize || product.sizes?.[0] || "",
      color: selectedColor || product.colors?.[0] || "",
      image_url: product.image_url,
    });

    window.dispatchEvent(new Event("cart-updated"));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <p className="text-zinc-500">Product not found</p>
        <Link to={createPageUrl("Shop")} className="text-red-500 mt-4 font-bold">
          Back to Shop
        </Link>
      </div>
    );
  }

  const allImages = [product.image_url, ...(product.images || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-5 pt-6 pb-20">
        <Link
          to={createPageUrl("Shop")}
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Images with Live Mockup Text/Logo Engraving Overlay */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            <div
              className="aspect-square rounded-2xl overflow-hidden bg-zinc-900 cursor-zoom-in relative group border border-zinc-850"
              onClick={() => setZoomImage(allImages[0])}
            >
              <img
                src={allImages[0] || "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600&q=80"}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />

              {/* Dynamic Custom Configuration overlay (simulating 24hourwristband preview) */}
              {product.isCustom && (customText || uploadedLogo) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4">
                  <div className="flex flex-col items-center justify-center px-5 py-4 bg-black/75 backdrop-blur-[4px] rounded-2xl border border-white/10 max-w-[85%] break-words shadow-2xl transition-all duration-300">
                    <span className="text-[9px] text-zinc-500 font-bold block uppercase tracking-wider mb-2">Live Preview</span>
                    
                    {/* Live Logo Preview inside mockup container */}
                    {uploadedLogo && (
                      <div className="w-16 h-16 bg-zinc-950/40 rounded-lg p-1.5 border border-white/5 flex items-center justify-center mb-2.5">
                        <img src={uploadedLogo} alt="Mockup Logo" className="max-w-full max-h-full object-contain opacity-90 brightness-110" />
                      </div>
                    )}

                    {/* Live Engraving Text preview */}
                    {customText && (
                      <div 
                        className="text-center font-bold uppercase"
                        style={{ 
                          fontFamily: selectedFont === "script" ? "'Brush Script MT', cursive" 
                                    : selectedFont === "serif" ? "Georgia, serif" 
                                    : selectedFont === "impact" ? "Impact, Charcoal, sans-serif"
                                    : "'Space Grotesk', sans-serif",
                          fontSize: customText.length > 20 ? "11px" : customText.length > 10 ? "13px" : "16px",
                          color: selectedColor === "Rose Gold" ? "#f4a261" 
                                : selectedColor === "Silver" ? "#e5e7eb" 
                                : selectedColor === "Midnight Black" ? "#f3f4f6"
                                : selectedColor === "Crimson Red" ? "#ef4444"
                                : selectedColor || "#ffffff",
                          letterSpacing: selectedFont === "impact" ? "0.08em" : "normal",
                          textShadow: "0 2px 8px rgba(0,0,0,0.6)"
                        }}
                      >
                        {customText}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.slice(1, 5).map((img, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl overflow-hidden bg-zinc-900 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setZoomImage(img)}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details & Configurator */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="py-2"
          >
            <div className="flex gap-2 mb-3">
              {product.is_new && (
                <Badge className="bg-red-600 text-white border-0 font-bold text-xs uppercase">
                  <Zap className="w-3 h-3 mr-1 fill-white" />
                  NEW DROP
                </Badge>
              )}
              {product.isCustom && (
                <Badge className="bg-red-950/40 text-red-500 border border-red-900/40 font-bold text-xs uppercase">
                  <Sparkles className="w-3 h-3 mr-1" />
                  CUSTOMIZABLE
                </Badge>
              )}
            </div>

            <p className="text-zinc-500 text-sm uppercase tracking-wider font-bold">
              {product.category?.replace(/_/g, " ")}
            </p>
            <h1 className="text-white font-black text-3xl md:text-4xl mt-1 leading-tight uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {product.name}
            </h1>
            <p className="text-red-500 font-black text-3xl mt-3">
              ${product.price}
            </p>

            {product.description && (
              <p className="text-zinc-400 mt-4 leading-relaxed text-sm">
                {product.description}
              </p>
            )}

            {/* Customizer Panel for 24hourwristband-style items */}
            {product.isCustom && (
              <div className="mt-8 border border-zinc-900 bg-zinc-950/50 rounded-2xl p-5 space-y-5">
                <h3 className="text-white font-black text-sm uppercase tracking-wide border-b border-zinc-900 pb-2">
                  Configure Your Custom Print
                </h3>

                {/* Print Text Input */}
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-bold text-xs uppercase tracking-wider">Engraving / Print Text</label>
                  <input
                    type="text"
                    maxLength={30}
                    placeholder="Enter name or custom text (max 30 chars)"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm font-bold"
                  />
                </div>

                {/* Font Selector */}
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-bold text-xs uppercase tracking-wider">Font Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "modern", label: "Modern Sans" },
                      { id: "impact", label: "Bold Impact" },
                      { id: "script", label: "Fancy Script" },
                    ].map((font) => (
                      <button
                        key={font.id}
                        onClick={() => setSelectedFont(font.id)}
                        className={cn(
                          "py-2 rounded-lg text-xs font-bold transition-all border",
                          selectedFont === font.id
                            ? "bg-red-600 border-red-600 text-white"
                            : "bg-zinc-900 border-zinc-850 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        )}
                      >
                        {font.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drag and Drop Custom Logo Uploader */}
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-bold text-xs uppercase tracking-wider block">Upload Logo / Clip Art</label>
                  <div className="border-2 border-dashed border-zinc-850 hover:border-red-600/40 rounded-xl p-4 transition-all flex flex-col items-center justify-center bg-zinc-900/35 text-center relative group/dropzone min-h-[110px]">
                    {uploadedLogo ? (
                      <div className="relative w-18 h-18 bg-black/40 rounded-lg p-1.5 border border-zinc-800 flex items-center justify-center">
                        <img src={uploadedLogo} alt="Uploaded preview" className="max-w-full max-h-full object-contain rounded" />
                        <button 
                          onClick={(e) => { e.preventDefault(); setUploadedLogo(null); }}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 text-[9px] hover:bg-red-700 transition-colors w-5 h-5 flex items-center justify-center font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-zinc-500 mb-2 group-hover/dropzone:text-red-500 transition-colors" />
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wide">Drag & Drop Logo Here</p>
                        <p className="text-[9px] text-zinc-500 mt-1">Supports PNG, JPG, or SVG</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Print Position Selector */}
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-bold text-xs uppercase tracking-wider">Print Position</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "front", label: "Front Side" },
                      { id: "both", label: "Front & Back (+$2)" },
                      { id: "wrap", label: "Full Wrap (+$4)" },
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        onClick={() => setPrintPosition(pos.id)}
                        className={cn(
                          "py-2 px-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border",
                          printPosition === pos.id
                            ? "bg-red-600 border-red-600 text-white"
                            : "bg-zinc-900 border-zinc-850 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        )}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Standard Color Selector */}
            {product.colors?.length > 0 && (
              <div className="mt-6">
                <label className="text-zinc-300 font-bold text-xs uppercase tracking-wider block mb-2">Select Color</label>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "px-4 h-11 rounded-xl font-bold text-sm transition-all capitalize border",
                        selectedColor === color
                          ? "bg-red-600 border-red-600 text-white"
                          : "bg-zinc-900 border-zinc-850 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      )}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bulk Quantity Selector & Dynamic Price Display */}
            <div className="mt-8 pt-6 border-t border-zinc-900">
              <div className="flex flex-col sm:flex-row gap-5 items-stretch sm:items-center">
                {/* Quantity Input */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <label className="text-zinc-300 font-bold text-xs uppercase tracking-wider">Quantity</label>
                  <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden h-12 w-32">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 text-zinc-400 hover:text-white font-black text-lg h-full border-r border-zinc-800 hover:bg-zinc-800 transition-colors"
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      min={1} 
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-12 bg-transparent text-center text-white font-black text-sm border-0 focus:outline-none"
                    />
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 text-zinc-400 hover:text-white font-black text-lg h-full border-l border-zinc-800 hover:bg-zinc-800 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Real-time Bulk Price Calculator panel */}
                <div className="flex-1 bg-zinc-950 border border-zinc-900 rounded-2xl px-4 py-3 flex flex-col justify-center">
                  <div className="flex justify-between items-baseline">
                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wide">Unit Price:</span>
                    <span className="text-white font-black text-lg">${unitPrice}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between items-center text-[10px] font-black text-green-500 uppercase mt-0.5">
                      <span>Bulk Price:</span>
                      <span>{discountPercent}% OFF Applied</span>
                    </div>
                  )}
                  {uploadedLogo && (
                    <div className="flex justify-between items-center text-[9px] font-bold text-zinc-500 uppercase mt-0.5">
                      <span>Setup Fee:</span>
                      <span>+$1.50 print/unit</span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline border-t border-zinc-900 pt-1.5 mt-1.5">
                    <span className="text-zinc-400 text-xs font-black uppercase">Total Price:</span>
                    <span className="text-red-500 font-black text-2xl">${totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Bulk Pricing Info Panel */}
              {product.isCustom && (
                <div className="mt-3 flex gap-4 text-[10px] text-zinc-500 font-bold uppercase tracking-wider justify-center bg-zinc-950/20 py-2 rounded-lg">
                  <span>1-9: Reg. Price</span>
                  <span className="text-zinc-700">|</span>
                  <span className="text-red-500/80">10-49: 15% Off</span>
                  <span className="text-zinc-700">|</span>
                  <span className="text-red-500">50+: 30% Off</span>
                </div>
              )}
            </div>

            {/* Add to Cart button */}
            <Button
              onClick={handleAddToCart}
              disabled={added}
              className={cn(
                "w-full mt-8 font-black uppercase tracking-wider py-7 rounded-xl text-lg transition-all",
                added
                  ? "bg-green-600 hover:bg-green-600 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white hover:shadow-[0_0_30px_rgba(220,38,38,0.4)]"
              )}
            >
              {added ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add Custom Order to Cart
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>

      <ImageZoomModal
        imageUrl={zoomImage}
        isOpen={!!zoomImage}
        onClose={() => setZoomImage(null)}
      />
    </div>
  );
}