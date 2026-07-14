'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

const SECTOR_TABS = [
  { key: 'all',       label: 'Tous',        entityType: undefined },
  { key: 'booking',   label: '🔧 Services',  entityType: 'booking' },
  { key: 'transport', label: '🚚 Transport', entityType: 'transport' },
  { key: 'order',     label: '🛒 Marketplace', entityType: 'order' },
];

const ENTITY_LABEL: Record<string, string> = {
  booking:   'Réservation',
  transport: 'Transport',
  order:     'Commande',
};

const STATUS_COLOR: Record<string, string> = {
  initiated:    'bg-yellow-100 text-yellow-800',
  'in-progress':'bg-blue-100 text-blue-800',
  completed:    'bg-green-100 text-green-800',
  failed:       'bg-red-100 text-red-800',
  'no-answer':  'bg-gray-100 text-gray-600',
  busy:         'bg-orange-100 text-orange-800',
};

type Conversation = {
  id: string;
  entityType: string;
  entityId: string;
  participant1: string;
  participant2: string;
  messageCount: number;
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastSenderRole: string | null;
  createdAt: string;
};

type Message = {
  id: string;
  senderRole: string;
  content: string;
  createdAt: string;
  readAt: string | null;
  sender: { id: string; firstName: string; lastName: string };
};

type CallLog = {
  id: string;
  entityType: string | null;
  entityId: string | null;
  callerPhone: string;
  targetPhone: string | null;
  twilioCallSid: string | null;
  status: string;
  duration: number | null;
  createdAt: string;
  endedAt: string | null;
};

export default function ConversationsPage() {
  const [tab, setTab] = useState<'messages' | 'calls'>('messages');
  const [sectorTab, setSectorTab] = useState('all');

  // Messages state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [totalConvs, setTotalConvs] = useState(0);
  const [convPage, setConvPage] = useState(1);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Calls state
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [totalCalls, setTotalCalls] = useState(0);
  const [callPage, setCallPage] = useState(1);
  const [loadingCalls, setLoadingCalls] = useState(true);

  const entityType = SECTOR_TABS.find(t => t.key === sectorTab)?.entityType;

  const fetchConversations = useCallback(() => {
    setLoadingConvs(true);
    const params: any = { page: convPage, limit: 50 };
    if (entityType) params.entityType = entityType;
    apiClient.get('/admin/conversations', { params })
      .then((data: any) => {
        setConversations(data.conversations ?? []);
        setTotalConvs(data.total ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoadingConvs(false));
  }, [convPage, entityType]);

  const fetchCallLogs = useCallback(() => {
    setLoadingCalls(true);
    const params: any = { page: callPage, limit: 100 };
    if (entityType) params.entityType = entityType;
    apiClient.get('/admin/call-logs', { params })
      .then((data: any) => {
        setCallLogs(data.logs ?? []);
        setTotalCalls(data.total ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoadingCalls(false));
  }, [callPage, entityType]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);
  useEffect(() => { fetchCallLogs(); }, [fetchCallLogs]);

  // Reset page on sector change
  useEffect(() => { setConvPage(1); setCallPage(1); setSelectedConv(null); setMessages([]); }, [sectorTab]);

  const openConversation = async (conv: Conversation) => {
    setSelectedConv(conv);
    setLoadingMessages(true);
    try {
      const data: any = await apiClient.get('/admin/conversations/messages', {
        params: { entityType: conv.entityType, entityId: conv.entityId },
      });
      setMessages(data.messages ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMessages(false);
    }
  };

  const roleColor = (role: string) => {
    if (role === 'client' || role === 'buyer') return 'bg-blue-100 text-blue-800';
    if (role === 'pro' || role === 'driver' || role === 'seller') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-600';
  };

  const CONV_LIMIT = 50;
  const convPages = Math.ceil(totalConvs / CONV_LIMIT);
  const CALL_LIMIT = 100;
  const callPages = Math.ceil(totalCalls / CALL_LIMIT);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Messages & Appels</h1>
        <p className="text-gray-600">Surveillance de tous les échanges entre utilisateurs</p>
      </div>

      {/* Onglets principaux */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['messages', 'calls'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'px-5 py-2.5 text-sm font-medium border-b-2 transition-colors',
              tab === t
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            {t === 'messages' ? '💬 Messages' : '📞 Appels'}
          </button>
        ))}
      </div>

      {/* Filtre secteur */}
      <div className="flex flex-wrap gap-2">
        {SECTOR_TABS.map(s => (
          <button
            key={s.key}
            onClick={() => setSectorTab(s.key)}
            className={[
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              sectorTab === s.key
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ].join(' ')}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── TAB MESSAGES ── */}
      {tab === 'messages' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Liste des conversations */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Conversations ({totalConvs})</h2>
              <button
                onClick={fetchConversations}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
              >
                ↻ Actualiser
              </button>
            </div>

            {loadingConvs ? (
              <div className="py-12 text-center text-gray-400">Chargement…</div>
            ) : conversations.length === 0 ? (
              <div className="py-12 text-center text-gray-400">Aucune conversation</div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv)}
                    className={[
                      'w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors',
                      selectedConv?.id === conv.id ? 'bg-red-50 border-l-2 border-red-400' : '',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                        {ENTITY_LABEL[conv.entityType] ?? conv.entityType}
                      </span>
                      <span className="text-xs text-gray-400">{conv.messageCount} msg</span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {conv.lastMessageAt ? formatDateTime(conv.lastMessageAt) : '—'}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-800">
                      {conv.participant1} ↔ {conv.participant2}
                    </div>
                    {conv.lastMessage && (
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        <span className={`inline-block px-1 py-0.5 rounded text-[10px] font-semibold mr-1 ${roleColor(conv.lastSenderRole ?? '')}`}>
                          {conv.lastSenderRole}
                        </span>
                        {conv.lastMessage}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {convPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
                <button
                  disabled={convPage === 1}
                  onClick={() => setConvPage(p => p - 1)}
                  className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  ← Préc.
                </button>
                <span className="text-gray-500">Page {convPage} / {convPages}</span>
                <button
                  disabled={convPage === convPages}
                  onClick={() => setConvPage(p => p + 1)}
                  className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  Suiv. →
                </button>
              </div>
            )}
          </div>

          {/* Détail messages */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
            {!selectedConv ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 py-24">
                Sélectionnez une conversation
              </div>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="font-semibold text-gray-800">
                    {selectedConv.participant1} ↔ {selectedConv.participant2}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                    <span>{ENTITY_LABEL[selectedConv.entityType]}</span>
                    <span className="text-gray-300">•</span>
                    <span className="font-mono">{selectedConv.entityId}</span>
                  </div>
                </div>

                {loadingMessages ? (
                  <div className="flex-1 flex items-center justify-center text-gray-400">
                    Chargement…
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[60vh]">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-400 py-8">Aucun message</div>
                    ) : (
                      messages.map(msg => {
                        const isRight = msg.senderRole === 'pro' || msg.senderRole === 'driver' || msg.senderRole === 'seller';
                        return (
                          <div key={msg.id} className={`flex flex-col ${isRight ? 'items-end' : 'items-start'}`}>
                            <div className={`flex items-center gap-1.5 mb-0.5 text-xs text-gray-500 ${isRight ? 'flex-row-reverse' : ''}`}>
                              <span className={`px-1.5 py-0.5 rounded font-semibold ${roleColor(msg.senderRole)}`}>
                                {msg.senderRole}
                              </span>
                              <span>{msg.sender.firstName} {msg.sender.lastName}</span>
                              <span>{formatDateTime(msg.createdAt)}</span>
                              {msg.readAt && <span className="text-green-500">✓</span>}
                            </div>
                            <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                              isRight
                                ? 'bg-green-100 text-green-900 rounded-tr-sm'
                                : 'bg-blue-100 text-blue-900 rounded-tl-sm'
                            }`}>
                              {msg.content}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TAB APPELS ── */}
      {tab === 'calls' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Journal des appels ({totalCalls})</h2>
            <button
              onClick={fetchCallLogs}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
            >
              ↻ Actualiser
            </button>
          </div>

          {loadingCalls ? (
            <div className="py-12 text-center text-gray-400">Chargement…</div>
          ) : callLogs.length === 0 ? (
            <div className="py-12 text-center text-gray-400">Aucun appel enregistré</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Secteur / Entité</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Appelant</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Destinataire</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Durée</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">SID Twilio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {callLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {log.entityType ? (
                          <div>
                            <span className="text-xs font-semibold text-gray-500">
                              {ENTITY_LABEL[log.entityType] ?? log.entityType}
                            </span>
                            {log.entityId && (
                              <div className="text-xs text-gray-400 font-mono truncate max-w-[120px]">
                                {log.entityId}
                              </div>
                            )}
                          </div>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-700">{log.callerPhone}</td>
                      <td className="px-4 py-3 font-mono text-gray-700">{log.targetPhone ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLOR[log.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {log.duration != null ? `${log.duration}s` : '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400 truncate max-w-[120px]">
                        {log.twilioCallSid ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {callPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
              <button
                disabled={callPage === 1}
                onClick={() => setCallPage(p => p - 1)}
                className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                ← Préc.
              </button>
              <span className="text-gray-500">Page {callPage} / {callPages}</span>
              <button
                disabled={callPage === callPages}
                onClick={() => setCallPage(p => p + 1)}
                className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                Suiv. →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
