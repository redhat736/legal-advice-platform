import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { chatApi, agentApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Send, 
  MessageSquare, 
  User, 
  ShieldCheck, 
  Clock, 
  CheckCheck, 
  AlertCircle,
  Bot
} from 'lucide-react';

export const Chat = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [lawyers, setLawyers] = useState([]);

  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat sessions and lawyer directory
  const loadInitialData = async () => {
    setLoadingSessions(true);
    try {
      const [sessionsRes, lawyerRes] = await Promise.all([
        chatApi.getSessions(),
        agentApi.listLawyers()
      ]);

      const fetchedSessions = sessionsRes?.sessions || [];
      setSessions(fetchedSessions);
      if (lawyerRes?.lawyers) setLawyers(lawyerRes.lawyers);

      // If redirected from lawyer card with a pre-selected lawyer
      const targetLawyerId = location.state?.selectedLawyerId;
      if (targetLawyerId) {
        const existing = fetchedSessions.find((s) => s.lawyer_id === targetLawyerId);
        if (existing) {
          setActiveSession(existing);
        } else {
          // Virtual new session with this lawyer
          const lawyerData = lawyerRes?.lawyers?.find((l) => l.id === targetLawyerId);
          setActiveSession({
            id: null,
            lawyer_id: targetLawyerId,
            lawyer_name: lawyerData?.name || location.state.lawyerName || 'Specialist Attorney',
            client_id: user?.id,
            isNew: true
          });
        }
      } else if (fetchedSessions.length > 0) {
        setActiveSession(fetchedSessions[0]);
      }
    } catch (err) {
      console.warn('Error loading chat:', err.message);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [user]);

  // Load messages whenever active session changes
  useEffect(() => {
    if (!activeSession || activeSession.isNew || !activeSession.id) {
      if (activeSession?.isNew) {
        setMessages([
          {
            id: 'temp-welcome',
            sender_id: activeSession.lawyer_id,
            sender_name: activeSession.lawyer_name,
            sender_role: 'lawyer',
            message_text: `Hello ${user?.name?.split(' ')[0] || ''}, I am ${activeSession.lawyer_name}. How can I assist you with your legal matter today?`,
            created_at: new Date().toISOString()
          }
        ]);
      }
      return;
    }

    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await chatApi.getMessages(activeSession.id);
        if (res?.messages) {
          setMessages(res.messages);
        }
      } catch (err) {
        console.warn('Error fetching messages:', err.message);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();

    // Poll for responses every 3 seconds for dynamic interactivity
    const interval = setInterval(async () => {
      try {
        const res = await chatApi.getMessages(activeSession.id);
        if (res?.messages) {
          setMessages(res.messages);
        }
      } catch {
        // silent catch
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const textToSend = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const payload = {
        message_text: textToSend,
        session_id: activeSession?.id || undefined,
        lawyer_id: activeSession?.lawyer_id || undefined
      };

      const res = await chatApi.sendMessage(payload);
      if (res?.chat_message) {
        setMessages((prev) => [...prev, res.chat_message]);

        // If this was a new session, update active session with ID and reload sessions
        if (activeSession?.isNew && res.session_id) {
          setActiveSession({
            ...activeSession,
            id: res.session_id,
            isNew: false
          });
          const updatedSessions = await chatApi.getSessions();
          if (updatedSessions?.sessions) setSessions(updatedSessions.sessions);
        }
      }
    } catch (err) {
      alert(`Message delivery error: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Container Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md flex flex-col md:flex-row h-[75vh]">
        
        {/* Left Sidebar: Session List */}
        <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/70">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" /> Consultations & Chat
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Encrypted client-lawyer communications</p>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loadingSessions ? (
              <div className="p-4 text-center text-xs text-slate-400">Loading sessions...</div>
            ) : sessions.length === 0 && !activeSession?.isNew ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No conversations yet. Choose a lawyer from Personal Agents or start below.
              </div>
            ) : (
              sessions.map((s) => {
                const partnerName = user?.role === 'client' ? s.lawyer_name : s.client_name;
                const isSelected = activeSession?.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSession(s)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {partnerName?.charAt(0) || 'L'}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold truncate">{partnerName}</div>
                      <div className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {s.area_of_expertise || 'Legal Advice Consultation'}
                      </div>
                    </div>
                  </button>
                );
              })
            )}

            {/* Quick start with a lawyer if user has few sessions */}
            {sessions.length < 3 && lawyers.length > 0 && (
              <div className="pt-4 px-2">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Available Lawyers</div>
                <div className="space-y-1">
                  {lawyers.slice(0, 3).map((l) => (
                    <button
                      key={l.id}
                      onClick={() =>
                        setActiveSession({
                          id: null,
                          lawyer_id: l.id,
                          lawyer_name: l.name,
                          client_id: user?.id,
                          isNew: true
                        })
                      }
                      className="w-full text-left p-2 rounded-lg text-xs text-slate-700 hover:bg-blue-50 flex items-center justify-between"
                    >
                      <span className="truncate">{l.name}</span>
                      <span className="text-[10px] text-blue-600 font-semibold shrink-0">Chat</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Main Pane: Active Conversation */}
        <div className="flex-1 flex flex-col bg-white">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                {(user?.role === 'client' ? activeSession?.lawyer_name : activeSession?.client_name)?.charAt(0) || 'L'}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {user?.role === 'client' ? activeSession?.lawyer_name || 'Counsel Consultation' : activeSession?.client_name || 'Client Intake'}
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Encrypted Channel
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 hidden sm:block">
              Attorney-Client Privilege Protocol Active
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
            {loadingMessages ? (
              <div className="text-center py-12 text-xs text-slate-400">Decrypting messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">
                Begin typing below to consult with your attorney.
              </div>
            ) : (
              messages.map((m) => {
                const isMine = m.sender_id === user?.id;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-700">{m.sender_name || (isMine ? 'You' : 'Counsel')}</span>
                      <span>•</span>
                      <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div
                      className={`max-w-md sm:max-w-lg rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                        isMine
                          ? 'bg-blue-600 text-white rounded-tr-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                      }`}
                    >
                      {m.message_text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your message, inquiry, or case clarification..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 py-2.5 px-4 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition disabled:opacity-50 shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};

export default Chat;
