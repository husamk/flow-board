import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableContainerProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export const DroppableContainer: React.FC<DroppableContainerProps> = ({
  id,
  children,
  className = '',
}) => {
  const { isOver, setNodeRef } = useDroppable({ id, data: { columnId: id } });

  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-200 ease-out ${className}`}
      style={{
        transform: isOver ? 'scale(1.02)' : 'scale(1)',
        background: isOver
          ? 'linear-gradient(135deg, rgba(0, 128, 255, 0.12), rgba(0, 200, 255, 0.2))'
          : 'transparent',
        border: isOver ? '2px dashed rgba(0, 128, 255, 0.6)' : '2px solid transparent',
        borderRadius: '8px',
        boxShadow: isOver ? '0 4px 10px rgba(0, 128, 255, 0.2)' : 'none',
      }}
    >
      {children}
    </div>
  );
};

export default DroppableContainer;
