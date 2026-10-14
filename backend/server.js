const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const { translateText } = require("./services/translationService");
const { analyzeDisease } = require("./services/diseaseAnalysisService");
const app = express();
const PORT = 5000;

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());
app.use(express.json({ limit: "10mb" }));
// ======================================================
// TRANSLATION API
// ======================================================

app.post("/api/translate", async (req, res) => {
  try {
    const { text, language } = req.body;

    if (!text || !language) {
      return res.status(400).json({
        success: false,
        message: "Text and language are required",
      });
    }

    const translatedText = await translateText(
      text,
      language
    );

    res.json({
      success: true,
      language,
      originalText: text,
      translatedText,
    });
  } catch (error) {
    console.error(
      "Translation API error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Unable to translate text",
    });
  }
});

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Kisaan Mithra AI backend is running",
  });
});

// ======================================================
// WEATHER API
// ======================================================

app.get("/api/weather", async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const response = await axios.get(
      "https://api.open-meteo.com/v1/forecast",
      {
        params: {
          latitude,
          longitude,

          current:
            "temperature_2m,relative_humidity_2m,rain,wind_speed_10m",

          hourly:
            "temperature_2m,relative_humidity_2m,precipitation_probability,precipitation",

          forecast_days: 3,

          timezone: "auto",
        },
      }
    );

    res.json({
      success: true,

      location: {
        latitude: Number(latitude),
        longitude: Number(longitude),
      },

      weather: response.data,
    });
  } catch (error) {
    console.error(
      "Weather API error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Unable to fetch weather data",
    });
  }
});

// ======================================================
// SMART IRRIGATION RECOMMENDATION API
// ======================================================

app.post("/api/recommendation", async (req, res) => {
  try {
    const {
      crop,
      cropStage,
      soilType,
      irrigationMethod,
      latitude,
      longitude,
      language = "en",
    } = req.body;

    // --------------------------------------------------
    // VALIDATE INPUT
    // --------------------------------------------------

    if (
      !crop ||
      !cropStage ||
      !soilType ||
      !latitude ||
      !longitude
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Crop, crop stage, soil type, latitude and longitude are required",
      });
    }

    // --------------------------------------------------
    // FETCH WEATHER DATA
    // --------------------------------------------------

    const weatherResponse = await axios.get(
      "https://api.open-meteo.com/v1/forecast",
      {
        params: {
          latitude,
          longitude,

          current:
            "temperature_2m,relative_humidity_2m,rain,wind_speed_10m",

          hourly:
            "precipitation_probability,precipitation",

          forecast_days: 1,

          timezone: "auto",
        },
      }
    );

    const weather = weatherResponse.data;

    // --------------------------------------------------
    // EXTRACT WEATHER INFORMATION
    // --------------------------------------------------

    const currentRain =
      weather.current?.rain || 0;

    const rainProbability =
      weather.hourly
        ?.precipitation_probability?.[0] || 0;

    const precipitation =
      weather.hourly
        ?.precipitation?.[0] || 0;

    const temperature =
      weather.current?.temperature_2m;

    const humidity =
      weather.current?.relative_humidity_2m;

    const windSpeed =
      weather.current?.wind_speed_10m;

    // --------------------------------------------------
    // DECISION VARIABLES
    // --------------------------------------------------

    let recommendation;
    let waterNeed;

    const decisionFactors = [];

    const normalizedSoil =
      soilType.toLowerCase();

    const normalizedStage =
      cropStage.toLowerCase();

    // --------------------------------------------------
    // FACTOR 1: RAINFALL
    // --------------------------------------------------

    if (
      currentRain > 0 ||
      precipitation > 2
    ) {
      recommendation =
        "Delay irrigation";

      waterNeed = "LOW";

      decisionFactors.push(
        "Rainfall is occurring or expected."
      );
    } else if (
      rainProbability >= 60
    ) {
      recommendation =
        "Wait and monitor";

      waterNeed = "MODERATE";

      decisionFactors.push(
        "There is a high probability of rain."
      );
    } else {
      recommendation =
        "Irrigation may be needed";

      waterNeed = "MODERATE";

      decisionFactors.push(
        "No significant rainfall is currently expected."
      );
    }

    // --------------------------------------------------
    // FACTOR 2: SOIL TYPE
    // --------------------------------------------------

    if (
      normalizedSoil === "sandy"
    ) {
      decisionFactors.push(
        "Sandy soil generally drains water faster."
      );
    } else if (
      normalizedSoil === "clay"
    ) {
      decisionFactors.push(
        "Clay soil generally retains water longer."
      );
    } else if (
      normalizedSoil === "loamy"
    ) {
      decisionFactors.push(
        "Loamy soil generally has balanced drainage and water retention."
      );
    }

    // --------------------------------------------------
    // FACTOR 3: CROP STAGE
    // --------------------------------------------------

    if (
      normalizedStage.includes("flower")
    ) {
      decisionFactors.push(
        "The crop is in the flowering stage, so field monitoring is important."
      );
    } else if (
      normalizedStage.includes("vegetative")
    ) {
      decisionFactors.push(
        "The crop is in the vegetative growth stage."
      );
    } else if (
      normalizedStage.includes("seedling")
    ) {
      decisionFactors.push(
        "The crop is in the early growth stage."
      );
    } else if (
      normalizedStage.includes("maturity")
    ) {
      decisionFactors.push(
        "The crop is approaching maturity."
      );
    }

    // --------------------------------------------------
    // FACTOR 4: TEMPERATURE
    // --------------------------------------------------

    if (
      temperature !== undefined
    ) {
      if (temperature >= 35) {
        decisionFactors.push(
          "The current temperature is relatively high, so field conditions should be monitored closely."
        );
      } else if (
        temperature <= 20
      ) {
        decisionFactors.push(
          "The current temperature is relatively cool."
        );
      }
    }

    // --------------------------------------------------
    // FACTOR 5: HUMIDITY
    // --------------------------------------------------

    if (
      humidity !== undefined
    ) {
      if (humidity >= 80) {
        decisionFactors.push(
          "Humidity is high, which may reduce immediate water-loss demand."
        );
      } else if (
        humidity <= 40
      ) {
        decisionFactors.push(
          "Humidity is relatively low, so field moisture should be monitored."
        );
      }
    }

    // --------------------------------------------------
    // CREATE ENGLISH EXPLANATION
    // --------------------------------------------------

    const reason =
      decisionFactors.join(" ");

    // --------------------------------------------------
    // TRANSLATE USING GEMINI
    // --------------------------------------------------

    let translatedAction =
      recommendation;

    let translatedReason =
      reason;

    try {
      translatedAction =
        await translateText(
          recommendation,
          language
        );

      translatedReason =
        await translateText(
          reason,
          language
        );
    } catch (translationError) {
      console.error(
        "Recommendation translation error:",
        translationError.message
      );

      // Keep English as fallback
      translatedAction =
        recommendation;

      translatedReason =
        reason;
    }

    // --------------------------------------------------
    // SEND RESPONSE
    // --------------------------------------------------

    res.json({
      success: true,

      farm: {
        crop,
        cropStage,
        soilType,
        irrigationMethod,

        latitude:
          Number(latitude),

        longitude:
          Number(longitude),
      },

      weather: {
        temperature,
        humidity,
        rain: currentRain,
        rainProbability,
        precipitation,
        windSpeed,
      },

      recommendation: {
        action:
          translatedAction,

        actionEnglish:
          recommendation,

        waterNeed,

        reason:
          translatedReason,

        reasonEnglish:
          reason,

        decisionFactors,
      },
    });
  } catch (error) {
    console.error(
      "Recommendation API error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to generate irrigation recommendation",
    });
  }
});
app.post("/api/disease-analysis", async (req, res) => {
  try {
    const {
      crop,
      symptoms,
      imageBase64,
      mimeType,
      language = "en",
    } = req.body;

    if (!crop && !symptoms && !imageBase64) {
      return res.status(400).json({
        success: false,
        message:
          "At least crop information, symptoms, or an image is required",
      });
    }

    const analysis = await analyzeDisease({
      crop,
      symptoms,
      imageBase64,
      mimeType,
      language,
    });

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error(
      "Disease analysis API error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Unable to analyze crop disease",
    });
  }
});
// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, () => {
  console.log(
    `Kisaan Mithra AI backend running on http://localhost:${PORT}`
  );
});