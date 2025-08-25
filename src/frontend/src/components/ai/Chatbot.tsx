import React, { useState, useRef, useEffect, JSX } from 'react';
import { Send, Bot, User, Loader, Calendar } from 'lucide-react';

interface Event {
  id: number;
  name: string;
  description?: string;
  date?: string;
  location?: string;
}

interface Message {
  id: number;
  text?: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isLoading?: boolean;
  isError?: boolean;
  isEventList?: boolean;
  events?: Event[];
}

interface Actor {
  getEvents: () => Promise<{ ok: Event[] }>;
}

const APP_URL = "http://localhost:3000"

// Mock initActor 
const initActor = async (canisterName: string): Promise<Actor> => {
  // Delay a sec
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    getEvents: async (): Promise<{ ok: Event[] }> => {
      return {
        ok: [
          {
            id: 1,
            name: "Workshop React & Web3",
            description: "Belajar membuat aplikasi React dengan integrasi Web3",
            date: "2025-09-15",
            location: "Jakarta"
          },
          {
            id: 2,
            name: "Blockchain Conference 2025",
            description: "Konferensi blockchain terbesar di Indonesia",
            date: "2025-10-20",
            location: "Surabaya"
          },
          {
            id: 3,
            name: "DeFi Meetup",
            description: "Diskusi tentang DeFi dan masa depan keuangan",
            date: "2025-11-05",
            location: "Bandung"
          }
        ]
      };
    }
  };
};

const FetchAIChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Halo! Saya adalah asisten AI yang terhubung dengan Fetch.ai. Anda bisa bertanya apa saja atau mengetik 'list event' untuk melihat daftar event yang tersedia.",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_KEY: string = 'sk_a515ef4442e546acae2d8b8e4106429720e4650f9350430f913b5d28574127a9';

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Magic keyword
  const detectListEventCommand = (message: string): boolean => {
    const normalizedMessage = message.toLowerCase().trim();
    const eventKeywords = ['list event', 'daftar event', 'event list', 'show events', 'tampilkan event'];
    return eventKeywords.some(keyword => normalizedMessage.includes(keyword));
  };

  const getEventsList = async (): Promise<Event[]> => {
    try {
      const actor = await initActor("event");
      const result = await actor.getEvents();
      return result.ok || [];
    } catch (error) {
      console.error('Error fetching events from Motoko:', error);
      return [];
    }
  };

  const callFetchAI = async (prompt: string): Promise<string> => {
    try {
      const response = await fetch('https://api.asi1.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'asi1-mini',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling Fetch.ai API:', error);
      throw error;
    }
  };

  const formatEventList = (events: Event[] | undefined): JSX.Element => {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-blue-600 font-semibold">
          <Calendar className="w-5 h-5" />
          <span>Daftar Event Tersedia</span>
        </div>
        {events?.map((event) => (
          <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-2">{event.name}</h3>
                {event.description && (
                  <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                )}
                {event.date && (
                  <p className="text-gray-500 text-xs mb-1">📅 {event.date}</p>
                )}
                {event.location && (
                  <p className="text-gray-500 text-xs mb-2">📍 {event.location}</p>
                )}
              </div>
            </div>
            <a
              href={`${APP_URL}/event/${event.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors"
            >
              Lihat Detail Event
            </a>
          </div>
        ))}
      </div>
    );
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      if (detectListEventCommand(inputMessage)) {
        const loadingMessage: Message = {
          id: Date.now() + 1,
          text: 'Sedang mengambil data event...',
          sender: 'ai',
          timestamp: new Date(),
          isLoading: true
        };
        setMessages(prev => [...prev, loadingMessage]);

        const events = await getEventsList();

        if (events.length > 0) {
          const eventsData = events.map(event =>
            `Event ID: ${event.id}, Nama: ${event.name}, Deskripsi: ${event.description || 'Tidak ada deskripsi'}, Tanggal: ${event.date || 'TBA'}, Lokasi: ${event.location || 'TBA'}`
          ).join('\n');

          const enhancedPrompt = `User meminta list event. Berikut adalah data event yang tersedia:

            ${eventsData}

            Berikan penjelasan singkat tentang event-event yang tersedia dan sampaikan bahwa detail lengkap bisa dilihat melalui link yang disediakan. Berikan respons dalam bahasa Indonesia yang ramah dan informatif.`;

          const aiResponse = await callFetchAI(enhancedPrompt);

          setMessages(prev => prev.filter(msg => !msg.isLoading));

          const aiMessage: Message = {
            id: Date.now() + 2,
            text: aiResponse,
            sender: 'ai',
            timestamp: new Date()
          };

          const eventListMessage: Message = {
            id: Date.now() + 3,
            sender: 'ai',
            timestamp: new Date(),
            isEventList: true,
            events: events
          };

          setMessages(prev => [...prev, aiMessage, eventListMessage]);
        } else {
          setMessages(prev => prev.filter(msg => !msg.isLoading));

          const noEventsMessage: Message = {
            id: Date.now() + 2,
            text: 'Maaf, saat ini tidak ada event yang tersedia.',
            sender: 'ai',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, noEventsMessage]);
        }
      } else {
        const aiResponse = await callFetchAI(inputMessage);

        const aiMessage: Message = {
          id: Date.now() + 1,
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error processing message:', error);

      setMessages(prev => prev.filter(msg => !msg.isLoading));

      const errorMessage: Message = {
        id: Date.now() + 1,
        text: 'Maaf, terjadi kesalahan saat memproses pesan Anda. Pastikan API key sudah benar dan coba lagi.',
        sender: 'ai',
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gray-50">
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Fetch.ai Assistant
            </h1>
            <p className="text-sm text-gray-500">
              Powered by ASI:One Platform
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
          >
            {message.sender === 'ai' && (
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}

            <div className={`max-w-[70%] ${message.sender === 'user' ? 'order-1' : ''}`}>
              <div
                className={`rounded-lg px-4 py-3 ${message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : message.isError
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-white text-gray-800 shadow-sm border'
                  }`}
              >
                {message.isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>{message.text}</span>
                  </div>
                ) : message.isEventList ? (
                  formatEventList(message.events)
                ) : (
                  <p className="whitespace-pre-wrap">{message.text}</p>
                )}
              </div>

              <div className={`text-xs text-gray-500 mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'
                }`}>
                {formatTime(message.timestamp)}
              </div>
            </div>

            {message.sender === 'user' && (
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t px-6 py-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ketik pesan Anda... (coba: 'list event')"
              className="w-full resize-none border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '50px', maxHeight: '120px' }}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-blue-500 hover:text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-2 text-xs text-gray-500 text-center">
          💡 Tip: Ketik "list event" untuk melihat daftar event yang tersedia
        </div>
      </div>
    </div>
  );
};

export default FetchAIChatbot;