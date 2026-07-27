import OpenAI from 'openai';
import aiClient from '../config/gemini.js';
import openai from '../config/openai.js';

const CATEGORIES = [
  'Groceries',
  'Dining Out',
  'Utilities',
  'Software & Tech',
  'Salary',
  'Freelance',
  'Entertainment',
  'Health',
  'Travel',
  'Shopping',
  'Other',
];

// Helper to initialize Groq Client (100% Free LLM - Llama 3.3 70B)
const getGroqClient = () => {
  const key = process.env.GROQ_API_KEY;
  if (key && key.trim() !== '') {
    try {
      return new OpenAI({
        apiKey: key.trim(),
        baseURL: 'https://api.groq.com/openai/v1',
      });
    } catch (e) {}
  }
  return null;
};

// Helper to initialize OpenRouter Client (100% Free LLM - Llama 3.2)
const getOpenRouterClient = () => {
  const key = process.env.OPENROUTER_API_KEY;
  if (key && key.trim() !== '') {
    try {
      return new OpenAI({
        apiKey: key.trim(),
        baseURL: 'https://openrouter.ai/api/v1',
      });
    } catch (e) {}
  }
  return null;
};

/**
 * 1. Parse Natural Language Expense Input
 */
export const parseNaturalLanguageExpense = async (text) => {
  const groq = getGroqClient();
  if (groq) {
    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are an AI financial assistant. Parse natural language input for financial transactions. Return ONLY valid JSON in the format:
{
  "description": string,
  "amount": number,
  "type": "expense" | "income",
  "category": string (must be one of: ${CATEGORIES.join(', ')}),
  "date": string (ISO date YYYY-MM-DD)
}`,
          },
          { role: 'user', content: text },
        ],
        temperature: 0.2,
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (content) {
        const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
      }
    } catch (e) {
      console.warn('[AI Service] Groq parse warning:', e.message);
    }
  }

  // Try Gemini API
  if (aiClient) {
    try {
      const prompt = `You are an AI financial assistant. Parse natural language input for financial transactions. Return ONLY valid JSON in the format:
{
  "description": string,
  "amount": number,
  "type": "expense" | "income",
  "category": string (must be one of: ${CATEGORIES.join(', ')}),
  "date": string (ISO date YYYY-MM-DD)
}

Input Text: "${text}"`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      const content = response.text?.trim();
      if (content) {
        const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
      }
    } catch (e) {
      // Fallback
    }
  }

  // Rule-Based Fallback Parser
  const amountMatch = text.match(/(?:[\$₹€£]|\b)(\d+(?:\.\d{1,2})?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
  const lower = text.toLowerCase();
  const isIncome = lower.includes('earned') || lower.includes('received') || lower.includes('salary') || lower.includes('paid me');

  let category = 'Other';
  if (lower.includes('pizza') || lower.includes('food') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('coffee') || lower.includes('restaurant')) {
    category = 'Dining Out';
  } else if (lower.includes('grocery') || lower.includes('market') || lower.includes('store')) {
    category = 'Groceries';
  } else if (lower.includes('freelance') || lower.includes('code') || lower.includes('gig')) {
    category = 'Freelance';
  } else if (lower.includes('salary')) {
    category = 'Salary';
  } else if (lower.includes('bill') || lower.includes('electricity') || lower.includes('water') || lower.includes('internet')) {
    category = 'Utilities';
  }

  let date = new Date().toISOString().split('T')[0];
  if (lower.includes('yesterday')) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    date = d.toISOString().split('T')[0];
  }

  return {
    description: text.substring(0, 50),
    amount: amount || 10,
    type: isIncome ? 'income' : 'expense',
    category,
    date,
  };
};

/**
 * 2. Automatic Categorisation
 */
export const categorizeTransaction = async (description) => {
  const groq = getGroqClient();
  if (groq) {
    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `Categorize the financial transaction into one of these categories: ${CATEGORIES.join(', ')}. Return ONLY the category name.`,
          },
          { role: 'user', content: description },
        ],
        temperature: 0.1,
      });

      const cat = response.choices[0]?.message?.content?.trim();
      if (cat && CATEGORIES.includes(cat)) {
        return cat;
      }
    } catch (e) {}
  }

  const lower = description.toLowerCase();
  if (lower.includes('food') || lower.includes('pizza') || lower.includes('coffee')) return 'Dining Out';
  if (lower.includes('grocery') || lower.includes('mart')) return 'Groceries';
  if (lower.includes('salary')) return 'Salary';
  return 'Other';
};

/**
 * 3. Monthly Insights Generation
 */
export const generateMonthlyInsights = async (summaryData) => {
  if (!summaryData.hasTransactions || summaryData.totalTransactionsCount === 0) {
    return `### Monthly AI Financial Summary\n- **No Transactions Logged**: You haven't recorded any transactions yet.\n- **Get Started**: Add your first income or expense transaction to unlock personalized AI analytics.`;
  }

  const prompt = `You are an expert financial advisor. Provide 3 short, actionable, personalized financial insights based on the provided spending data:\n${JSON.stringify(summaryData)}`;

  const groq = getGroqClient();
  if (groq) {
    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert financial advisor. Provide 3 short, actionable, personalized financial insights based on the provided spending data.',
          },
          { role: 'user', content: JSON.stringify(summaryData) },
        ],
        temperature: 0.7,
      });
      const text = response.choices[0]?.message?.content?.trim();
      if (text) return text;
    } catch (e) {}
  }

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });
      if (response && response.text) {
        return response.text.trim();
      }
    } catch (geminiError) {
      const isQuota = geminiError.message && geminiError.message.includes('429');
      console.warn(`[AI Service] ${isQuota ? 'Gemini API free quota limit reached, seamlessly using local engine.' : `Gemini API warning: ${geminiError.message.substring(0, 80)}`}`);
    }
  }

  return `### Monthly AI Financial Summary\n- **Spending Trend**: Your highest expense category is **${summaryData.highestCategory}** ($${summaryData.highestCategoryAmount}).\n- **Budget Health**: You spent $${summaryData.thisMonthExpense} this month out of $${summaryData.thisMonthIncome} in income.\n- **Net Savings**: Your current net balance is **$${summaryData.netSavings}** with a savings rate of **${summaryData.savingsRate}**.`;
};

/**
 * 4. AI Chatbot Assistant Engine
 */
export const chatWithFinancialAI = async (userMessage, liveContext) => {
  if (!liveContext || !liveContext.hasTransactions || liveContext.totalTransactionsCount === 0) {
    return `You don't have any transactions yet.\n\nAdd your first income or expense to receive AI insights.`;
  }

  const systemPrompt = `You are SpendWise AI, an intelligent personal finance copilot. You have real-time access to the user's authentic financial records from MongoDB below:

AUTHENTIC USER FINANCIAL DATA:
- Has Transactions: ${liveContext.hasTransactions}
- Total Transactions Count: ${liveContext.totalTransactionsCount}
- This Month Expense: $${liveContext.thisMonthExpense} across ${liveContext.thisMonthTransactionCount} transactions
- This Month Income: $${liveContext.thisMonthIncome}
- Net Balance This Month: $${liveContext.thisMonthNetBalance}
- All-Time Total Income: $${liveContext.totalIncome}
- All-Time Total Expense: $${liveContext.totalExpense}
- Net Savings: $${liveContext.netSavings} (Savings Rate: ${liveContext.savingsRate})
- Top Expense Category: ${liveContext.highestCategory} ($${liveContext.highestCategoryAmount})
- Category Expense Breakdown: ${JSON.stringify(liveContext.categoryBreakdown)}
- Category Increased Most: ${liveContext.categoryIncreasedMost} (Increased by +$${liveContext.maxIncreaseAmount})
- Largest Single Expense: ${liveContext.largestExpense ? `${liveContext.largestExpense.description} ($${liveContext.largestExpense.amount}) in ${liveContext.largestExpense.category} on ${liveContext.largestExpense.date}` : 'None'}
- Average Daily Spending This Month: $${liveContext.averageDailySpending}
- Monthly Budget Limit: $${liveContext.totalBudgetLimit}
- Total Budget Spent: $${liveContext.totalBudgetSpent}
- Remaining Budget: $${liveContext.remainingBudget}
- Comparison vs Last Month: Expense change $${liveContext.expenseDiff} (${liveContext.expenseDiffPercent > 0 ? '+' : ''}${liveContext.expenseDiffPercent}%), Last month income: $${liveContext.lastMonthIncome}, Last month expense: $${liveContext.lastMonthExpense}
- Recent 5 Transactions: ${JSON.stringify(liveContext.recentTransactions)}

STRICT RULES:
1. Always base your answer strictly on the authentic financial data provided above.
2. Never invent or hallucinate fake numbers or dollar amounts.
3. Answer user questions directly, accurately, and concisely.
4. Format your output with clear markdown lists or bold headers.`;

  // 1. Try Groq (Free Llama 3.3 70B)
  const groq = getGroqClient();
  if (groq) {
    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.5,
      });
      const text = response.choices[0]?.message?.content?.trim();
      if (text) {
        console.log('[AI Service] Response generated via Groq (Llama 3.3 70B)');
        return text;
      }
    } catch (e) {
      console.warn('[AI Service] Groq API warning:', e.message);
    }
  }

  // 2. Try OpenRouter (Free Llama 3.2 3B)
  const openRouter = getOpenRouterClient();
  if (openRouter) {
    try {
      const response = await openRouter.chat.completions.create({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.5,
      });
      const text = response.choices[0]?.message?.content?.trim();
      if (text) {
        console.log('[AI Service] Response generated via OpenRouter');
        return text;
      }
    } catch (e) {
      console.warn('[AI Service] OpenRouter API warning:', e.message);
    }
  }

  // 3. Try Gemini API
  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `${systemPrompt}\n\nUser Question: ${userMessage}`,
      });
      if (response && response.text) {
        console.log('[AI Service] Response generated via Google Gemini 2.0 Flash');
        return response.text.trim();
      }
    } catch (geminiError) {
      const isQuota = geminiError.message && geminiError.message.includes('429');
      console.warn(`[AI Service] ${isQuota ? 'Gemini API free quota limit reached, seamlessly using local engine.' : `Gemini API warning: ${geminiError.message.substring(0, 80)}`}`);
    }
  }

  // 4. Try OpenAI API
  try {
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.5,
      });

      return response.choices[0]?.message?.content?.trim();
    }
  } catch (error) {
    // Fallback
  }

  // 5. Smart Live Context Rule-Based Engine (Guaranteed 100% Uptime & Zero Cost)
  const lower = userMessage.toLowerCase();

  if (lower.includes('spend this month') || lower.includes('spent this month') || (lower.includes('spent') && lower.includes('month'))) {
    return `You have spent **$${liveContext.thisMonthExpense}** this month across **${liveContext.thisMonthTransactionCount} transactions**.\n\n- **Total Income Received**: $${liveContext.thisMonthIncome}\n- **Net Balance**: $${liveContext.thisMonthNetBalance}`;
  }

  if (lower.includes('income') || lower.includes('received') || lower.includes('earned')) {
    return `You have received **$${liveContext.thisMonthIncome}** in income this month.\n\n- **All-Time Total Income**: $${liveContext.totalIncome}\n- **Net Savings**: $${liveContext.netSavings}`;
  }

  if (lower.includes('highest') || lower.includes('top category') || lower.includes('highest expense')) {
    return `Your highest expense category is **${liveContext.highestCategory}**, totaling **$${liveContext.highestCategoryAmount}**.`;
  }

  if (lower.includes('recent') || lower.includes('recent transactions') || lower.includes('last transactions')) {
    if (!liveContext.recentTransactions || liveContext.recentTransactions.length === 0) {
      return `You don't have any recent transactions logged yet.`;
    }
    const txList = liveContext.recentTransactions
      .map((t) => `- **${t.description}**: $${t.amount} (${t.category}, ${t.type}) on ${t.date}`)
      .join('\n');
    return `Here are your recent transactions:\n${txList}`;
  }

  if (lower.includes('saved') || lower.includes('savings') || lower.includes('net savings')) {
    return `You have saved **$${liveContext.netSavings}** overall with a savings rate of **${liveContext.savingsRate}**.\n\n- **Total Income**: $${liveContext.totalIncome}\n- **Total Expenses**: $${liveContext.totalExpense}`;
  }

  if (lower.includes('budget') || lower.includes('remains')) {
    if (liveContext.totalBudgetLimit === 0) {
      return `You haven't set up any active budget limits for this month yet. Head over to the **Budgets** tab to create category limits!`;
    }
    return `You have **$${liveContext.remainingBudget}** remaining in your active monthly budget out of **$${liveContext.totalBudgetLimit}** total limit.\n\n- **Budget Spent**: $${liveContext.totalBudgetSpent}`;
  }

  if (lower.includes('increased') || lower.includes('increase') || lower.includes('category increased')) {
    if (liveContext.categoryIncreasedMost === 'None') {
      return `None of your expense categories showed an increase compared to last month.`;
    }
    return `The category that increased the most compared to last month is **${liveContext.categoryIncreasedMost}**, which went up by **+$${liveContext.maxIncreaseAmount}**.`;
  }

  if (lower.includes('largest') || lower.includes('biggest') || lower.includes('max expense')) {
    if (!liveContext.largestExpense) {
      return `No expense transactions recorded yet.`;
    }
    return `Your largest single expense on record is **${liveContext.largestExpense.description}** for **$${liveContext.largestExpense.amount}** in the **${liveContext.largestExpense.category}** category on ${liveContext.largestExpense.date}.`;
  }

  if (lower.includes('compare') || lower.includes('last month')) {
    const changeSymbol = liveContext.expenseDiff >= 0 ? '+' : '-';
    return `### Monthly Comparison 📊\n- **This Month Expense**: $${liveContext.thisMonthExpense}\n- **Last Month Expense**: $${liveContext.lastMonthExpense}\n- **Expense Difference**: ${changeSymbol}$${Math.abs(liveContext.expenseDiff)} (${liveContext.expenseDiffPercent}%)\n- **This Month Income**: $${liveContext.thisMonthIncome} (vs $${liveContext.lastMonthIncome} last month)`;
  }

  if (lower.includes('save more') || lower.includes('suggestion') || lower.includes('advice') || lower.includes('tips')) {
    return `### Money-Saving Suggestions 💡\n1. **Optimize ${liveContext.highestCategory}**: Reduce spending in your top category ($${liveContext.highestCategoryAmount}) by 10-15%.\n2. **Daily Spending Target**: Keep daily expenses under **$${Math.round(liveContext.averageDailySpending * 0.8)}** (current average is $${liveContext.averageDailySpending}/day).\n3. **Automate 20% Savings**: Reserve 20% of income ($${Math.round(liveContext.thisMonthIncome * 0.2)}) for emergency savings.`;
  }

  if (lower.includes('spent') || lower.includes('spend')) {
    return `You have spent **$${liveContext.thisMonthExpense}** this month across **${liveContext.thisMonthTransactionCount} transactions**. Your total income received is **$${liveContext.thisMonthIncome}**, giving you a net balance of **$${liveContext.thisMonthNetBalance}**.`;
  }

  return `Based on your live records, you have spent **$${liveContext.thisMonthExpense}** this month with **${liveContext.highestCategory}** as your top category ($${liveContext.highestCategoryAmount}). Your net savings is **$${liveContext.netSavings}**. How else can I assist you with your finances?`;
};
