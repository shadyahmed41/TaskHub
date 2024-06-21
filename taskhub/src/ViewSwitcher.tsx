import React, { FC, useState }  from "react";
import './css/Calender.css'
import "gantt-task-react/dist/index.css";
import { ViewMode } from "gantt-task-react";
type ViewSwitcherProps = {
  isChecked: boolean;
  onViewListChange: (isChecked: boolean) => void;
  onViewModeChange: (viewMode: ViewMode) => void;
};
export const ViewSwitcher: FC<ViewSwitcherProps> = ({
  onViewModeChange,
  onViewListChange,
  isChecked
}: any) => {

  const [activeButton, setActiveButton] = useState<ViewMode | null>(null);

  const handleButtonClick = (viewMode: ViewMode) => {
    onViewModeChange(viewMode);
    setActiveButton(viewMode);
  };
  
  return (
    <div className="ViewContainer" style={{width:'75vw', height: '100px', position: 'relative', top: "-120px"}}>
      {/* Chart Preferences */}
      <div style={{position: 'absolute', right: '90px', display: 'flex', flexDirection: 'column'}}>
      Chart Time Preferences: 
      <div style={{display: 'flex', marginTop: '15px'}}>
      <button
        className={`CPButton ${activeButton === ViewMode.QuarterDay ? 'activeCPButton' : 'notActive'}`}
        onClick={() => {handleButtonClick(ViewMode.QuarterDay), onViewModeChange(ViewMode.QuarterDay)}}
      >
        Quarter of Day
      </button>
      <button
        className={`CPButton ${activeButton === ViewMode.HalfDay ? 'activeCPButton' : 'notActive'}`}
        onClick={() => {handleButtonClick(ViewMode.HalfDay), onViewModeChange(ViewMode.HalfDay)}}
      >
        Half of Day
      </button>
      <button 
      className={`CPButton ${activeButton === ViewMode.Day ? 'activeCPButton' : 'notActive'}`}
      onClick={() => {handleButtonClick(ViewMode.Day), onViewModeChange(ViewMode.Day)}}
      >
        Days
      </button>
      <button
        className={`CPButton ${activeButton === ViewMode.Week ? 'activeCPButton' : 'notActive'}`}
        onClick={() => {handleButtonClick(ViewMode.Week), onViewModeChange(ViewMode.Week)}}
      >
        Weeks
      </button>
      <button
        className={`CPButton ${activeButton === ViewMode.Month ? 'activeCPButton' : 'notActive'}`}
        onClick={() => {handleButtonClick(ViewMode.Month), onViewModeChange(ViewMode.Month)}}
      >
        Months
      </button>
      </div>
      </div>

      {/* Task List */}
      <div style={{position: 'absolute', top: '-30px'}}>
        <div>Display Prefrences:</div>
      <div className="Switch" style={{width: '200px', display: 'flex', marginLeft: '20px'}}>
        Show Task List
        <label className="Switch_Toggle">
          <input
            type="checkbox"
            defaultChecked={isChecked}
            onClick={() => onViewListChange(!isChecked)}
          />
          <span className="Slider" />
        </label>
      </div>
      </div>
    </div>
  );
};
