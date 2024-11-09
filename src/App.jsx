import { useState, useEffect } from "react";

function App() {
  const [translate, setTranslate] = useState(false);
  const [inputLang, setInputLang] = useState("");
  const [outputLang, setOutputLang] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [recognition, setRecognition] = useState(null); // Store recognition instance in state

  const languages = ["Hindi", "English", "Kannada", "Malayalam"];
  const outputLangOptions = languages.filter((lang) => lang !== inputLang);

  const isStartButtonEnabled = inputLang && (!translate || (outputLang && inputLang !== outputLang));

  useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
    }
  }, []);

  const handleStartSpeaking = () => {
    // Clear previous text
    setInputText("");
    setTranslatedText("");
    setIsSpeaking(true);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    // Create a new recognition instance
    const newRecognition = new SpeechRecognition();
    newRecognition.lang = getLanguageCode(inputLang);
    newRecognition.interimResults = true; // Enable interim results for continuous listening
    newRecognition.continuous = true; // Keep recognizing continuously

    newRecognition.onresult = async (event) => {
      const transcript = event.results[event.resultIndex][0].transcript;
      setInputText((prev) => prev + transcript + " "); // Append recognized text

      // Check if translation is required
      if (translate) {
        const translated = await translateText(transcript, outputLang);
        setTranslatedText(translated);
        speakText(translated, outputLang); // Speak out the translated text
      }
    };

    newRecognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsSpeaking(false);
      // Ensure recognition stops on error
      if (event.error === 'aborted') {
        // Optionally handle aborted error
        console.log('Recognition aborted');
      }
    };

    newRecognition.onend = () => {
      if (isSpeaking) {
        // Automatically restart recognition if the user hasn't clicked stop
        newRecognition.start();
      }
    };

    // Save the recognition instance to state
    setRecognition(newRecognition);
    newRecognition.start();
  };

  // Function to stop speech recognition
  const handleStopSpeaking = () => {
    setIsSpeaking(false);
    if (recognition) {
      recognition.stop(); // Stop the recognition
      setRecognition(null); // Clear the recognition instance
    }
  };

  // Function to return language code based on selection
  const getLanguageCode = (lang) => {
    switch (lang) {
      case "Hindi":
        return "hi-IN";
      case "English":
        return "en-US";
      case "Kannada":
        return "kn-IN";
      case "Malayalam":
        return "ml-IN";
      default:
        return "en-US";
    }
  };

  // Placeholder for translation function
  const translateText = async (text, targetLang) => {
    // Mock API call to a translation service
    // Replace with an actual API call as needed
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`${text} translated to ${targetLang}`);
      }, 1000);
    });
  };

  // Function to speak the translated text
  const speakText = (text, lang) => {
    const speech = new window.SpeechSynthesis();
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = getLanguageCode(lang);
    speech.speak(utterance);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-semibold mb-6">Audio Translation App</h1>

      {/* Translation Option */}
      <div className="mb-4">
        <label className="mr-4">
          <input
            type="radio"
            name="translateOption"
            value="no"
            checked={!translate}
            onChange={() => setTranslate(false)}
          />
          No Translation
        </label>
        <label>
          <input
            type="radio"
            name="translateOption"
            value="yes"
            checked={translate}
            onChange={() => setTranslate(true)}
          />
          Translation
        </label>
      </div>

      {/* Input Language Selection */}
      <div className="flex gap-4 mb-4">
            <select
          className="p-2 border rounded"
          value={inputLang}
          onChange={(e) => setInputLang(e.target.value)}
        >
          <option value="">Select Input Language</option>
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
          

        {/* Output Language Selection (only if Translation is enabled) */}
        {translate && (
          <select
            className="p-2 border rounded"
            value={outputLang}
            onChange={(e) => setOutputLang(e.target.value)}
          >
            <option value="">Select Output Language</option>
            {outputLangOptions.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Start and Stop Buttons */}
      <div className="flex gap-4">
        {isSpeaking ? (
          <button
            onClick={handleStopSpeaking}
            className="px-4 py-2 rounded text-white bg-red-500"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleStartSpeaking}
            className={`px-4 py-2 rounded text-white ${isStartButtonEnabled ? 'bg-blue-500' : 'bg-gray-400'}`}
            disabled={!isStartButtonEnabled}
          >
            Start Speaking
          </button>
        )}
      </div>

      {/* Display Recognized Text */}
      {isSpeaking || inputText ? (
        <div className="mt-6 w-full max-w-md">
          <label className="block mb-2 font-semibold">
            {translate ? `Input (${inputLang})` : "Recognized Text"}
          </label>
          <textarea
            className="w-full p-2 border rounded h-full"
            value={inputText}
            readOnly
          />
        </div>
      ) : null}

      {/* Display Translated Text */}
      {translate && translatedText && (
        <div className="mt-6 w-full max-w-md">
          <label className="block mb-2 font-semibold">Translated Text ({outputLang})</label>
          <textarea
            className="w-full p-2 border rounded h-24"
            value={translatedText}
            readOnly
          />
        </div>
      )}
    </div>
  );
}

export default App;
