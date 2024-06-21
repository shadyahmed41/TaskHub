import { useLocation } from 'react-router-dom';
import './css/loading.css';
import NavBarBig from "./NavBarBig";

function Loading(props: any){
  const { nonavbar } = props;    
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const source = queryParams.get("source");
    return(
        <div>
            {(source != "outside" && nonavbar != "no") && <NavBarBig />}
        <div className="loading">
            <div className="ring"></div>
            <div className="ring"></div>
            <div className="ring"></div>
            <div className="ring"></div>
            <div className="loaddingtext">Loading</div>
        </div>
        </div>
    );
}
export default Loading