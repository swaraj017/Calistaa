async function payNow(event) {
  event.preventDefault();  

  const priceElement = document.querySelector('.amount');

  if (!priceElement) {
      alert('Price not found!');
      return;
  }

  const amountText = priceElement.textContent.trim();
  const amount = parseFloat(amountText.replace('₹', '').replace(/,/g, '').trim());

  if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
  }

  const response = await fetch('/create-order', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount, currency: 'INR', receipt: 'receipt#1', notes: {} })
  });

  const order = await response.json();

  if (!order || !order.id) {
      alert('Error creating order');
      return;
  }

  const options = {
      key: '',
      amount: order.amount,
      currency: order.currency,
      name: 'Your Company Name',
      description: 'Test Transaction',
      order_id: order.id,
      callback_url: 'http://localhost:3000/payment-success',
      prefill: {
          name: 'Your Name',
          email: 'your.email@example.com',
          contact: '9999999999'
      },
      theme: {
          color: '#F37254'
      },
      handler: function (response) {
          fetch('/verify-payment', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
              })
          }).then(res => res.json())
              .then(data => {
                  if (data.status === 'ok') {
                      window.location.href = '/payment-success';
                  } else {
                      alert('Payment verification failed');
                  }
              }).catch(error => {
                  console.error('Error:', error);
                  alert('Error verifying payment');
              });
      }
  };

  const rzp = new Razorpay(options);
  rzp.open();
}
