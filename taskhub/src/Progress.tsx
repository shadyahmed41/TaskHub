import React from "react";
import { FaCheck, FaTimes } from "react-icons/fa"; // Assuming you're using FontAwesome icons


interface ProgressProps {
  radius: number;
  strokeWidth: number;
  percentage: number; // Add percentage prop 
  status: string;
}

function Progress({ radius, strokeWidth, percentage, status  }: ProgressProps) {
  // const [percentage, setPercentage] = useState([100]);

  // const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = parseInt(e.target.value);
  //   if (!isNaN(value) && value >= 0 && value <= 100) {
  //     setPercentage(value);
  //   }
  // };

  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const progress = (percentage / 100) * circumference;
  const strokeDashoffset = circumference - progress;

  const textX = radius;
  const textY = radius;

  const iconPosition = radius / Math.sqrt(2);

  return (
    <div style={{margin: 0, padding: 0}}>
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="#ddd"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="green"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          style={{
            strokeDashoffset,
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
          }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {status === 'completed' && (
          <g transform={`translate(${iconPosition}, ${iconPosition})`}>
            <FaCheck
              color="green"
              size={radius * 0.6} // Adjust size if needed
              style={{ transform: 'translate(-50%, -50%)' }}
            />
          </g>
        )}
      
         {status !== 'completed' &&  (
           <>
        <text
          x={textX}
          y={textY}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={radius / 3}
        >
         {percentage}%
        </text>
        </>
         )}
        
      </svg>
    </div>
  );
}

export default Progress;

//  import React from "react";
//  import { FaCheck, FaTimes } from "react-icons/fa";

//  interface ProgressProps {
//   radius: number;
//   strokeWidth: number;
//   percentage: number; // Keep percentage prop
//   status: string; // Add status prop
// }

// function Progress({ radius, strokeWidth, percentage, status }: ProgressProps) {
//   const normalizedRadius = radius - strokeWidth / 2;
//   const circumference = 2 * Math.PI * normalizedRadius;
//   const progress = (percentage / 100) * circumference;
//   const strokeDashoffset = circumference - progress;
//   const textX = radius;
//   const textY = radius;

//   return (
//     <div style={{ marginRight: '50px', marginBottom: '50px' }}>
//       <svg height={radius * 2} width={radius * 2}>
//         <circle
//           stroke="#ddd"
//           fill="transparent"
//           strokeWidth={strokeWidth}
//           r={normalizedRadius}
//           cx={radius}
//           cy={radius}
//         />
//         {status === 'completed' && (
//           <>
//             <circle cx={radius} cy={radius} r={normalizedRadius} fill="green" />
//             <FaCheck
//               color="white"
//               size={radius * 0.5} // Adjust size if needed
//               style={{
//                 position: "absolute",
//                 top: "50%",
//                 left: "50%",
//                 transform: "translate(-50%, -50%)"
//               }}
//             />
//           </>
//         )}
//         {status === 'not submitted' && (
//           <>
//             <circle cx={radius} cy={radius} r={normalizedRadius} fill="red" />
//             <FaTimes
//               color="white"
//               size={radius * 0.5} // Adjust size if needed
//               style={{
//                 position: "absolute",
//                 top: "50%",
//                 left: "50%",
//                 transform: "translate(-50%, -50%)"
//               }}
//             />
//           </>
//         )}
//         {status !== 'completed' && status !== 'not submitted' && (
//           <>
//             <circle
//               stroke={status === 'completed' ? 'green' : 'transparent'}
//               fill={status === 'completed' ? 'green' : 'transparent'}
//               strokeWidth={strokeWidth}
//               strokeDasharray={circumference}
//               style={{
//                 strokeDashoffset,
//                 transform: "rotate(-90deg)",
//                 transformOrigin: "50% 50%",
//               }}
//               r={normalizedRadius}
//               cx={radius}
//               cy={radius}
//             />
//             <text
//               x={textX}
//               y={textY}
//               textAnchor="middle"
//               dominantBaseline="middle"
//               fontSize={radius / 3}
//             >
//               {percentage}%
//             </text>
//           </>
//         )}
//       </svg>
//     </div>
//   );
// }

// export default Progress;


