import React from 'react';
import { 
  Card, 
  CardContent 
} from "../components/ui/card";
import { Edit, Trash2, Info } from 'lucide-react';

const ComedianCard = ({ 
  comedian, 
  isSelected, 
  onSelect, 
  onShowInfo, 
  onDelete, 
  onEdit,
  isCustom 
}) => {
  return (
    <Card 
      className={`relative transition-all duration-300 hover:scale-105 cursor-pointer
        ${isSelected ? 'ring-4 ring-blue-500' : ''}`}
      onClick={onSelect}
    >
      {/* Action buttons positioned absolutely */}
      {isCustom && (
        <div className="absolute top-2 left-2 flex gap-2 z-10">
          <button
            className="p-1.5 hover:bg-red-100 rounded-full bg-white shadow-sm text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(comedian.id);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            className="p-1.5 hover:bg-blue-100 rounded-full bg-white shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(comedian);
            }}
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Info button positioned absolutely */}
      <button
        className="absolute top-2 right-2 p-1.5 hover:bg-blue-100 rounded-full bg-white shadow-sm info-button"
        onClick={(e) => {
          e.stopPropagation();
          const rect = e.currentTarget.getBoundingClientRect();
          onShowInfo(e, comedian, rect);
        }}
      >
        <Info className="h-3.5 w-3.5" />
      </button>

      <CardContent className="p-4 pt-10">
        <div className="flex items-center gap-4">
          <img
            src={comedian.image}
            alt={comedian.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <div className="font-semibold">{comedian.name}</div>
            <div className="text-2xl">{comedian.emoji}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComedianCard;