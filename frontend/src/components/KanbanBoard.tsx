import React, { useState, useMemo } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { useWorkItems, useUpdateWorkItemStatus } from '../api/queries';
import type { WorkItem, WorkItemStatus } from '../types';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';

// Mapping local column names to backend status codes
export const COLUMNS: { id: WorkItemStatus; title: string }[] = [
    { id: 'BACKLOG', title: 'Backlog' }, // We'll map this to OPEN or handle it depending on backend if needed
    { id: 'TODO', title: 'To Do' },
    { id: 'IN_PROGRESS', title: 'In Progress' },
    { id: 'REVIEW', title: 'Review' },
    { id: 'DONE', title: 'Done' },
];

export const KanbanBoard: React.FC<{ projectId: string }> = ({ projectId }) => {
    const { data: workItems, isLoading } = useWorkItems(projectId);
    const { mutate: updateStatus } = useUpdateWorkItemStatus();

    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor)
    );

    const itemsByColumn = useMemo(() => {
        const grouped = COLUMNS.reduce((acc, col) => {
            acc[col.id] = [];
            return acc;
        }, {} as Record<string, WorkItem[]>);

        if (workItems) {
            workItems.forEach(item => {
                // Map backend status to our columns
                let colId = item.statusCode as string;
                if (colId === 'OPEN') colId = 'TODO'; // Example mapping
                if (colId === 'IN_REVIEW') colId = 'REVIEW';
                
                if (grouped[colId]) {
                    grouped[colId].push(item);
                } else {
                     // Default fallback
                    grouped['TODO'].push(item);
                }
            });
        }
        return grouped;
    }, [workItems]);

    const activeItem = useMemo(() => 
        workItems?.find((i) => i.id === activeId),
    [activeId, workItems]);

    if (isLoading) return <div className="p-8 text-center text-text-secondary">Loading board...</div>;

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const itemId = active.id as string;
        
        // Target could be a column ID (e.g. 'TODO') or another card ID (e.g. 'card-2')
        let targetColId: WorkItemStatus | null = null;

        const isOverAColumn = COLUMNS.some(col => col.id === over.id);
        if (isOverAColumn) {
            targetColId = over.id as WorkItemStatus;
        } else {
            // Over another card — find which column contains that card
            const overItem = workItems?.find(i => i.id === over.id);
            if (overItem) {
                let colId = overItem.statusCode as string;
                if (colId === 'OPEN') colId = 'TODO';
                if (colId === 'IN_REVIEW') colId = 'REVIEW';
                targetColId = colId as WorkItemStatus;
            }
        }

        if (!targetColId) return;

        const item = workItems?.find(i => i.id === itemId);
        if (!item) return;

        let sourceColId = item.statusCode as string;
        if (sourceColId === 'OPEN') sourceColId = 'TODO';
        if (sourceColId === 'IN_REVIEW') sourceColId = 'REVIEW';

        if (sourceColId !== targetColId) {
            updateStatus({ id: itemId, statusCode: targetColId });
        }
    };

    return (
        <div className="h-full flex flex-col p-6 overflow-hidden bg-[var(--bg-color)]">
            {/* Sprint Header */}
            <div className="mb-6 bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div>
                    <h2 className="text-xl font-bold">Current Sprint</h2>
                    <p className="text-sm text-[var(--text-secondary)]">Goal: Deliver Kanban Board features</p>
                </div>
                <div className="flex gap-8">
                    <div className="text-center">
                        <p className="text-sm text-[var(--text-secondary)]">Days Remaining</p>
                        <p className="font-semibold text-lg">5</p>
                    </div>
                    <div className="text-center w-32">
                        <p className="text-sm text-[var(--text-secondary)]">Progress</p>
                        <div className="h-2 w-full bg-gray-200 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: '45%' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Board Layout */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex flex-1 gap-6 overflow-x-auto pb-4">
                    {COLUMNS.map((col) => (
                        <KanbanColumn
                            key={col.id}
                            id={col.id}
                            title={col.title}
                            items={itemsByColumn[col.id] || []}
                            isCollapsible={col.id === 'BACKLOG'}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeItem ? <KanbanCard item={activeItem} isOverlay /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};
