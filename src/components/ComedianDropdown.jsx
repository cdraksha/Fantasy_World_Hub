import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Edit, Trash2, Plus } from 'lucide-react';

const ComedianDropdown = ({ 
  customComedians, 
  selectedComedian, 
  onSelect, 
  onDelete, 
  onEdit,
  onCreateNew 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredComedian, setHoveredComedian] = useState(null);
  const [selectedInfoComedian, setSelectedInfoComedian] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const currentComedian = customComedians.find(c => c.id === selectedComedian);
    setSelectedInfoComedian(currentComedian || null);
  }, [selectedComedian, customComedians]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = customComedians.find(c => c.id === selectedComedian);

  const handleComedianSelect = (comedian) => {
    onSelect(comedian.id);
    setSelectedInfoComedian(comedian);
  };

  const handleComedianDelete = (id) => {
    setSelectedInfoComedian(null);
    setHoveredComedian(null);
    onDelete(id);
  };

  const displayedComedian = hoveredComedian || selectedInfoComedian;

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Dropdown Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white rounded-lg p-4 flex items-center justify-between shadow-sm hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {selected ? (
            <>
              <img
                src={selected.image}
                alt={selected.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-medium">{selected.name}</span>
            </>
          ) : (
            <span className="text-gray-500">Select Your Comedian</span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-[100]">
          <div className="flex flex-col">
            {/* Comedian Grid */}
            <div className="p-4 border-b">
              <div className="flex flex-wrap gap-4 justify-start">
                {customComedians.map((comedian) => (
                  <div
                    key={comedian.id}
                    className="relative flex-shrink-0"
                    onMouseEnter={() => setHoveredComedian(comedian)}
                    onMouseLeave={() => setHoveredComedian(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleComedianSelect(comedian);
                    }}
                  >
                    <div
                      className={`w-16 h-16 rounded-full cursor-pointer transition-transform hover:scale-105 ${
                        selectedComedian === comedian.id
                          ? 'ring-2 ring-blue-500 ring-offset-2'
                          : ''
                      }`}
                    >
                      <img
                        src={comedian.image}
                        alt={comedian.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  </div>
                ))}
                {/* Create New Comedian Button */}
                <div
                  className="relative flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateNew();
                    setIsOpen(false);
                  }}
                >
                  <div className="w-16 h-16 rounded-full cursor-pointer transition-transform hover:scale-105 bg-blue-50 flex items-center justify-center border-2 border-dashed border-blue-200 hover:border-blue-400">
                    <Plus className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 min-h-[12rem] bg-gray-50">
              {displayedComedian ? (
                <div className="flex gap-4">
                  <img
                    src={displayedComedian.image}
                    alt={displayedComedian.name}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        {displayedComedian.name} {displayedComedian.emoji}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(displayedComedian);
                            setIsOpen(false);
                          }}
                          className="p-1 hover:bg-blue-100 rounded-full transition-colors"
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleComedianDelete(displayedComedian.id);
                          }}
                          className="p-1 hover:bg-red-100 rounded-full transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {displayedComedian.info}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 italic">
                  Selected comedian information will appear here
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComedianDropdown;