import { X, Plus, Minus, ShoppingBag } from 'lucide-react'
import { formatPrice } from '../lib/stripe'

export default function Cart({ cartItems, onRemove, onUpdateQuantity, onClose }) {
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  if (cartItems.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div
          className="flex justify-between items-center mb-6 pb-4"
          style={{ borderBottom: '1px solid rgba(57,255,20,0.15)' }}
        >
          <h2 className="text-xl font-black uppercase tracking-wider" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Your Cart
          </h2>
          <button onClick={onClose} className="md:hidden transition" style={{ color: '#39ff14' }}>
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ShoppingBag size={48} style={{ color: 'rgba(57,255,20,0.2)', margin: '0 auto 12px' }} />
            <p className="font-bold text-sm mb-3" style={{ color: 'rgba(240,240,240,0.4)' }}>Your cart is empty</p>
            <button
              onClick={onClose}
              className="text-xs font-bold uppercase tracking-widest transition-all"
              style={{ color: '#39ff14', textDecoration: 'underline' }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div
        className="flex justify-between items-center mb-6 pb-4"
        style={{ borderBottom: '1px solid rgba(57,255,20,0.15)' }}
      >
        <h2 className="text-xl font-black uppercase tracking-wider" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Your Cart
        </h2>
        <button onClick={onClose} className="md:hidden transition" style={{ color: '#39ff14' }}>
          <X size={22} />
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-1">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="rounded-lg p-3 transition-all duration-200"
            style={{
              background: 'rgba(57,255,20,0.04)',
              border: '1px solid rgba(57,255,20,0.12)',
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-sm leading-tight" style={{ color: '#f0f0f0', maxWidth: '75%' }}>
                {item.name}
              </h3>
              <button
                onClick={() => onRemove(item.id)}
                className="transition"
                style={{ color: 'rgba(240,240,240,0.3)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#dc143c'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,240,240,0.3)'}
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex justify-between items-center">
              <p className="font-black text-sm" style={{ color: '#39ff14', fontFamily: 'Space Grotesk, sans-serif' }}>
                {formatPrice(item.price)}
              </p>

              {/* Quantity Controls */}
              <div
                className="flex items-center gap-1 rounded-lg"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(57,255,20,0.15)', padding: '2px 4px' }}
              >
                <button
                  id={`qty-minus-${item.id}`}
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  className="p-1 rounded transition-colors"
                  style={{ color: 'rgba(57,255,20,0.7)' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#39ff14'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(57,255,20,0.7)'}
                >
                  <Minus size={12} />
                </button>
                <span className="w-6 text-center text-xs font-black" style={{ color: '#f0f0f0' }}>
                  {item.quantity}
                </span>
                <button
                  id={`qty-plus-${item.id}`}
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="p-1 rounded transition-colors"
                  style={{ color: 'rgba(57,255,20,0.7)' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#39ff14'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(57,255,20,0.7)'}
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>

            <p className="text-xs mt-1.5" style={{ color: 'rgba(240,240,240,0.3)' }}>
              Subtotal: {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="space-y-3" style={{ borderTop: '1px solid rgba(57,255,20,0.15)', paddingTop: '1rem' }}>
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'rgba(240,240,240,0.5)' }}>
            Total
          </span>
          <span
            className="text-2xl font-black"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              color: '#39ff14',
              textShadow: '0 0 16px rgba(57,255,20,0.5)',
            }}
          >
            {formatPrice(total)}
          </span>
        </div>

        <button
          id="checkout-btn"
          className="w-full py-3 rounded-lg text-sm font-black uppercase tracking-widest transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #39ff14, #00eaff)',
            color: '#080808',
            boxShadow: '0 0 20px rgba(57,255,20,0.35)',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 35px rgba(57,255,20,0.6)'; e.currentTarget.style.transform = 'scale(1.02)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(57,255,20,0.35)'; e.currentTarget.style.transform = 'scale(1)' }}
        >
          Proceed to Checkout
        </button>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-all duration-200"
          style={{
            border: '1px solid rgba(57,255,20,0.25)',
            color: 'rgba(57,255,20,0.7)',
            background: 'transparent',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(57,255,20,0.06)'; e.currentTarget.style.borderColor = 'rgba(57,255,20,0.5)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(57,255,20,0.25)' }}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  )
}