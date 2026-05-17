
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import midtransClient from 'midtrans-client';
import cors from 'cors';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // Setup Midtrans (Fallback to simulated if keys missing)
  const isProduction = process.env.NODE_ENV === "production";
  
  // Midtrans Client Setup
  let snap: any = null;
  let coreApi: any = null;

  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-placeholder';
    const clientKey = process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-placeholder';
    
    snap = new midtransClient.Snap({
      isProduction: false, // Force sandbox for now as requested
      serverKey: serverKey,
      clientKey: clientKey
    });

    coreApi = new midtransClient.CoreApi({
      isProduction: false,
      serverKey: serverKey,
      clientKey: clientKey
    });
    
    console.log("Midtrans initialized in SANDBOX mode");
  } catch (error) {
    console.error("Failed to initialize Midtrans client:", error);
  }

  // --- API ROUTES ---

  // 1. Generate QRIS Transaction
  app.post("/api/payment/qris", async (req, res) => {
    const { amount, invoiceId, items } = req.body;

    console.log(`[PAYMENT LOG] Generating QRIS for Invoice: ${invoiceId}, Amount: ${amount}`);

    if (!amount || amount <= 0 || !invoiceId) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Invalid transaction data. Nominal must be > 0 and Invoice ID required.' 
      });
    }

    try {
      // Logic for real Midtrans API
      // If we don't have real keys, we use a fallback response
      if (!process.env.MIDTRANS_SERVER_KEY) {
        console.warn("[PAYMENT WARNING] Using FALLBACK QRIS generation (No Server Key)");
        return res.json({
          status: 'success',
          type: 'SIMULATED',
          qr_string: `00020101021226300016COM.DANA.WWW0118936009153020610125204000053033605408${amount}.005802ID5912NEXUS STORE 6005JAKARTA62070703${invoiceId}6304`,
          reference: `SIM-${invoiceId}-${Date.now()}`,
          message: 'Simulated QRIS generated successfully (Sandbox Fallback)'
        });
      }

      // Real core API call for QRIS
      const parameter = {
        "payment_type": "gopay", // Gopay usually returns QR for QRIS in Midtrans
        "transaction_details": {
          "gross_amount": amount,
          "order_id": invoiceId,
        },
        "item_details": items || []
      };

      const response = await coreApi.charge(parameter);
      
      console.log(`[PAYMENT LOG] Midtrans Response for ${invoiceId}:`, response.transaction_status);

      res.json({
        status: 'success',
        type: 'REAL_GATEWAY',
        qr_string: response.actions?.find((a: any) => a.name === 'generate-qr-code')?.url || response.qr_code || '',
        reference: response.transaction_id,
        raw: response
      });

    } catch (error: any) {
      console.error(`[PAYMENT ERROR] Failed to create transaction ${invoiceId}:`, error.message);
      res.status(500).json({ 
        status: 'error', 
        message: 'Gateway pembayaran sedang bermasalah',
        details: error.message 
      });
    }
  });

  // 2. Webhook / Notification Handler
  app.post("/api/payment/notification", async (req, res) => {
    const notification = req.body;
    
    console.log(`[WEBHOOK LOG] Received notification for Order: ${notification.order_id}, Status: ${notification.transaction_status}`);

    try {
      // In a real app, you would verify the signature here
      // const statusResponse = await snap.transaction.notification(notification);
      // But for now we just log it
      
      res.status(200).send('OK');
    } catch (error: any) {
      console.error("[WEBHOOK ERROR] Failed to process notification:", error.message);
      res.status(500).send('Error');
    }
  });

  // 3. Check Status
  app.get("/api/payment/status/:orderId", async (req, res) => {
    const { orderId } = req.params;

    try {
      if (!process.env.MIDTRANS_SERVER_KEY) {
        // Simulated check: always return success after some time? 
        // No, let the client simulate success if keys are missing
        return res.json({ status: 'PENDING', message: 'Simulated check' });
      }

      const status = await coreApi.transaction.status(orderId);
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
