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
  // 1. Try Gemini API first (fast & reliable)
  if (aiClient) {
    const models = ['gemini-flash-lite-latest', 'gemini-3.8-flash'];
    const prompt = `You are an AI financial assistant. Parse natural language input for financial transactions. Return ONLY valid JSON in the format:
{
  "description": string,
  "amount": number,
  "type": "expense" | "income",
  "category": string (must be one of: ${CATEGORIES.join(', ')}),
  "date": string (ISO date YYYY-MM-DD)
}

Input Text: "${text}"`;

    for (const m of models) {
      try {
        const response = await aiClient.models.generateContent({
          model: m,
          contents: prompt,
        });

        const content = response.text?.trim();
        if (content) {
          const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
          return JSON.parse(cleaned);
        }
      } catch (e) {
        // try next candidate
      }
    }
  }

  // 2. Try Groq Client
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
    } catch (e) {}
  }

  // 3. Rule-Based Fallback Parser
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
  // 1. Try Gemini API first
  if (aiClient) {
    const models = ['gemini-flash-lite-latest', 'gemini-3.8-flash'];
    for (const m of models) {
      try {
        const response = await aiClient.models.generateContent({
          model: m,
          contents: `Categorize the financial transaction into one of these categories: ${CATEGORIES.join(', ')}. Return ONLY the category name.\nTransaction: "${description}"`,
        });
        const cat = response.text?.trim();
        if (cat && CATEGORIES.includes(cat)) {
          return cat;
        }
      } catch (e) {}
    }
  }

  // 2. Try Groq
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

  // 3. Fallback Keyword Matcher
  const lower = description.toLowerCase();
  if (lower.includes('food') || lower.includes('pizza') || lower.includes('coffee') || lower.includes('dining')) return 'Dining Out';
  if (lower.includes('grocery') || lower.includes('mart') || lower.includes('supermarket')) return 'Groceries';
  if (lower.includes('salary') || lower.includes('paycheck')) return 'Salary';
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

  // 1. Try Gemini API
  if (aiClient) {
    const models = ['gemini-flash-lite-latest', 'gemini-3.8-flash'];
    for (const m of models) {
      try {
        const response = await aiClient.models.generateContent({
          model: m,
          contents: prompt,
        });
        if (response && response.text) {
          return response.text.trim();
        }
      } catch (geminiError) {}
    }
  }

  // 2. Try Groq
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

  return `### Monthly AI Financial Summary\n- **Spending Trend**: Your highest expense category is **${summaryData.highestCategory}** (₹${summaryData.highestCategoryAmount}).\n- **Budget Health**: You spent ₹${summaryData.thisMonthExpense} this month out of ₹${summaryData.thisMonthIncome} in income.\n- **Net Savings**: Your current net balance is **₹${summaryData.netSavings}** with a savings rate of **${summaryData.savingsRate}**.`;
};

/**
 * High-precision deterministic formatted response engine (100% database grounded & zero hallucination)
 */
export const generateDeterministicResponse = (intentInfo = {}, financialData = {}) => {
  if (!financialData || financialData.hasTransactions === false) {
    return "You don't have any transactions logged yet.\n\nAdd your first income or expense to receive AI financial insights.";
  }

  const { intent, category } = intentInfo;

  switch (intent) {
    case 'CATEGORY_SPENDING': {
      const cat = category || financialData.category || 'this category';
      const total = financialData.categoryTotal || 0;
      const count = financialData.transactionCount || 0;
      const share = financialData.sharePercentage || 0;

      if (count === 0) {
        if (financialData.allTimeCategoryCount > 0) {
          return `You haven't spent anything on **${cat}** this month across your recorded transactions (All-time spent: ₹${financialData.allTimeCategorySpend.toLocaleString('en-IN')} across ${financialData.allTimeCategoryCount} transactions).`;
        }
        return `You have not spent anything on **${cat}** this month (0 transactions logged).`;
      }

      return `You spent **₹${total.toLocaleString('en-IN')}** on **${cat}** this month across **${count} transaction${count > 1 ? 's' : ''}** (${share}% of your total monthly spending).`;
    }

    case 'CATEGORY_COMPARISON': {
      const cat = category || financialData.category || 'this category';
      const total = financialData.categoryTotal || 0;
      const totalExp = financialData.totalMonthlyExpense || 0;
      const pct = financialData.sharePercentage || 0;

      return `You spent **₹${total.toLocaleString('en-IN')}** on **${cat}** this month compared to your total monthly spending of **₹${totalExp.toLocaleString('en-IN')}**, which represents **${pct}%** of your total spending.`;
    }

    case 'HIGHEST_CATEGORY': {
      const highest = financialData.highestCategory;
      const amount = financialData.highestCategoryAmount || 0;
      const count = financialData.highestCategoryCount || 0;
      const share = financialData.sharePercentage || 0;

      if (!highest || highest === 'None' || amount === 0) {
        return 'You do not have any expense transactions recorded for this month.';
      }

      const fallbackNote = financialData.isAllTimeFallback ? ' (based on all-time records)' : '';
      return `**${highest}** was your highest expense category this month${fallbackNote}, with **₹${amount.toLocaleString('en-IN')}** spent across **${count} transaction${count > 1 ? 's' : ''}** (${share}% of total expenses).`;
    }

    case 'LARGEST_EXPENSE': {
      const exp = financialData.largestExpense;
      if (!exp) {
        return 'You have not recorded any expense transactions yet.';
      }
      return `Your largest expense was **${exp.description}** for **₹${exp.amount.toLocaleString('en-IN')}** in the **${exp.category}** category on ${exp.date}.`;
    }

    case 'TOTAL_SPENDING': {
      const total = financialData.totalMonthlyExpense || 0;
      const count = financialData.transactionCount || 0;
      return `You have spent **₹${total.toLocaleString('en-IN')}** this month across **${count} transaction${count > 1 ? 's' : ''}**.`;
    }

    case 'TOTAL_INCOME': {
      const total = financialData.totalMonthlyIncome || 0;
      const count = financialData.transactionCount || 0;
      return `You have received **₹${total.toLocaleString('en-IN')}** in income this month across **${count} transaction${count > 1 ? 's' : ''}** (All-time total income: ₹${(financialData.allTimeTotalIncome || 0).toLocaleString('en-IN')}).`;
    }

    case 'SAVINGS': {
      const inc = financialData.totalIncome || 0;
      const exp = financialData.totalExpense || 0;
      const savings = financialData.netSavings || 0;
      const rate = financialData.savingsRate || '0%';

      return `You have saved **₹${savings.toLocaleString('en-IN')}** this month with a savings rate of **${rate}**.\n\n- **Total Income Received**: ₹${inc.toLocaleString('en-IN')}\n- **Total Expenses**: ₹${exp.toLocaleString('en-IN')}\n- **Net Balance**: ₹${savings.toLocaleString('en-IN')}`;
    }

    case 'RECENT_TRANSACTIONS': {
      const txs = financialData.transactions || [];
      if (txs.length === 0) {
        return "You don't have any recent transactions logged yet.";
      }
      const list = txs
        .map((t) => `- **${t.description}**: ₹${t.amount.toLocaleString('en-IN')} (${t.category}, ${t.type}) on ${t.date}`)
        .join('\n');
      return `Here are your recent transactions:\n${list}`;
    }

    case 'BUDGET_REMAINING': {
      if (category) {
        const cat = category;
        if (!financialData.hasBudget) {
          return `You haven't set a budget limit for **${cat}** this month yet (Current spending: ₹${(financialData.spent || 0).toLocaleString('en-IN')}). Head over to the **Budgets** tab to create one!`;
        }

        const limit = financialData.budgetLimit || 0;
        const spent = financialData.spent || 0;
        const pct = financialData.spentPercentage || 0;

        if (financialData.isOverBudget) {
          return `⚠️ You have exceeded your **${cat}** budget by **₹${(financialData.overAmount || 0).toLocaleString('en-IN')}**! You have spent **₹${spent.toLocaleString('en-IN')}** against your budget limit of **₹${limit.toLocaleString('en-IN')}** (${pct}% capacity).`;
        }

        return `You are within your **${cat}** budget! You have spent **₹${spent.toLocaleString('en-IN')}** out of your **₹${limit.toLocaleString('en-IN')}** limit, leaving **₹${(financialData.remaining || 0).toLocaleString('en-IN')}** remaining (${pct}% utilized).`;
      }

      if (!financialData.hasBudget || financialData.totalBudgetLimit === 0) {
        return "You haven't set up any active budget limits for this month yet. Head over to the **Budgets** tab to create monthly category limits!";
      }

      return `You have **₹${(financialData.remainingBudget || 0).toLocaleString('en-IN')}** remaining in your active monthly budget out of a **₹${(financialData.totalBudgetLimit || 0).toLocaleString('en-IN')}** total limit.\n\n- **Total Budget Limit**: ₹${(financialData.totalBudgetLimit || 0).toLocaleString('en-IN')}\n- **Total Budget Spent**: ₹${(financialData.totalBudgetSpent || 0).toLocaleString('en-IN')}\n- **Remaining Budget**: ₹${(financialData.remainingBudget || 0).toLocaleString('en-IN')}`;
    }

    case 'MONTH_COMPARISON': {
      const thisExp = financialData.thisMonthExpense || 0;
      const lastExp = financialData.lastMonthExpense || 0;
      const diff = financialData.expenseDiff || 0;
      const pct = financialData.expenseDiffPercent || 0;
      const changeSym = diff >= 0 ? '+' : '-';

      return `### Monthly Spending Comparison 📊\n- **This Month Expense**: ₹${thisExp.toLocaleString('en-IN')}\n- **Last Month Expense**: ₹${lastExp.toLocaleString('en-IN')}\n- **Expense Difference**: ${changeSym}₹${Math.abs(diff).toLocaleString('en-IN')} (${pct > 0 ? '+' : ''}${pct}%)\n- **This Month Income**: ₹${(financialData.thisMonthIncome || 0).toLocaleString('en-IN')} (vs ₹${(financialData.lastMonthIncome || 0).toLocaleString('en-IN')} last month)`;
    }

    case 'SAVING_ADVICE': {
      if (category) {
        const cat = category;
        const total = financialData.categoryTotal || 0;
        const count = financialData.transactionCount || 0;
        const share = financialData.sharePercentage || 0;
        const targetSavings = Math.round(total * 0.15);

        return `### Suggestions to Reduce ${cat} Expenses 💡\n` +
          `You spent **₹${total.toLocaleString('en-IN')}** on ${cat} this month across **${count} transaction${count > 1 ? 's' : ''}** (${share}% of your total monthly spending).\n\n` +
          `1. **Target 15% Reduction**: Aim to save **₹${targetSavings.toLocaleString('en-IN')}** by planning purchases in advance and prioritizing essentials.\n` +
          `2. **Set a Category Budget**: Establish a strict monthly cap for ${cat} in the **Budgets** section to get automated threshold warnings.\n` +
          `3. **Track Discretionary Items**: Review individual ${cat} receipts to swap branded items for value alternatives and eliminate impulse purchases.`;
      }

      const topCat = financialData.highestCategory || 'your top category';
      const topAmt = financialData.highestCategoryAmount || 0;
      const daily = financialData.averageDailySpending || 0;
      const inc = financialData.thisMonthIncome || 0;

      return `### Personalized Money-Saving Recommendations 💡\n` +
        `1. **Optimize ${topCat}**: Your largest spending area is ${topCat} (₹${topAmt.toLocaleString('en-IN')}). Trimming 10-15% can save you **₹${Math.round(topAmt * 0.15).toLocaleString('en-IN')}**.\n` +
        `2. **Daily Spending Guideline**: Keep your non-essential daily spending under **₹${Math.round(daily * 0.8).toLocaleString('en-IN')}** (current average is ₹${daily.toLocaleString('en-IN')}/day).\n` +
        `3. **Automate 20% Savings**: Allocate 20% of monthly income (₹${Math.round(inc * 0.2).toLocaleString('en-IN')}) directly to savings before discretionary spending.`;
    }

    default: {
      const thisExp = financialData.thisMonthExpense || financialData.totalExpense || 0;
      const topCat = financialData.highestCategory || 'None';
      const topAmt = financialData.highestCategoryAmount || 0;
      const net = financialData.netSavings || 0;

      return `Based on your live records, you have spent **₹${thisExp.toLocaleString('en-IN')}** this month with **${topCat}** as your top category (₹${topAmt.toLocaleString('en-IN')}). Your net savings is **₹${net.toLocaleString('en-IN')}**. How else can I assist you with your finances?`;
    }
  }
};

/**
 * 4. AI Chatbot Assistant Engine
 */
export const chatWithFinancialAI = async (
  userMessage,
  financialData,
  intentInfo = { intent: 'GENERAL_FINANCIAL_QUERY' }
) => {
  if (!financialData || financialData.hasTransactions === false) {
    return `You don't have any transactions yet.\n\nAdd your first income or expense to receive AI insights.`;
  }

  const systemPrompt = `You are SpendWise AI, an intelligent personal finance copilot. You have real-time access to the user's authentic financial records from MongoDB below:

USER QUERY INTENT: ${intentInfo.intent || 'GENERAL_FINANCIAL_QUERY'}
${intentInfo.category ? `TARGET CATEGORY: ${intentInfo.category}` : ''}

VERIFIED AUTHENTIC FINANCIAL FACTS FROM MONGODB (IN INDIAN RUPEES ₹ / INR):
${JSON.stringify(financialData, null, 2)}

STRICT RULES:
1. Always base your answer strictly on the authentic verified database facts provided above.
2. Format all monetary values in Indian Rupees with ₹ (e.g. ₹30,000).
3. NEVER invent, assume, or hallucinate financial numbers.
4. Answer the user question directly, accurately, and concisely.
5. If the user asks about a specific category (such as Groceries), answer about that category specifically. Do NOT return the generic total monthly spending.
6. If the user asks for highest category, largest expense, savings, income, budget, or recent transactions, directly answer with the corresponding database fact.
7. If data for a category or budget is zero or missing, clearly state that instead of making up a number.
8. Format your output with clear markdown lists or bold headers.`;

  // 1. Try Gemini API (Resilient multi-model fallback)
  if (aiClient) {
    const candidateModels = ['gemini-flash-lite-latest', 'gemini-3.8-flash'];
    for (const m of candidateModels) {
      try {
        const response = await aiClient.models.generateContent({
          model: m,
          contents: `${systemPrompt}\n\nUser Question: ${userMessage}`,
        });
        if (response && response.text) {
          console.log(`[AI Service] Response generated via Google Gemini (${m})`);
          return response.text.trim();
        }
      } catch (geminiError) {
        // try next candidate
      }
    }
  }

  // 2. Try Groq (Llama 3.3 70B)
  const groq = getGroqClient();
  if (groq) {
    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
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

  // 3. Try OpenRouter (Free Llama 3.2 3B)
  const openRouter = getOpenRouterClient();
  if (openRouter) {
    try {
      const response = await openRouter.chat.completions.create({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
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

  // 4. Try OpenAI API
  try {
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
      });
      const text = response.choices[0]?.message?.content?.trim();
      if (text) return text;
    }
  } catch (error) {
    // Fallback
  }

  // 5. High-precision deterministic formatted response engine (Guaranteed 100% Uptime, Accuracy & Zero Cost)
  return generateDeterministicResponse(intentInfo, financialData);
};
