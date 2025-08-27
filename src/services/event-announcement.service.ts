import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatGroq } from "@langchain/groq";
import { EventAudience, EventCategories, EventType } from "@prisma/client";

// Interface for only the required fields needed for announcement generation
export interface EventAnnouncementInput {
  title: string;
  tagline?: string;
  description?: string;
  categories?: EventCategories[];
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  eventType?: EventType;
  venueName?: string;
  venueAddress?: string;
  platform?: string;
  audience?: EventAudience;
  registrationRequired?: boolean;
  registrationDeadline?: string;
  maxParticipants?: number;
  paidEvent?: boolean;
  ticketPrice?: number;
}

export class EventAnnouncementService {
  private model: ChatGroq;

  constructor(apiKey?: string) {
    // Initialize the Together AI model with your API key
    this.model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY || apiKey,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    });
  }

  /**
   * Generates an AI-powered promotional announcement for an event
   * @param eventInput The event details needed for announcement generation
   * @returns A string containing the promotional announcement
   */
  async generateAnnouncement(
    eventInput: EventAnnouncementInput
  ): Promise<string> {
    // Create a detailed context from the event information
    const eventContext = this.buildEventContext(eventInput);

    // Define the prompt template with specific instructions for high-quality announcements
    const promptTemplate = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are an enthusiastic and professional event announcer for SocioHub, the official event management platform for COMSATS University Islamabad, Attock Campus. 
      
Your task is to create compelling promotional announcements for university events that will engage students and increase participation.

Guidelines for writing announcements:
- Be concise but informative (150–200 words)
- Use an enthusiastic, energetic tone appropriate for university students
- Highlight the most appealing aspects of the event
- Include practical details like **date, time (converted to Pakistan Standard Time), and location**
- Present date and time in a **clear, natural, and human-readable format**, such as:
  - "Monday, May 27 at 10:00 AM"  
  - or "Thursday, June 6 • 3:00 PM to 5:00 PM"
- Use persuasive language that encourages registration/attendance
- For workshops/seminars, emphasize learning opportunities and benefits
- For social events, emphasize fun, networking, and community building
- For competitions, emphasize challenges, prizes, and recognition
- Match your tone to the event category (professional for academic events, more casual for social gatherings)
- End with a strong call-to-action

IMPORTANT: Focus on the specific details provided about the event. Don't invent details that aren't included in the event information.
`,
      ],
      [
        "user",
        `Create a promotional announcement for the following event at COMSATS University:

EVENT DETAILS:
{eventContext}

Generate an engaging, accurate announcement that highlights the key aspects of this event and motivates students to participate.`,
      ],
    ]);

    // Create the chain and execute it
    const chain = promptTemplate
      .pipe(this.model)
      .pipe(new StringOutputParser());

    try {
      const result = await chain.invoke({
        eventContext,
      });

      return result;
    } catch (error) {
      console.error("Error generating event announcement:", error);
      return "Join us for this exciting event! Check the details and register soon!";
    }
  }

  /**
   * Builds a detailed context string from the event input
   */
  private buildEventContext(eventInput: EventAnnouncementInput): string {
    let context = "";

    // Basic event information
    context += `Title: ${eventInput.title}\n`;

    if (eventInput.tagline) {
      context += `Tagline: ${eventInput.tagline}\n`;
    }

    if (eventInput.description) {
      context += `Description: ${eventInput.description}\n`;
    }

    // Categories
    if (eventInput.categories && eventInput.categories.length > 0) {
      context += `Category: ${eventInput.categories.join(", ")}\n`;
    }

    // Date and time
    if (eventInput.startDate) {
      context += `Date: ${eventInput.startDate}`;
      if (eventInput.endDate && eventInput.endDate !== eventInput.startDate) {
        context += ` to ${eventInput.endDate}`;
      }
      context += "\n";
    }

    if (eventInput.startTime) {
      context += `Time: ${eventInput.startTime}`;
      if (eventInput.endTime) {
        context += ` to ${eventInput.endTime}`;
      }
      context += "\n";
    }

    // Location information
    context += `Event Type: ${eventInput.eventType || "Not specified"}\n`;

    if (eventInput.eventType === EventType.Physical && eventInput.venueName) {
      context += `Venue: ${eventInput.venueName}`;
      if (eventInput.venueAddress) {
        context += ` (${eventInput.venueAddress})`;
      }
      context += "\n";
    } else if (eventInput.eventType === EventType.Online) {
      context += `Platform: ${eventInput.platform || "Online"}\n`;
    }

    // Registration information
    if (eventInput.registrationRequired) {
      context += `Registration Required: Yes\n`;

      if (eventInput.registrationDeadline) {
        context += `Registration Deadline: ${eventInput.registrationDeadline}\n`;
      }

      if (eventInput.maxParticipants) {
        context += `Maximum Participants: ${eventInput.maxParticipants}\n`;
      }
    }

    // Payment information
    if (eventInput.paidEvent) {
      context += `Ticket Price: ${eventInput.ticketPrice}\n`;
    } else {
      context += `Entry: Free\n`;
    }

    // Audience information
    if (eventInput.audience) {
      context += `Audience: ${eventInput.audience}\n`;
    }

    return context;
  }
}
