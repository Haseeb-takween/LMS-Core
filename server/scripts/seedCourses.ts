import mongoose from "mongoose";
import Course from "../src/models/Course.model";
import Session from "../src/models/Session.model";
import Quiz from "../src/models/Quiz.model";

const MONGO_URI = process.env.MONGO_URI ?? "";

const courseData = [
  {
    course: {
      title: "Digital Marketing Fundamentals",
      description:
        "A beginner-friendly introduction to core digital marketing concepts, covering SEO basics, social media strategy, and email marketing.",
      schedule: "Tuesdays, 7:00 PM (UK)",
      isActive: true,
    },
    sessions: [
      {
        lessonNumber: 1,
        title: "Introduction to SEO",
        description:
          "Covers what SEO is, why it matters, and the difference between on-page and off-page optimisation.",
        order: 1,
        questions: [
          {
            type: "mc" as const,
            text: "What does SEO stand for?",
            options: [
              "Search Engine Optimization",
              "Site Engagement Outcome",
              "Social Engagement Online",
              "Search Engagement Object",
            ],
            correctAnswer: "Search Engine Optimization",
            order: 1,
          },
          {
            type: "short" as const,
            text: "In one sentence, explain the difference between on-page and off-page SEO.",
            order: 2,
          },
        ],
      },
      {
        lessonNumber: 2,
        title: "Social Media Strategy Basics",
        description:
          "Introduces how to choose the right platforms for a business and the basics of content planning.",
        order: 2,
        questions: [
          {
            type: "mc" as const,
            text: "Which of the following is NOT typically considered a key social media metric?",
            options: [
              "Engagement rate",
              "Follower count",
              "Tyre pressure",
              "Click-through rate",
            ],
            correctAnswer: "Tyre pressure",
            order: 1,
          },
          {
            type: "short" as const,
            text: "Name one factor a business should consider when choosing which social platform to focus on.",
            order: 2,
          },
        ],
      },
      {
        lessonNumber: 3,
        title: "Email Marketing Essentials",
        description:
          "Covers building an email list, writing subject lines, and basic campaign structure.",
        order: 3,
        questions: [
          {
            type: "mc" as const,
            text: "What is generally considered most important for getting an email opened?",
            options: [
              "The subject line",
              "The footer",
              "The unsubscribe link",
              "The sender's time zone",
            ],
            correctAnswer: "The subject line",
            order: 1,
          },
          {
            type: "short" as const,
            text: "What is one reason businesses build an email list rather than relying only on social media?",
            order: 2,
          },
        ],
      },
    ],
  },
  {
    course: {
      title: "Introduction to Python Programming",
      description:
        "A beginner course covering Python basics — variables, control flow, and simple functions.",
      schedule: "Thursdays, 6:30 PM (UK)",
      isActive: true,
    },
    sessions: [
      {
        lessonNumber: 1,
        title: "Variables and Data Types",
        description:
          "Covers how to declare variables and the basic data types in Python (strings, integers, floats, booleans).",
        order: 1,
        questions: [
          {
            type: "mc" as const,
            text: "Which of these is a valid Python variable name?",
            options: ["2cool", "my_variable", "my-variable", "class"],
            correctAnswer: "my_variable",
            order: 1,
          },
          {
            type: "short" as const,
            text: "Briefly explain the difference between an integer and a float.",
            order: 2,
          },
        ],
      },
      {
        lessonNumber: 2,
        title: "Control Flow (If Statements & Loops)",
        description: "Covers if/else statements, for loops, and while loops.",
        order: 2,
        questions: [
          {
            type: "mc" as const,
            text: "Which keyword is used to repeat a block of code a fixed number of times in Python?",
            options: ["while", "for", "repeat", "loop"],
            correctAnswer: "for",
            order: 1,
          },
          {
            type: "short" as const,
            text: "In your own words, when would you use a while loop instead of a for loop?",
            order: 2,
          },
        ],
      },
      {
        lessonNumber: 3,
        title: "Writing Simple Functions",
        description:
          "Covers defining functions, parameters, and return values.",
        order: 3,
        questions: [
          {
            type: "mc" as const,
            text: "What keyword is used to define a function in Python?",
            options: ["func", "define", "def", "function"],
            correctAnswer: "def",
            order: 1,
          },
          {
            type: "short" as const,
            text: "What is the purpose of a 'return' statement in a function?",
            order: 2,
          },
        ],
      },
    ],
  },
];

async function seed(): Promise<void> {
  if (!MONGO_URI) throw new Error("MONGO_URI is not set");

  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  for (const entry of courseData) {
    // Idempotent: delete existing course + its sessions + quizzes by title
    const existing = await Course.findOne({ title: entry.course.title });
    if (existing) {
      const existingSessions = await Session.find({ courseId: existing._id });
      const sessionIds = existingSessions.map((s) => s._id);
      await Quiz.deleteMany({ sessionId: { $in: sessionIds } });
      await Session.deleteMany({ courseId: existing._id });
      await Course.deleteOne({ _id: existing._id });
      console.log(`Removed existing: ${entry.course.title}`);
    }

    const course = await Course.create(entry.course);
    console.log(`Created course: ${course.title}`);

    for (const sessionEntry of entry.sessions) {
      const { questions, ...sessionFields } = sessionEntry;

      const session = await Session.create({
        ...sessionFields,
        courseId: course._id,
      });
      console.log(`  Created session: ${session.title}`);

      await Quiz.create({
        sessionId: session._id,
        questions,
      });
      console.log(`  Created quiz with ${questions.length} questions`);
    }
  }

  await mongoose.disconnect();
  console.log("Seed complete");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
