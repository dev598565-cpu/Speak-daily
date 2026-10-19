import { Topic } from '../types';

export const DEFAULT_TOPICS: Topic[] = [
  {
    id: 'topic-1',
    title: 'A Book or Movie That Changed Your Perspective',
    category: 'Culture & Media',
    difficulty: 'Intermediate',
    prompt: 'Describe a book, film, or documentary that made you reconsider how you view the world. What was the central message, and how did it affect your personal decisions or mindset?',
    talking_points: [
      'Briefly summarize the premise and context',
      'Explain the key turning point or message',
      'How did it influence your real-world behavior or outlook?'
    ],
    vocabulary: [
      { word: 'Profound', meaning: 'Very great or intense; having deep insight' },
      { word: 'Resonate', meaning: 'To evoke a feeling of shared emotion or belief' },
      { word: 'Paradigm shift', meaning: 'A fundamental change in approach or underlying assumptions' }
    ],
    is_daily: true,
  },
  {
    id: 'topic-2',
    title: 'The Impact of AI on Future Careers',
    category: 'Technology',
    difficulty: 'Advanced',
    prompt: 'Artificial Intelligence is transforming every industry. In your opinion, which jobs will become more valuable in the next decade, and which skills must young professionals master to stay competitive?',
    talking_points: [
      'Identify 1-2 skills AI cannot easily replace',
      'Discuss the balance between automation and human empathy',
      'Give actionable advice to someone starting their career today'
    ],
    vocabulary: [
      { word: 'Obsolescence', meaning: 'The process of becoming outdated or no longer used' },
      { word: 'Adaptability', meaning: 'The capacity to adjust readily to new conditions' },
      { word: 'Augment', meaning: 'To make something greater by adding to it' }
    ],
    is_daily: false,
  },
  {
    id: 'topic-3',
    title: 'My Ideal Morning Routine for Peak Productivity',
    category: 'Daily Life',
    difficulty: 'Beginner',
    prompt: 'Walk through how you spend the first two hours of your day. What habits make you feel energetic and prepared for the challenges ahead?',
    talking_points: [
      'What time do you usually wake up?',
      'Do you prioritize exercise, reading, or planning?',
      'What is one habit you want to quit or build?'
    ],
    vocabulary: [
      { word: 'Consistent', meaning: 'Acting or done in the same way over time' },
      { word: 'Invigorating', meaning: 'Making one feel strong, healthy, and full of energy' },
      { word: 'Mindfulness', meaning: 'A mental state achieved by focusing awareness on the present' }
    ],
    is_daily: false,
  },
  {
    id: 'topic-4',
    title: 'Handling High-Pressure Situations and Deadlines',
    category: 'Career & Workplace',
    difficulty: 'Intermediate',
    prompt: 'Share a story about a challenging deadline or stressful problem you encountered at work or university. How did you organize your priorities and communicate with your team?',
    talking_points: [
      'Set the scene and explain the stakes',
      'Describe your tactical steps to resolve it',
      'Reflect on what the experience taught you'
    ],
    vocabulary: [
      { word: 'Prioritize', meaning: 'Designate or treat something as more important' },
      { word: 'Composure', meaning: 'The state of being calm and in control of oneself' },
      { word: 'Contingency', meaning: 'A provision for an unforeseen event or circumstance' }
    ],
    is_daily: false,
  },
  {
    id: 'topic-5',
    title: 'A Memorable Journey That Took an Unexpected Turn',
    category: 'Travel & Adventure',
    difficulty: 'Intermediate',
    prompt: 'Tell the story of a trip where things did not go according to plan. How did you adapt to the surprises, and what did you learn about yourself?',
    talking_points: [
      'Where were you traveling and with whom?',
      'What unexpected obstacle occurred?',
      'Why does this memory stand out today?'
    ],
    vocabulary: [
      { word: 'Serendipity', meaning: 'Finding valuable or agreeable things not sought for by chance' },
      { word: 'Unforeseen', meaning: 'Not anticipated or predicted' },
      { word: 'Resilient', meaning: 'Able to withstand or recover quickly from difficult conditions' }
    ],
    is_daily: false,
  },
  {
    id: 'topic-6',
    title: 'Remote Work vs. Office Collaboration',
    category: 'Society & Work',
    difficulty: 'Advanced',
    prompt: 'Many companies are mandating return-to-office, while employees value flexibility. Where do you stand on remote work versus in-person office culture?',
    talking_points: [
      'Examine the productivity benefits of quiet remote work',
      'Contrast with spontaneous innovation in office spaces',
      'Propose your ideal hybrid balance'
    ],
    vocabulary: [
      { word: 'Autonomy', meaning: 'The freedom or right to act independently' },
      { word: 'Camaraderie', meaning: 'Mutual trust and friendship among colleagues' },
      { word: 'Synchronous', meaning: 'Existing or occurring at the same time' }
    ],
    is_daily: false,
  }
];
