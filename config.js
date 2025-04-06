const CONFIG = {
    // Replace this with your actual Gemini API key
    API_KEY: "YOUR_PREDEFINED_GEMINI_API_KEY_HERE",
    
    // Predefined prompts for each defect type
    DEFECT_PROMPTS: {
      "defect1": "Analyze this image for Defect Type 1 (Surface Cracks). Report if any cracks are visible, their approximate size, location, and severity. If no defects are found, state that clearly.",
      
      "defect2": "Analyze this image for Defect Type 2 (Discoloration). Identify any abnormal color patterns, stains, or discoloration. Describe the affected areas, approximate size, and potential severity. If no defects are found, state that clearly.",
      
      "defect3": "Analyze this image for Defect Type 3 (Deformation). Look for any bending, warping, dents, or structural abnormalities. Describe their location, approximate size, and severity. If no defects are found, state that clearly.",
      
      "defect4": "Analyze this image for Defect Type 4 (Missing Components). Identify if any parts or components appear to be missing from the structure. Describe what might be missing and the impact. If no defects are found, state that clearly.",
      
      "defect5": "Analyze this image for Defect Type 5 (Corrosion/Rust). Examine for any signs of corrosion, rust, or oxidation. Describe the affected areas, approximate coverage, and severity. If no defects are found, state that clearly.",
      
      "defect6": "Analyze this image for Defect Type 6 (Foreign Objects). Look for any debris, contaminants, or foreign objects that don't belong. Describe what they appear to be, their location, and potential impact. If no defects are found, state that clearly.",
      
      "defect7": "Analyze this image for Defect Type 7 (Wear and Tear). Identify signs of excessive wear, friction damage, or material degradation. Describe the affected areas, type of wear, and severity. If no defects are found, state that clearly."
    }
  };