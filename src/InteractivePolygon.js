import { useState } from 'react';

export default function InteractivePolygon() {
  const [points, setPoints] = useState([
    { x: 125, y: 125 },
    { x: 275, y: 125 },
    { x: 275, y: 275 },
    { x: 125, y: 275 }
  ]);

  const [graphPoints, setgraphPoints] = useState([
    { x: 125, y: 125 },
    { x: 275, y: 125 },
    { x: 275, y: 275 },
    { x: 125, y: 275 }
  ]);
  
  const [draggedPointIndex, setDraggedPointIndex] = useState(null);

  const pointWithin = (point, polygon) => {
    const x = point.x;
    const y = point.y;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;
      
      const intersect = ((yi > y) !== (yj > y)) && 
                         (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    
    return inside;
  };

  /*const lineIntersect = (x1, y1, x2, y2, x3, y3, x4, y4) => {
    const EPSILON = 1e-10;

    const d1x = x2 - x1;
    const d1y = y2 - y1;
    const d2x = x4 - x3;
    const d2y = y4 - y3;
    
    const det = d1x * d2y - d1y * d2x;

    if (Math.abs(det) < EPSILON) {
      return false;
    }
    
    const s = ((x1 - x3) * d2y - (y1 - y3) * d2x) / det;
    const t = ((x3 - x1) * d1y - (y3 - y1) * d1x) / -det;

    const isEndpoint = 
      (Math.abs(s) < EPSILON || Math.abs(s - 1) < EPSILON) && 
      (Math.abs(t) < EPSILON || Math.abs(t - 1) < EPSILON);
      
    if (isEndpoint) {
      return false; // Endpoints touching isn't a "real" intersection for our purposes
    }
    
    return (s >= 0 && s <= 1 && t >= 0 && t <= 1);
  };*/

  /*const shrink = (lineStart, lineEnd) => {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) {
      // Points are the same; can't shrink
      return { lineStart, lineEnd };
    }

    const ux = dx / length;
    const uy = dy / length;

    const newX1 = lineStart.x + ux * 1;
    const newY1 = lineStart.y + uy * 1;

    const newX2 = lineEnd.x - ux * 1;
    const newY2 = lineEnd.y - uy * 1;

    const newStart = { newX1, newY1 };
    const newEnd = { newX2, newY2};

    return { newStart, newEnd };

  }*/

  const lineWithin = (lineStart, lineEnd, polygon) => {
    //console.log(`Checking line from (${lineStart.x},${lineStart.y}) to (${lineEnd.x},${lineEnd.y})`);
    /*
    for (let i = 0; i < polygon.length; i++) {
      const j = (i + 1) % polygon.length;
      
      // Skip edges that connect to the endpoints of our line
      const isStartOnEdge = 
        (Math.abs(lineStart.x - polygon[i].x) < 1e-10 && Math.abs(lineStart.y - polygon[i].y) < 1e-10) || 
        (Math.abs(lineStart.x - polygon[j].x) < 1e-10 && Math.abs(lineStart.y - polygon[j].y) < 1e-10);
      
      const isEndOnEdge = 
        (Math.abs(lineEnd.x - polygon[i].x) < 1e-10 && Math.abs(lineEnd.y - polygon[i].y) < 1e-10) || 
        (Math.abs(lineEnd.x - polygon[j].x) < 1e-10 && Math.abs(lineEnd.y - polygon[j].y) < 1e-10);
      
      // Only check intersection if our line doesn't start or end on this edge
      if (!isStartOnEdge && !isEndOnEdge) {
        if (lineIntersect(
            lineStart.x, lineStart.y, lineEnd.x, lineEnd.y,
            polygon[i].x, polygon[i].y, polygon[j].x, polygon[j].y
        )) {
          console.log(`Intersects with polygon edge ${i}-${j}, returning false`);
          return false;
        }
      }
    }*/

    //const newLine = shrink(lineStart, lineEnd);
    
    const numSamples = 52;
    for (let i = 1; i < numSamples - 1; i++) {
      const t = i / numSamples;
      const sampleX = lineStart.x + t * (lineEnd.x - lineStart.x);
      const sampleY = lineStart.y + t * (lineEnd.y - lineStart.y);
      
      if (!pointWithin({x: sampleX, y: sampleY}, polygon)) {
        //console.log(`Sample point (${sampleX}, ${sampleY}) is outside, returning false`);
        return false;
      }
    }
    
    //console.log("Line is inside polygon, returning true");
    return true;
  };

  const generateAllPairs = () => {
    const pairs = [];
    
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        if (j !== (i + 1) % points.length && i !== (j + 1) % points.length) {
          const vis = lineWithin(points[i], points[j], points);
          pairs.push({
            from: points[i],
            to: points[j],
            fromIndex: i,
            toIndex: j,
            vis: vis
          });
        }
      }
    }
    return pairs;
  };

  const generateNewPoints = () => {
    const newPts = [];
    
    for (let i = 0; i < points.length + 1; i++) {
      const angle = (2 * Math.PI * i) / (points.length + 1); // Evenly spaced around the circle
      const x = 200 + 100 * Math.cos(angle);
      const y = 200 + 100 * Math.sin(angle);
      newPts.push({ x, y });
    }
    return newPts;
  };

  const generateGraphPairs = () => {
    const graphPairs = [];
    
    for (let i = 0; i < graphPoints.length; i++) {
      for (let j = i + 1; j < graphPoints.length; j++) {
        // Skip adjacent vertices as they're already connected in the polygon
        if (j !== (i + 1) % graphPoints.length && i !== (j + 1) % graphPoints.length) {
          const vis = lineWithin(points[i], points[j], points);
          graphPairs.push({
            from: graphPoints[i],
            to: graphPoints[j],
            fromIndex: i,
            toIndex: j,
            vis: vis
          });
        }
      }
    }
    return graphPairs;
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
    setPoints(generateNewPoints());
    setgraphPoints(generateNewPoints());
  };
  
  const handleResetPoints = () => {
    setPoints([
      { x: 125, y: 125 },
      { x: 275, y: 125 },
      { x: 275, y: 275 },
      { x: 125, y: 275 }
    ]);
    setgraphPoints([
      { x: 125, y: 125 },
      { x: 275, y: 125 },
      { x: 275, y: 275 },
      { x: 125, y: 275 }
    ]);
  };

  const visibilityPairs = generateAllPairs();
  const graphPairs = generateGraphPairs();
  
  return (
    <div className="flex flex-col items-center p-4 max-w-3xl mx-auto">
      <div className='flex'>
        <a href="visual.html">
          <button style={{ position: 'relative', top: '8px', left: '-100px' }}>
            <img src="back_button.png" alt="Home" width="20" />
          </button>
        </a>

        
        <h2 className="text-2xl font-bold mb-4">Interactive Polygon and Subsequent Visibility Graph</h2>
      </div>
      
      <div className="mb-4 text-center">
        <p>Click and drag any point to modify the interactive polygon on the left and the visibility graph on the right will update accordingly to reflect the visibility relationship of each pair of vertices!</p>
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
      <div className = "flex">
        <div className="border border-gray-300 rounded-lg bg-white shadow-lg mb-4">
          <div className="p-3 border-b border-gray-300 bg-gray-100 font-medium text-lg text-center">
            Interactive Polygon
          </div>
          <svg 
            width="400" 
            height="400" 
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="bg-gray-50"
          >
            {/* Visibility Graph - non-adjacent vertex connections */}
            {visibilityPairs.map((pair, index) => (
              <line 
                key={`vis-${index}`}
                x1={pair.from.x}
                y1={pair.from.y}
                x2={pair.to.x}
                y2={pair.to.y}
                stroke={pair.vis ? "rgba(0, 0, 0, 0.5)" : "rgba(199, 0, 0, 0.5)"}
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
            ))}
            
            {/* Polygon sides */}
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
          </svg>
        </div>

        <div className="border border-gray-300 rounded-lg bg-white shadow-lg mb-4">
          <div className="p-3 border-b border-gray-300 bg-gray-100 font-medium text-lg text-center">
            Visibility Graph
          </div>
          <svg 
            width="400" 
            height="400" 
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="bg-gray-50"
          >
            {/* Visibility Graph - non-adjacent vertex connections */}
            {graphPairs.map((pair, index) => (
              <line 
                key={`vis-${index}`}
                x1={pair.from.x}
                y1={pair.from.y}
                x2={pair.to.x}
                y2={pair.to.y}
                fill={"rgba(120, 190, 255, 0.3)"}
                stroke={pair.vis ? "blue" : "rgba(158, 158, 158, 0.3)"} 
                strokeWidth="2"
                strokeDasharray="4 2"
              />
            ))}
            
            {/* Polygon sides */}
            <polygon 
              points={graphPoints.map(p => `${p.x},${p.y}`).join(' ')} 
              fill="rgba(120, 190, 255, 0.3)" 
              stroke="blue" 
              strokeWidth="2"
            />
            
            {/* Vertices */}
            {graphPoints.map((point, index) => (
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
          </svg>
        </div>
      </div>
    </div>
  );
}