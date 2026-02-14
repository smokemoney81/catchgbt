/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AGB from './pages/AGB';
import AI from './pages/AI';
import AIAssistant from './pages/AIAssistant';
import AIPage from './pages/AIPage';
import ARView from './pages/ARView';
import Analysis from './pages/Analysis';
import Arcade from './pages/Arcade';
import BaitMixer from './pages/BaitMixer';
import CatchCam from './pages/CatchCam';
import Community from './pages/Community';
import Dashboard from './pages/Dashboard';
import Datenschutz from './pages/Datenschutz';
import DeviceIntegration from './pages/DeviceIntegration';
import Devices from './pages/Devices';
import ExamPrep from './pages/ExamPrep';
import Gear from './pages/Gear';
import GearV1 from './pages/GearV1';
import Home from './pages/Home';
import Impressum from './pages/Impressum';
import Licenses from './pages/Licenses';
import Log from './pages/Log';
import Logbook from './pages/Logbook';
import Map from './pages/Map';
import MapPage from './pages/MapPage';
import Match3Game from './pages/Match3Game';
import Premium from './pages/Premium';
import PremiumDebug from './pages/PremiumDebug';
import PremiumPlans from './pages/PremiumPlans';
import Profile from './pages/Profile';
import Quiz from './pages/Quiz';
import Rank from './pages/Rank';
import Ranking from './pages/Ranking';
import Rules from './pages/Rules';
import RulesPage from './pages/RulesPage';
import Settings from './pages/Settings';
import Shop from './pages/Shop';
import Start from './pages/Start';
import StartFishing from './pages/StartFishing';
import TripPlanner from './pages/TripPlanner';
import Tutorials from './pages/Tutorials';
import UsedGear from './pages/UsedGear';
import VoiceControl from './pages/VoiceControl';
import WaterAnalysis from './pages/WaterAnalysis';
import Weather from './pages/Weather';
import WeatherAlerts from './pages/WeatherAlerts';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AGB": AGB,
    "AI": AI,
    "AIAssistant": AIAssistant,
    "AIPage": AIPage,
    "ARView": ARView,
    "Analysis": Analysis,
    "Arcade": Arcade,
    "BaitMixer": BaitMixer,
    "CatchCam": CatchCam,
    "Community": Community,
    "Dashboard": Dashboard,
    "Datenschutz": Datenschutz,
    "DeviceIntegration": DeviceIntegration,
    "Devices": Devices,
    "ExamPrep": ExamPrep,
    "Gear": Gear,
    "GearV1": GearV1,
    "Home": Home,
    "Impressum": Impressum,
    "Licenses": Licenses,
    "Log": Log,
    "Logbook": Logbook,
    "Map": Map,
    "MapPage": MapPage,
    "Match3Game": Match3Game,
    "Premium": Premium,
    "PremiumDebug": PremiumDebug,
    "PremiumPlans": PremiumPlans,
    "Profile": Profile,
    "Quiz": Quiz,
    "Rank": Rank,
    "Ranking": Ranking,
    "Rules": Rules,
    "RulesPage": RulesPage,
    "Settings": Settings,
    "Shop": Shop,
    "Start": Start,
    "StartFishing": StartFishing,
    "TripPlanner": TripPlanner,
    "Tutorials": Tutorials,
    "UsedGear": UsedGear,
    "VoiceControl": VoiceControl,
    "WaterAnalysis": WaterAnalysis,
    "Weather": Weather,
    "WeatherAlerts": WeatherAlerts,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};