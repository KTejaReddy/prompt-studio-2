/**
 * Category taxonomy. `color` values come from the design palette.
 * Subcategories drive the dynamic Explore filter.
 */
export interface SeedCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  subcategories: string[];
}

export const SEED_CATEGORIES: SeedCategory[] = [
  { id: "coding", name: "Coding", icon: "⌘", color: "#31C7B5", subcategories: ["Code Review", "Debugging", "Refactoring", "Documentation", "Testing", "Databases"] },
  { id: "writing", name: "Writing", icon: "✎", color: "#FF6B5F", subcategories: ["Blogging", "Editing", "Storytelling", "Copywriting", "Technical Writing"] },
  { id: "research", name: "Research", icon: "◈", color: "#A98BFF", subcategories: ["Literature Review", "Fact Checking", "Summarization", "Study Design"] },
  { id: "education", name: "Education", icon: "✦", color: "#F0B93E", subcategories: ["Exam Prep", "Explainers", "Quizzing", "Lesson Planning", "Flashcards"] },
  { id: "business", name: "Business", icon: "▣", color: "#FF8A3D", subcategories: ["Strategy", "Operations", "Decision Making", "Reporting"] },
  { id: "marketing", name: "Marketing", icon: "◉", color: "#F45197", subcategories: ["Campaigns", "SEO", "Ad Copy", "Social Media"] },
  { id: "productivity", name: "Productivity", icon: "✓", color: "#6FD8B5", subcategories: ["Summarization", "Email", "Task Management", "Meetings"] },
  { id: "design", name: "Design", icon: "◐", color: "#8F6DEB", subcategories: ["UX Research", "Critique", "Branding"] },
  { id: "data-analysis", name: "Data Analysis", icon: "▦", color: "#54B8E8", subcategories: ["Exploration", "Visualization", "Statistics", "Cleaning"] },
  { id: "career", name: "Career", icon: "▲", color: "#FFB48C", subcategories: ["Resumes", "Cover Letters", "Interviews", "LinkedIn"] },
  { id: "finance", name: "Finance", icon: "$", color: "#1FA396", subcategories: ["Personal Finance", "Investing", "Analysis"] },
  { id: "legal", name: "Legal", icon: "§", color: "#7A5BE0", subcategories: ["Contract Analysis", "Plain Language", "Compliance"] },
  { id: "content-creation", name: "Content Creation", icon: "▶", color: "#E8439A", subcategories: ["Video Scripts", "Newsletters", "Podcasts"] },
  { id: "presentations", name: "Presentations", icon: "▭", color: "#FFA126", subcategories: ["Slide Design", "Talks", "Executive Decks"] },
  { id: "customer-support", name: "Customer Support", icon: "☎", color: "#54B8E8", subcategories: ["Ticket Handling", "Response Writing"] },
  { id: "management", name: "Management", icon: "⚑", color: "#FF9757", subcategories: ["One-on-Ones", "Performance Reviews", "Hiring"] },
  { id: "entrepreneurship", name: "Entrepreneurship", icon: "◆", color: "#FF7E6B", subcategories: ["Idea Validation", "Pitching", "Growth"] },
  { id: "personal-development", name: "Personal Development", icon: "❀", color: "#F6C453", subcategories: ["Habits", "Reflection", "Learning"] },
  { id: "image-generation", name: "Image Generation", icon: "✧", color: "#E88B54", subcategories: ["Photography", "Illustration", "Logos"] },
  { id: "video", name: "Video", icon: "▷", color: "#D6407F", subcategories: ["Scripting", "Storyboards", "Hooks"] },
  { id: "social-media", name: "Social Media", icon: "◎", color: "#FF7E5F", subcategories: ["Threads", "Hooks", "Calendars"] },
  { id: "automation", name: "Automation", icon: "⚙", color: "#8F6DEB", subcategories: ["Workflow Design", "Integrations"] },
];
