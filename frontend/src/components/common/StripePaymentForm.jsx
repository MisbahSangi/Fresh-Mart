import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { FiLock, FiCreditCard } from 'react-icons/fi';

const StripePaymentForm = ({ amount, onSuccess, onError }) => {
  const stripe   = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMsg,   setErrorMsg]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setErrorMsg('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders`,
        },
        redirect: 'if_required'
      });

      if (error) {
        setErrorMsg(error.message);
        onError?.(error.message);
      } else if (paymentIntent?.status === 'succeeded') {
        onSuccess?.(paymentIntent.id);
      }
    } catch (err) {
      setErrorMsg('Payment failed. Please try again.');
      onError?.(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Card Header */}
      <div className="flex items-center gap-2 mb-2">
        <FiCreditCard className="text-primary" size={18} />
        <span className="text-sm font-semibold text-gray-700">
          Card Details
        </span>
        <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
          <FiLock size={11} />
          Secured by Stripe
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div className="border border-gray-200 rounded-xl p-4">
        <PaymentElement
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card'],
          }}
        />
      </div>

      {/* Test Card Info */}
      <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
        <p className="text-xs font-semibold text-blue-700 mb-1">
          🧪 Test Mode — Use Test Card:
        </p>
        <p className="text-xs text-blue-600 font-mono">
          4242 4242 4242 4242
        </p>
        <p className="text-xs text-blue-500">
          Expiry: any future date · CVC: any 3 digits · ZIP: any 5 digits
        </p>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3">
          <p className="text-red-600 text-xs">❌ {errorMsg}</p>
        </div>
      )}

      {/* Pay Button */}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-primary text-white font-bold py-3.5
                   rounded-xl hover:bg-secondary transition text-sm
                   flex items-center justify-center gap-2
                   disabled:opacity-60 disabled:cursor-not-allowed">
        {processing ? (
          <>
            <div className="w-4 h-4 border-2 border-white
                            border-t-transparent rounded-full animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <FiLock size={15} />
            Pay Rs. {amount?.toLocaleString()}
          </>
        )}
      </button>

      {/* Accepted Cards */}
      <div className="flex items-center justify-center gap-2 pt-1">
        <span className="text-xs text-gray-400">Accepted:</span>
        {['VISA', 'MC', 'AMEX'].map(card => (
          <span key={card}
                className="text-xs bg-gray-100 text-gray-600 px-2
                           py-0.5 rounded font-mono font-bold">
            {card}
          </span>
        ))}
      </div>
    </form>
  );
};

export default StripePaymentForm;