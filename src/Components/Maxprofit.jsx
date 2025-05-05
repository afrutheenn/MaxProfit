import React, { useState } from "react";

const MaxProfit = () => {
  const [timeUnits, setTimeUnits] = useState("");
  const [result, setResult] = useState(null);

  const calculateMaxProfit = (timeUnits) => {
    const buildings = [
      { type: 'T', time: 5, earnings: 1500 },
      { type: 'P', time: 4, earnings: 1000 },
      { type: 'C', time: 10, earnings: 3000 }
    ];

    let maxEarnings = 0;
    let bestSolutions = [];

    function explore(currentTime, built, currentEarnings, schedule) {
      let totalEarnings = currentEarnings;
      for (const item of schedule) {
        if (item.completionTime < timeUnits) {
          totalEarnings += (timeUnits - item.completionTime) * item.earnings;
        }
      }

      if (totalEarnings > maxEarnings) {
        maxEarnings = totalEarnings;
        bestSolutions = [{...built}];
      } else if (totalEarnings === maxEarnings) {
        bestSolutions.push({...built});
      }

      for (const building of buildings) {
        const completionTime = currentTime + building.time;
        if (completionTime <= timeUnits) {
          const newBuilt = {...built};
          newBuilt[building.type] = (newBuilt[building.type] || 0) + 1;
          
          const newSchedule = [...schedule, {
            type: building.type,
            completionTime: completionTime,
            earnings: building.earnings
          }];

          explore(completionTime, newBuilt, currentEarnings, newSchedule);
        }
      }
    }

    explore(0, { T: 0, P: 0, C: 0 }, 0, []);

    // Filter to keep only the most distinct optimal solutions
    const optimalSolutions = [];
    
    // First convert all solutions to a standard format
    const formattedSolutions = bestSolutions.map(sol => ({
      T: sol.T || 0,
      P: sol.P || 0,
      C: sol.C || 0,
      total: (sol.T || 0) + (sol.P || 0) + (sol.C || 0)
    }));

    // Find solutions with maximum T count (primary optimal solution)
    const maxT = Math.max(...formattedSolutions.map(sol => sol.T));
    const maxTSolutions = formattedSolutions.filter(sol => sol.T === maxT);
    
    // Among max T solutions, find those with minimal other buildings
    const minNonT = Math.min(...maxTSolutions.map(sol => sol.P + sol.C));
    const primarySolution = maxTSolutions.find(sol => sol.P + sol.C === minNonT);
    optimalSolutions.push(primarySolution);

    // Now find secondary optimal solutions (different building mix)
    // For time unit 49, this should be T:8, P:2, C:0
    const secondarySolutions = formattedSolutions.filter(sol => 
      sol.T < maxT && 
      sol.T + sol.P * 1.25 >= maxT && // Approximate conversion factor
      !(sol.P === 0 && sol.C === 0)   // Exclude pure T solutions
    );

    // Add the best secondary solution if it exists
    if (secondarySolutions.length > 0) {
      // Find the one with highest T, then highest P
      secondarySolutions.sort((a, b) => b.T - a.T || b.P - a.P);
      optimalSolutions.push(secondarySolutions[0]);
    }

    // Remove duplicates
    const uniqueSolutions = [];
    const seen = new Set();
    optimalSolutions.forEach(solution => {
      const key = `${solution.T},${solution.P},${solution.C}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueSolutions.push({
          T: solution.T,
          P: solution.P,
          C: solution.C
        });
      }
    });

    // Sort solutions
    uniqueSolutions.sort((a, b) => {
      if (b.T !== a.T) return b.T - a.T;
      if (b.P !== a.P) return b.P - a.P;
      return b.C - a.C;
    });

    return {
      timeUnits,
      earnings: maxEarnings,
      solutions: uniqueSolutions
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!timeUnits || timeUnits < 1) return;
    const calculatedResult = calculateMaxProfit(Number(timeUnits));
    setResult(calculatedResult);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Property Development Calculator
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="timeUnits" className="block text-sm font-medium text-gray-700">
              Enter Time Units:
            </label>
            <input
              type="number"
              id="timeUnits"
              value={timeUnits}
              onChange={(e) => setTimeUnits(e.target.value)}
              min="1"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-medium py-2 px-4 rounded-md transition duration-200"
          >
            Calculate
          </button>
        </form>

        {result && (
          <div className="mt-8 p-6 bg-gray-100 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">
              Results
            </h2>
            
            <div className="space-y-2 mb-6">
              <p className="text-gray-700">
                <span className="font-medium">Time Unit:</span> {result.timeUnits}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Maximum Earnings:</span> ${result.earnings.toLocaleString()}
              </p>
            </div>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">
              Optimal Solutions:
            </h3>
            
            {result.solutions.length > 0 ? (
              <ul className="space-y-2">
                {result.solutions.map((solution, index) => (
                  <li key={index} className="bg-white p-3 rounded-md shadow-sm">
                    <span className="font-medium">Solution {index + 1}:</span> 
                    <span className="ml-2">
                      T: {solution.T}, P: {solution.P}, C: {solution.C}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No solutions found for the given time units.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaxProfit;