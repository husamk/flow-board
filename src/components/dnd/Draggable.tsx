import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DraggableProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onDelete?: () => void;
}

export const Draggable: React.FC<DraggableProps> = ({
  id,
  children,
  className = '',
  onClick,
  onDelete = () => {},
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    rotate: isDragging ? '3deg' : '0deg',
    zIndex: isDragging ? 999 : 'auto',
    cursor: isDragging ? 'grabbing' : 'grab',
    boxShadow: isDragging ? '0 6px 16px rgba(0, 0, 0, 0.2)' : 'none',
  } as React.CSSProperties;

  return (
    <div className="relative">
      {!isDragging && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-3 right-3 z-20 text-gray-400 hover:text-red-600 hover:font-bold transition-all text-l"
          aria-label="Delete card"
        >
          ×
        </button>
      )}
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={style}
        className={`relative ${className}`}
        onClick={onClick}
      >
        {children}
      </div>
    </div>
  );
};

export default Draggable;
