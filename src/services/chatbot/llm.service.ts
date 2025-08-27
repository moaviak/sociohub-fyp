import { ChatGroq } from "@langchain/groq";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { chatbotConfig } from "./config";

export class LLMService {
  public llm: ChatGroq;
  public embeddings: HuggingFaceInferenceEmbeddings;
  public fastLLM: ChatGroq; // Faster model for classification

  constructor() {
    this.llm = new ChatGroq({
      model: chatbotConfig.llm.model,
      apiKey: process.env.GROQ_API_KEY!,
      maxTokens: chatbotConfig.llm.maxTokens,
      temperature: chatbotConfig.llm.temperature,
    });

    // Faster model for quick classification tasks
    this.fastLLM = new ChatGroq({
      model: chatbotConfig.llm.fastModel, // Smaller, faster model
      apiKey: process.env.GROQ_API_KEY!,
      maxTokens: 150,
      temperature: 0.1,
    });

    this.embeddings = new HuggingFaceInferenceEmbeddings({
      model: chatbotConfig.embedding.model,
      apiKey: process.env.HUGGINGFACE_API_TOKEN!,
    });
  }
}
