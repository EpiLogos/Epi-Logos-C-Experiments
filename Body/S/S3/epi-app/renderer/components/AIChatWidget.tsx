import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Sparkles } from 'lucide-react';
import { cn } from '../../shared/utils';

interface AIChatWidgetProps {
    isCollapsed: boolean;
}

export function AIChatWidget({ isCollapsed }: AIChatWidgetProps) {
    const [input, setInput] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={cn(
            "relative border-t border-[var(--border-subtle)] transition-all duration-300",
            isCollapsed ? "p-2" : "p-4"
        )}>
            <AnimatePresence>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mb-3 space-y-2"
                    >
                        {/* Placeholder History / Greeting */}
                        <div className="text-[11px] text-[var(--text-tertiary)] flex items-center space-x-2">
                            <Sparkles size={12} className="text-emerald-400" />
                            <span>Gemini Active</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={cn(
                "relative group rounded-xl bg-[var(--bg-panel)] border transition-all duration-200",
                isFocused ? "border-[var(--text-secondary)] shadow-lg" : "border-[var(--border-subtle)]",
                isCollapsed ? "h-10 w-10 flex items-center justify-center cursor-pointer hover:bg-[var(--bg-hover)]" : ""
            )}>
                {isCollapsed ? (
                    <Sparkles size={18} className="text-[var(--text-secondary)] group-hover:text-emerald-400 transition-colors" />
                ) : (
                    <div className="flex items-center p-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Ask PAI..."
                            className="w-full bg-transparent border-none outline-none text-[13px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
                        />
                        <button className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                            {input ? <Send size={14} /> : <Mic size={14} />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
