// Format price for display
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

// Stripe integration will be added later
export const getStripe = () => {
  console.log('Stripe not yet configured')
  return null
}

export const createPaymentIntent = async (amount, orderId) => {
  console.log('Payment processing not yet configured')
  return null
}