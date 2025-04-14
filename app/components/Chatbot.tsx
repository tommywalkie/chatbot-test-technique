"use client";

import { useState, useEffect, useCallback } from "react";
import { Message } from "@prisma/client";
import ChatInput from "./ChatInput";
import MessageList from "./MessageList";

/**
 * Composant principal du chatbot
 * Gère l'état de la conversation, l'envoi et la réception des messages
 */
export default function Chatbot() {
  // États pour gérer les messages, la conversation et les états de chargement
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  /**
   * Crée une nouvelle conversation
   * Mémorisé avec useCallback pour éviter des recréations inutiles
   */
  const createNewConversation = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la conversation");
      }

      const data = await response.json();
      setConversationId(data.id);
      setMessages([]);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Crée une nouvelle conversation au chargement du composant
  useEffect(() => {
    createNewConversation();
  }, [createNewConversation]);

  /**
   * Gère l'envoi d'un message
   * @param content Contenu du message à envoyer
   */
  const handleSendMessage = async (content: string) => {
    if (!conversationId || !content.trim()) return;

    // Créer un message temporaire pour l'affichage immédiat
    const tempUserMessage: Message = {
      id: Date.now().toString(),
      content,
      isUserMessage: true,
      createdAt: new Date(),
      conversationId,
    };

    setMessages((prev) => [...prev, tempUserMessage]);
    setIsLoading(true);

    // Ajouter un indicateur de frappe
    setIsTyping(true);

    try {
      // Envoyer le message à l'API
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du message");
      }

      const data = await response.json();

      // Simuler un délai de frappe pour le bot (effet UX)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Ajouter la réponse du chatbot
      const botMessage: Message = {
        id: Date.now().toString() + "-bot",
        content: "Merci pour votre message !",
        isUserMessage: false,
        createdAt: new Date(),
        conversationId,
      };

      // Mettre à jour les messages en remplaçant le message temporaire par le message sauvegardé
      // et en ajoutant la réponse du bot
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMessage.id),
        data,
        botMessage,
      ]);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] w-full max-w-3xl mx-auto rounded-lg overflow-hidden shadow-xl border border-gray-200 bg-white">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Chatbot</h1>
        <button
          onClick={createNewConversation}
          disabled={isLoading}
          aria-label="Démarrer une nouvelle conversation"
          className="bg-white text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 flex items-center disabled:opacity-50 shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Nouvelle conversation
        </button>
      </div>
      <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col">
        <MessageList messages={messages} isTyping={isTyping} />
        <div className="p-4 border-t border-gray-200 bg-white">
          <ChatInput
            onSendMessage={handleSendMessage}
            isDisabled={isLoading || !conversationId}
          />
        </div>
      </div>
    </div>
  );
}
