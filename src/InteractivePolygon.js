import { useState } from 'react';

export default function InteractivePolygon() {
  const [points, setPoints] = useState([
    { x: 100, y: 100 },
    { x: 200, y: 100 },
    { x: 200, y: 200 },
    { x: 100, y: 200 }
  ]);
  
  const [draggedPointIndex, setDraggedPointIndex] = useState(null);
  
  // Calculate polygon area
  const calculateArea = () => {
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    return Math.abs(area / 2).toFixed(2);
  };
  
  // Calculate polygon perimeter
  const calculatePerimeter = () => {
    let perimeter = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      perimeter += Math.sqrt(dx * dx + dy * dy);
    }
    return perimeter.toFixed(2);
  };
  
  // Calculate centroid
  const calculateCentroid = () => {
    let sumX = 0;
    let sumY = 0;
    
    points.forEach(point => {
      sumX += point.x;
      sumY += point.y;
    });
    
    return {
      x: (sumX / points.length).toFixed(2),
      y: (sumY / points.length).toFixed(2)
    };
  };

  const createAllLines = () => {
    const pairs = [];

    for (let i = 0; i < points.length; i++) {
        for (let j = 0; j < points.length; j++) {
            if (j !== (i+1) % points.length && i !== (j+1) % points.length) {
                pairs.push({
                    from: points[i],
                    to: points[j],
                    fromIndex: i,
                    toIndex: j
                });
            }
        }
    }
    return pairs;
  };
  
  const handleMouseDown = (index) => {
    setDraggedPointIndex(index);
  };
  
  const handleMouseMove = (e) => {
    if (draggedPointIndex !== null) {
      const svgRect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - svgRect.left;
      const y = e.clientY - svgRect.top;
      
      const newPoints = [...points];
      newPoints[draggedPointIndex] = { x, y };
      setPoints(newPoints);
    }
  };
  
  const handleMouseUp = () => {
    setDraggedPointIndex(null);
  };
  
  const handleAddPoint = () => {
    // Calculate midpoint of last and first points
    const lastIndex = points.length - 1;
    const midX = (points[lastIndex].x + points[0].x) / 2;
    const midY = (points[lastIndex].y + points[0].y) / 2;
    
    setPoints([...points, { x: midX, y: midY }]);
  };
  
  const handleResetPoints = () => {
    setPoints([
      { x: 100, y: 100 },
      { x: 200, y: 100 },
      { x: 200, y: 200 },
      { x: 100, y: 200 }
    ]);
  };

  const centroid = calculateCentroid();
  
  return (
    <div className="flex flex-col items-center p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Interactive Polygon</h2>
      <div className="mb-4 text-center">
        <p>Click and drag any point to modify the polygon</p>
        <div className="flex gap-4 justify-center my-4">
          <button 
            onClick={handleAddPoint}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Add Point
          </button>
          <button 
            onClick={handleResetPoints}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
          >
            Reset
          </button>
        </div>
      </div>
      
      <div className="border border-gray-300 rounded-lg bg-white shadow-lg mb-4">
        <svg 
          width="400" 
          height="400" 
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="bg-gray-50"
        >

        {visibilityPairs.map((pair, index) => (
            <line
                key = {`vis-${index}`}
                x1 = {pair.from.x}
                y1 = {pair.from.y}
                x2 = {pair.to.x}
                y2 = {pair.to.y}
                stroke = "rgba(200, 100, 255, 0.5)"
                strokeWidth= "1.5"
                strokeDasharray= "4 2"
            />
        ))}

          {/* Polygon */}
          <polygon 
            points={points.map(p => `${p.x},${p.y}`).join(' ')} 
            fill="rgba(120, 190, 255, 0.3)" 
            stroke="blue" 
            strokeWidth="2"
          />
          
          {/* Vertices */}
          {points.map((point, index) => (
            <circle 
              key={index}
              cx={point.x}
              cy={point.y}
              r="8"
              fill={draggedPointIndex === index ? "red" : "blue"}
              cursor="move"
              onMouseDown={() => handleMouseDown(index)}
            />
          ))}
          
          {/* Vertex labels */}
          {points.map((point, index) => (
            <text 
              key={`label-${index}`}
              x={point.x + 12}
              y={point.y - 5}
              fill="black"
              fontSize="12"
            >
              P{index + 1}({Math.round(point.x)}, {Math.round(point.y)})
            </text>
          ))}
          
          {/* Centroid */}
          <circle
            cx={centroid.x}
            cy={centroid.y}
            r="4"
            fill="red"
          />
          <text
            x={parseFloat(centroid.x) + 8}
            y={parseFloat(centroid.y) - 8}
            fill="red"
            fontSize="12"
          >
            Centroid
          </text>
        </svg>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow border border-gray-300 w-full">
        <h3 className="text-lg font-semibold mb-2">Polygon Properties</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium">Area:</h4>
            <p>{calculateArea()} square units</p>
          </div>
          <div>
            <h4 className="font-medium">Perimeter:</h4>
            <p>{calculatePerimeter()} units</p>
          </div>
          <div>
            <h4 className="font-medium">Centroid:</h4>
            <p>({centroid.x}, {centroid.y})</p>
          </div>
          <div>
            <h4 className="font-medium">Vertices:</h4>
            <p>{points.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}