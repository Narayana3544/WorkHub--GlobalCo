import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ChevronRight, ChevronDown } from 'lucide-react';
import type { WorkItem } from '../types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
    id: string;
    title: string;
    items: WorkItem[];
    isCollapsible?: boolean;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, items, isCollapsible }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const { setNodeRef } = useDroppable({
        id,
    });

    if (isCollapsible && isCollapsed) {
        return (
            <div 
                className="w-12 flex-shrink-0 bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl flex flex-col items-center py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsCollapsed(false)}
            >
                <ChevronRight className="mb-4 text-[var(--text-secondary)]" size={20} />
                <div className="rotate-90 origin-center whitespace-nowrap font-semibold tracking-wider text-[var(--text-secondary)]">
                    {title} ({items.length})
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-80 flex-shrink-0 bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
            {/* Column Header */}
            <div className="p-4 border-b border-[var(--border-color)] bg-gray-50/50 dark:bg-gray-800/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{title}</h3>
                    <span className="bg-gray-200 dark:bg-gray-700 text-[var(--text-secondary)] text-xs font-medium px-2 py-0.5 rounded-full">
                        {items.length}
                    </span>
                </div>
                {isCollapsible && (
                    <button 
                        onClick={() => setIsCollapsed(true)}
                        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        <ChevronDown size={20} />
                    </button>
                )}
            </div>

            {/* Droppable Area */}
            <div 
                ref={setNodeRef}
                className="flex-1 p-3 overflow-y-auto space-y-3 min-h-[150px] bg-[var(--bg-color)]/30"
            >
                <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    {items.map((item) => (
                        <KanbanCard key={item.id} item={item} />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
};
