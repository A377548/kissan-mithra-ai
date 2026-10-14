import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_BASE_URL = "http://localhost:5000/api";

const languages = [
  { code: "te", name: "తెలుగు" },
  { code: "hi", name: "हिन्दी" },
  { code: "kn", name: "ಕನ್ನಡ" },
  { code: "ta", name: "தமிழ்" },
  { code: "mr", name: "मराठी" },
  { code: "en", name: "English" },
];

const cropOptions = [
  {
    value: "Rice",
    labels: {
      en: "Rice",
      te: "వరి",
      hi: "धान",
      kn: "ಅಕ್ಕಿ",
      ta: "நெல்",
      mr: "तांदूळ",
    },
  },
  {
    value: "Cotton",
    labels: {
      en: "Cotton",
      te: "పత్తి",
      hi: "कपास",
      kn: "ಹತ್ತಿ",
      ta: "பருத்தி",
      mr: "कापूस",
    },
  },
  {
    value: "Maize",
    labels: {
      en: "Maize",
      te: "మొక్కజొన్న",
      hi: "मक्का",
      kn: "ಮೆಕ್ಕೆಜೋಳ",
      ta: "மக்காச்சோளம்",
      mr: "मका",
    },
  },
];

const cropStageOptions = [
  {
    value: "Seedling",
    labels: {
      en: "Seedling",
      te: "మొలక దశ",
      hi: "पौध अवस्था",
      kn: "ಸಸಿ ಹಂತ",
      ta: "நாற்று நிலை",
      mr: "रोप अवस्था",
    },
  },
  {
    value: "Vegetative",
    labels: {
      en: "Vegetative",
      te: "వృద్ధి దశ",
      hi: "वानस्पतिक अवस्था",
      kn: "ಸಸ್ಯ ಬೆಳವಣಿಗೆ ಹಂತ",
      ta: "வளர்ச்சி நிலை",
      mr: "वाढीची अवस्था",
    },
  },
  {
    value: "Flowering",
    labels: {
      en: "Flowering",
      te: "పుష్పించే దశ",
      hi: "फूल आने की अवस्था",
      kn: "ಹೂ ಬಿಡುವ ಹಂತ",
      ta: "பூக்கும் நிலை",
      mr: "फुलोरा अवस्था",
    },
  },
  {
    value: "Maturity",
    labels: {
      en: "Maturity",
      te: "పక్వ దశ",
      hi: "परिपक्व अवस्था",
      kn: "ಪಕ್ವ ಹಂತ",
      ta: "முதிர்ச்சி நிலை",
      mr: "परिपक्व अवस्था",
    },
  },
];

const soilOptions = [
  {
    value: "Clay",
    labels: {
      en: "Clay",
      te: "బంకమట్టి",
      hi: "चिकनी मिट्टी",
      kn: "ಜೇಡಿ ಮಣ್ಣು",
      ta: "களிமண்",
      mr: "चिकणमाती",
    },
  },
  {
    value: "Loamy",
    labels: {
      en: "Loamy",
      te: "లోమీ మట్టి",
      hi: "दोमट मिट्टी",
      kn: "ಲೋಮಿ ಮಣ್ಣು",
      ta: "வண்டல் மண்",
      mr: "लोम माती",
    },
  },
  {
    value: "Sandy",
    labels: {
      en: "Sandy",
      te: "ఇసుక మట్టి",
      hi: "बलुई मिट्टी",
      kn: "ಮರಳು ಮಣ್ಣು",
      ta: "மணல் மண்",
      mr: "वालुकामय माती",
    },
  },
];

const irrigationOptions = [
  {
    value: "Flood",
    labels: {
      en: "Flood",
      te: "కాలువ/ముంపు పద్ధతి",
      hi: "बाढ़ सिंचाई",
      kn: "ಹೊಳೆ ನೀರಾವರಿ",
      ta: "வெள்ளப் பாசனம்",
      mr: "पाट सिंचन",
    },
  },
  {
    value: "Drip",
    labels: {
      en: "Drip",
      te: "బిందు సేద్యం",
      hi: "ड्रिप सिंचाई",
      kn: "ಹನಿ ನೀರಾವರಿ",
      ta: "சொட்டு நீர்ப்பாசனம்",
      mr: "ठिबक सिंचन",
    },
  },
  {
    value: "Sprinkler",
    labels: {
      en: "Sprinkler",
      te: "స్ప్రింక్లర్",
      hi: "स्प्रिंकलर",
      kn: "ಸ್ಪ್ರಿಂಕ್ಲರ್",
      ta: "தெளிப்பு நீர்ப்பாசனம்",
      mr: "तुषार सिंचन",
    },
  },
];

const uiTranslations = {
  en: {
    brandTitle: "Kisaan Mithra AI",
    subtitle: "From Farm Data to the Right Decision",
    chooseLanguage: "Choose Your Language",
    languageDescription: "Select the language you prefer to use.",
    smartAssistant: "Smart Farming Assistant",
    farmQuestion: "What should I do on my farm today?",
    heroDescription:
      "Get practical recommendations using your farm details and local weather conditions.",
    irrigationRecommendation: "Irrigation Recommendation",
    diseaseRecommendation: "Disease Recommendation",
    step1: "Step 1",
    farmDetails: "Farm Details",
    crop: "Crop",
    cropStage: "Crop Stage",
    soilType: "Soil Type",
    irrigationMethod: "Irrigation Method",
    farmLocation: "Farm Location",
    locationDescription:
      "Your location helps us understand local weather conditions.",
    useLocation: "📍 Use My Current Location",
    detectingLocation: "Detecting location...",
    locationSuccess: "Location detected successfully.",
    locationDetected: "Location detected",
    getRecommendation: "Get Recommendation",
    gettingRecommendation: "Analyzing...",
    step2: "Step 2",
    todaysRecommendation: "Today's Recommendation",
    recommendationPlaceholder:
      "Your personalized irrigation recommendation will appear here.",
    recommendationInstructions:
      "Complete your farm details and location to get a recommendation.",
    analyzing: "Analyzing your farm...",
    analyzingDescription:
      "We're checking weather conditions and farm details.",
    recommendedAction: "Recommended Action",
    currentWeather: "Current Weather",
    temperature: "Temperature",
    humidity: "Humidity",
    rain: "Rain",
    wind: "Wind",
    farmProfile: "Farm Profile",
    stage: "Stage",
    soil: "Soil",
    irrigation: "Irrigation",
    diseaseTitle: "Crop Disease Recommendation",
    diseaseDescription:
      "Describe or show the symptoms of your crop. You can use an image, voice, text, or any combination.",
    selectDiseaseCrop: "Select Crop for Disease Analysis",
    diseaseCropDescription:
      "Choose the crop you want to examine.",
    uploadImage: "Upload Crop Image",
    imageOptional: "Optional",
    chooseImage: "Choose Image",
    removeImage: "Remove Image",
    voiceSymptoms: "Voice Description",
    voiceOptional: "Optional",
    startRecording: "Start Recording",
    stopRecording: "Stop Recording",
    recording: "Recording...",
    textSymptoms: "Describe the Symptoms",
    textPlaceholder:
      "Example: Brown spots are appearing on the leaves...",
    textOptional: "Optional",
    analyzeCrop: "Analyze Crop",
    analyzingCrop: "Analyzing Crop...",
    provideInput:
      "Please provide an image or text description. Voice recording must be transcribed before it can be analyzed.",
    imageSelected: "Image selected",
    audioRecorded: "Voice recording ready",
    diseaseResult: "Disease Analysis",
    predictedDisease: "Likely Issue",
    confidence: "Confidence",
    whyThisResult: "Why this was predicted",
    whatToDo: "What You Should Do",
    safetyNote:
      "AI-assisted result. For serious or uncertain cases, consult a local agricultural expert.",
    noResult:
      "Your disease analysis will appear here after you analyze the crop.",
    locationError:
      "Unable to detect your location. Please allow location access.",
    detectLocationFirst: "Please detect your farm location first.",
    backendError:
      "Unable to connect to the backend. Please make sure the server is running.",
    imageReadError: "Unable to read the selected image.",
    invalidImage: "Please select a valid image file.",
  },

  te: {
    brandTitle: "కిసాన్ మిత్ర AI",
    subtitle: "పంట సమాచారం నుండి సరైన నిర్ణయం వరకు",
    chooseLanguage: "మీ భాషను ఎంచుకోండి",
    languageDescription: "మీకు అనుకూలమైన భాషను ఎంచుకోండి.",
    smartAssistant: "స్మార్ట్ వ్యవసాయ సహాయకుడు",
    farmQuestion: "ఈరోజు నా పొలంలో నేను ఏమి చేయాలి?",
    heroDescription:
      "మీ పంట వివరాలు మరియు స్థానిక వాతావరణ పరిస్థితుల ఆధారంగా సూచనలు పొందండి.",
    irrigationRecommendation: "నీటిపారుదల సూచన",
    diseaseRecommendation: "పంట వ్యాధి సూచన",
    step1: "దశ 1",
    farmDetails: "పొలం వివరాలు",
    crop: "పంట",
    cropStage: "పంట దశ",
    soilType: "మట్టి రకం",
    irrigationMethod: "నీటిపారుదల విధానం",
    farmLocation: "పొలం స్థానం",
    locationDescription:
      "స్థానిక వాతావరణ పరిస్థితులను అర్థం చేసుకోవడానికి మీ స్థానం అవసరం.",
    useLocation: "📍 నా ప్రస్తుత స్థానాన్ని ఉపయోగించండి",
    detectingLocation: "స్థానాన్ని గుర్తిస్తోంది...",
    locationSuccess: "స్థానం విజయవంతంగా గుర్తించబడింది.",
    locationDetected: "స్థానం గుర్తించబడింది",
    getRecommendation: "సూచన పొందండి",
    gettingRecommendation: "విశ్లేషిస్తోంది...",
    step2: "దశ 2",
    todaysRecommendation: "ఈరోజు సూచన",
    recommendationPlaceholder:
      "మీ వ్యక్తిగత నీటిపారుదల సూచన ఇక్కడ కనిపిస్తుంది.",
    recommendationInstructions:
      "సూచన పొందడానికి మీ పొలం వివరాలు మరియు స్థానాన్ని నమోదు చేయండి.",
    analyzing: "మీ పొలాన్ని విశ్లేషిస్తోంది...",
    analyzingDescription:
      "వాతావరణ పరిస్థితులు మరియు పొలం వివరాలను పరిశీలిస్తున్నాము.",
    recommendedAction: "సిఫార్సు చేసిన చర్య",
    currentWeather: "ప్రస్తుత వాతావరణం",
    temperature: "ఉష్ణోగ్రత",
    humidity: "తేమ",
    rain: "వర్షం",
    wind: "గాలి",
    farmProfile: "పొలం వివరాలు",
    stage: "దశ",
    soil: "మట్టి",
    irrigation: "నీటిపారుదల",
    diseaseTitle: "పంట వ్యాధి సూచన",
    diseaseDescription:
      "మీ పంట లక్షణాలను వివరించండి లేదా చూపించండి. చిత్రం లేదా టెక్స్ట్‌ను ఉపయోగించవచ్చు.",
    selectDiseaseCrop: "వ్యాధి విశ్లేషణ కోసం పంటను ఎంచుకోండి",
    diseaseCropDescription: "విశ్లేషించాల్సిన పంటను ఎంచుకోండి.",
    uploadImage: "పంట చిత్రాన్ని అప్‌లోడ్ చేయండి",
    imageOptional: "ఐచ్ఛికం",
    chooseImage: "చిత్రాన్ని ఎంచుకోండి",
    removeImage: "చిత్రాన్ని తొలగించండి",
    voiceSymptoms: "వాయిస్ వివరణ",
    voiceOptional: "ఐచ్ఛికం",
    startRecording: "రికార్డింగ్ ప్రారంభించండి",
    stopRecording: "రికార్డింగ్ ఆపండి",
    recording: "రికార్డింగ్ జరుగుతోంది...",
    textSymptoms: "లక్షణాలను వివరించండి",
    textPlaceholder:
      "ఉదాహరణ: ఆకులపై గోధుమ రంగు మచ్చలు కనిపిస్తున్నాయి...",
    textOptional: "ఐచ్ఛికం",
    analyzeCrop: "పంటను విశ్లేషించండి",
    analyzingCrop: "పంటను విశ్లేషిస్తోంది...",
    provideInput: "దయచేసి పంట చిత్రం లేదా టెక్స్ట్ వివరణ ఇవ్వండి.",
    imageSelected: "చిత్రం ఎంచుకోబడింది",
    audioRecorded: "వాయిస్ రికార్డింగ్ సిద్ధంగా ఉంది",
    diseaseResult: "వ్యాధి విశ్లేషణ",
    predictedDisease: "సంభావ్య సమస్య",
    confidence: "నమ్మక స్థాయి",
    whyThisResult: "ఈ ఫలితానికి కారణం",
    whatToDo: "మీరు చేయాల్సింది",
    safetyNote:
      "ఇది AI ఆధారిత సూచన. తీవ్రమైన లేదా అనిశ్చిత సందర్భాల్లో వ్యవసాయ నిపుణుడిని సంప్రదించండి.",
    noResult: "పంటను విశ్లేషించిన తర్వాత ఫలితం ఇక్కడ కనిపిస్తుంది.",
    locationError:
      "మీ స్థానాన్ని గుర్తించలేకపోయాము. దయచేసి లొకేషన్ అనుమతించండి.",
    detectLocationFirst: "ముందుగా మీ పొలం స్థానాన్ని గుర్తించండి.",
    backendError:
      "బ్యాక్‌ఎండ్‌కు కనెక్ట్ కాలేకపోయాము. సర్వర్ నడుస్తుందో తనిఖీ చేయండి.",
    imageReadError: "ఎంచుకున్న చిత్రాన్ని చదవలేకపోయాము.",
    invalidImage: "దయచేసి సరైన చిత్రాన్ని ఎంచుకోండి.",
  },

  hi: {
    brandTitle: "किसान मित्र AI",
    subtitle: "खेत के डेटा से सही निर्णय तक",
    chooseLanguage: "अपनी भाषा चुनें",
    languageDescription: "वह भाषा चुनें जिसे आप उपयोग करना चाहते हैं।",
    smartAssistant: "स्मार्ट कृषि सहायक",
    farmQuestion: "आज मुझे अपने खेत में क्या करना चाहिए?",
    heroDescription:
      "अपने खेत की जानकारी और स्थानीय मौसम के आधार पर उपयोगी सुझाव प्राप्त करें।",
    irrigationRecommendation: "सिंचाई सुझाव",
    diseaseRecommendation: "फसल रोग सुझाव",
    step1: "चरण 1",
    farmDetails: "खेत की जानकारी",
    crop: "फसल",
    cropStage: "फसल की अवस्था",
    soilType: "मिट्टी का प्रकार",
    irrigationMethod: "सिंचाई का तरीका",
    farmLocation: "खेत का स्थान",
    locationDescription:
      "स्थानीय मौसम की जानकारी के लिए आपके स्थान की आवश्यकता है।",
    useLocation: "📍 मेरा वर्तमान स्थान उपयोग करें",
    detectingLocation: "स्थान पता लगाया जा रहा है...",
    locationSuccess: "स्थान सफलतापूर्वक पता चला।",
    locationDetected: "स्थान पता चला",
    getRecommendation: "सुझाव प्राप्त करें",
    gettingRecommendation: "विश्लेषण हो रहा है...",
    step2: "चरण 2",
    todaysRecommendation: "आज का सुझाव",
    recommendationPlaceholder:
      "आपका व्यक्तिगत सिंचाई सुझाव यहां दिखाई देगा।",
    recommendationInstructions:
      "सुझाव पाने के लिए खेत की जानकारी और स्थान दर्ज करें।",
    analyzing: "आपके खेत का विश्लेषण हो रहा है...",
    analyzingDescription:
      "हम मौसम और खेत की जानकारी की जांच कर रहे हैं।",
    recommendedAction: "सुझाया गया कार्य",
    currentWeather: "वर्तमान मौसम",
    temperature: "तापमान",
    humidity: "नमी",
    rain: "बारिश",
    wind: "हवा",
    farmProfile: "खेत की जानकारी",
    stage: "अवस्था",
    soil: "मिट्टी",
    irrigation: "सिंचाई",
    diseaseTitle: "फसल रोग सुझाव",
    diseaseDescription:
      "अपनी फसल के लक्षण बताएं या दिखाएं। आप चित्र या टेक्स्ट का उपयोग कर सकते हैं।",
    selectDiseaseCrop: "रोग विश्लेषण के लिए फसल चुनें",
    diseaseCropDescription: "विश्लेषण के लिए फसल चुनें।",
    uploadImage: "फसल की तस्वीर अपलोड करें",
    imageOptional: "वैकल्पिक",
    chooseImage: "तस्वीर चुनें",
    removeImage: "तस्वीर हटाएं",
    voiceSymptoms: "आवाज़ में विवरण",
    voiceOptional: "वैकल्पिक",
    startRecording: "रिकॉर्डिंग शुरू करें",
    stopRecording: "रिकॉर्डिंग रोकें",
    recording: "रिकॉर्डिंग हो रही है...",
    textSymptoms: "लक्षणों का वर्णन करें",
    textPlaceholder:
      "उदाहरण: पत्तियों पर भूरे रंग के धब्बे दिखाई दे रहे हैं...",
    textOptional: "वैकल्पिक",
    analyzeCrop: "फसल का विश्लेषण करें",
    analyzingCrop: "फसल का विश्लेषण हो रहा है...",
    provideInput: "कृपया फसल की तस्वीर या टेक्स्ट विवरण दें।",
    imageSelected: "तस्वीर चुनी गई",
    audioRecorded: "आवाज़ की रिकॉर्डिंग तैयार है",
    diseaseResult: "रोग विश्लेषण",
    predictedDisease: "संभावित समस्या",
    confidence: "विश्वास स्तर",
    whyThisResult: "यह परिणाम क्यों आया",
    whatToDo: "आपको क्या करना चाहिए",
    safetyNote:
      "यह AI आधारित सुझाव है। गंभीर या अनिश्चित मामलों में कृषि विशेषज्ञ से सलाह लें।",
    noResult: "विश्लेषण के बाद परिणाम यहां दिखाई देगा।",
    locationError:
      "आपका स्थान पता नहीं चल सका। कृपया स्थान की अनुमति दें।",
    detectLocationFirst: "पहले अपने खेत का स्थान पता करें।",
    backendError:
      "बैकएंड से कनेक्ट नहीं हो पाया। कृपया सर्वर जांचें।",
    imageReadError: "चुनी गई तस्वीर पढ़ी नहीं जा सकी।",
    invalidImage: "कृपया एक मान्य तस्वीर चुनें।",
  },

  kn: {
    brandTitle: "ಕಿಸಾನ್ ಮಿತ್ರ AI",
    subtitle: "ಕೃಷಿ ಮಾಹಿತಿಯಿಂದ ಸರಿಯಾದ ನಿರ್ಧಾರಕ್ಕೆ",
    chooseLanguage: "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    languageDescription: "ನೀವು ಬಳಸಲು ಬಯಸುವ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    smartAssistant: "ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಹಾಯಕ",
    farmQuestion: "ಇಂದು ನನ್ನ ಹೊಲದಲ್ಲಿ ನಾನು ಏನು ಮಾಡಬೇಕು?",
    heroDescription:
      "ನಿಮ್ಮ ಹೊಲದ ಮಾಹಿತಿ ಮತ್ತು ಸ್ಥಳೀಯ ಹವಾಮಾನದ ಆಧಾರದ ಮೇಲೆ ಸಲಹೆ ಪಡೆಯಿರಿ.",
    irrigationRecommendation: "ನೀರಾವರಿ ಸಲಹೆ",
    diseaseRecommendation: "ಬೆಳೆ ರೋಗ ಸಲಹೆ",
    step1: "ಹಂತ 1",
    farmDetails: "ಹೊಲದ ವಿವರಗಳು",
    crop: "ಬೆಳೆ",
    cropStage: "ಬೆಳೆಯ ಹಂತ",
    soilType: "ಮಣ್ಣಿನ ವಿಧ",
    irrigationMethod: "ನೀರಾವರಿ ವಿಧಾನ",
    farmLocation: "ಹೊಲದ ಸ್ಥಳ",
    locationDescription:
      "ಸ್ಥಳೀಯ ಹವಾಮಾನವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ನಿಮ್ಮ ಸ್ಥಳ ಅಗತ್ಯವಿದೆ.",
    useLocation: "📍 ನನ್ನ ಪ್ರಸ್ತುತ ಸ್ಥಳವನ್ನು ಬಳಸಿ",
    detectingLocation: "ಸ್ಥಳ ಪತ್ತೆಹಚ್ಚಲಾಗುತ್ತಿದೆ...",
    locationSuccess: "ಸ್ಥಳ ಯಶಸ್ವಿಯಾಗಿ ಪತ್ತೆಯಾಗಿದೆ.",
    locationDetected: "ಸ್ಥಳ ಪತ್ತೆಯಾಗಿದೆ",
    getRecommendation: "ಸಲಹೆ ಪಡೆಯಿರಿ",
    gettingRecommendation: "ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    step2: "ಹಂತ 2",
    todaysRecommendation: "ಇಂದಿನ ಸಲಹೆ",
    recommendationPlaceholder:
      "ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ನೀರಾವರಿ ಸಲಹೆ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.",
    recommendationInstructions:
      "ಸಲಹೆ ಪಡೆಯಲು ಹೊಲದ ವಿವರಗಳು ಮತ್ತು ಸ್ಥಳವನ್ನು ನಮೂದಿಸಿ.",
    analyzing: "ನಿಮ್ಮ ಹೊಲವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    analyzingDescription:
      "ಹವಾಮಾನ ಮತ್ತು ಹೊಲದ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ.",
    recommendedAction: "ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮ",
    currentWeather: "ಪ್ರಸ್ತುತ ಹವಾಮಾನ",
    temperature: "ತಾಪಮಾನ",
    humidity: "ತೇವಾಂಶ",
    rain: "ಮಳೆ",
    wind: "ಗಾಳಿ",
    farmProfile: "ಹೊಲದ ವಿವರಗಳು",
    stage: "ಹಂತ",
    soil: "ಮಣ್ಣು",
    irrigation: "ನೀರಾವರಿ",
    diseaseTitle: "ಬೆಳೆ ರೋಗ ಸಲಹೆ",
    diseaseDescription:
      "ನಿಮ್ಮ ಬೆಳೆಯ ಲಕ್ಷಣಗಳನ್ನು ವಿವರಿಸಿ ಅಥವಾ ತೋರಿಸಿ. ಚಿತ್ರ ಅಥವಾ ಪಠ್ಯವನ್ನು ಬಳಸಿ.",
    selectDiseaseCrop: "ರೋಗ ವಿಶ್ಲೇಷಣೆಗೆ ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    diseaseCropDescription: "ವಿಶ್ಲೇಷಿಸಬೇಕಾದ ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    uploadImage: "ಬೆಳೆಯ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    imageOptional: "ಐಚ್ಛಿಕ",
    chooseImage: "ಚಿತ್ರ ಆಯ್ಕೆಮಾಡಿ",
    removeImage: "ಚಿತ್ರ ತೆಗೆದುಹಾಕಿ",
    voiceSymptoms: "ಧ್ವನಿ ವಿವರಣೆ",
    voiceOptional: "ಐಚ್ಛಿಕ",
    startRecording: "ರೆಕಾರ್ಡಿಂಗ್ ಪ್ರಾರಂಭಿಸಿ",
    stopRecording: "ರೆಕಾರ್ಡಿಂಗ್ ನಿಲ್ಲಿಸಿ",
    recording: "ರೆಕಾರ್ಡಿಂಗ್ ನಡೆಯುತ್ತಿದೆ...",
    textSymptoms: "ಲಕ್ಷಣಗಳನ್ನು ವಿವರಿಸಿ",
    textPlaceholder:
      "ಉದಾಹರಣೆ: ಎಲೆಗಳ ಮೇಲೆ ಕಂದು ಬಣ್ಣದ ಕಲೆಗಳು ಕಾಣಿಸುತ್ತಿವೆ...",
    textOptional: "ಐಚ್ಛಿಕ",
    analyzeCrop: "ಬೆಳೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
    analyzingCrop: "ಬೆಳೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    provideInput: "ದಯವಿಟ್ಟು ಬೆಳೆಯ ಚಿತ್ರ ಅಥವಾ ಪಠ್ಯ ವಿವರಣೆ ನೀಡಿ.",
    imageSelected: "ಚಿತ್ರ ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ",
    audioRecorded: "ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್ ಸಿದ್ಧವಾಗಿದೆ",
    diseaseResult: "ರೋಗ ವಿಶ್ಲೇಷಣೆ",
    predictedDisease: "ಸಂಭಾವ್ಯ ಸಮಸ್ಯೆ",
    confidence: "ವಿಶ್ವಾಸ ಮಟ್ಟ",
    whyThisResult: "ಈ ಫಲಿತಾಂಶ ಏಕೆ ಬಂದಿದೆ",
    whatToDo: "ನೀವು ಮಾಡಬೇಕಾದದ್ದು",
    safetyNote:
      "ಇದು AI ಆಧಾರಿತ ಸಲಹೆ. ಗಂಭೀರ ಸಂದರ್ಭಗಳಲ್ಲಿ ಕೃಷಿ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    noResult: "ವಿಶ್ಲೇಷಣೆಯ ನಂತರ ಫಲಿತಾಂಶ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.",
    locationError:
      "ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಪತ್ತೆಹಚ್ಚಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಸ್ಥಳ ಅನುಮತಿ ನೀಡಿ.",
    detectLocationFirst: "ಮೊದಲು ನಿಮ್ಮ ಹೊಲದ ಸ್ಥಳವನ್ನು ಪತ್ತೆಹಚ್ಚಿ.",
    backendError:
      "ಬ್ಯಾಕ್‌ಎಂಡ್‌ಗೆ ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಸರ್ವರ್ ಪರಿಶೀಲಿಸಿ.",
    imageReadError: "ಆಯ್ಕೆಮಾಡಿದ ಚಿತ್ರವನ್ನು ಓದಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    invalidImage: "ದಯವಿಟ್ಟು ಸರಿಯಾದ ಚಿತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
  },

  ta: {
    brandTitle: "கிசான் மித்ரா AI",
    subtitle: "பண்ணை தரவிலிருந்து சரியான முடிவுக்கு",
    chooseLanguage: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    languageDescription: "நீங்கள் பயன்படுத்த விரும்பும் மொழியைத் தேர்ந்தெடுக்கவும்.",
    smartAssistant: "ஸ்மார்ட் விவசாய உதவியாளர்",
    farmQuestion: "இன்று என் பண்ணையில் நான் என்ன செய்ய வேண்டும்?",
    heroDescription:
      "உங்கள் பண்ணை விவரங்கள் மற்றும் உள்ளூர் வானிலை அடிப்படையில் பரிந்துரைகளைப் பெறுங்கள்.",
    irrigationRecommendation: "நீர்ப்பாசன பரிந்துரை",
    diseaseRecommendation: "பயிர் நோய் பரிந்துரை",
    step1: "படி 1",
    farmDetails: "பண்ணை விவரங்கள்",
    crop: "பயிர்",
    cropStage: "பயிர் நிலை",
    soilType: "மண் வகை",
    irrigationMethod: "நீர்ப்பாசன முறை",
    farmLocation: "பண்ணை இருப்பிடம்",
    locationDescription: "உள்ளூர் வானிலையைப் புரிந்துகொள்ள உங்கள் இருப்பிடம் தேவை.",
    useLocation: "📍 எனது தற்போதைய இருப்பிடத்தைப் பயன்படுத்தவும்",
    detectingLocation: "இருப்பிடம் கண்டறியப்படுகிறது...",
    locationSuccess: "இருப்பிடம் வெற்றிகரமாக கண்டறியப்பட்டது.",
    locationDetected: "இருப்பிடம் கண்டறியப்பட்டது",
    getRecommendation: "பரிந்துரையைப் பெறுங்கள்",
    gettingRecommendation: "பகுப்பாய்வு செய்கிறது...",
    step2: "படி 2",
    todaysRecommendation: "இன்றைய பரிந்துரை",
    recommendationPlaceholder: "உங்கள் தனிப்பட்ட நீர்ப்பாசன பரிந்துரை இங்கே தோன்றும்.",
    recommendationInstructions: "பரிந்துரையைப் பெற பண்ணை விவரங்கள் மற்றும் இருப்பிடத்தை உள்ளிடவும்.",
    analyzing: "உங்கள் பண்ணை பகுப்பாய்வு செய்யப்படுகிறது...",
    analyzingDescription: "வானிலை மற்றும் பண்ணை விவரங்களைச் சரிபார்க்கிறோம்.",
    recommendedAction: "பரிந்துரைக்கப்பட்ட செயல்",
    currentWeather: "தற்போதைய வானிலை",
    temperature: "வெப்பநிலை",
    humidity: "ஈரப்பதம்",
    rain: "மழை",
    wind: "காற்று",
    farmProfile: "பண்ணை விவரம்",
    stage: "நிலை",
    soil: "மண்",
    irrigation: "நீர்ப்பாசனம்",
    diseaseTitle: "பயிர் நோய் பரிந்துரை",
    diseaseDescription: "உங்கள் பயிரின் அறிகுறிகளை விவரிக்கவும். படம் அல்லது உரையைப் பயன்படுத்தலாம்.",
    selectDiseaseCrop: "நோய் பகுப்பாய்வுக்குப் பயிரைத் தேர்ந்தெடுக்கவும்",
    diseaseCropDescription: "பகுப்பாய்வு செய்ய வேண்டிய பயிரைத் தேர்ந்தெடுக்கவும்.",
    uploadImage: "பயிர் படத்தை பதிவேற்றவும்",
    imageOptional: "விருப்பமானது",
    chooseImage: "படத்தைத் தேர்ந்தெடுக்கவும்",
    removeImage: "படத்தை அகற்றவும்",
    voiceSymptoms: "குரல் விளக்கம்",
    voiceOptional: "விருப்பமானது",
    startRecording: "பதிவைத் தொடங்கவும்",
    stopRecording: "பதிவை நிறுத்தவும்",
    recording: "பதிவு செய்யப்படுகிறது...",
    textSymptoms: "அறிகுறிகளை விவரிக்கவும்",
    textPlaceholder: "உதாரணம்: இலைகளில் பழுப்பு நிற புள்ளிகள் தோன்றுகின்றன...",
    textOptional: "விருப்பமானது",
    analyzeCrop: "பயிரை பகுப்பாய்வு செய்யவும்",
    analyzingCrop: "பயிர் பகுப்பாய்வு செய்யப்படுகிறது...",
    provideInput: "பயிர் படம் அல்லது உரை விளக்கத்தை வழங்கவும்.",
    imageSelected: "படம் தேர்ந்தெடுக்கப்பட்டது",
    audioRecorded: "குரல் பதிவு தயாராக உள்ளது",
    diseaseResult: "நோய் பகுப்பாய்வு",
    predictedDisease: "சாத்தியமான பிரச்சனை",
    confidence: "நம்பகத்தன்மை",
    whyThisResult: "இந்த முடிவு ஏன் வந்தது",
    whatToDo: "நீங்கள் செய்ய வேண்டியது",
    safetyNote: "இது AI அடிப்படையிலான பரிந்துரை. தேவையானபோது வேளாண் நிபுணரை அணுகவும்.",
    noResult: "பகுப்பாய்வுக்குப் பிறகு முடிவு இங்கே தோன்றும்.",
    locationError: "உங்கள் இருப்பிடத்தைக் கண்டறிய முடியவில்லை. இருப்பிட அனுமதியை வழங்கவும்.",
    detectLocationFirst: "முதலில் உங்கள் பண்ணை இருப்பிடத்தைக் கண்டறியவும்.",
    backendError: "பின்தளத்துடன் இணைக்க முடியவில்லை. சேவையகத்தைச் சரிபார்க்கவும்.",
    imageReadError: "தேர்ந்தெடுத்த படத்தைப் படிக்க முடியவில்லை.",
    invalidImage: "சரியான படத்தைத் தேர்ந்தெடுக்கவும்.",
  },

  mr: {
    brandTitle: "किसान मित्र AI",
    subtitle: "शेतातील माहितीपासून योग्य निर्णयापर्यंत",
    chooseLanguage: "तुमची भाषा निवडा",
    languageDescription: "तुम्हाला वापरायची असलेली भाषा निवडा.",
    smartAssistant: "स्मार्ट शेती सहाय्यक",
    farmQuestion: "आज माझ्या शेतात मी काय करावे?",
    heroDescription:
      "तुमच्या शेताची माहिती आणि स्थानिक हवामानाच्या आधारे उपयुक्त सल्ला मिळवा.",
    irrigationRecommendation: "सिंचन सल्ला",
    diseaseRecommendation: "पिक रोग सल्ला",
    step1: "पायरी 1",
    farmDetails: "शेताची माहिती",
    crop: "पीक",
    cropStage: "पिकाची अवस्था",
    soilType: "मातीचा प्रकार",
    irrigationMethod: "सिंचन पद्धत",
    farmLocation: "शेताचे स्थान",
    locationDescription: "स्थानिक हवामान समजून घेण्यासाठी तुमचे स्थान आवश्यक आहे.",
    useLocation: "📍 माझे सध्याचे स्थान वापरा",
    detectingLocation: "स्थान शोधत आहे...",
    locationSuccess: "स्थान यशस्वीरित्या शोधले.",
    locationDetected: "स्थान शोधले",
    getRecommendation: "सल्ला मिळवा",
    gettingRecommendation: "विश्लेषण करत आहे...",
    step2: "पायरी 2",
    todaysRecommendation: "आजचा सल्ला",
    recommendationPlaceholder: "तुमचा वैयक्तिक सिंचन सल्ला येथे दिसेल.",
    recommendationInstructions: "सल्ला मिळवण्यासाठी शेताची माहिती आणि स्थान द्या.",
    analyzing: "तुमच्या शेताचे विश्लेषण करत आहे...",
    analyzingDescription: "आम्ही हवामान आणि शेताची माहिती तपासत आहोत.",
    recommendedAction: "शिफारस केलेली कृती",
    currentWeather: "सध्याचे हवामान",
    temperature: "तापमान",
    humidity: "आर्द्रता",
    rain: "पाऊस",
    wind: "वारा",
    farmProfile: "शेताची माहिती",
    stage: "अवस्था",
    soil: "माती",
    irrigation: "सिंचन",
    diseaseTitle: "पिक रोग सल्ला",
    diseaseDescription: "तुमच्या पिकाची लक्षणे सांगा किंवा दाखवा. चित्र किंवा मजकूर वापरा.",
    selectDiseaseCrop: "रोग विश्लेषणासाठी पीक निवडा",
    diseaseCropDescription: "विश्लेषणासाठी पीक निवडा.",
    uploadImage: "पिकाचा फोटो अपलोड करा",
    imageOptional: "ऐच्छिक",
    chooseImage: "फोटो निवडा",
    removeImage: "फोटो काढा",
    voiceSymptoms: "आवाजातील वर्णन",
    voiceOptional: "ऐच्छिक",
    startRecording: "रेकॉर्डिंग सुरू करा",
    stopRecording: "रेकॉर्डिंग थांबवा",
    recording: "रेकॉर्डिंग सुरू आहे...",
    textSymptoms: "लक्षणांचे वर्णन करा",
    textPlaceholder: "उदाहरण: पानांवर तपकिरी रंगाचे डाग दिसत आहेत...",
    textOptional: "ऐच्छिक",
    analyzeCrop: "पिकाचे विश्लेषण करा",
    analyzingCrop: "पिकाचे विश्लेषण करत आहे...",
    provideInput: "कृपया पिकाचा फोटो किंवा मजकूर वर्णन द्या.",
    imageSelected: "फोटो निवडला आहे",
    audioRecorded: "आवाजाचे रेकॉर्डिंग तयार आहे",
    diseaseResult: "रोग विश्लेषण",
    predictedDisease: "संभाव्य समस्या",
    confidence: "विश्वास पातळी",
    whyThisResult: "हा परिणाम का आला",
    whatToDo: "तुम्ही काय करावे",
    safetyNote: "हा AI आधारित सल्ला आहे. गरज असल्यास कृषी तज्ज्ञांचा सल्ला घ्या.",
    noResult: "विश्लेषणानंतर परिणाम येथे दिसेल.",
    locationError: "तुमचे स्थान शोधता आले नाही. कृपया स्थानाची परवानगी द्या.",
    detectLocationFirst: "प्रथम तुमच्या शेताचे स्थान शोधा.",
    backendError: "बॅकएंडशी कनेक्ट करता आले नाही. सर्व्हर तपासा.",
    imageReadError: "निवडलेला फोटो वाचता आला नाही.",
    invalidImage: "कृपया योग्य फोटो निवडा.",
  },
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Unable to read image"));
        return;
      }

      resolve(reader.result.split(",")[1]);
    };

    reader.onerror = () => {
      reject(new Error("Unable to read image"));
    };

    reader.readAsDataURL(file);
  });
}

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedTask, setSelectedTask] = useState("irrigation");
  
  // Irrigation form state: independent from diseaseCrop.
  const [formData, setFormData] = useState({
    crop: "Rice",
    cropStage: "Vegetative",
    soilType: "Clay",
    irrigationMethod: "Flood",
  });

  // Disease analysis has its own crop selection.
  const [diseaseCrop, setDiseaseCrop] = useState("Rice");

  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [diseaseImage, setDiseaseImage] = useState(null);
  const [diseaseImagePreview, setDiseaseImagePreview] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecorded, setAudioRecorded] = useState(false);
  const [diseaseLoading, setDiseaseLoading] = useState(false);
  const [diseaseResult, setDiseaseResult] = useState(null);
  const [diseaseError, setDiseaseError] = useState("");

  const t = uiTranslations[selectedLanguage] || uiTranslations.en;

  // Release temporary image preview URLs when the selected image changes.
  useEffect(() => {
    return () => {
      if (diseaseImagePreview) {
        URL.revokeObjectURL(diseaseImagePreview);
      }
    };
  }, [diseaseImagePreview]);

  // Clean up an unfinished recording timer if the component is removed.
  // The timer is only a UI simulation; see the note below.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const getCurrentLocation = () => {
    setLocationStatus(t.detectingLocation);
    setError("");

    if (!navigator.geolocation) {
      setLocationStatus("");
      setError(t.locationError);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setLocationStatus(t.locationSuccess);
      },
      () => {
        setLocationStatus("");
        setError(t.locationError);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      }
    );
  };

  const getRecommendation = async () => {
    if (!location) {
      setError(t.detectLocationFirst);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/recommendation`,
        {
          ...formData,
          latitude: location.latitude,
          longitude: location.longitude,
          language: selectedLanguage,
        }
      );

      setResult(response.data);
    } catch (requestError) {
      console.error("Irrigation recommendation error:", requestError);
      setError(
        requestError.response?.data?.message || t.backendError
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDiseaseImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setDiseaseError(t.invalidImage);
      event.target.value = "";
      return;
    }

    setDiseaseImage(file);
    setDiseaseImagePreview(URL.createObjectURL(file));
    setDiseaseError("");
    setDiseaseResult(null);
  };

  const removeDiseaseImage = () => {
    setDiseaseImage(null);
    setDiseaseImagePreview("");
    setDiseaseResult(null);
  };

  // IMPORTANT:
  // This is a visual placeholder, not actual audio recording.
  // It does not capture speech or send audio to the backend.
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setAudioRecorded(false);
      return;
    }

    setIsRecording(true);
    setAudioRecorded(false);

    window.setTimeout(() => {
      setIsRecording(false);
      setAudioRecorded(true);
    }, 3000);
  };

  const analyzeDisease = async () => {
    // A simulated recording is not sent to the backend.
    // Require a real supported input: image or typed symptoms.
    if (!diseaseImage && !symptoms.trim()) {
      setDiseaseError(t.provideInput);
      return;
    }

    setDiseaseLoading(true);
    setDiseaseError("");
    setDiseaseResult(null);

    try {
      let imageBase64 = null;
      let mimeType = null;

      if (diseaseImage) {
        imageBase64 = await fileToBase64(diseaseImage);
        mimeType = diseaseImage.type || "image/jpeg";
      }

      const response = await axios.post(
        `${API_BASE_URL}/disease-analysis`,
        {
          crop: diseaseCrop,
          symptoms: symptoms.trim(),
          imageBase64,
          mimeType,
          language: selectedLanguage,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Disease analysis failed"
        );
      }

      setDiseaseResult(response.data.analysis);
    } catch (requestError) {
      console.error("Disease analysis error:", requestError);

      setDiseaseError(
        requestError.response?.data?.message ||
          requestError.message ||
          t.backendError
      );
    } finally {
      setDiseaseLoading(false);
    }
  };

  if (!selectedLanguage) {
    return (
      <div className="language-page">
        <div className="language-card">
          <div className="language-logo">🌾</div>

          <h1>Kisaan Mithra AI</h1>

          <p className="language-subtitle">
            From Farm Data to the Right Decision
          </p>

          <h2>Choose Your Language</h2>

          <p className="language-description">
            Select the language you prefer to use.
          </p>

          <div className="language-list">
            {languages.map((language) => (
              <button
                key={language.code}
                type="button"
                className="language-option"
                onClick={() => setSelectedLanguage(language.code)}
              >
                <div>
                  <div className="language-name">
                    {language.name}
                  </div>

                  <div className="language-english">
                    {language.code === "en"
                      ? "English"
                      : language.code === "te"
                      ? "Telugu"
                      : language.code === "hi"
                      ? "Hindi"
                      : language.code === "kn"
                      ? "Kannada"
                      : language.code === "ta"
                      ? "Tamil"
                      : "Marathi"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <div className="brand">
          <h1>🌾 {t.brandTitle}</h1>
          <p>{t.subtitle}</p>
        </div>

        <div className="header-language">
          <select
            aria-label="Choose language"
            value={selectedLanguage}
            onChange={(event) =>
              setSelectedLanguage(event.target.value)
            }
          >
            {languages.map((language) => (
              <option key={language.code} value={language.code}>
                {language.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* TASK NAVIGATION */}
      <div className="task-bar">
        <div className="task-bar-inner">
          <button
            type="button"
            className={`task-tab ${
              selectedTask === "irrigation" ? "active" : ""
            }`}
            onClick={() => setSelectedTask("irrigation")}
          >
            <span className="task-icon">🌾</span>
            {t.irrigationRecommendation}
          </button>

          <button
            type="button"
            className={`task-tab ${
              selectedTask === "disease" ? "active" : ""
            }`}
            onClick={() => setSelectedTask("disease")}
          >
            <span className="task-icon">🌿</span>
            {t.diseaseRecommendation}
          </button>
        </div>
      </div>

      <main className="main-content">
        {/* IRRIGATION WORKFLOW */}
        {selectedTask === "irrigation" && (
          <>
            <section className="hero-section">
              <p className="section-label">{t.smartAssistant}</p>
              <h2>{t.farmQuestion}</h2>
              <p>{t.heroDescription}</p>
            </section>

            <section className="dashboard-grid">
              {/* FARM DETAILS */}
              <div className="card">
                <div className="card-step">{t.step1}</div>
                <h3>{t.farmDetails}</h3>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="irrigation-crop">{t.crop}</label>
                    <select
                      id="irrigation-crop"
                      name="crop"
                      value={formData.crop}
                      onChange={handleChange}
                    >
                      {cropOptions.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.labels[selectedLanguage]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="crop-stage">{t.cropStage}</label>
                    <select
                      id="crop-stage"
                      name="cropStage"
                      value={formData.cropStage}
                      onChange={handleChange}
                    >
                      {cropStageOptions.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.labels[selectedLanguage]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="soil-type">{t.soilType}</label>
                    <select
                      id="soil-type"
                      name="soilType"
                      value={formData.soilType}
                      onChange={handleChange}
                    >
                      {soilOptions.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.labels[selectedLanguage]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="irrigation-method">
                      {t.irrigationMethod}
                    </label>
                    <select
                      id="irrigation-method"
                      name="irrigationMethod"
                      value={formData.irrigationMethod}
                      onChange={handleChange}
                    >
                      {irrigationOptions.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.labels[selectedLanguage]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* LOCATION */}
                <div className="location-section">
                  <h4>{t.farmLocation}</h4>
                  <p>{t.locationDescription}</p>

                  <button
                    type="button"
                    className="location-button"
                    onClick={getCurrentLocation}
                    disabled={locationStatus === t.detectingLocation}
                  >
                    {locationStatus === t.detectingLocation
                      ? t.detectingLocation
                      : t.useLocation}
                  </button>

                  {location && (
                    <div className="location-success">
                      ✓ {t.locationDetected}
                    </div>
                  )}

                  {locationStatus &&
                    locationStatus !== t.detectingLocation && (
                      <div className="location-status">
                        {locationStatus}
                      </div>
                    )}
                </div>

                <button
                  type="button"
                  className="recommendation-button"
                  onClick={getRecommendation}
                  disabled={loading}
                >
                  {loading
                    ? t.gettingRecommendation
                    : t.getRecommendation}
                </button>

                {error && (
                  <div className="error-message" role="alert">
                    {error}
                  </div>
                )}
              </div>

              {/* IRRIGATION RESULTS */}
              <div className="card recommendation-card">
                <div className="card-step">{t.step2}</div>
                <h3>{t.todaysRecommendation}</h3>

                {!loading && !result && (
                  <div className="empty-state">
                    <div className="empty-icon">🌱</div>
                    <p>{t.recommendationPlaceholder}</p>
                    <span>{t.recommendationInstructions}</span>
                  </div>
                )}

                {loading && (
                  <div className="loading-state">
                    <div className="loading-icon">🌿</div>
                    <h4>{t.analyzing}</h4>
                    <p>{t.analyzingDescription}</p>
                  </div>
                )}

                {result && !loading && (
                  <div className="recommendation-result">
                    <div className="recommendation-action">
                      <span>{t.recommendedAction}</span>
                      <strong>
                        {result.recommendation?.action || "—"}
                      </strong>
                    </div>

                    <div className="weather-box">
                      <h4>{t.currentWeather}</h4>

                      <div className="weather-grid">
                        <div>
                          <span>{t.temperature}</span>
                          <strong>
                            {result.weather?.temperature ?? "—"}°C
                          </strong>
                        </div>

                        <div>
                          <span>{t.humidity}</span>
                          <strong>
                            {result.weather?.humidity ?? "—"}%
                          </strong>
                        </div>

                        <div>
                          <span>{t.rain}</span>
                          <strong>
                            {result.weather?.rain ?? "—"} mm
                          </strong>
                        </div>

                        <div>
                          <span>{t.wind}</span>
                          <strong>
                            {result.weather?.windSpeed ?? "—"} km/h
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="reason-box">
                      <h4>{t.recommendedAction}</h4>
                      <p>
                        {result.recommendation?.reason || "—"}
                      </p>
                    </div>

                    <div className="farm-profile">
                      <h4>{t.farmProfile}</h4>

                      <div className="profile-grid">
                        <div>
                          <span>{t.crop}</span>
                          <strong>{result.farm?.crop || "—"}</strong>
                        </div>

                        <div>
                          <span>{t.stage}</span>
                          <strong>{result.farm?.cropStage || "—"}</strong>
                        </div>

                        <div>
                          <span>{t.soil}</span>
                          <strong>{result.farm?.soilType || "—"}</strong>
                        </div>

                        <div>
                          <span>{t.irrigation}</span>
                          <strong>
                            {result.farm?.irrigationMethod || "—"}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* DISEASE ANALYSIS WORKFLOW */}
        {selectedTask === "disease" && (
          <section className="disease-dashboard">
            <div className="disease-header">
              <p className="section-label">
                {t.diseaseRecommendation}
              </p>

              <h2>{t.diseaseTitle}</h2>
              <p>{t.diseaseDescription}</p>
            </div>

            <div className="disease-grid">
              {/* DISEASE INPUT CARD */}
              <div className="card disease-input-card">
                {/* INDEPENDENT DISEASE CROP SELECTOR */}
                <div className="disease-input-section">
                  <div className="disease-section-title">
                    <div>
                      <h3>🌾 {t.selectDiseaseCrop}</h3>
                      <span>{t.diseaseCropDescription}</span>
                    </div>
                  </div>

                  <select
                    name="diseaseCrop"
                    value={diseaseCrop}
                    onChange={(event) => {
                      setDiseaseCrop(event.target.value);
                      setDiseaseResult(null);
                      setDiseaseError("");
                    }}
                  >
                    {cropOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.labels[selectedLanguage]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* IMAGE UPLOAD */}
                <div className="disease-input-section">
                  <div className="disease-section-title">
                    <div>
                      <h3>📷 {t.uploadImage}</h3>
                      <span>{t.imageOptional}</span>
                    </div>
                  </div>

                  {!diseaseImagePreview ? (
                    <label className="upload-box">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleDiseaseImage}
                      />

                      <div className="upload-icon">📷</div>
                      <strong>{t.chooseImage}</strong>
                      <span>JPG, PNG or camera image</span>
                    </label>
                  ) : (
                    <div className="image-preview-wrapper">
                      <img
                        src={diseaseImagePreview}
                        alt="Selected crop"
                        className="crop-preview"
                      />

                      <button
                        type="button"
                        className="remove-image-button"
                        onClick={removeDiseaseImage}
                      >
                        {t.removeImage}
                      </button>
                    </div>
                  )}
                </div>

                {/* VOICE UI */}
                <div className="disease-input-section">
                  <div className="disease-section-title">
                    <div>
                      <h3>🎤 {t.voiceSymptoms}</h3>
                      <span>{t.voiceOptional}</span>
                    </div>
                  </div>

                  <div className="voice-box">
                    <button
                      type="button"
                      className={`voice-button ${
                        isRecording ? "recording" : ""
                      }`}
                      onClick={toggleRecording}
                      aria-label={
                        isRecording
                          ? t.stopRecording
                          : t.startRecording
                      }
                    >
                      {isRecording ? "⏹" : "🎤"}
                    </button>

                    <div className="voice-content">
                      <strong>
                        {isRecording
                          ? t.recording
                          : audioRecorded
                          ? t.audioRecorded
                          : t.startRecording}
                      </strong>

                      <span>
                        {audioRecorded
                          ? "This demo has not transcribed audio. Type the symptoms below."
                          : "Voice recording is a UI demonstration and is not sent for analysis."}
                      </span>
                    </div>
                  </div>
                </div>

                {/* TEXT SYMPTOMS */}
                <div className="disease-input-section">
                  <div className="disease-section-title">
                    <div>
                      <h3>✍️ {t.textSymptoms}</h3>
                      <span>{t.textOptional}</span>
                    </div>
                  </div>

                  <textarea
                    className="symptom-textarea"
                    value={symptoms}
                    onChange={(event) => {
                      setSymptoms(event.target.value);
                      setDiseaseError("");
                    }}
                    placeholder={t.textPlaceholder}
                    rows={5}
                  />
                </div>

                {diseaseError && (
                  <div className="error-message" role="alert">
                    {diseaseError}
                  </div>
                )}

                <button
                  type="button"
                  className="primary-button disease-analyze-button"
                  onClick={analyzeDisease}
                  disabled={diseaseLoading}
                >
                  {diseaseLoading
                    ? `⏳ ${t.analyzingCrop}`
                    : `🔍 ${t.analyzeCrop}`}
                </button>
              </div>

              {/* DISEASE RESULT CARD */}
              <div className="card disease-result-card">
                <div className="card-step">{t.step2}</div>
                <h3>{t.diseaseResult}</h3>

                {diseaseLoading && (
                  <div className="loading-state">
                    <div className="loading-icon">🌿</div>
                    <h4>{t.analyzingCrop}</h4>
                  </div>
                )}

                {!diseaseLoading && !diseaseResult && (
                  <div className="empty-state">
                    <div className="empty-icon">🌿</div>
                    <p>{t.noResult}</p>
                  </div>
                )}

                {!diseaseLoading && diseaseResult && (
                  <div className="disease-result">
                    <div className="disease-main-result">
                      <span>{t.predictedDisease}</span>
                      <h4>{diseaseResult.disease || "Unknown"}</h4>
                    </div>

                    <div className="confidence-box">
                      <span>{t.confidence}:</span>{" "}
                      <strong>
                        {diseaseResult.confidence != null
                          ? diseaseResult.confidence
                          : "Not calculated"}
                      </strong>
                    </div>

                    <div className="disease-info-box">
                      <h4>{t.whyThisResult}</h4>
                      <p>
                        {diseaseResult.reason ||
                          "No explanation was returned."}
                      </p>
                    </div>

                    <div className="disease-action-box">
                      <h4>{t.whatToDo}</h4>
                      <p>
                        {diseaseResult.action ||
                          "Consult a local agricultural expert for next steps."}
                      </p>
                    </div>

                    <p className="safety-note">
                      {t.safetyNote}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
