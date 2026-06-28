import { ShoppingCart, Package } from 'lucide-react'
import { formatPrice } from '../lib/stripe'

// Map product index to a rotating neon accent for visual variety
const ACCENTS = [
  { color: '#39ff14', glow: 'rgba(57,255,20,0.35)',  label: 'rgba(57,255,20,0.85)'  },
  { color: '#00eaff', glow: 'rgba(0,234,255,0.35)',  label: 'rgba(0,234,255,0.85)'  },
  { color: '#bf00ff', glow: 'rgba(191,0,255,0.35)',  label: 'rgba(191,0,255,0.85)'  },
  { color: '#ffb300', glow: 'rgba(255,179,0,0.35)',  label: 'rgba(255,179,0,0.85)'  },
]

export default function ProductCard({ product, onAddToCart, index = 0 }) {
  const accent = ACCENTS[index % ACCENTS.length]

  return (
    <div
      className="group rounded-xl overflow-hidden animate-slide-up transition-all duration-300"
      style={{
        background: 'linear-gradient(160deg, #141414 0%, #0e0e0e 100%)',
        border: `1px solid rgba(240,240,240,0.07)`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.border = `1px solid ${accent.color}55`
        e.currentTarget.style.boxShadow = `0 0 28px ${accent.glow}, 0 8px 32px rgba(0,0,0,0.6)`
        e.currentTarget.style.transform = 'translateY(-4px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.border = `1px solid rgba(240,240,240,0.07)`
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Product Image */}
      <div
        className="aspect-square relative overflow-hidden"
        style={{
          background: `radial-gradient(ellipse at center, ${accent.color}12 0%, #080808 70%)`,
        }}
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <Package size={48} style={{ color: `${accent.color}50` }} />
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: `${accent.color}40` }}
            >
              {product.category || 'Merch'}
            </p>
          </div>
        )}

        {/* Low Stock Badge */}
        {product.stock != null && product.stock < 10 && product.stock > 0 && (
          <div
            className="absolute top-3 right-3 text-xs font-black px-3 py-1 rounded uppercase tracking-widest"
            style={{
              background: '#dc143c',
              color: '#f0f0f0',
              boxShadow: '0 0 12px rgba(220,20,60,0.6)',
            }}
          >
            Only {product.stock} left
          </div>
        )}

        {/* Out of Stock overlay */}
        {product.stock === 0 && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(8,8,8,0.75)', backdropFilter: 'blur(2px)' }}
          >
            <span className="font-black uppercase tracking-widest text-sm" style={{ color: 'rgba(240,240,240,0.4)' }}>
              Sold Out
            </span>
          </div>
        )}

        {/* Accent bar at bottom of image */}
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg, transparent, ${accent.color}, transparent)` }}
        />
      </div>

      {/* Product Info */}
      <div className="p-5">
        <h3
          className="font-black text-base mb-1 leading-tight transition-colors duration-200"
          style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#f0f0f0' }}
        >
          {product.name}
        </h3>

        {product.description && (
          <p
            className="text-xs mb-4 line-clamp-2 leading-relaxed"
            style={{ color: 'rgba(240,240,240,0.45)' }}
          >
            {product.description}
          </p>
        )}

        <div className="flex justify-between items-center gap-2 mt-4">
          <span
            className="text-2xl font-black"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              color: accent.color,
              textShadow: `0 0 12px ${accent.glow}`,
            }}
          >
            {formatPrice(product.price)}
          </span>

          <button
            id={`add-to-cart-${product.id}`}
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: product.stock === 0 ? 'rgba(240,240,240,0.06)' : `${accent.color}18`,
              border: `1px solid ${product.stock === 0 ? 'rgba(240,240,240,0.1)' : `${accent.color}55`}`,
              color: product.stock === 0 ? 'rgba(240,240,240,0.35)' : accent.color,
            }}
            onMouseEnter={e => {
              if (product.stock !== 0) {
                e.currentTarget.style.background = `${accent.color}30`
                e.currentTarget.style.boxShadow = `0 0 14px ${accent.glow}`
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = `${accent.color}18`
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <ShoppingCart size={14} />
            Add
          </button>
        </div>
      </div>
    </div>
  )
}