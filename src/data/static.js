// Static data that doesn't come from the database

export const marketData = [
  { symbol: "IHSG",    value: "7,254.18",  change: "+1.24%", up: true  },
  { symbol: "USD/IDR", value: "16,245",    change: "-0.31%", up: false },
  { symbol: "GOLD",    value: "$3,182",    change: "+0.87%", up: true  },
  { symbol: "BRENT",   value: "$72.45",    change: "-1.12%", up: false },
  { symbol: "BBCA",    value: "9,850",     change: "+0.51%", up: true  },
  { symbol: "TLKM",    value: "3,120",     change: "-0.64%", up: false },
  { symbol: "ASII",    value: "4,780",     change: "+1.08%", up: true  },
  { symbol: "BTC/USD", value: "$104,230",  change: "+2.34%", up: true  },
  { symbol: "BMRI",    value: "6,250",     change: "+0.80%", up: true  },
  { symbol: "ANTM",    value: "1,680",     change: "+2.44%", up: true  },
  { symbol: "ETH/USD", value: "$4,820",    change: "+1.87%", up: true  },
  { symbol: "NICKEL",  value: "$16,840",   change: "-0.92%", up: false },
];

export const categories = [
  { name: "Compound Interest Calculator", slug: "kalkulator", icon: "📈", color: "amber" },
  { name: "Economics",     slug: "economics",     icon: "🏦", color: "blue"   },
  { name: "Investment",    slug: "investment",    icon: "💰", color: "green"  },
  { name: "Nasional",      slug: "nasional",      icon: "🇮🇩", color: "red"   },
  { name: "Global",        slug: "global",        icon: "🌍", color: "purple" },
  { name: "Technology",    slug: "technology",    icon: "💻", color: "teal"   },
];

export const liveMarket = [
  { label: "IHSG",    val: "7,254.18",  chg: "+1.24%", up: true  },
  { label: "USD/IDR", val: "16,245",    chg: "-0.31%", up: false },
  { label: "Gold",    val: "$3,182",    chg: "+0.87%", up: true  },
  { label: "BTC",     val: "$104,230",  chg: "+2.34%", up: true  },
];
