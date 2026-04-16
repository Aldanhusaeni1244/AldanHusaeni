
import { GoogleGenAI } from "@google/genai";
import { Transaction, Product } from "./types";

export const getSalesAnalysis = async (transactions: Transaction[], inventory: Product[]) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined. AI insights disabled.");
    return "Analisis AI tidak tersedia (API Key belum diatur).";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const summary = {
    totalSales: transactions.reduce((acc, t) => acc + t.total, 0),
    count: transactions.length,
    lowStock: inventory.filter(i => i.stock <= i.minStock).map(i => i.name),
  };

  const prompt = `Analyze the following retail data and provide 3 key business insights and 1 action recommendation in Indonesian:
  Data:
  - Total Transactions: ${summary.count}
  - Total Revenue: ${summary.totalSales}
  - Low Stock Items: ${summary.lowStock.join(', ')}
  - Latest 5 Transactions Data: ${JSON.stringify(transactions.slice(-5))}
  
  Format: Bullet points, professional tone. Focus on profit, stock levels, and sales trends.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return "Analysis currently unavailable. Please check your connection.";
  }
};
