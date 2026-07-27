import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, MessageSquare, Paperclip } from 'lucide-react';
import type { WorkItem } from '../types';

interface KanbanCardProps {
    item: WorkItem;
    isOverlay?: boolean;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ item, isOverlay }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: item.id,
        data: {
            type: 'Card',
            item,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const getTypeColor = (type?: string) => {
        switch (type) {
            case 'BUG': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'TASK': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'CRITICAL': return 'bg-red-500';
            case 'HIGH': return 'bg-orange-500';
            case 'MEDIUM': return 'bg-yellow-500';
            case 'LOW': return 'bg-green-500';
            default: return 'bg-gray-300';
        }
    };

    if (isDragging && !isOverlay) {
        return (
            <div 
                ref={setNodeRef} 
                style={style}
                className="h-32 bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg opacity-50"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
                bg-[var(--card-color)] p-4 rounded-lg border shadow-sm group cursor-grab active:cursor-grabbing
                hover:border-[var(--color-primary)] transition-colors
                ${isOverlay ? 'rotate-2 scale-105 shadow-xl border-[var(--color-primary)] z-50' : 'border-[var(--border-color)]'}
            `}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide ${getTypeColor(item.typeCode)}`}>
                        {item.typeCode || 'TASK'}
                    </span>
                    <div className="flex items-center gap-1" title={`Priority: ${item.priorityCode}`}>
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(item.priorityCode)}`} />
                    </div>
                </div>
                <button className="text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                    <MoreHorizontal size={16} />
                </button>
            </div>

            <h4 className="text-sm font-medium leading-snug mb-3 text-[var(--text-primary)]">
                {item.title}
            </h4>

            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                    <div className="flex items-center gap-1 text-xs">
                        <MessageSquare size={14} />
                        <span>2</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                        <Paperclip size={14} />
                        <span>1</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {item.typeCode === 'BUG' && (
                        <div className="text-[10px] text-red-500 font-semibold border border-red-200 bg-red-50 px-1 rounded" title="Environment & Severity">
                            {item.environment || 'PROD'} • {item.severity || 'MAJOR'}
                        </div>
                    )}
                    {item.typeCode === 'TEST_CASE' && item.executionResult && (
                        <div className={`text-[10px] font-semibold border px-1 rounded ${
                            item.executionResult === 'PASS' ? 'text-green-600 border-green-200 bg-green-50' :
                            item.executionResult === 'FAIL' ? 'text-red-600 border-red-200 bg-red-50' :
                            'text-orange-600 border-orange-200 bg-orange-50'
                        }`}>
                            {item.executionResult}
                        </div>
                    )}
                    <div className="bg-gray-100 dark:bg-gray-800 text-[var(--text-secondary)] text-xs font-semibold px-2 py-1 rounded">
                        {item.storyPoints}
                    </div>
                    {item.assigneeId ? (
                        <div 
                            className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                            title={item.assigneeName}
                        >
                            {item.assigneeName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 border border-dashed border-gray-400 dark:border-gray-500 flex items-center justify-center text-[10px] text-gray-500" />
                    )}
                </div>
            </div>
        </div>
    );
};
