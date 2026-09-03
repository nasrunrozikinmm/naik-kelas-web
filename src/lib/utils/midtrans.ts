export function loadSnapScript(isProduction: boolean, clientKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  return new Promise((resolve, reject) => {
    const targetHost = isProduction ? "app.midtrans.com" : "app.sandbox.midtrans.com";
    const targetSrc = `https://${targetHost}/snap/snap.js`;

    const scripts = document.querySelectorAll('script[src*="midtrans.com/snap/snap.js"]');
    for (let i = 0; i < scripts.length; i++) {
      const s = scripts[i] as HTMLScriptElement;
      if (s.src.includes(targetHost)) {
        resolve();
        return;
      }
      s.remove();
    }

    const script = document.createElement("script");
    script.src = targetSrc;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Gagal memuat skrip pembayaran Midtrans"));
    document.body.appendChild(script);
  });
}
