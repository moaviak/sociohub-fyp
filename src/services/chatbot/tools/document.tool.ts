import { Tool } from "@langchain/core/tools";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { chatbotConfig } from "../config";
import { UserContext } from "../types";
import { emitEventToUser } from "../../../socket";
import { io } from "../../../app";

export class DocumentRetrievalTool extends Tool {
  name = "document_retrieval";
  description =
    "Search through SocioHub documentation and guides to help users understand how to use the platform. Use this for questions about app features, how-to guides, and platform functionality.";

  private vectorStore!: PineconeStore;
  private isInitialized = false;
  private pinecone!: Pinecone;

  constructor(
    private embeddings: HuggingFaceTransformersEmbeddings,
    private userContext?: UserContext
  ) {
    super();
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      this.pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
      });

      const pineconeIndex = this.pinecone.index(
        chatbotConfig.pinecone.indexName
      );

      this.vectorStore = new PineconeStore(this.embeddings, {
        pineconeIndex,
        textKey: "text",
        namespace: "sociohub-docs",
      });

      this.isInitialized = true;
    } catch (error) {
      throw error;
    }
  }

  // Method to check if records exist in the namespace
  async hasExistingRecords(): Promise<boolean> {
    try {
      await this.initialize();

      const pineconeIndex = this.pinecone.index(
        chatbotConfig.pinecone.indexName
      );

      // Query with a dummy vector to check if any records exist
      const stats = await pineconeIndex.describeIndexStats();

      // Check if the namespace exists and has vectors
      const namespaceStats = stats.namespaces?.["sociohub-docs"];
      return namespaceStats ? namespaceStats.recordCount > 0 : false;
    } catch (error) {
      console.error("Error checking existing records:", error);
      return false;
    }
  }

  // Method to initialize documents (checks for existing records first)
  async initializeDocuments() {
    try {
      await this.initialize();

      const hasRecords = await this.hasExistingRecords();

      if (hasRecords) {
        console.log(
          "Records already exist in Pinecone namespace 'sociohub-docs'. Skipping indexing."
        );
        return {
          message: "Documents already indexed",
          action: "skipped",
          recordsExist: true,
        };
      }

      console.log(
        "No records found in Pinecone namespace 'sociohub-docs'. Indexing new documents..."
      );
      await this.indexDocuments();

      return {
        message: "Documents successfully indexed",
        action: "indexed",
        recordsExist: false,
      };
    } catch (error) {
      console.error("Error during document initialization:", error);
      throw error;
    }
  }

  // Method to delete all records from the namespace and re-index documents
  async deleteAndReindexDocuments(force: boolean = false) {
    try {
      await this.initialize();

      if (!force) {
        const hasRecords = await this.hasExistingRecords();
        if (!hasRecords) {
          console.log(
            "No records found to delete. Proceeding with indexing..."
          );
          await this.indexDocuments();
          return {
            message: "No records to delete, documents indexed",
            action: "indexed_only",
          };
        }
      }

      // Delete all vectors from the namespace
      await this.deleteAllRecords();

      // Wait a bit for deletion to propagate
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Index new documents
      await this.indexDocuments();

      return {
        message: "Records deleted and documents re-indexed",
        action: "deleted_and_reindexed",
      };
    } catch (error) {
      console.error("Error during delete and reindex:", error);
      throw error;
    }
  }

  // Method to delete all records from the namespace
  async deleteAllRecords() {
    try {
      await this.initialize();

      const hasRecords = await this.hasExistingRecords();
      if (!hasRecords) {
        console.log("No records found to delete in namespace 'sociohub-docs'");
        return { message: "No records to delete", action: "skipped" };
      }

      const pineconeIndex = this.pinecone.index(
        chatbotConfig.pinecone.indexName
      );

      // Delete all vectors in the namespace
      await pineconeIndex.namespace("sociohub-docs").deleteAll();
      console.log("All records deleted from namespace 'sociohub-docs'");

      return { message: "All records deleted", action: "deleted" };
    } catch (error) {
      console.error("Error deleting records:", error);
      throw error;
    }
  }

  // Method to recreate index with consistent embeddings
  async recreateIndex() {
    try {
      await this.initialize();

      // Delete existing index if it exists
      try {
        await this.pinecone.deleteIndex(chatbotConfig.pinecone.indexName);

        // Wait for deletion to complete
        await new Promise((resolve) => setTimeout(resolve, 60000));
      } catch (error) {
        console.log("Index may not exist or already deleted");
      }

      // Create new index with correct dimensions
      await this.pinecone.createIndex({
        name: chatbotConfig.pinecone.indexName,
        dimension: 384, // all-MiniLM-L6-v2 dimension
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-east-1",
          },
        },
      });

      // Wait for index to be ready
      await new Promise((resolve) => setTimeout(resolve, 60000));

      // Re-initialize vector store
      const pineconeIndex = this.pinecone.index(
        chatbotConfig.pinecone.indexName
      );
      this.vectorStore = new PineconeStore(this.embeddings, {
        pineconeIndex,
        textKey: "text",
        namespace: "sociohub-docs",
      });

      // Index documents with new embeddings
      await this.indexDocuments();

      return {
        message: "Index recreated and documents indexed",
        action: "recreated",
      };
    } catch (error) {
      console.error("Error recreating index:", error);
      throw error;
    }
  }

  async indexDocuments() {
    try {
      await this.initialize();

      // Load documents from docs directory
      const loader = new DirectoryLoader("docs", {
        ".md": (path) => new TextLoader(path),
        ".txt": (path) => new TextLoader(path),
      });

      const docs = await loader.load();

      if (docs.length === 0) {
        console.log("No documents found to index");
        return { message: "No documents found", action: "skipped" };
      }

      // Split documents into chunks with better settings
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: chatbotConfig.embedding.chunkSize,
        chunkOverlap: chatbotConfig.embedding.chunkOverlap,
        separators: ["\n\n", "\n", ".", "!", "?", ";", ",", " ", ""],
      });

      const splitDocs = await textSplitter.splitDocuments(docs);

      // Add metadata for better retrieval
      const docsWithMetadata = splitDocs.map((doc, index) => ({
        ...doc,
        metadata: {
          ...doc.metadata,
          chunk_id: index,
          source_type: "documentation",
          indexed_at: new Date().toISOString(),
        },
      }));

      // Add documents to vector store in batches
      const batchSize = 50;
      for (let i = 0; i < docsWithMetadata.length; i += batchSize) {
        const batch = docsWithMetadata.slice(i, i + batchSize);
        await this.vectorStore.addDocuments(batch);
      }

      console.log(
        `Successfully indexed ${docsWithMetadata.length} document chunks`
      );
      return {
        message: `Successfully indexed ${docsWithMetadata.length} document chunks`,
        action: "indexed",
        chunksCount: docsWithMetadata.length,
      };
    } catch (error) {
      console.error("Error indexing documents:", error);
      throw error;
    }
  }

  async _call(query: string): Promise<string> {
    try {
      await this.initialize();

      // Check if documents are indexed, if not, initialize them
      const hasRecords = await this.hasExistingRecords();
      if (!hasRecords) {
        console.log("No documents found in index. Initializing documents...");
        await this.initializeDocuments();
      }

      // Emit search start event
      if (this.userContext?.id) {
        emitEventToUser(io, this.userContext.id, "tool_status", {
          tool: "document_retrieval",
          status: "running",
          message: "Searching documentation...",
        });
      }

      // Enhance query for better retrieval
      const enhancedQuery = this.enhanceQuery(query);

      const results = await this.vectorStore.similaritySearchWithScore(
        enhancedQuery,
        5
      );

      // Emit search complete event
      if (this.userContext?.id) {
        emitEventToUser(io, this.userContext.id, "tool_status", {
          tool: "document_retrieval",
          status: "complete",
          message: `Found ${results.length} relevant documents`,
        });
      }

      if (results.length === 0) {
        return "No relevant documentation found for your query. Please try rephrasing your question or ask about specific SocioHub features like events, societies, tasks, or registrations.";
      }

      // Filter results by relevance score (similarity threshold)
      const relevantResults = results.filter(([doc, score]) => score > 0.3);

      if (relevantResults.length === 0) {
        return "I couldn't find closely related documentation for your query. Could you be more specific about what aspect of SocioHub you need help with?";
      }

      const context = relevantResults
        .map(([doc, score], index) => {
          return `**Document ${index + 1}** (Relevance: ${(score * 100).toFixed(
            1
          )}%)\n${doc.pageContent}`;
        })
        .join("\n\n---\n\n");

      return `Found relevant documentation:\n\n${context}`;
    } catch (error) {
      console.error("Error in document retrieval:", error);
      return "I encountered an error while searching the documentation. Please try again or contact support if the issue persists.";
    }
  }

  private enhanceQuery(query: string): string {
    // Add context keywords to improve retrieval
    const contextKeywords = {
      event: ["event", "schedule", "register", "attend"],
      society: ["society", "club", "organization", "join"],
      task: ["task", "todo", "assignment", "manage"],
      registration: ["registration", "signup", "enroll", "participate"],
      profile: ["profile", "account", "user", "settings"],
      notification: ["notification", "alert", "message", "updates"],
    };

    let enhancedQuery = query.toLowerCase();

    // Add related keywords based on query content
    for (const [category, keywords] of Object.entries(contextKeywords)) {
      if (enhancedQuery.includes(category)) {
        enhancedQuery += " " + keywords.join(" ");
        break;
      }
    }

    return enhancedQuery;
  }
}
