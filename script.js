document.addEventListener("DOMContentLoaded", async () => {
    const paymentMethodForm = document.getElementById('payment-method-form');
    const confirmationForm = document.getElementById('confirmation-form');
    const stripe = Stripe('pk_test_51Lq39MBZR5OhU67takJreymGrz56AcKaHvgyT7E2qd5ud4AU2icbseISyhZZGO9N8kV2TyNvhTH2waS2HCZo13Zy000zDuz7Y5'); // Reemplaza 'tu_clave_publica' con tu clave pública de Stripe
  
    paymentMethodForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const accountHolderNameField = document.getElementById('account-holder-name');
      const emailField = document.getElementById('email');

      const setupIntent = await stripe.setupIntents.create({
        payment_method_types: ['us_bank_account'],
        customer: 'id_del_cliente', // Reemplaza 'id_del_cliente' con el ID de tu cliente
      });
      
      const clientSecret = setupIntent.client_secret;
  
      // Llama a este método para abrir el diálogo de verificación instantánea.
      stripe.collectBankAccountForSetup({
        clientSecret: clientSecret,
        params: {
          payment_method_type: 'us_bank_account',
          payment_method_data: {
            billing_details: {
              name: accountHolderNameField.value,
              email: emailField.value,
            },
          },
        },
        expand: ['payment_method'],
      })
      .then(({setupIntent, error}) => {
        if (error) {
          console.error(error.message);
          // Fallo en la colección del método de pago por alguna razón.
        } else if (setupIntent.status === 'requires_payment_method') {
          // El cliente canceló el modal de verificación alojado. Preséntale otras opciones de método de pago.
        } else if (setupIntent.status === 'requires_confirmation') {
          // Recolectamos una cuenta, posiblemente verificada al instante, pero posiblemente ingresada manualmente. Muestra los detalles del método de pago y el texto del mandato al cliente y confirma la intención una vez que acepte el mandato.
          confirmationForm.show();
        }
      });
    });
  });
  