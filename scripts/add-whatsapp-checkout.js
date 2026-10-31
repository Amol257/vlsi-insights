const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.resolve('c:/Users/acer/Desktop/Antigravity/WORK/VLSI Insights/frontend/pages/cart.html'),
  path.resolve('c:/Users/acer/Desktop/Antigravity/WORK/VLSI Insights - Copy/frontend/pages/cart.html')
];

const cssToInject = `
    /* Alternative Checkout Divider */
    .checkout-divider {
      display: flex;
      align-items: center;
      text-align: center;
      margin: 14px 0 10px;
    }
    .checkout-divider::before,
    .checkout-divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid var(--edge);
    }
    .checkout-divider span {
      padding: 0 10px;
      font-size: 0.6875rem;
      font-weight: 700;
      color: var(--text-lo);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    /* WhatsApp Order Button */
    .whatsapp-order-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 13px 20px;
      background: #25D366;
      color: #FFFFFF;
      font-family: var(--font-display);
      font-size: 0.9375rem;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      border: none;
      transition: all var(--dur-fast) ease;
      position: relative;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(37, 211, 102, 0.2);
    }
    .whatsapp-order-btn svg {
      flex-shrink: 0;
    }
    .whatsapp-order-btn:hover:not(:disabled) {
      background: #20bd5a;
      transform: translateY(-1px);
      box-shadow: 0 4px 14px rgba(37, 211, 102, 0.35);
    }
    .whatsapp-order-btn:active:not(:disabled) {
      transform: scale(0.98);
    }
    .whatsapp-order-btn:disabled {
      opacity: 0.55;
      cursor: not-allowed;
      box-shadow: none;
    }
`;

const htmlToInject = `
          <div class="checkout-divider">
            <span>OR</span>
          </div>

          <button class="whatsapp-order-btn" id="whatsappOrderBtn" type="button" disabled>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.979-.276-.101-.476-.15-.677.15-.2.301-.777.979-.953 1.18-.175.2-.351.226-.652.075-1.956-.979-3.238-1.748-4.526-3.957-.34-.585.341-.543.977-1.815.1-.2.05-.376-.025-.526-.076-.15-.678-1.631-.929-2.235-.245-.589-.494-.509-.678-.518-.176-.008-.376-.01-.577-.01-.2 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.508 0 1.48 1.079 2.909 1.229 3.109.15.2 2.122 3.24 5.141 4.543 2.51 1.084 3.024.869 3.57.818.547-.05 1.782-.728 2.033-1.43.25-.703.25-1.305.175-1.43-.075-.126-.275-.201-.576-.351z"/>
              <path d="M12.004 2C6.48 2 2 6.48 2 12c0 1.848.5 3.58 1.378 5.076L2 22l5.078-1.332A9.96 9.96 0 0012.004 22C17.524 22 22 17.52 22 12s-4.476-10-9.996-10zm0 18.25c-1.62 0-3.13-.483-4.404-1.314l-.316-.207-3.272.858.873-3.19-.227-.361A8.204 8.204 0 013.75 12c0-4.553 3.7-8.25 8.254-8.25 4.553 0 8.25 3.697 8.25 8.25 0 4.553-3.697 8.25-8.25 8.25z"/>
            </svg>
            <span class="whatsapp-btn__label">Enroll / Order via WhatsApp</span>
          </button>
`;

const jsToInject = `
    // ================================================================
    // WHATSAPP ORDER / ENROLLMENT INTEGRATION (Option B Dual Flow)
    // ================================================================
    const waOrderBtn = document.getElementById('whatsappOrderBtn');
    if (waOrderBtn) {
      waOrderBtn.addEventListener('click', async function() {
        var cart = getCart();
        if (!cart || !cart.length) return;

        var totals = calcTotals(cart);
        var user = null;
        try {
          user = await getAuthUser();
        } catch (e) {}

        // Format program list
        var programList = cart.map(function(item, idx) {
          var priceStr = (item.price && item.price > 0) ? '₹' + item.price.toLocaleString('en-IN') : (item.priceLabel || 'Price on request');
          var qtyStr = (item.qty && item.qty > 1) ? ' (Qty: ' + item.qty + ')' : '';
          return (idx + 1) + '. ' + item.name + ' - ' + priceStr + qtyStr;
        }).join('\\n');

        var studentInfo = '';
        if (user) {
          var fullName = (user.user_metadata && user.user_metadata.full_name) || '';
          var email = user.email || '';
          var phone = (user.user_metadata && user.user_metadata.phone) || '';
          studentInfo = '\\n\\n👤 *Student Information:*' +
            (fullName ? '\\n• Name: ' + fullName : '') +
            (email ? '\\n• Email: ' + email : '') +
            (phone ? '\\n• Phone: ' + phone : '');
        }

        var promoInfo = appliedPromo ? ('\\n🏷️ *Promo Code:* ' + Object.keys(PROMO_CODES).find(function(k) { return PROMO_CODES[k] === appliedPromo; }) + ' (Discount Applied)') : '';
        var totalText = '₹' + totals.total.toLocaleString('en-IN') + ' (incl. 18% GST)';

        var textMessage = '👋 *Hi VLSI Insights Team!*\\n' +
          'I would like to enroll in the following program(s):\\n\\n' +
          '📚 *Selected Programs:*\\n' + programList + '\\n' +
          promoInfo + '\\n' +
          '💰 *Total Amount:* ' + totalText +
          studentInfo + '\\n\\n' +
          'Please guide me with the enrollment procedure, batch dates, and payment options (UPI / Bank Transfer). Thank you!';

        // Silent lead logging to Supabase contact_submissions audit log
        try {
          var client = (typeof sb !== 'undefined' && sb && sb.from) ? sb : (typeof getSbClient === 'function' ? getSbClient() : null);
          if (client && client.from) {
            client.from('contact_submissions').insert({
              name: (user && user.user_metadata && user.user_metadata.full_name) || 'WhatsApp Cart Customer',
              email: (user && user.email) || 'whatsapp-order@vlsiinsights.com',
              phone: (user && user.user_metadata && user.user_metadata.phone) || null,
              message: 'Cart WhatsApp Checkout: ' + cart.map(function(c) { return c.name; }).join(', ') + ' | Total: ' + totalText,
              source: 'cart_whatsapp_checkout'
            }).then(function() {}).catch(function() {});
          }
        } catch (logErr) {}

        var waUrl = 'https://wa.me/919810191592?text=' + encodeURIComponent(textMessage);
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      });
    }
`;

targetFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log('Skipping non-existent:', file);
    return;
  }

  let content = fs.readFileSync(file, 'utf8');

  // 1. Inject CSS if not present
  if (!content.includes('.whatsapp-order-btn')) {
    content = content.replace('.secure-note {', cssToInject + '\n    .secure-note {');
  }

  // 2. Inject Button HTML if not present
  if (!content.includes('id="whatsappOrderBtn"')) {
    content = content.replace(
      '</button>\n\n          <div class="secure-note">',
      '</button>' + htmlToInject + '\n          <div class="secure-note">'
    );
    // Handle CRLF variant
    if (!content.includes('id="whatsappOrderBtn"')) {
      content = content.replace(
        '</button>\r\n\r\n          <div class="secure-note">',
        '</button>' + htmlToInject.replace(/\n/g, '\r\n') + '\r\n          <div class="secure-note">'
      );
    }
  }

  // 3. Update renderCart() disabled state
  if (!content.includes("document.getElementById('whatsappOrderBtn');")) {
    content = content.replace(
      'const payBtn = document.getElementById(\'payBtn\');',
      'const payBtn = document.getElementById(\'payBtn\');\n      const waOrderBtn = document.getElementById(\'whatsappOrderBtn\');'
    );
    content = content.replace(
      'payBtn.disabled = true;\n        if (countEl) countEl.textContent = \'0 items\';',
      'payBtn.disabled = true;\n        if (waOrderBtn) waOrderBtn.disabled = true;\n        if (countEl) countEl.textContent = \'0 items\';'
    );
    content = content.replace(
      'payBtn.disabled = true;\r\n        if (countEl) countEl.textContent = \'0 items\';',
      'payBtn.disabled = true;\r\n        if (waOrderBtn) waOrderBtn.disabled = true;\r\n        if (countEl) countEl.textContent = \'0 items\';'
    );
    content = content.replace(
      'payBtn.disabled = false;\n\n      list.innerHTML',
      'payBtn.disabled = false;\n      if (waOrderBtn) waOrderBtn.disabled = false;\n\n      list.innerHTML'
    );
    content = content.replace(
      'payBtn.disabled = false;\r\n\r\n      list.innerHTML',
      'payBtn.disabled = false;\r\n      if (waOrderBtn) waOrderBtn.disabled = false;\r\n\r\n      list.innerHTML'
    );
  }

  // 4. Inject JS Handler if not present
  if (!content.includes('WHATSAPP ORDER / ENROLLMENT INTEGRATION')) {
    content = content.replace(
      'function onPaymentSuccess(response) {',
      jsToInject + '\n    function onPaymentSuccess(response) {'
    );
    if (!content.includes('WHATSAPP ORDER / ENROLLMENT INTEGRATION')) {
      content = content.replace(
        'function onPaymentSuccess(response) {',
        jsToInject.replace(/\n/g, '\r\n') + '\r\n    function onPaymentSuccess(response) {'
      );
    }
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated:', file);
});

