import React, { useState } from 'react'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import api from '../services/api.js'

export default function PaymentButton({ cvId, action, onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const pay = async () => {
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/api/v1/payments/intent', { cvId, action })
      const card = elements.getElement(CardElement)
      const result = await stripe.confirmCardPayment(data.clientSecret, { payment_method: { card } })
      if (result.error) setError(result.error.message || 'Payment failed')
      else if (result.paymentIntent.status === 'succeeded') onSuccess?.()
    } catch (e) {
      setError(e?.response?.data?.message || e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border rounded p-3">
      <div className="mb-2"><CardElement options={{ hidePostalCode: true }} /></div>
      <button className="btn btn-primary" onClick={pay} disabled={!stripe || loading}>
        {loading ? 'Processing…' : `Pay & ${action==='download'?'Download PDF':'Create Share Link'}`}
      </button>
      {error && <div className="text-danger small mt-2">{error}</div>}
    </div>
  )
}
