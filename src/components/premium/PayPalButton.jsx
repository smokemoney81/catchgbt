
import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const PAYPAL_CLIENT_ID = 'AW2UW1NJ8YU0Fw5YCSxUKTDT9gwHa5dnSL6dviKqgHEDAT-g5IaRZywYSskIOoNJxXuuxjo3wCxlHlYe';

export default function PayPalButton({ planId, planName, planPrice, onSuccess }) {
  const paypalRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Fehler beim Laden des Users:', error);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (window.paypal) {
      renderPayPalButton();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=EUR&disable-funding=venmo`;
    script.async = true;
    
    script.onload = () => {
      renderPayPalButton();
    };

    script.onerror = () => {
      toast.error('PayPal konnte nicht geladen werden');
      setIsLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [planId, planPrice, planName, user]);

  const renderPayPalButton = () => {
    if (!window.paypal || !paypalRef.current || !user) return;

    paypalRef.current.innerHTML = '';

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'paypal'
      },
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            description: `CatchGbt ${planName} Plan - Monatliches Abo`,
            amount: {
              currency_code: 'EUR',
              value: planPrice.toFixed(2)
            },
            custom_id: JSON.stringify({
              user_id: user?.id,
              user_email: user?.email,
              plan_id: planId,
              plan_name: planName
            })
          }]
        });
      },
      onApprove: async (data, actions) => {
        try {
          const order = await actions.order.capture();
          console.log('PayPal Zahlung erfolgreich:', order);

          try {
            await base44.functions.invoke('activatePlan', {
              plan_id: planId,
              payment_method: 'paypal',
              transaction_id: order.id
            });

            toast.success('Zahlung erfolgreich!', {
              description: `${planName} Plan wurde aktiviert`
            });

            if (onSuccess) onSuccess();
          } catch (activationError) {
            console.error('Fehler beim Aktivieren des Plans:', activationError);
            toast.error('Plan-Aktivierung fehlgeschlagen', {
              description: 'Bitte kontaktiere den Support'
            });
          }
        } catch (error) {
          console.error('PayPal Capture Error:', error);
          toast.error('Zahlung fehlgeschlagen');
        }
      },
      onCancel: () => {
        toast.info('Zahlung abgebrochen');
      },
      onError: (err) => {
        console.error('PayPal Error:', err);
        toast.error('PayPal Fehler', {
          description: 'Bitte versuche es später erneut'
        });
      }
    }).render(paypalRef.current).then(() => {
      setIsLoading(false);
    });
  };

  return (
    <div className="w-full">
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <div ref={paypalRef} className="min-h-[50px]"></div>
    </div>
  );
}
