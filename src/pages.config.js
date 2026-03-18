import React, { lazy } from 'react';
import __Layout from './Layout.jsx';

const AGB = lazy(() => import('./pages/AGB'));
const AI = lazy(() => import('./pages/AI'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const AIPage = lazy(() => import('./pages/AIPage'));
const ARView = lazy(() => import('./pages/ARView'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const Analysis = lazy(() => import('./pages/Analysis'));
const AngelscheinPruefungSchonzeiten = lazy(() => import('./pages/AngelscheinPruefungSchonzeiten'));
const BaitMixer = lazy(() => import('./pages/BaitMixer'));
const CatchCam = lazy(() => import('./pages/CatchCam'));
const Community = lazy(() => import('./pages/Community'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Datenschutz = lazy(() => import('./pages/Datenschutz'));
const DeviceIntegration = lazy(() => import('./pages/DeviceIntegration'));
const Devices = lazy(() => import('./pages/Devices'));
const FunctionRatings = lazy(() => import('./pages/FunctionRatings'));
const Gear = lazy(() => import('./pages/Gear'));
const GearV1 = lazy(() => import('./pages/GearV1'));
const Home = lazy(() => import('./pages/Home'));
const Impressum = lazy(() => import('./pages/Impressum'));
const Licenses = lazy(() => import('./pages/Licenses'));
const Log = lazy(() => import('./pages/Log'));
const Logbook = lazy(() => import('./pages/Logbook'));
const Map = lazy(() => import('./pages/Map'));
const MapPage = lazy(() => import('./pages/MapPage'));
const Match3Game = lazy(() => import('./pages/Match3Game'));
const Premium = lazy(() => import('./pages/Premium'));
const PremiumDebug = lazy(() => import('./pages/PremiumDebug'));
const PremiumPlans = lazy(() => import('./pages/PremiumPlans'));
const Profile = lazy(() => import('./pages/Profile'));
const Quiz = lazy(() => import('./pages/Quiz'));
const Rank = lazy(() => import('./pages/Rank'));
const Settings = lazy(() => import('./pages/Settings'));
const Shop = lazy(() => import('./pages/Shop'));
const Start = lazy(() => import('./pages/Start'));
const StartFishing = lazy(() => import('./pages/StartFishing'));
const TripPlanner = lazy(() => import('./pages/TripPlanner'));
const Tutorials = lazy(() => import('./pages/Tutorials'));
const UsedGear = lazy(() => import('./pages/UsedGear'));
const VoiceControl = lazy(() => import('./pages/VoiceControl'));
const WaterAnalysis = lazy(() => import('./pages/WaterAnalysis'));
const Weather = lazy(() => import('./pages/Weather'));

export const PAGES = {
    "AGB": AGB,
    "AI": AI,
    "AIAssistant": AIAssistant,
    "AIPage": AIPage,
    "ARView": ARView,
    "AdminUsers": AdminUsers,
    "Analysis": Analysis,
    "AngelscheinPruefungSchonzeiten": AngelscheinPruefungSchonzeiten,
    "BaitMixer": BaitMixer,
    "CatchCam": CatchCam,
    "Community": Community,
    "Dashboard": Dashboard,
    "Datenschutz": Datenschutz,
    "DeviceIntegration": DeviceIntegration,
    "Devices": Devices,
    "FunctionRatings": FunctionRatings,
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
};

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};