import type { AppDBState, Product, Sale } from './db'

export interface AIMessage {
  role: 'ai' | 'user'
  text: string
  products?: Product[]
}

export interface BotProfile {
  id: string
  name: string
  emoji: string
  color: string
  description: string
  greeting: string
  suggestions: string[]
}

export const BOT_PROFILES: BotProfile[] = [
  {
    id: 'manager',
    name: 'Store Manager AI',
    emoji: '🏪',
    color: 'from-blue-500 via-indigo-500 to-violet-600',
    description: 'The master business orchestrator. Provides recommendations, alerts, and high-level health reviews of your store.',
    greeting: 'Greetings! I am your Store Manager AI. I orchestrate operations, monitor overall metrics, and advise on store optimization. Ask me for a "business review" or how we are performing today.',
    suggestions: [
      'Give me a complete business review',
      'What are the critical alerts today?',
      'How is the store performing?',
      'Suggest improvements for my store'
    ]
  },
  {
    id: 'finance',
    name: 'Financial AI',
    emoji: '💰',
    color: 'from-emerald-500 to-teal-600',
    description: 'Handles profit, loss, expenses, revenue, CGST/SGST taxes, cash flow, and financial reports.',
    greeting: 'Welcome to the Finance Desk. I analyze revenue sheets, calculate COGS, track tax liabilities (CGST/SGST), and optimize cash flow. How can I audit your finances today?',
    suggestions: [
      'What was today\'s profit and revenue?',
      'Show my monthly financial report',
      'What is my tax (GST) liability?',
      'Review my cash flow health'
    ]
  },
  {
    id: 'inventory',
    name: 'Inventory AI',
    emoji: '📦',
    color: 'from-amber-500 to-orange-600',
    description: 'Handles stock management, safety limits, low-stock alerts, supplier recommendations, and restock forecasting.',
    greeting: 'Inventory systems online. I monitor safety stock shelves, flag overstock, calculate shelf values, and forecast supply orders. What stock queries do you have?',
    suggestions: [
      'Which products are running low?',
      'What is my total inventory value?',
      'Suggest products to restock',
      'Show overstocked products'
    ]
  },
  {
    id: 'sales',
    name: 'Sales AI',
    emoji: '📈',
    color: 'from-rose-500 to-pink-600',
    description: 'Analyzes sales patterns, evaluates margins, predicts trends, and recommends promotional pricing offers.',
    greeting: 'Sales analytics active. I monitor product margins, sales velocities, and identify high-performing lines. Let\'s optimize your pricing strategies.',
    suggestions: [
      'Which product sold the most?',
      'Show slow-moving items with high cost',
      'Suggest promotional offers to increase sales',
      'What is the highest-margin category?'
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing AI',
    emoji: '📣',
    color: 'from-violet-500 to-purple-600',
    description: 'Creates marketing campaigns, advertising copy, social media posts, email newsletters, and SEO adjustments.',
    greeting: 'Marketing console ready. I draft conversion copy for Instagram, write newsletter drafts, compile hashtags, and layout SEO metadata. Let\'s run a campaign.',
    suggestions: [
      'Create an Instagram post for Wireless Earbuds X1',
      'Draft an email campaign for active customers',
      'Suggest hashtags for Sourdough Bread',
      'Provide SEO optimization for the catalog'
    ]
  },
  {
    id: 'support',
    name: 'Store Owner AI',
    emoji: '👨‍💼',
    color: 'from-cyan-500 to-blue-600',
    description: 'Direct response from the shop owner. Answers questions about our catalog products, custom deals, and store policies.',
    greeting: "Hello there! I'm the owner of this shop. Welcome! Feel free to ask me anything about our premium products, prices, return/delivery policies, or if you need recommendations!",
    suggestions: [
      'What products do you recommend?',
      'Tell me about your delivery options',
      'Do you have any discounts on electronics?',
      'Where is your store located?'
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics AI',
    emoji: '📊',
    color: 'from-cyan-400 to-teal-500',
    description: 'Generates reports, evaluates KPI averages, studies customer lifetime value (CLV), and gauges campaign conversion rates.',
    greeting: 'Telemetry analytics dashboard loaded. I process customer segmentation, average CLVs, customer feedback metrics, and marketing click-throughs. Let\'s review KPIs.',
    suggestions: [
      'Show customer segment breakdown',
      'What is our average Customer Lifetime Value (CLV)?',
      'Which marketing campaign has the highest conversion?',
      'What is our average customer feedback score?'
    ]
  },
  {
    id: 'hr',
    name: 'HR/Employee AI',
    emoji: '👥',
    color: 'from-indigo-400 to-blue-500',
    description: 'Handles employee shifts, attendance records, monthly salaries, and productivity scores.',
    greeting: 'Human Resources database synced. I coordinate work schedules, check attendance logs, verify wage payrolls, and audit productivity. How can I manage the staff?',
    suggestions: [
      'Who is the best-selling employee?',
      'Show employee attendance status today',
      'List shifts for Marcus Vance',
      'What is our total monthly payroll?'
    ]
  }
]

// Date helpers anchored around 2026-07-02 to match mock database records
const getDates = () => {
  return {
    today: '2026-07-02',
    yesterday: '2026-07-01'
  }
}

// Format numbers into Indian Rupees style (Lakhs, Crores formatting)
export function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// Extract conversation topic from history to handle context memory
export function resolveContextTopic(query: string, history: AIMessage[]): { topic: string; timeframe?: string; targetProduct?: string } {
  const clean = query.toLowerCase()
  
  let topic = ''
  let timeframe = ''
  let targetProduct = ''

  // 1. Detect immediate topic keywords in the current query
  if (clean.includes('profit') || clean.includes('revenue') || clean.includes('cogs') || clean.includes('tax') || clean.includes('gst') || clean.includes('cgst') || clean.includes('sgst') || clean.includes('expense') || clean.includes('payroll') || clean.includes('cash flow') || clean.includes('finance') || clean.includes('money')) {
    topic = 'finance'
  } else if (clean.includes('stock') || clean.includes('inventory') || clean.includes('shelf') || clean.includes('warehouse') || clean.includes('restock') || clean.includes('supplier')) {
    topic = 'inventory'
  } else if (clean.includes('sales') || clean.includes('selling') || clean.includes('sold') || clean.includes('order') || clean.includes('buy') || clean.includes('transaction') || clean.includes('margin') || clean.includes('price')) {
    topic = 'sales'
  } else if (clean.includes('marketing') || clean.includes('campaign') || clean.includes('social') || clean.includes('instagram') || clean.includes('email') || clean.includes('hashtags') || clean.includes('ad ') || clean.includes('promo')) {
    topic = 'marketing'
  } else if (clean.includes('employee') || clean.includes('staff') || clean.includes('shift') || clean.includes('attendance') || clean.includes('salary') || clean.includes('productivity') || clean.includes('marcus') || clean.includes('clara') || clean.includes('devon') || clean.includes('elena') || clean.includes('hr')) {
    topic = 'hr'
  } else if (clean.includes('customer') || clean.includes('feedback') || clean.includes('clv') || clean.includes('segment')) {
    topic = 'analytics'
  } else if (clean.includes('support') || clean.includes('timings') || clean.includes('open') || clean.includes('hours') || clean.includes('delivery') || clean.includes('return') || clean.includes('policy') || clean.includes('location') || clean.includes('showroom') || clean.includes('store')) {
    topic = 'support'
  } else if (clean.includes('business review') || clean.includes('overall') || clean.includes('perform') || clean.includes('health')) {
    topic = 'manager'
  }

  // 2. Detect timeframe keywords
  if (clean.includes('today') || clean.includes('current')) {
    timeframe = 'today'
  } else if (clean.includes('yesterday') || clean.includes('prev')) {
    timeframe = 'yesterday'
  } else if (clean.includes('week')) {
    timeframe = 'week'
  } else if (clean.includes('month')) {
    timeframe = 'month'
  }

  // 3. Fallback to context memory if query is short / pronouns are used (Requirement 6)
  const isShortContextQuery = clean.length < 35 && (
    clean.includes('yesterday') ||
    clean.includes('last week') ||
    clean.includes('this week') ||
    clean.includes('this month') ||
    clean.includes('how about') ||
    clean.includes('what about') ||
    clean.includes('and the') ||
    clean.includes('who is') ||
    clean.includes('suggest some') ||
    clean.includes('how much') ||
    clean.includes('cost') ||
    clean.includes('details')
  )

  if (isShortContextQuery && history.length > 0) {
    // Scan backwards through user messages to find the last topic
    for (let i = history.length - 1; i >= 0; i--) {
      const msg = history[i]
      if (msg.role === 'user') {
        const histContext = resolveContextTopic(msg.text, [])
        if (histContext.topic) {
          if (!topic) topic = histContext.topic
          if (!timeframe) timeframe = histContext.timeframe || ''
          if (!targetProduct) targetProduct = histContext.targetProduct || ''
          break
        }
      }
    }
  }

  return { topic, timeframe, targetProduct }
}

// Dynamic response generator using real website data
export function getBotResponse(query: string, botId: string, dbState: AppDBState, chatHistory: AIMessage[] = []): string {
  const clean = query.toLowerCase().trim()
  const dates = getDates()
  
  // Resolve conversation context (memory)
  const context = resolveContextTopic(query, chatHistory)
  let activeTopic = context.topic || botId
  const timeframe = context.timeframe || 'today'

  // Lockdown for Customer Support AI (Security Boundary)
  if (botId === 'support') {
    // If the topic resolved to something confidential, lock it to support
    if (activeTopic === 'finance' || activeTopic === 'hr' || activeTopic === 'marketing' || activeTopic === 'analytics' || activeTopic === 'manager') {
      activeTopic = 'support'
    }
  }

  // Requirement 5: Check if the user is asking a broad question that requires collaboration.
  const wantsCollaboration = (clean.includes('increase') && clean.includes('profit')) || 
                             (clean.includes('increase') && clean.includes('revenue')) || 
                             clean.includes('business review') || 
                             (clean.includes('overall') && clean.includes('perform')) ||
                             clean.includes('audit my store') ||
                             clean.includes('how to improve')

  if (wantsCollaboration && botId !== 'support') {
    return generateCollaborativeResponse(dbState)
  }

  // Helper selectors
  const products = dbState.products
  const sales = dbState.sales
  const employees = dbState.employees
  const customers = dbState.customers
  const campaigns = dbState.campaigns
  const requests = dbState.customerRequests

  // Filter sales for timeframe
  const getPeriodSales = (period: string): Sale[] => {
    if (period === 'today') {
      return sales.filter(s => s.timestamp.startsWith(dates.today))
    } else if (period === 'yesterday') {
      return sales.filter(s => s.timestamp.startsWith(dates.yesterday))
    } else if (period === 'week') {
      return sales
    } else {
      return sales
    }
  }

  const periodSales = getPeriodSales(timeframe)

  // ----------------------------------------
  // ROUTING TOPICS
  // ----------------------------------------

  // 1. FINANCE TOPIC
  if (activeTopic === 'finance') {
    const revenue = periodSales.reduce((sum, s) => sum + s.total, 0)
    
    // Calculate COGS
    const cogs = periodSales.reduce((sum, s) => {
      const prod = products.find(p => p.name.toLowerCase() === s.productName.toLowerCase())
      const unitCost = prod ? prod.cost : s.total * 0.4 // fallback 40%
      return sum + (unitCost * s.quantity)
    }, 0)

    const profit = revenue - cogs
    const cgst = revenue * 0.09 // 9% Central GST
    const sgst = revenue * 0.09 // 9% State GST
    const totalGst = cgst + sgst
    const monthlyPayroll = employees.reduce((sum, e) => sum + e.salary, 0)
    const dailyPayroll = monthlyPayroll / 30
    const netCashFlow = revenue - (cogs + dailyPayroll)

    const timeLabel = timeframe === 'today' ? 'today' : timeframe === 'yesterday' ? 'yesterday' : 'this week'

    // Formulate response
    const greetings = [
      `Here is the financial breakdown (Indian styles) for **${timeLabel}**:`,
      `I've audited the billing registers. For **${timeLabel}**, the numbers are:`,
      `Financial ledgers compiled for **${timeLabel}**:`
    ]
    const selectedGreeting = greetings[Math.floor(Math.random() * greetings.length)]

    // Check if query is about GST specifically
    if (clean.includes('tax') || clean.includes('gst') || clean.includes('cgst') || clean.includes('sgst')) {
      return `💸 **Financial AI (GST Tax Desk)**:
For **${timeLabel}**, gross taxable sales are ${formatINR(revenue)}.
- **CGST (9%)**: **${formatINR(cgst)}**
- **SGST (9%)**: **${formatINR(sgst)}**
- **Total GST Liability**: **${formatINR(totalGst)}** (Combined 18% GST).
- Net profits before taxation: ${formatINR(profit)}.

*Next Action*: Our automations show that automated GST Invoice Generation is currently **${dbState.automations.gstGeneration ? 'ENABLED' : 'DISABLED'}**. I recommend keeping this active for real-time customer invoice filing.`
    }

    // Cash flow query
    if (clean.includes('cash flow') || clean.includes('cashflow')) {
      return `💵 **Financial AI (Cash Flow Telemetry)**:
- Inflows (Revenue): **+${formatINR(revenue)}**
- Outflows (COGS): **-${formatINR(cogs)}**
- Outflows (Daily Payroll overhead): **-${formatINR(dailyPayroll)}**
- Net operational cash flow is **${formatINR(netCashFlow)}**.

*Reasoning*: The cash flow is positive mainly due to high transactions in Electronics.
*Next Action*: To protect working capital, consider scheduling the next inventory purchase after the weekend sales influx.`
    }

    return `💰 **Financial AI Audit**:
${selectedGreeting}
- **Gross Revenue**: ${formatINR(revenue)}
- **Cost of Goods (COGS)**: ${formatINR(cogs)}
- **Estimated Net Profit**: **${formatINR(profit)}** (Profit margin: **${revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : '0'}%**)
- **Overhead Payroll (Daily)**: ${formatINR(dailyPayroll)}

*Reasoning*: Profitability is driven by sales of products like *${periodSales[0]?.productName || 'Green Tea'}*.
*Next Action*: To increase margins further, I recommend review of product markups in the *Apparel* category where margins are tight.`
  }

  // 2. INVENTORY TOPIC
  if (activeTopic === 'inventory') {
    const lowStock = products.filter(p => p.stock <= p.minStock)
    const overstock = products.filter(p => p.overstock || p.stock > p.minStock * 3)
    const totalVal = products.reduce((sum, p) => sum + (p.stock * p.price), 0)
    const totalCostVal = products.reduce((sum, p) => sum + (p.stock * p.cost), 0)

    if (clean.includes('value') || clean.includes('valuation') || (clean.includes('how much') && clean.includes('worth'))) {
      return `📦 **Inventory AI (Valuation Ledger)**:
The warehouse is currently holding **${products.length} catalog SKU lines**.
- Total Retail Value: **${formatINR(totalVal)}**
- Total Warehouse Cost Basis: **${formatINR(totalCostVal)}**
- Unrealized Inventory Markup: ${formatINR(totalVal - totalCostVal)}

*Next Action*: I recommend selling down the overstocked items to release **${formatINR(overstock.reduce((sum, p) => sum + (p.stock * p.cost), 0))}** of locked working capital.`
    }

    // Checking safety stock / low stock
    if (clean.includes('low') || clean.includes('running low') || clean.includes('alert')) {
      if (lowStock.length === 0) {
        return `📦 **Inventory AI**: Good news! All shelves are loaded within safety thresholds. There are no active low-stock alerts.`
      }

      return `📦 **Inventory AI Low Stock Report**:
We have detected **${lowStock.length} items** below safe operating shelf thresholds:
${lowStock.map(p => `- ${p.image} **${p.name}**: ${p.stock} units left (Min safety limit: ${p.minStock})`).join('\n')}

*Reasoning*: High customer demand for Groceries and Electronics has depleted shelves faster than our standard lead times.
*Next Action*: Tap "Suggest products to restock" to compile a procurement order sheet.`
    }

    // Restock list / suggestions
    if (clean.includes('suggest') || clean.includes('restock') || clean.includes('procure') || clean.includes('order')) {
      if (lowStock.length === 0) {
        return `📦 **Inventory AI**: Shelves are fully stocked. No restock purchases required. If you want to increase stocks for upcoming holidays, let me know.`
      }

      // Calculate cost to restock
      const procurementList = lowStock.map(p => {
        const orderQty = Math.max(25, p.minStock * 2 - p.stock)
        const costToBuy = orderQty * p.cost
        // Supplier recommendation logic
        let supplier = 'Global Trade Link'
        if (p.category === 'Electronics') supplier = 'Quantum Tech Corp'
        if (p.category === 'Groceries' || p.category === 'Food') supplier = 'GreenField Fresh Co.'
        if (p.category === 'Medical') supplier = 'BioPharma Distributors'
        if (p.category === 'Apparel') supplier = 'Heritage Fabrics Ltd.'
        
        return {
          name: p.name,
          qty: orderQty,
          cost: costToBuy,
          supplier
        }
      })

      const totalProcureCost = procurementList.reduce((sum, item) => sum + item.cost, 0)

      return `📦 **Inventory AI Restock Recommendations**:
To secure the supply chain, purchase orders are recommended for these **${lowStock.length} items**:
${procurementList.map(item => `- **${item.name}**: Purchase **${item.qty} units** from *${item.supplier}* (Cost: **${formatINR(item.cost)}**)`).join('\n')}

- **Total Procurement Cost**: **${formatINR(totalProcureCost)}**

*Next Action*: Switch to the **Requests Center** tab to submit these procurement requisitions for cashier review and approval.`
    }

    // Overstock
    if (clean.includes('overstock') || clean.includes('excess')) {
      return `📦 **Inventory AI Overstock Audit**:
The following items are taking excessive warehouse storage:
${overstock.map(p => `- ${p.image} **${p.name}**: ${p.stock} units in stock (Safety floor: ${p.minStock})`).join('\n')}

*Reasoning*: Seasonal demand deceleration in Electronics (specifically Smart Charging Cables) has led to shelf stagnation.
*Next Action*: Marketing AI recommends running a 15% WhatsApp bundle discount to flush excess stock.`
    }

    // Fallback inventory
    return `📦 **Inventory AI**:
I can audit catalog stock levels. We currently track **${products.length} active products**.
- Total stock items: ${products.reduce((sum, p) => sum + p.stock, 0)} units.
- Active low-stock alerts: **${lowStock.length}**.
Try asking: *"Which products are running low?"* or *"Suggest products to restock"*`
  }

  // 3. SALES TOPIC
  if (activeTopic === 'sales') {
    const sortedSales = [...products].sort((a, b) => b.salesCount - a.salesCount)
    const slowestSales = [...products].sort((a, b) => a.salesCount - b.salesCount)
    const topProd = sortedSales[0]
    const slowProd = slowestSales[0]

    // Category performance
    if (clean.includes('category') || clean.includes('categories')) {
      const catStats: Record<string, { count: number; rev: number }> = {}
      products.forEach(p => {
        if (!catStats[p.category]) catStats[p.category] = { count: 0, rev: 0 }
        catStats[p.category].count += p.salesCount
        catStats[p.category].rev += p.salesCount * p.price
      })
      
      const report = Object.entries(catStats).map(([cat, stats]) => 
        `- **${cat}**: Sold **${stats.count} units** (Gross Revenue: **${formatINR(stats.rev)}**)`
      ).join('\n')

      return `📈 **Sales AI Category Audit**:
Here is the sales performance breakdown by category:
${report}

*Reasoning*: *Electronics* and *Food* continue to generate the highest sales velocities due to customer segment demand.
*Next Action*: We should focus high-margin promotions on *Apparel* to capture more market share.`
    }

    // Top selling product
    if (clean.includes('best') || clean.includes('most') || clean.includes('highest') || clean.includes('top') || clean.includes('sold the most')) {
      return `📈 **Sales AI Performance Leader**:
The highest volume performer is **${topProd.image} ${topProd.name}** (Category: ${topProd.category}) with **${topProd.salesCount} units sold**.
- Total revenue generated: **${formatINR(topProd.salesCount * topProd.price)}**
- Net margin: **${(((topProd.price - topProd.cost) / topProd.price) * 100).toFixed(1)}%** (${formatINR(topProd.price - topProd.cost)} per unit)

*Next Action*: Since inventory stock is currently at **${topProd.stock} units**, we should coordinate with Inventory AI to place a bulk reorder to prevent an out-of-stock event.`
    }

    // Slow moving products
    if (clean.includes('slow') || clean.includes('least') || clean.includes('lowest') || clean.includes('worst')) {
      return `📈 **Sales AI Stagnancy Report**:
Our slowest-moving product is **${slowProd.image} ${slowProd.name}** with only **${slowProd.salesCount} sales** all-time.
- Shelf stock remaining: **${slowProd.stock} units** (Valued at ${formatINR(slowProd.stock * slowProd.price)} retail).
- Margin on item: **${(((slowProd.price - slowProd.cost) / slowProd.price) * 100).toFixed(1)}%**.

*Next Action*: Marketing AI suggests bundling this with our top seller, or offering a flash 20% discount coupon to clear space.`
    }

    // General sales query
    const totalUnitsSold = products.reduce((sum, p) => sum + p.salesCount, 0)
    return `📈 **Sales AI Dashboard**:
Sales analysis engines are fully functional.
- Total units sold: **${totalUnitsSold}** units.
- Average item margin: **54.5%**.
- Top selling SKU: **${topProd.name}**.
Try asking: *"Which product sold the most?"* or *"Show slow-moving items"*`
  }

  // 4. MARKETING TOPIC
  if (activeTopic === 'marketing') {
    // Generate social copy / promo templates
    if (clean.includes('instagram') || clean.includes('social') || clean.includes('facebook') || clean.includes('post') || clean.includes('copy')) {
      // Find a product mentioned or use the top seller/overstock product
      let targetProd = products.find(p => clean.includes(p.name.toLowerCase()))
      if (!targetProd) {
        targetProd = products.find(p => p.id === 'p2') || products[0]
      }

      const postCopy = `⚡️ **EXCLUSIVE DEAL ALERT!** ⚡️
      
Upgrade your gear with the brand new **${targetProd.image} ${targetProd.name}**! 🚀
Whether you are at work or on the move, get reliability you can trust.

💥 **SPECIAL OFFER**: Get **15% OFF** today only!
👉 Use Code: **DEAL15** at checkout.

🔗 Link in Bio to purchase yours!
#${targetProd.category.toLowerCase()} #techlife #premiumquality #gadgets #deals #shoplocal`

      return `📣 **Marketing AI (Social Copy Engine)**:
Generated an Instagram post copy for **${targetProd.name}**:

---
${postCopy}
---

*Image Prompt (for generation)*: *"Detailed photographic shot of ${targetProd.name} floating in an energetic, high-tech neon blue atmosphere, cinematic lighting, photorealistic 8k"*

*Next Action*: Submit this draft template straight to our Instagram queue inside the **AI Marketing** tab.`
    }

    // Campaign performance
    if (clean.includes('campaign') || clean.includes('conversions') || clean.includes('stats')) {
      const activeCampaigns = campaigns.map(c => 
        `- **${c.title}** (${c.platform}): Clicks: ${c.clicks} | Conversion: **${c.conversion}%** (Status: **${c.status}**)`
      ).join('\n')

      return `📣 **Marketing AI (Campaign Telemetry)**:
Here are the metrics for our advertising campaigns:
${activeCampaigns}

*Next Action*: The *Weekend Restock* campaign on WhatsApp registered a record **8.5% conversion rate**. I recommend allocating 25% more budget from Email to WhatsApp campaigns.`
    }

    // Hashtags
    if (clean.includes('hashtag') || clean.includes('tags')) {
      return `📣 **Marketing AI**:
Here are highly searched keywords and hashtag combinations for our catalog:
- **Electronics**: \`#audiophile #techlife #gadgetporn #RGBsetup #homeoffice\`
- **Groceries**: \`#organictea #healthyhabits #greentealover #sourdough #freshfood\`
- **General Store**: \`#shoplocal #quantumdeals #retailtherapy #fastdelivery\``
    }

    // SEO Suggestions
    if (clean.includes('seo') || clean.includes('search engine')) {
      return `📣 **Marketing AI (SEO Optimizer)**:
Here are recommended SEO guidelines for our e-commerce headers:
1. **Title Tag**: *Quantum BusinessOS Store | Premium Electronics & Fresh Groceries*
2. **Meta Description**: *Shop Wireless Earbuds, Organic Green Tea, and Sourdough Bread. Enjoy superfast drone delivery and 30-day free returns. Best prices online!*
3. **Keywords**: *wireless earbuds, premium leather wallet, multi vitamins, organic honey, sourdough bread*`
    }

    return `📣 **Marketing AI**:
I can generate high-converting promotional copies, write ad headers, and audit campaign performance.
Try: *"Create an Instagram post for Wireless Earbuds X1"* or *"Show campaign performance"*`
  }

  // 5. CUSTOMER SUPPORT TOPIC (AI Customer Assistant - RAG)
  if (activeTopic === 'support') {
    // ----------------------------------------
    // RAG KNOWLEDGE BASES
    // ----------------------------------------

    const POLICY_DATABASE = {
      return: `🛡 **Return Policy**:
We offer a customer-friendly **30-day money-back guarantee** on all items! If you are not completely satisfied with your purchase, you can return it within 30 days of receipt.
- **Requirements**: Items must be in their original packaging, unused, and in the same condition as received.
- **Process**: Returns can be scheduled for automatic drone pickup or courier pickup directly from your app.
- **Refunds**: Once received and inspected, refunds are processed back to your original payment method within 5-7 business days.`,
      
      refund: `💸 **Refund Policy**:
Refunds are processed promptly upon the return of goods in eligible condition.
- **Method**: The refund will be credited back to your original payment method (Credit/Debit Card, UPI Wallet, or cash voucher).
- **Processing Time**: Standard verification takes 2-3 business days after arrival at our CyberCity Gurgaon hub. The refund is credited in 5-7 business days.
- **Shipping Fees**: Standard shipping charges are non-refundable unless the return is due to a product defect.`,
      
      exchange: `🔄 **Exchange Policy**:
If you need a different size, color, or model, we provide exchange options within 30 days of purchase.
- **Availability**: Exchanges are subject to active catalog stock levels. If an item is out of stock, a refund or credit voucher will be provided.
- **Drone Exchange**: We can schedule an automated drone exchange where the drone delivers the replacement item and retrieves the returned item in a single trip.`,
      
      warranty: `🛡 **Warranty Policy**:
All electronic appliances and accessories carry a **1 Year Hardware Electronic Warranty** (unless specified otherwise on the product page, e.g. FlexLink cables carry a 2 Year Warranty).
- **Coverage**: Covers manufacturing defects, internal component failures, and wiring issues under normal usage conditions.
- **Exclusions**: Does not cover liquid damage, drops, physical breaks, or unauthorized modifications.
- **Claim Process**: Contact support with your invoice number to schedule a diagnostic pickup.`,

      privacy: `🔒 **Privacy Policy**:
We value your trust and prioritize your privacy!
- **Data Security**: All customer personal details, including emails, addresses, and order histories, are protected with end-to-end encryption. We are SOC 2 compliant.
- **No Shared Training**: We do NOT share or sell your business operations or transaction data. Our AI models never train on your private business transactions.
- **Cookies**: We use cookies solely to maintain your session parameters and local store settings.`,

      terms: `📄 **Terms & Conditions**:
Welcome to the store! By using our platform and customer portal, you agree to:
- **Billing**: Payment must be completed via our verified checkout options (Cash on Delivery or digital wallet).
- **Drone Shipping**: Drone deliveries are constrained by local aviation regulations and weather alerts.
- **Limitations**: We reserve the right to cancel or refuse bulk order requests that exceed reasonable shelf quantities.`
    }

    const SHIPPING_DATABASE = {
      charges: `🚚 **Shipping Charges**:
- Standard delivery is **FREE** on all orders above ₹4,000!
- For orders below ₹4,000, a flat shipping charge of **₹150** is applied for drone shipping or courier delivery.`,

      deliveryTime: `⏱ **Delivery Time**:
- **Metro Hubs**: Local deliveries are completed within **24 hours** using our high-speed Cargo Drones.
- **Standard Shipping**: Deliveries outside prime metro grid coverage take **2 to 3 business days** via standard courier.`,

      sameDay: `🚀 **Same-Day & Express Delivery**:
- Same-day Cargo Drone shipping is available for all eligible orders placed before 3:00 PM (subject to safe wind levels and clearance within Gurgaon/metro limits).
- Select "Express Drone Delivery" at checkout for guaranteed delivery within 4 hours.`,

      cod: `💵 **Cash on Delivery (COD)**:
- Yes! We support Cash on Delivery (COD) for all physical store deliveries. You can pay our delivery agent or drone locker collector in cash upon receiving the package.`,

      pickup: `🏪 **Showroom Pickup**:
- Customers can place orders online and schedule a free pickup at any of our Experience Showrooms in **Gurgaon (CyberCity)**, **Bengaluru (Indiranagar)**, or **Mumbai (BKC)**.`
    }

    const FAQ_DATABASE = {
      aiEmployee: `🏪 **AI Employees FAQ**:
An AI Employee is a dedicated AI agent that learns your business operations and handles tasks across inventory, finance, customer support, marketing, and analytics — working 24/7 alongside your team.`,

      setupTime: `⏱ **Setup Time FAQ**:
Most businesses are up and running in under 15 minutes. Connect your existing tools, and your AI employee starts learning immediately. No technical knowledge required.`,

      businessDataSecurity: `🔒 **Business Data Security FAQ**:
Yes. We use end-to-end encryption, are SOC 2 compliant, and you retain full ownership of your data. We never train shared models on your private business data.`,

      humanReplacement: `👥 **Human Replacement FAQ**:
Our AI Employees augment your team by automating repetitive tasks — invoicing, support tickets, inventory tracking, and reporting. This frees your people to focus on strategy and growth. Most customers automate 90%+ of routine work.`,

      integrations: `🔗 **Integrations FAQ**:
BusinessOS AI connects with 200+ tools including Shopify, Stripe, QuickBooks, Slack, Gmail, HubSpot, and more. Custom integrations are available on Enterprise plans.`,

      actionsLimit: `⚡️ **AI Actions Limit FAQ**:
You can upgrade your plan anytime, or purchase additional action packs. Enterprise plans include unlimited AI actions with dedicated infrastructure.`
    }

    const OFFERS_DATABASE = {
      instagramOffer: `✨ **Instagram Promo**: Summer Tech Splash campaign. Upgrade your audio gear with the Wireless Earbuds X1! Get **20% OFF** using the coupon code: **TECHSUMMER** at checkout.`,
      whatsappOffer: `✨ **WhatsApp Special**: Sourdough Bread, Organic Honey, and Organic Green Tea specials. Use coupon code **RELEASE15** for **15% OFF** overstocked items!`,
      newsletterOffer: `✨ **Loyalty appreciation**: Registered newsletter members enjoy a flat **15% discount** voucher sent to their registered emails. Check your email inbox for your custom voucher code.`
    }

    // Curated details for product search specifications
    const getProductSpecs = (p: Product) => {
      const nameLower = p.name.toLowerCase()
      
      let brand = 'Quantum Tech'
      let description = `A premium quality ${p.name} designed to deliver exceptional performance and style.`
      let specifications = 'Standard industry specifications.'
      let features = ['High durability', 'Ergonomic design', 'Premium materials']
      let dimensions = 'N/A'
      let weight = 'N/A'
      let warranty = '1 Year Limited Warranty'
      let returnPolicy = '30-Day Money Back Guarantee. Return in original packaging.'
      let rating = p.rating ? `${p.rating}/5` : '4.5/5'
      let reviews = ['Great product!', 'Satisfied with the purchase.']
      let deliveryTime = 'Within 24 hours via Cargo Drone Express'
      let expectedShipping = 'Ships today'
      let storeAvailability = 'In Stock at CyberCity Gurgaon experience showroom'
      let accessories = ['User manual', 'Warranty card']
      let relatedProducts = [] as string[]
      let recommendedFor = 'Students, home offices, and tech enthusiasts'
      let offerPrice = p.price ? formatINR(p.price * 0.9) : undefined // 10% standard offer discount

      if (nameLower.includes('earbud')) {
        brand = 'Acoustic Labs'
        description = 'High-fidelity wireless earbuds with active noise cancellation, smart touch controls, and ergonomic fit.'
        specifications = 'Bluetooth 5.3, 10mm dynamic drivers, IPX7 water resistance'
        features = ['Active Noise Cancellation', '30-hour total battery life with charging case', 'Touch control commands', 'Instant pairing']
        dimensions = '2.4 x 1.8 x 0.9 inches'
        weight = '45g'
        warranty = '1 Year Replacement Warranty'
        recommendedFor = 'Music lovers, commuters, and fitness enthusiasts'
        accessories = ['USB-C Cable', 'Silicone Ear Tips (S/M/L)', 'Charging Case']
        relatedProducts = ['Noise-Cancelling Headphones', 'Smart Charging Cable']
      } else if (nameLower.includes('cable')) {
        brand = 'FlexLink'
        description = 'Ultra-durable charging cable with LED charging status indicator, nylon braiding, and smart chip protection.'
        specifications = 'USB-C to USB-C, 100W Power Delivery, 2-meter length'
        features = ['100W Fast Charging support', 'Smart LED status display', 'Reinforced strain relief joints', 'Nylon braided exterior']
        dimensions = '6.6 feet (2 meters)'
        weight = '30g'
        warranty = '2 Year Damage Protection Warranty'
        recommendedFor = 'Fast charging laptops, smartphones, and tablets'
        accessories = ['Velcro organizer strap']
        relatedProducts = ['Wireless Earbuds X1', 'Noise-Cancelling Headphones']
      } else if (nameLower.includes('wallet')) {
        brand = 'Vanguard Hide'
        description = 'Genuine top-grain leather wallet with integrated RFID blocking technology and slim bi-fold design.'
        specifications = 'Top-grain cowhide leather, 6 card slots, 1 ID window'
        features = ['RFID blocking security barrier', 'Slim profile design', 'Quick-access thumb card slot', 'Genuine leather craftsmanship']
        dimensions = '4.2 x 3.1 x 0.4 inches'
        weight = '60g'
        warranty = '6 Month Leather Stitching Warranty'
        recommendedFor = 'Everyday carry, professionals, and minimalist enthusiasts'
        accessories = ['Premium presentation box']
        relatedProducts = ['Futuristic Hoodie', 'Premium Running Shoes']
      } else if (nameLower.includes('tea')) {
        brand = 'GreenField Organic'
        description = 'Hand-picked premium organic green tea leaves rich in natural antioxidants and soothing aroma.'
        specifications = '100% Organic Camellia sinensis leaves, loose tea format'
        features = ['Antioxidant-rich formula', 'No artificial colors or preservatives', 'Sustainably sourced leaves', 'Eco-friendly paper pouch']
        dimensions = '100g pouch'
        weight = '100g'
        warranty = 'Seal expiry quality assurance (expires 2026-08-15)'
        recommendedFor = 'Health-conscious individuals, tea lovers, and detox routines'
        accessories = ['Stainless steel loose leaf infuser']
        relatedProducts = ['Organic Honey (500g)', 'Sourdough Bread']
      } else if (nameLower.includes('hoodie')) {
        brand = 'Heritage Apparel'
        description = 'Futuristic streetwear hoodie with relaxed drop-shoulder fit, thick cotton fabric, and cyber graphic decals.'
        specifications = '80% Premium organic cotton, 20% recycled polyester, 400 GSM fabric'
        features = ['High density graphic print', 'Thick double-lined hood', 'Kangaroo utility pocket', 'Comfortable ribbed cuffs']
        dimensions = 'Sizes: S, M, L, XL available'
        weight = '550g'
        warranty = 'Color-fade resistant guarantee'
        recommendedFor = 'Casual wear, streetwear styling, and cool weather layers'
        accessories = ['Eco drawstring pouch']
        relatedProducts = ['Premium Running Shoes', 'Premium Leather Wallet']
      } else if (nameLower.includes('vitamin')) {
        brand = 'BioPharma Nutra'
        description = 'Daily multivitamin supplements packed with essential vitamins, minerals, and natural extracts.'
        specifications = '60 tablets per container, GMP certified formulation'
        features = ['Complete daily nutrient list', 'Gluten-free and vegan capsule shells', 'Supports immune defense', 'Energy boosting complex']
        dimensions = '60 capsules bottle'
        weight = '90g'
        warranty = 'Safety seal guarantee (expires 2026-07-20)'
        recommendedFor = 'Daily wellness support, athletes, and busy schedules'
        accessories = ['Daily pill organizer']
        relatedProducts = ['Pain Relief Spray', 'Organic Honey (500g)']
      } else if (nameLower.includes('honey')) {
        brand = 'GreenField Farms'
        description = 'Pure raw forest honey collected sustainably from organic bee apiaries. Unfiltered and raw.'
        specifications = '100% Pure wild forest honey, Grade A certified'
        features = ['Zero added sugars or syrup', 'Naturally rich floral notes', 'Raw and cold-extracted', 'Glass jar storage container']
        dimensions = '500g jar'
        weight = '500g jar (gross 650g)'
        warranty = 'Purity verification certification'
        recommendedFor = 'Natural sweetener option, baking, and sore throat relief'
        accessories = ['Wooden honey dipper wand']
        relatedProducts = ['Organic Green Tea (100g)', 'Sourdough Bread']
      } else if (nameLower.includes('keyboard')) {
        brand = 'Quantum Mechanical'
        description = 'Tactile mechanical keyboard featuring custom linear switches, dynamic RGB custom layouts, and hot-swap PCB.'
        specifications = '75% layout format, hot-swappable linear switches, double-shot PBT keycaps'
        features = ['Hot-swappable switches', '16.8 million colors RGB backlight', 'Sound absorbing foam layers', 'Dual-mode connection support']
        dimensions = '12.5 x 5.2 x 1.3 inches'
        weight = '820g'
        warranty = '1 Year Hardware Electronics Warranty'
        recommendedFor = 'Programmers, PC gamers, and office setups'
        accessories = ['Keycap puller tool', 'Switch puller tool', 'USB-C coiled cable']
        relatedProducts = ['Wireless Earbuds X1', 'Noise-Cancelling Headphones']
      } else if (nameLower.includes('shoes')) {
        brand = 'Heritage Footwear'
        description = 'High performance running sneakers with custom responsive foam midsoles and breathable mesh upper.'
        specifications = 'Responsive nitrogen-infused foam, carbon rubber sole plate'
        features = ['Responsive energy return cushioning', 'Breathable knit exterior mesh', 'Anti-slip grip tread', 'Orthotic support insoles']
        dimensions = 'Sizes: 8, 9, 10, 11 available'
        weight = '310g per shoe'
        warranty = '3 Month Manufacturing Fault Warranty'
        recommendedFor = 'Athletic routines, daily runners, and active walking comfort'
        accessories = ['Additional set of reflective laces']
        relatedProducts = ['Futuristic Hoodie', 'Premium Leather Wallet']
      } else if (nameLower.includes('chocolate')) {
        brand = 'Gourmet Chocolatiers'
        description = 'Single-origin premium dark chocolate bar with handpicked cocoa beans and smooth, velvety texture.'
        specifications = '72% Dark chocolate cocoa content, organic beans'
        features = ['Velvety single-origin taste', 'Zero artificial flavorings', 'Rich in natural cocoa butter', 'Eco foil wrapping']
        dimensions = '100g bar'
        weight = '100g'
        warranty = 'Freshness assurance (expiry 2026-10-30)'
        recommendedFor = 'Chocolate connoisseurs, gifting, and sweet treats'
        accessories = ['Elegant gift wrapping option']
        relatedProducts = ['Energy Drink Sugar-Free', 'Sourdough Bread']
      } else if (nameLower.includes('drink')) {
        brand = 'Volt Energy'
        description = 'Sugar-free carbonated energy beverage enhanced with B-complex vitamins, taurine, and high caffeine.'
        specifications = '250ml can, zero sugars, 80mg caffeine'
        features = ['Zero sugar nutrition layout', 'B-vitamin focus complex', 'Instant alertness trigger', 'Crisp refreshment feel']
        dimensions = '250ml can'
        weight = '260g'
        warranty = 'Carbonation freshness guarantee'
        recommendedFor = 'Workouts, study nights, and gaming marathons'
        accessories = ['Reusable silicone can lid']
        relatedProducts = ['Gourmet Chocolate Bar', 'Sourdough Bread']
      } else if (nameLower.includes('spray')) {
        brand = 'BioPharma Medical'
        description = 'Rapid pain relief cooling aerosol spray that relieves muscle cramps, minor sprains, and backaches.'
        specifications = '150ml aerosol container, cooling menthol formula'
        features = ['Rapid muscle recovery boost', 'Deep penetration cooling effect', 'Non-greasy rapid dry formulation', 'Easy 360-degree nozzle']
        dimensions = '150ml aerosol spray'
        weight = '130g'
        warranty = 'Clinical approval standard'
        recommendedFor = 'Sports bags, workout recovery, and muscle relief'
        accessories = ['Travel safety spray cap']
        relatedProducts = ['Vitamins Multi-Pack', 'Pain Relief Spray']
      } else if (nameLower.includes('bread')) {
        brand = 'GreenField Bakery'
        description = 'Artisanal sourdough loaf baked freshly with wild yeast starter cultures and premium unbleached flour.'
        specifications = 'Naturally fermented sourdough loaf, classic crust'
        features = ['Natural 24-hour fermentation', 'No industrial yeast or additives', 'Crispy crust with open crumb', 'Freshly baked daily']
        dimensions = '400g loaf'
        weight = '400g'
        warranty = 'Freshness standard (expiry 2026-07-04)'
        recommendedFor = 'Breads, sandwiches, and soup pairings'
        accessories = ['Reusable linen bread storage bag']
        relatedProducts = ['Organic Honey (500g)', 'Organic Green Tea (100g)']
      } else if (nameLower.includes('headphones')) {
        brand = 'Acoustic Labs'
        description = 'Wireless over-ear noise-cancelling headphones featuring studio sound quality and comfortable memory foam ear cups.'
        specifications = 'Hybrid ANC technology, 40mm dynamic drivers, 40-hour battery'
        features = ['Hybrid Active Noise Cancellation', 'Custom tuned sound profiles', 'Hi-Res audio certified signature', 'Plush memory foam pads']
        dimensions = '7.5 x 6.3 x 3.1 inches'
        weight = '245g'
        warranty = '1 Year Electronic Hardware Warranty'
        recommendedFor = 'Work-from-home, office study, and audiophile sound quality'
        accessories = ['Hard shell travel case', 'USB-C Cable', '3.5mm Aux audio cable']
        relatedProducts = ['Wireless Earbuds X1', 'Smart Charging Cable']
      }

      return {
        name: p.name,
        sku: p.sku,
        price: p.price,
        stock: p.stock,
        brand,
        category: p.category,
        description,
        specifications,
        features,
        dimensions,
        weight,
        warranty,
        returnPolicy,
        rating,
        reviews,
        deliveryTime,
        expectedShipping,
        storeAvailability,
        accessories,
        relatedProducts,
        recommendedFor,
        offerPrice: offerPrice
      }
    }

    // Levenshtein distance similarity function
    const getLevenshteinDistance = (a: string, b: string): number => {
      const al = a.length, bl = b.length
      if (al === 0) return bl
      if (bl === 0) return al
      const matrix = []
      for (let i = 0; i <= bl; i++) matrix[i] = [i]
      for (let j = 0; j <= al; j++) matrix[0][j] = j
      for (let i = 1; i <= bl; i++) {
        for (let j = 1; j <= al; j++) {
          if (b[i - 1] === a[j - 1]) {
            matrix[i][j] = matrix[i - 1][j - 1]
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1, // substitution
              matrix[i][j - 1] + 1,     // insertion
              matrix[i - 1][j] + 1      // deletion
            )
          }
        }
      }
      return matrix[bl][al]
    }

    const findSimilarProduct = (q: string): Product | null => {
      const cleanQ = q.toLowerCase().replace(/[^a-z0-9]/g, '').trim()
      if (!cleanQ) return null
      
      // Direct substring match
      for (const p of products) {
        const cleanName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '')
        if (cleanName.includes(cleanQ) || cleanQ.includes(cleanName)) {
          return p
        }
      }
      
      // Fuzzy Levenshtein match (smart misspelling lookup)
      let bestMatch: Product | null = null
      let minDistance = 999
      for (const p of products) {
        const cleanName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '')
        const dist = getLevenshteinDistance(cleanQ, cleanName)
        if (dist < minDistance && dist <= 4) {
          minDistance = dist
          bestMatch = p
        }
      }
      return bestMatch
    }

    const formatProductOutput = (p: Product): string => {
      const specs = getProductSpecs(p)
      return `📦 **${specs.name}**

💰 **Price**: ${formatINR(specs.price)}
🏷 **Offer**: ${specs.offerPrice ? `${formatINR(parseFloat(specs.offerPrice.replace(/[^0-9.]/g, '')))} (10% standard off)` : 'No active standard discounts'}
⭐ **Rating**: ${specs.rating}
📦 **Stock**: ${specs.stock > 0 ? `${specs.stock} units available` : 'This product is currently out of stock.'}
🚚 **Delivery**: ${specs.deliveryTime}
🛡 **Warranty**: ${specs.warranty}
📄 **Description**: ${specs.description}
✅ **Features**:
${specs.features.map(f => `  - ${f}`).join('\n')}
🎯 **Recommended For**: ${specs.recommendedFor}`
    }

    // ----------------------------------------
    // Step 1: Understand Intent & Retrieve
    // ----------------------------------------

    // Check order tracking query
    const isTrackingQuery = clean.includes('track') || clean.includes('order status') || clean.includes('where is my package') || clean.includes('delivery status') || clean.includes('package status')
    if (isTrackingQuery) {
      // Look for Order ID (e.g. s1, s2, POS-..., or email/phone in query)
      const orderMatch = clean.match(/(s\d+|pos-[a-z0-9]+)/i)
      const emailMatch = clean.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
      const phoneMatch = clean.match(/(\+?\d[\d\s-]{8,}\d)/)
      
      let matchedSale: Sale | undefined
      if (orderMatch) {
        const idToSearch = orderMatch[0].toLowerCase()
        matchedSale = sales.find(s => s.id.toLowerCase() === idToSearch || (s._id && s._id.toLowerCase() === idToSearch))
      } else if (emailMatch) {
        const emailToSearch = emailMatch[0].toLowerCase()
        matchedSale = sales.find(s => s.customerName.toLowerCase() === 'alex johnson' && emailToSearch.includes('alex')) || sales.find(s => s.customerName.toLowerCase() === 'sarah smith' && emailToSearch.includes('sarah'))
      } else if (phoneMatch) {
        // phone number lookups
        const numClean = phoneMatch[0].replace(/\s+/g, '')
        matchedSale = sales.find(s => s.phone && s.phone.replace(/\s+/g, '').includes(numClean))
      }

      if (matchedSale) {
        const statusMap = {
          placed: 'Placed',
          confirmed: 'Confirmed',
          packed: 'Packed',
          ready_for_dispatch: 'Ready for Dispatch',
          shipped: 'Dispatched',
          reached_hub: 'In Transit',
          out_for_delivery: 'Out For Delivery',
          delivered: 'Delivered',
          cancelled: 'Cancelled'
        }
        const displayStatus = statusMap[matchedSale.shippingStatus || 'delivered'] || 'Delivered'
        
        return `📦 **Order Tracking Details**:
- **Order ID**: ${matchedSale.id}
- **Status**: ${displayStatus}
- **Courier**: Cargo DroneExpress Metro Delivery
- **Tracking Number**: TRK-DRN-${matchedSale.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}
- **Estimated Delivery**: ${matchedSale.shippingStatus === 'delivered' ? 'Delivered successfully' : 'Within 24 Hours'}`
      }
      
      // If order details requested but no ID found
      if (orderMatch || emailMatch || phoneMatch) {
        return `I couldn't find this information in the store database. Please contact the store owner for more details.`
      }

      return `Could you please provide your **Order ID** (e.g., s1, s2), **registered mobile number**, or **email address** so I can retrieve your details?`
    }

    // Check product comparison query
    const isComparisonQuery = clean.includes('compare') || clean.includes(' vs ') || clean.includes('versus')
    if (isComparisonQuery) {
      // Identify two items
      // Check if iPhone 15 vs Samsung S24 is requested
      if (clean.includes('iphone') && (clean.includes('s24') || clean.includes('samsung'))) {
        return `### Product Comparison: iPhone 15 vs Samsung S24

| Specifications | iPhone 15 | Samsung Galaxy S24 |
| :--- | :--- | :--- |
| **Price** | ₹79,900 | ₹74,999 |
| **Display** | 6.1-inch Super Retina XDR OLED, 60Hz | 6.2-inch Dynamic AMOLED 2X, 120Hz |
| **Battery** | 3349 mAh (Up to 20 hours video) | 4000 mAh (Up to 22 hours video) |
| **Performance** | Apple A16 Bionic chip | Exynos 2400 / Snapdragon 8 Gen 3 |
| **Camera** | Dual: 48MP Main + 12MP Ultra-Wide | Triple: 50MP Main + 10MP Telephoto + 12MP Ultra-Wide |
| **RAM** | 6 GB | 8 GB |
| **Storage** | 128GB / 256GB / 512GB | 128GB / 256GB / 512GB |
| **Warranty** | 1 Year Apple Limited Warranty | 1 Year Samsung Limited Warranty |
| **Pros** | Premium build, bright display, outstanding video quality | Dynamic 120Hz display, dedicated optical telephoto zoom lens, AI editing suite |
| **Cons** | Limited to 60Hz screen refresh, no charger included | Plastic rear components on basic frames |
| **Recommendation** | Recommended for users who prefer iOS ecosystem and high video recording efficiency. | Recommended for users looking for peak screen brightness, high refresh rates, and AI photo tools. |`
      }

      // Check if catalog products are being compared
      // Extract matching catalog items
      const matchedCatalogItems: Product[] = []
      for (const p of products) {
        if (clean.includes(p.name.toLowerCase()) || clean.includes(p.category.toLowerCase())) {
          if (!matchedCatalogItems.find(item => item.id === p.id)) {
            matchedCatalogItems.push(p)
          }
        }
      }

      if (matchedCatalogItems.length >= 2) {
        const p1 = matchedCatalogItems[0]
        const p2 = matchedCatalogItems[1]
        const s1 = getProductSpecs(p1)
        const s2 = getProductSpecs(p2)

        return `### Product Comparison: ${p1.name} vs ${p2.name}

| Specifications | ${p1.name} | ${p2.name} |
| :--- | :--- | :--- |
| **Price** | ${formatINR(p1.price)} | ${formatINR(p2.price)} |
| **Category** | ${p1.category} | ${p2.category} |
| **Brand** | ${s1.brand} | ${s2.brand} |
| **Stock Status** | ${p1.stock > 0 ? `${p1.stock} available` : 'Out of stock'} | ${p2.stock > 0 ? `${p2.stock} available` : 'Out of stock'} |
| **Warranty** | ${s1.warranty} | ${s2.warranty} |
| **Dimensions** | ${s1.dimensions} | ${s2.dimensions} |
| **Weight** | ${s1.weight} | ${s2.weight} |
| **Pros** | ${s1.features[0] || 'Premium quality'} | ${s2.features[0] || 'Premium quality'} |
| **Cons** | Limited colors | Limited options |
| **Recommendation** | ${s1.recommendedFor} | ${s2.recommendedFor} |`
      }
      
      // If we don't have enough catalog items matching
      if (matchedCatalogItems.length === 1) {
        return `I found one matching product (**${matchedCatalogItems[0].name}**). Please specify another product name to compare it with.`
      }

      return `I couldn't find those products in the store database. Please contact the store owner for more details.`
    }

    // Check FAQ match
    if (clean.includes('what is') && (clean.includes('employee') || clean.includes('agent'))) {
      return FAQ_DATABASE.aiEmployee
    }
    if (clean.includes('setup') || clean.includes('how long') || clean.includes('get started')) {
      return FAQ_DATABASE.setupTime
    }
    if (clean.includes('secure') || clean.includes('data') || clean.includes('private') || clean.includes('encryption')) {
      return FAQ_DATABASE.businessDataSecurity
    }
    if (clean.includes('replace') || clean.includes('human')) {
      return FAQ_DATABASE.humanReplacement
    }
    if (clean.includes('integrate') || clean.includes('connect')) {
      return FAQ_DATABASE.integrations
    }
    if (clean.includes('action limit') || clean.includes('unlimited') || clean.includes('pricing plan')) {
      return FAQ_DATABASE.actionsLimit
    }

    // Check Shipping/Delivery match
    if (clean.includes('shipping charge') || clean.includes('free shipping') || clean.includes('shipping fee')) {
      return SHIPPING_DATABASE.charges
    }
    if (clean.includes('delivery time') || clean.includes('how long') || clean.includes('shipping options')) {
      return SHIPPING_DATABASE.deliveryTime
    }
    if (clean.includes('same day') || clean.includes('same-day') || clean.includes('express')) {
      return SHIPPING_DATABASE.sameDay
    }
    if (clean.includes('cod') || clean.includes('cash on delivery') || clean.includes('payment method')) {
      return SHIPPING_DATABASE.cod
    }
    if (clean.includes('pickup') || clean.includes('collect') || clean.includes('showroom')) {
      return SHIPPING_DATABASE.pickup
    }

    // Check Policy match
    if (clean.includes('refund policy') || clean.includes('how do i get a refund')) {
      return POLICY_DATABASE.refund
    }
    if (clean.includes('return policy') || clean.includes('how to return')) {
      return POLICY_DATABASE.return
    }
    if (clean.includes('exchange policy') || clean.includes('how to exchange')) {
      return POLICY_DATABASE.exchange
    }
    if (clean.includes('warranty policy') || clean.includes('does it have warranty')) {
      return POLICY_DATABASE.warranty
    }
    if (clean.includes('privacy policy') || clean.includes('data safe')) {
      return POLICY_DATABASE.privacy
    }
    if (clean.includes('terms') || clean.includes('conditions')) {
      return POLICY_DATABASE.terms
    }

    // Check Offers/Discounts match
    if (clean.includes('offer') || clean.includes('discount') || clean.includes('coupon') || clean.includes('promo')) {
      if (clean.includes('instagram') || clean.includes('earbud')) {
        return OFFERS_DATABASE.instagramOffer
      }
      if (clean.includes('whatsapp') || clean.includes('bread') || clean.includes('tea') || clean.includes('honey')) {
        return OFFERS_DATABASE.whatsappOffer
      }
      return `${OFFERS_DATABASE.instagramOffer}\n\n${OFFERS_DATABASE.whatsappOffer}\n\n${OFFERS_DATABASE.newsletterOffer}`
    }

    // Check recommendations or search queries
    const recommendationTrigger = clean.includes('recommend') || clean.includes('suggest') || clean.includes('choose') || clean.includes('find') || clean.includes('looking for') || clean.includes('need a') || clean.includes('want a')
    if (recommendationTrigger) {
      // Check incomplete categories first
      const hasLaptopKeyword = clean.includes('laptop') || clean.includes('laptops')
      const hasPhoneKeyword = clean.includes('phone') || clean.includes('phones')
      
      if (hasLaptopKeyword || hasPhoneKeyword || clean === 'i need a product' || clean === 'recommend me something') {
        // Asks follow-up questions
        return `Could you please specify your **budget** and **intended purpose** (e.g., Gaming, Office work, Programming, Student use, Video editing) so I can recommend the perfect product for you?`
      }

      // Check budget parameters
      const budgetMatch = clean.match(/(?:under|below|budget of)?\s*(?:rs\.?|₹|inr)?\s*(\d+)/i)
      const budgetValue = budgetMatch ? parseInt(budgetMatch[1]) : null

      // Check category match
      const matchingCategory = products.filter(p => clean.includes(p.category.toLowerCase()))
      let candidates = matchingCategory.length > 0 ? matchingCategory : products

      // Apply budget filter if available
      if (budgetValue) {
        candidates = candidates.filter(p => p.price <= budgetValue)
      }

      if (candidates.length > 0) {
        // Sort matching candidates:
        // 1. Highest Rating
        // 2. Best Seller
        // 3. Lowest Price
        const sorted = [...candidates].sort((a, b) => {
          const aRating = a.rating || 4.5
          const bRating = b.rating || 4.5
          if (bRating !== aRating) return bRating - aRating
          return b.salesCount - a.salesCount
        })

        const topRecs = sorted.slice(0, 5)
        const recList = topRecs.map((p, idx) => {
          const specs = getProductSpecs(p)
          return `\n${idx + 1}. **${p.name}** (${formatINR(p.price)})
- **Why recommended**: Highly rated with a ${specs.rating} rating and fits your specific category criteria perfectly. Designed especially for ${specs.recommendedFor}.`
        }).join('\n')

        return `Based on your request, I recommend the following top options from our store catalog:${recList}`
      }
    }

    // Direct product detail match (lookup by name/sku/category)
    const exactMatch = findSimilarProduct(clean)
    if (exactMatch) {
      if (exactMatch.stock <= 0) {
        // Recommend alternatives in same category
        const alternatives = products.filter(p => p.category === exactMatch.category && p.id !== exactMatch.id && p.stock > 0).slice(0, 2)
        let altText = ''
        if (alternatives.length > 0) {
          altText = `\n\nI recommend these similar alternatives that are in stock:\n` + alternatives.map(p => `- **${p.name}** (${formatINR(p.price)})`).join('\n')
        }
        return `This product is currently out of stock.${altText}`
      }
      return formatProductOutput(exactMatch)
    }

    // Check category list match
    const categoryMatch = products.filter(p => clean.includes(p.category.toLowerCase()))
    if (categoryMatch.length > 0) {
      const top5 = categoryMatch.slice(0, 5)
      return `Here are the matching catalog items I found for you:
${top5.map(p => formatProductOutput(p)).join('\n\n---\n\n')}`
    }

    // Default strict fallback (absolutely no hallucinations)
    return `I couldn't find this information in the store database. Please contact the store owner for more details.`
  }

  // 6. ANALYTICS TOPIC
  if (activeTopic === 'analytics') {
    const avgCLV = customers.reduce((sum, c) => sum + c.clv, 0) / customers.length
    const segments = customers.reduce((acc, c) => {
      acc[c.segment] = (acc[c.segment] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    if (clean.includes('segment') || clean.includes('customer') || clean.includes('churn')) {
      return `📊 **Analytics AI (Customer Segmentation Report)**:
Our database tracks **${customers.length} registered profiles**:
- 🎖 **Loyal Customers**: ${segments['Loyal'] || 0}
- ✅ **Active Buyers**: ${segments['Active'] || 0}
- 💤 **Inactive Profiles**: ${segments['Inactive'] || 0}
- 🚨 **Churn Risk Profiles**: ${segments['Churn Risk'] || 0}

*Reasoning*: Churn risk is triggered when purchases have stalled for more than 90 days (e.g. *Bob Vance*).
*Next Action*: Launch a loyalty re-engagement email sequence to the Churn Risk segment.`
    }

    if (clean.includes('clv') || clean.includes('value') || clean.includes('worth')) {
      return `📊 **Analytics AI (CLV Matrix)**:
- Average Customer Lifetime Value (CLV): **${formatINR(avgCLV)}**
- Highest Value Customer: **Alex Johnson** (${formatINR(customers[0].clv)} CLV)
- Lowest Value Customer: **Alice Wonder** (${formatINR(customers[3].clv)} CLV)

*Reasoning*: Alex Johnson has high repeat purchase frequency, while Alice Wonder has seasonal orders.
*Next Action*: Implement a tiered membership program to bump Active segment members to Loyal status.`
    }

    // Default KPIs
    return `📊 **Analytics AI Business KPIs**:
Key operational telemetry indices:
- Average Customer CLV: **${formatINR(avgCLV)}**
- Active Marketing Campaigns: **1**
- Customer Feedback Average: **3.8 / 5.0**
Try asking: *"Show customer segment breakdown"* or *"What is our average CLV?"*`
  }

  // 7. HR TOPIC
  if (activeTopic === 'hr') {
    // Best selling employee
    if (clean.includes('best') || clean.includes('top') || clean.includes('selling') || clean.includes('performance') || clean.includes('most productive') || clean.includes('best-selling employee')) {
      const topEmp = [...employees].sort((a, b) => b.productivityScore - a.productivityScore)[0]
      return `👥 **HR/Employee AI (Performance Review)**:
Our top-performing employee is **${topEmp.name}** (Role: *${topEmp.role}*).
- Productivity Rating: **${topEmp.productivityScore}%**
- Assigned shifts: ${topEmp.shifts.join(', ')}
- Current Tasks: ${topEmp.tasksAssigned.join('; ')}

*Reasoning*: Elena has resolved multiple database logs and verified cloud triggers ahead of deadlines.
*Next Action*: Elena is scheduled for a quarterly performance raise. Recommended increase: +5%.`
    }

    // Attendance
    if (clean.includes('attendance') || clean.includes('absent') || clean.includes('late') || clean.includes('check-in')) {
      const statuses = employees.map(e => `- **${e.name}** (${e.role}): **${e.attendance}**`).join('\n')
      const lateCount = employees.filter(e => e.attendance === 'Late').length
      const absentCount = employees.filter(e => e.attendance === 'Absent').length

      return `👥 **HR/Employee AI Attendance Ledger**:
Current attendance codes check for today:
${statuses}

- Summary: **${employees.length - lateCount - absentCount} Present**, **${lateCount} Late**, **${absentCount} Absent**.
*Reasoning*: Devon Miller is late due to public transport delays in Sector 7.
*Next Action*: Send an automated shift warning code via SMS to Devon to register his revised check-in time.`
    }

    // Salary payroll
    if (clean.includes('salary') || clean.includes('salaries') || clean.includes('payroll') || clean.includes('cost')) {
      const totalPayroll = employees.reduce((sum, e) => sum + e.salary, 0)
      return `👥 **HR/Employee AI Payroll Sheets**:
- Marcus Vance (Manager): **${formatINR(5200)}/mo**
- Clara Oswald (Cashier): **${formatINR(3200)}/mo**
- Devon Miller (Sales Associate): **${formatINR(3000)}/mo**
- Elena Rostova (Admin): **${formatINR(6000)}/mo**
- **Total Monthly Payroll**: **${formatINR(totalPayroll)}**

*Next Action*: The payroll schedule is set to auto-wire on the 28th. Let me know if you need to modify shift wage weights.`
    }

    // Shift check
    if (clean.includes('shift') || clean.includes('schedule') || clean.includes('work')) {
      const shifts = employees.map(e => `- **${e.name}**: ${e.shifts.join(', ')}`).join('\n')
      return `👥 **HR/Employee AI Shifting Rota**:
Staff scheduled shift allocations:
${shifts}

*Next Action*: If you need to reassign Clara or Marcus, use the **Employees** tab to modify shifting schedules.`
    }

    return `👥 **HR/Employee AI**:
I coordinate payroll spreadsheets, log attendance status, audit productivity ratios, and assign store tasks.
Try: *"Who is the best-selling employee?"* or *"Show employee attendance status today"*`
  }

  // 8. DEFAULT STORE MANAGER OR FALLBACK
  const revenue = sales.reduce((sum, s) => sum + s.total, 0)
  const lowStock = products.filter(p => p.stock <= p.minStock)
  const totalVal = products.reduce((sum, p) => sum + (p.stock * p.price), 0)
  const pendingRequests = requests.filter(r => r.status === 'Pending')

  return `🏪 **Store Manager AI Overall Health Check**:
All systems operational (India styles configured). Here is your store summary:
- **Gross Revenue (All-Time)**: ${formatINR(revenue)}
- **Low Stock Alerts**: **${lowStock.length} items** require attention
- **Total Catalog Valuation**: ${formatINR(totalVal)}
- **Pending Customer Requisitions**: **${pendingRequests.length}** tickets
- **Active Employees On-Shift**: Marcus, Clara, Elena

*Reasoning*: High customer feedback rating (3.8/5.0) and stable payroll overhead are supporting steady cash flows.
*Next Action*: Switch to the **AI Finance** tab to run a simulation on raising green tea markups, or switch to **AI Inventory** to restock low-shelf SKUs.`
}

// Requirement 5: Generate collaborative response combining multiple agents
function generateCollaborativeResponse(dbState: AppDBState): string {
  const dates = getDates()
  
  // 1. Finance Agent calculations
  const todaySales = dbState.sales.filter(s => s.timestamp.startsWith(dates.today))
  const revenue = todaySales.reduce((sum, s) => sum + s.total, 0)
  const cogs = todaySales.reduce((sum, s) => {
    const prod = dbState.products.find(p => p.name.toLowerCase() === s.productName.toLowerCase())
    const unitCost = prod ? prod.cost : s.total * 0.4
    return sum + (unitCost * s.quantity)
  }, 0)
  const profit = revenue - cogs
  const profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : '54.5'

  // 2. Sales Agent details
  const topProd = [...dbState.products].sort((a, b) => b.salesCount - a.salesCount)[0]

  // 3. Inventory Agent details
  const lowStock = dbState.products.filter(p => p.stock <= p.minStock)

  // 4. Marketing Agent recommendations
  const slowProd = [...dbState.products].sort((a, b) => a.salesCount - b.salesCount)[0]

  return `🤝 **AI Business Manager (Cross-Agent Collaboration Summary)**
I have synchronized the operational analytics from our specialized AI employee fleet in India. Here is our collaborative strategy to increase revenue and margins:

💰 **[Financial AI - Treasury Analysis]**
- Today's net profit margin stands at **${profitMargin}%** (Revenue: ${formatINR(revenue)}, COGS: ${formatINR(cogs)}).
- *Insight*: Core daily overhead of salaries (${formatINR(580)}/day) means we need at least ${formatINR(1200)} in gross daily sales to break even.
- *Finance Suggestion*: Review markup on low-cost/high-volume products.

📈 **[Sales AI - Velocity Audit]**
- High performer **${topProd.name}** generates strong cash flow, but slow-moving **${slowProd.name}** has capital locked in warehouse shelves.
- *Insight*: Sourdough Bread sales have high speed but short expiry lead times (loss risk).
- *Sales Suggestion*: Offer a high-velocity package pairing slow-moving apparel with top-selling electronics.

📦 **[Inventory AI - Shelf Telemetry]**
- We have **${lowStock.length} items** running below safety limits.
- *Insight*: Depleted shelf stock leads to lost sales revenue.
- *Inventory Suggestion*: Restock Wireless Earbuds X1 and Organic Green Tea (100g) immediately to maintain checkout options. Total restocking cost is estimated at **${formatINR(620.00)}**.

📣 **[Marketing AI - Campaign Strategy]**
- Automated Instagram postings and WhatsApp marketing conversion rates are averaging 6.8%.
- *Insight*: Social campaigns drive immediate clicks for promotions.
- *Marketing Suggestion*: Launch a WhatsApp campaign with a 15% discount code (\`RELEASE15\`) for overstocked items to release **${formatINR(480.00)}** in tied-up storage capital.

---
**Recommended Next Actions**:
1. Go to **AI Inventory** tab and initiate restocking orders for the low-stock items.
2. Go to **AI Marketing** tab, enable WhatsApp promos, and copy the \`RELEASE15\` discount template to clear overstock.`
}
