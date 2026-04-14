// ============================================
// SocialHub - Dashboard Data
// ============================================

export const appConfig = {
  name: "SocialHub",
  tagline: "Your Social Media Command Center",
  version: "1.0.0",
}

export const platforms = [
  { id: "facebook", name: "Facebook", color: "#1877F2", icon: "facebook" },
  { id: "instagram", name: "Instagram", color: "#E4405F", icon: "instagram" },
  { id: "tiktok", name: "TikTok", color: "#000000", icon: "tiktok" },
]

export const navItems = [
  { path: "/", label: "Dashboard", icon: "ChartBar" },
  { path: "/compose", label: "Compose", icon: "PencilSimple" },
  { path: "/analytics", label: "Analytics", icon: "ChartLine" },
  { path: "/trends", label: "Trend Analyzer", icon: "TrendUp" },
  { path: "/settings", label: "Settings", icon: "Gear" },
]

// Mock stats for dashboard overview
export const overviewStats = [
  { label: "Total Followers", value: "284.5K", change: "+12.3%", trend: "up" },
  { label: "Total Engagement", value: "48.2K", change: "+8.7%", trend: "up" },
  { label: "Posts This Month", value: "67", change: "+23%", trend: "up" },
  { label: "Avg. Reach", value: "15.8K", change: "-2.1%", trend: "down" },
]

// Mock platform-specific stats
export const platformStats = {
  facebook: {
    followers: "98.2K",
    engagement: "4.2%",
    postsThisWeek: 8,
    topPostReach: "24.5K",
  },
  instagram: {
    followers: "142.1K",
    engagement: "6.8%",
    postsThisWeek: 12,
    topPostReach: "38.2K",
  },
  tiktok: {
    followers: "44.2K",
    engagement: "9.1%",
    postsThisWeek: 5,
    topPostReach: "112K",
  },
}

// Mock engagement data for charts (last 7 days)
export const engagementData = [
  { date: "Mon", facebook: 1200, instagram: 2400, tiktok: 3200 },
  { date: "Tue", facebook: 1800, instagram: 2800, tiktok: 2900 },
  { date: "Wed", facebook: 1400, instagram: 3200, tiktok: 4100 },
  { date: "Thu", facebook: 2200, instagram: 2600, tiktok: 3800 },
  { date: "Fri", facebook: 2800, instagram: 3800, tiktok: 5200 },
  { date: "Sat", facebook: 3200, instagram: 4200, tiktok: 6100 },
  { date: "Sun", facebook: 2600, instagram: 3600, tiktok: 4800 },
]

// Mock monthly data for analytics
export const monthlyData = [
  { month: "Jan", followers: 210000, engagement: 38000, reach: 420000 },
  { month: "Feb", followers: 218000, engagement: 41000, reach: 445000 },
  { month: "Mar", followers: 231000, engagement: 39000, reach: 460000 },
  { month: "Apr", followers: 245000, engagement: 44000, reach: 490000 },
  { month: "May", followers: 258000, engagement: 46000, reach: 510000 },
  { month: "Jun", followers: 270000, engagement: 48000, reach: 530000 },
  { month: "Jul", followers: 284500, engagement: 48200, reach: 545000 },
]

// Mock recent posts
export const recentPosts = [
  {
    id: 1,
    content: "Exciting new product launch coming next week! Stay tuned for something amazing...",
    platforms: ["facebook", "instagram"],
    status: "published",
    publishedAt: "2026-04-12T10:30:00Z",
    engagement: { likes: 342, comments: 28, shares: 15 },
    image: null,
  },
  {
    id: 2,
    content: "Behind the scenes of our creative process. What do you think of the new design?",
    platforms: ["instagram", "tiktok"],
    status: "published",
    publishedAt: "2026-04-11T14:00:00Z",
    engagement: { likes: 892, comments: 67, shares: 43 },
    image: null,
  },
  {
    id: 3,
    content: "5 tips to boost your morning productivity. Thread incoming!",
    platforms: ["facebook", "instagram", "tiktok"],
    status: "published",
    publishedAt: "2026-04-10T09:00:00Z",
    engagement: { likes: 1204, comments: 89, shares: 156 },
    image: null,
  },
  {
    id: 4,
    content: "Weekend giveaway alert! Follow + share to enter. Winner announced Monday.",
    platforms: ["facebook", "instagram"],
    status: "scheduled",
    publishedAt: "2026-04-13T12:00:00Z",
    engagement: null,
    image: null,
  },
  {
    id: 5,
    content: "Customer spotlight: How @janedoe grew her business 300% using our platform",
    platforms: ["facebook", "instagram", "tiktok"],
    status: "draft",
    publishedAt: null,
    engagement: null,
    image: null,
  },
]

// Mock trending topics
export const trendingTopics = [
  { topic: "Short-form video marketing", volume: "2.4M", growth: "+45%" },
  { topic: "AI-generated content", volume: "1.8M", growth: "+120%" },
  { topic: "UGC campaigns", volume: "980K", growth: "+32%" },
  { topic: "Behind-the-scenes content", volume: "1.2M", growth: "+28%" },
  { topic: "Interactive polls & quizzes", volume: "650K", growth: "+15%" },
]

// Mock trend analysis results
export const mockTrendAnalysis = {
  query: "fitness industry",
  analyzedVideos: 25,
  topVideos: [
    {
      id: 1,
      title: "5-Minute Morning Stretch Routine",
      platform: "tiktok",
      views: "2.4M",
      likes: "342K",
      comments: 4521,
      thumbnail: null,
      steps: [
        "Open with a relatable hook: 'You only need 5 minutes to feel amazing'",
        "Use trending audio (currently: upbeat lo-fi)",
        "Show each stretch with text overlay labels",
        "Keep transitions snappy - 1-2 seconds per cut",
        "End with before/after energy comparison",
        "CTA: 'Save this for tomorrow morning'",
      ],
      topComments: [
        { text: "Doing this every morning now, life changer!", likes: 2341 },
        { text: "Day 30 of this routine, my back pain is GONE", likes: 1892 },
        { text: "The stretch at 0:23 is everything", likes: 987 },
        { text: "Can you do one for desk workers?", likes: 756 },
      ],
      visionAnalysis: {
        dominantColors: ["#1a1a2e", "#e94560", "#0f3460"],
        detectedObjects: ["person", "yoga mat", "water bottle", "timer overlay"],
        textOverlays: ["5 MIN", "STRETCH", "MORNING ROUTINE"],
        sceneTransitions: 12,
        avgShotDuration: "2.1s",
      },
    },
    {
      id: 2,
      title: "What I Eat in a Day - High Protein",
      platform: "instagram",
      views: "1.8M",
      likes: "256K",
      comments: 3210,
      thumbnail: null,
      steps: [
        "Start with meal prep overhead shot",
        "Use 'What I Eat in a Day' format (proven high engagement)",
        "Show macro breakdown for each meal with text overlay",
        "Include grocery haul clip at the start",
        "Use natural lighting - no heavy filters",
        "End with full day summary graphic",
      ],
      topComments: [
        { text: "Finally realistic meals! Not everyone eats chicken and rice", likes: 3102 },
        { text: "The snack ideas are so creative", likes: 1654 },
        { text: "Recipe for the protein smoothie please!", likes: 1201 },
        { text: "This is exactly what I needed for my cut", likes: 890 },
      ],
      visionAnalysis: {
        dominantColors: ["#fefefe", "#2d6a4f", "#d4a373"],
        detectedObjects: ["food", "plate", "kitchen", "blender", "meal prep containers"],
        textOverlays: ["BREAKFAST", "540 cal", "42g protein"],
        sceneTransitions: 18,
        avgShotDuration: "1.8s",
      },
    },
    {
      id: 3,
      title: "Gym Transformation - 90 Days",
      platform: "tiktok",
      views: "4.1M",
      likes: "612K",
      comments: 8932,
      thumbnail: null,
      steps: [
        "Open with 'day 1' clip - raw, unfiltered",
        "Use split-screen comparison format",
        "Show key milestones (day 30, 60, 90)",
        "Include workout clips with exercise names",
        "Use emotional/motivational audio track",
        "End with side-by-side transformation reveal",
      ],
      topComments: [
        { text: "This is the motivation I needed today", likes: 8721 },
        { text: "What was your workout split?", likes: 4532 },
        { text: "The consistency is insane, respect", likes: 3201 },
        { text: "Starting my own journey today, wish me luck", likes: 2890 },
      ],
      visionAnalysis: {
        dominantColors: ["#000000", "#ff6b6b", "#4ecdc4"],
        detectedObjects: ["person", "gym equipment", "mirror", "weights", "timer"],
        textOverlays: ["DAY 1", "DAY 90", "TRANSFORMATION"],
        sceneTransitions: 24,
        avgShotDuration: "1.5s",
      },
    },
  ],
  insights: {
    bestPostingTime: "6-8 AM and 7-9 PM",
    avgVideoLength: "30-60 seconds",
    topFormats: ["Before/After", "Day in the Life", "Tutorial/How-to"],
    trendingAudio: ["Lo-fi beats", "Motivational speeches", "Trending pop remixes"],
    engagementDrivers: ["Text overlays", "Fast cuts", "Relatable hooks", "Save-worthy content"],
  },
}

// Settings defaults
export const settingsDefaults = {
  businessName: "",
  industry: "",
  connectedAccounts: {
    facebook: { connected: false, username: "" },
    instagram: { connected: false, username: "" },
    tiktok: { connected: false, username: "" },
  },
  postingPreferences: {
    defaultPlatforms: ["facebook", "instagram", "tiktok"],
    autoHashtags: true,
    watermark: false,
  },
  notifications: {
    postPublished: true,
    engagementSpike: true,
    trendAlert: true,
    weeklyReport: true,
  },
  googleCloudVision: {
    apiKey: "",
    enabled: false,
  },
}
