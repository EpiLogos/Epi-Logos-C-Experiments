import { useState, useEffect, useCallback, useRef } from 'react';
import { Cpu, Play, Square, Loader2, ChevronDown } from 'lucide-react';
import { agentExecutionClient } from '@/services/agentExecutionClient';
import type { AgentDescriptor, AgentRunHandle, AgentRunEvent } from '@/services/types';

export function EpiiAgent() {
  const [agents, setAgents] = useState<AgentDescriptor[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [currentRun, setCurrentRun] = useState<AgentRunHandle | null>(null);
  const [events, setEvents] = useState<AgentRunEvent[]>([]);
  const [input, setInput] = useState('');
  const eventsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    agentExecutionClient.list().then(setAgents).catch(() => {});
  }, []);

  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events.length]);

  const handleRun = useCallback(async () => {
    if (!selectedAgent || !input.trim()) return;
    setRunning(true);
    setEvents([]);
    try {
      const handle = await agentExecutionClient.invoke({
        kind: 'agent_turn',
        modality: 'text',
        session_key: '',
        payload: { message: input.trim() },
        day_now: null,
        coordinate: selectedAgent,
      });
      setCurrentRun(handle);
      const unlisten = await agentExecutionClient.onRunEvent(handle.run_id, (event) => {
        setEvents((prev) => [...prev, event]);
        if (event.event_type === 'done' || event.event_type === 'error') {
          setRunning(false);
          unlisten();
        }
      });
    } catch (e) {
      setRunning(false);
      setEvents([{ run_id: '', event_type: 'error', data: String(e), timestamp: Date.now() }]);
    }
  }, [selectedAgent, input]);

  const handleAbort = useCallback(async () => {
    if (!currentRun) return;
    await agentExecutionClient.abort(currentRun.run_id);
    setRunning(false);
  }, [currentRun]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Cpu size={16} className="text-emerald-400" />
        <h3 className="text-sm font-medium text-neutral-300">Epii Agent</h3>
      </div>

      {/* Agent Selector */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <select
            value={selectedAgent ?? ''}
            onChange={(e) => setSelectedAgent(e.target.value || null)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-300 appearance-none"
          >
            <option value="">Select agent...</option>
            {agents.map((a) => (
              <option key={a.name} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none" />
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !running && handleRun()}
          placeholder="Enter invocation message..."
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-300 outline-none"
          disabled={running}
        />
        {running ? (
          <button
            onClick={handleAbort}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30 transition-colors"
          >
            <Square size={12} />
            Stop
          </button>
        ) : (
          <button
            onClick={handleRun}
            disabled={!selectedAgent || !input.trim()}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Play size={12} />
            Run
          </button>
        )}
      </div>

      {/* Events Stream */}
      <div className="rounded-lg border border-neutral-800 max-h-60 overflow-auto">
        {events.length === 0 ? (
          <div className="p-4 text-center text-xs text-neutral-600">
            {running ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Running...
              </div>
            ) : (
              'No events yet'
            )}
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {events.map((event, i) => (
              <div
                key={i}
                className={`px-3 py-2 text-xs font-mono ${
                  event.event_type === 'error'
                    ? 'text-red-400'
                    : event.event_type === 'done'
                      ? 'text-emerald-400'
                      : 'text-neutral-400'
                }`}
              >
                <span className="text-neutral-600 mr-2">[{event.event_type}]</span>
                {typeof event.data === 'string' ? event.data : JSON.stringify(event.data)}
              </div>
            ))}
            <div ref={eventsEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
