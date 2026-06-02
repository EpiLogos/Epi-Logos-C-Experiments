import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, ChevronDown, Clock3, Cpu, Loader2, Play, Square } from 'lucide-react';
import { agentExecutionClient } from '@/services/agentExecutionClient';
import type { AgentDescriptor, AgentRunEvent, AgentRunHandle } from '@/services/types';

export type EpiiConversationStatus = 'available' | 'pending' | 'unavailable';

interface EpiiAgentProps {
  status: EpiiConversationStatus;
  agents: AgentDescriptor[];
}

export function EpiiAgent({ status, agents }: EpiiAgentProps) {
  if (status === 'unavailable') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle size={16} className="text-amber-400" />
          <h3 className="text-sm font-medium text-neutral-200">Agentic Control Room</h3>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-sm text-amber-100">Conversational backend unavailable</p>
          <p className="mt-2 text-xs leading-5 text-neutral-400">
            No bounded conversational backend is reachable from this surface right now, so Epii
            can only show the current runtime evidence and summon inspectors.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock3 size={16} className="text-sky-400" />
          <h3 className="text-sm font-medium text-neutral-200">Agentic Control Room</h3>
        </div>
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
          <p className="text-sm text-sky-100">Conversation backend pending</p>
          <p className="mt-2 text-xs leading-5 text-neutral-400">
            Specialists are registered, but live turn completion is not yet wired to return a
            governed in-surface dialogue. This panel stays honest about that rather than
            fabricating a response.
          </p>
        </div>
        <div className="space-y-2">
          {agents.length === 0 ? (
            <p className="text-xs text-neutral-500">No specialists are currently registered.</p>
          ) : (
            agents.map((agent) => (
              <div
                key={agent.name}
                className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-200">{agent.name}</span>
                  <span className="text-[10px] font-mono text-sky-400">{agent.coordinate}</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-neutral-400">{agent.description}</p>
                <p className="mt-2 text-[10px] text-neutral-500">
                  Capabilities: {agent.capabilities.join(', ')}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return <LiveEpiiAgentConsole initialAgents={agents} />;
}

function LiveEpiiAgentConsole({ initialAgents }: { initialAgents: AgentDescriptor[] }) {
  const [agents, setAgents] = useState<AgentDescriptor[]>(initialAgents);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [currentRun, setCurrentRun] = useState<AgentRunHandle | null>(null);
  const [events, setEvents] = useState<AgentRunEvent[]>([]);
  const [input, setInput] = useState('');
  const eventsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialAgents.length > 0) {
      setAgents(initialAgents);
      return;
    }
    agentExecutionClient.list().then(setAgents).catch(() => {});
  }, [initialAgents]);

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
    } catch (error) {
      setRunning(false);
      setEvents([
        { run_id: '', event_type: 'error', data: String(error), timestamp: Date.now() },
      ]);
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
        <h3 className="text-sm font-medium text-neutral-300">Agentic Control Room</h3>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <select
            value={selectedAgent ?? ''}
            onChange={(event) => setSelectedAgent(event.target.value || null)}
            className="w-full appearance-none rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-300"
          >
            <option value="">Select agent...</option>
            {agents.map((agent) => (
              <option key={agent.name} value={agent.name}>
                {agent.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-neutral-600"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && !running && handleRun()}
          placeholder="Enter invocation message..."
          className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-300 outline-none"
          disabled={running}
        />
        {running ? (
          <button
            onClick={handleAbort}
            className="flex items-center gap-1 rounded-lg bg-red-500/20 px-3 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/30"
          >
            <Square size={12} />
            Stop
          </button>
        ) : (
          <button
            onClick={handleRun}
            disabled={!selectedAgent || !input.trim()}
            className="flex items-center gap-1 rounded-lg bg-emerald-500/20 px-3 py-2 text-xs text-emerald-400 transition-colors hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Play size={12} />
            Run
          </button>
        )}
      </div>

      <div className="max-h-60 overflow-auto rounded-lg border border-neutral-800">
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
            {events.map((event, index) => (
              <div
                key={index}
                className={`px-3 py-2 font-mono text-xs ${
                  event.event_type === 'error'
                    ? 'text-red-400'
                    : event.event_type === 'done'
                      ? 'text-emerald-400'
                      : 'text-neutral-400'
                }`}
              >
                <span className="mr-2 text-neutral-600">[{event.event_type}]</span>
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
