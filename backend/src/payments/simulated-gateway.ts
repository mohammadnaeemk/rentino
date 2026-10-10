export interface SimulationContext {
  paymentId: string;
  orderId: string;
  amountRial: number;
  amountToman: number;
  status: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatToman(toman: number): string {
  return toman.toLocaleString("fa-IR");
}

/**
 * A local, clearly-labelled MOCK payment page. It exists only to demonstrate
 * the payment state machine — no gateway is contacted and no money moves.
 * Relative form actions keep it working behind any host/port.
 */
export function renderSimulatedGateway(ctx: SimulationContext): string {
  const completed = ctx.status === "COMPLETED";

  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>درگاه پرداخت آزمایشی | رنتینو</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; display: grid; place-items: center;
    font-family: Vazirmatn, Tahoma, system-ui, sans-serif;
    background: #f5f5f4; color: #1c1917; padding: 24px;
  }
  .card {
    width: 100%; max-width: 420px; background: #fff; border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0,0,0,.08); padding: 28px;
  }
  .badge {
    display: inline-block; background: #fef3c7; color: #92400e;
    border-radius: 999px; padding: 4px 12px; font-size: 12px; font-weight: 700;
  }
  h1 { font-size: 20px; margin: 16px 0 4px; }
  p { line-height: 1.9; font-size: 14px; color: #57534e; margin: 8px 0; }
  dl { margin: 20px 0; border-top: 1px solid #e7e5e4; }
  .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e7e5e4; }
  .row dt { color: #78716c; font-size: 13px; }
  .row dd { margin: 0; font-weight: 700; }
  form { margin: 0; }
  button {
    width: 100%; border: 0; border-radius: 10px; padding: 13px;
    font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit;
  }
  .pay { background: #16a34a; color: #fff; margin-bottom: 12px; }
  .cancel { background: #f5f5f4; color: #44403c; }
  .note { font-size: 12px; color: #a8a29e; margin-top: 18px; text-align: center; }
</style>
</head>
<body>
  <main class="card">
    <span class="badge">محیط آزمایشی — بدون پرداخت واقعی</span>
    <h1>درگاه پرداخت آزمایشی</h1>
    <p>این صفحه یک درگاه شبیه‌سازی‌شده است و هیچ تراکنش بانکی واقعی انجام نمی‌شود.</p>

    <dl>
      <div class="row"><dt>شناسه سفارش</dt><dd>${escapeHtml(ctx.orderId)}</dd></div>
      <div class="row"><dt>مبلغ</dt><dd>${formatToman(ctx.amountToman)} تومان</dd></div>
      <div class="row"><dt>وضعیت</dt><dd>${completed ? "پرداخت‌شده" : "در انتظار پرداخت"}</dd></div>
    </dl>

    ${
      completed
        ? `<p>این پرداخت قبلاً با موفقیت (شبیه‌سازی‌شده) ثبت شده است.</p>`
        : `<form method="POST" action="/api/v1/payments/${escapeHtml(ctx.paymentId)}/complete">
      <button class="pay" type="submit">پرداخت موفق (آزمایشی)</button>
    </form>`
    }
    <form method="POST" action="/api/v1/payments/${escapeHtml(ctx.paymentId)}/cancel">
      <button class="cancel" type="submit">انصراف از پرداخت</button>
    </form>

    <p class="note">رنتینو · شبیه‌ساز پرداخت برای نمایش آموزشی</p>
  </main>
</body>
</html>`;
}
