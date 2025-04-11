function removeExistingTooltips() {
  const existingTooltips = document.querySelectorAll('.gemini-tooltip');
  existingTooltips.forEach(tooltip => tooltip.remove());
}
function removeTooltip(tid) {
    const Tooltip = document.getElementById(tid);
    Tooltip.remove();
  }
  
async function callApiWithImage(apiKey, systemInstruction, text, base64Image) {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
  const data = {
      systemInstruction: {
          parts: [
              {
                  text: systemInstruction
              }
          ]
      },
      contents: [{
          parts: [
              { text: text },
              {
                  inlineData: {
                      mimeType: "image/jpeg",
                      data: base64Image
                  }
              }
          ]
      }]
  };

  return fetch(apiUrl, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
  })
      .then(response => response.json())
      .then(data => {
          return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";
      })
      .catch((error) => {
          console.error('Error:', error);
          return { error: error.toString() };
      });
}

function createLoadingTooltip(ids) {
    // Create the tooltip container
    const tooltip = document.createElement("div");
    tooltip.className = "gemini-tooltip";
    tooltip.innerText="loading...";
    tooltip.id=ids;
    // Apply styles to the tooltip
    Object.assign(tooltip.style, {
        position: "absolute",
        backgroundColor: "#1e1e1e",
        color: "#fff",
        padding: "10px",
        borderRadius: "8px",
        fontSize: "14px",
        fontFamily: "Segoe UI, sans-serif",
        width: "300px",              // Fixed width
        maxHeight: "200px",          // Height limit
        overflowY: "auto",           // Scroll when content exceeds height
        boxShadow: "0 0 10px rgba(0,0,0,0.4)",
        zIndex: 9999,
        display: "none",             // Initially hidden
        lineHeight: "1.5",
        whiteSpace: "pre-wrap",
        opacity: "0.95",
    });
    // Return the tooltip element
    document.body.appendChild(tooltip);
    return tooltip;
  }


// Function to create a styled tooltip with tabs for each type of defect
function createStyledTooltip(defectDetails) {
  // Create the tooltip container
  const tooltip = document.createElement("div");
  tooltip.className = "gemini-tooltip";

  // Creating tab container
  const tabContainer = document.createElement("div");
  tabContainer.className = "tabs";

  // Creating content container
  const contentContainer = document.createElement("div");
  contentContainer.className = "content-container";

  // Apply styles to the tooltip
  Object.assign(tooltip.style, {
      position: "absolute",
      backgroundColor: "#1e1e1e",
      color: "#fff",
      padding: "10px",
      borderRadius: "8px",
      fontSize: "14px",
      fontFamily: "Segoe UI, sans-serif",
      width: "300px",              // Fixed width
      maxHeight: "200px",          // Height limit
      overflowY: "auto",           // Scroll when content exceeds height
      boxShadow: "0 0 10px rgba(0,0,0,0.4)",
      zIndex: 9999,
      display: "none",             // Initially hidden
      lineHeight: "1.5",
      whiteSpace: "pre-wrap",
      opacity: "0.95",
  });


  // Create tabs dynamically based on defect details
  defectDetails.forEach((defect, index) => {
      // Creating tab for the defect
      const tabButton = document.createElement("button");
      tabButton.className = "tab-button";
      tabButton.innerText = defect.name;
    
      // Handle click event to switch content
      tabButton.addEventListener("click", () => {
          // Hide all content and show the clicked tab's content
          const allContents = contentContainer.querySelectorAll(".tab-content");
          allContents.forEach(content => content.style.display = "none");

          // Show the content for the clicked tab
          allContents[index].style.display = "block";

          // Set active tab style (optional)
          const allTabs = tabContainer.querySelectorAll(".tab-button");
          allTabs.forEach(tab => tab.classList.remove("active"));
          tabButton.classList.add("active");
      });

      tabContainer.appendChild(tabButton);

      // Create content for the defect
      const contentDiv = document.createElement("div");
      contentDiv.className = "tab-content";
      contentDiv.innerText = defect.content || "No content available."; // Handle undefined cases
      const lowerText = defect.content.toLowerCase();
      if (lowerText.includes("high risk")) tabButton.style.backgroundColor = "red"; // optional: highlight background
      else if (lowerText.includes("low risk")) tabButton.style.backgroundColor = "red";
      else tabButton.style.backgroundColor = "#00ff00";
      contentDiv.style.display = "none"; // Only show the first tab content by default
      contentContainer.appendChild(contentDiv);
  });

  // Append both the tab container and the content container to the tooltip
  tooltip.appendChild(tabContainer);
  tooltip.appendChild(contentContainer);
  document.body.appendChild(tooltip);

  // Return the tooltip element
  return tooltip;
}



window.detectImageDefects = async function(defectTypes) {
document.documentElement.style.cursor = 'wait';  // This targets the <html> element
  const prompts = {
    symbolic: `A symbolic ambiguity is a type of defect that can appear in an image used for AV requirements. This is how to identify if a symbolic ambiguity is present in an image or not.
Symbolic Ambiguity:
Differences in the interpretation of visual signs are based on conventions associated with their meanings by usage, such as color, size, shape, or position. Example:  “I thought that element is more important and risky than the others because it's bigger and drawn in red color.” “Misinterpretation of a traffic sign where a red exclamation mark could mean wrong action or proceed with caution.”

Here are the steps:
- Describe the situation the image is trying to depict.
- List all the visible symbols in the image.
- Record specific features of these symbols such as color, shape, size, position, etc., and identify if any of these are associated with conventional meanings (such as red color indicating danger or restriction).
- Analyze the features of the symbols and determine if their conventional meaning is actually intended with the situation the image is trying to depict.
- If the conventional meaning is not intended, but readers could interpret the image in that way, then the image contains a symbolic ambiguity. At the end of your response, EXPLICITLY mention if the defect has "no risk" in case it is not present, "high risk" if it is present and critical, and "low risk" if it is present but not critical.`,
    background: `A background or familiarity ambiguity is a type of defect that can appear in an image used for AV requirements. This is how to identify if a background or familiarity ambiguity is present in an image or not.
Background & Familiarity Ambiguity:
Potential differences in understanding that may arise due to differing cultural or professional backgrounds of collaborators (Background) or Potential differences in interpretations that can arise due to collaborators being familiar with different understandings of a specific visual (Familiarity). Example: “I was reading your diagram from right to left instead of vice versa, as we usually do this in Arab countries. No wonder it didn't make sense.” “I thought that symbol represented a decision point, as we used it in flow charts, and not a document.” “Speed limit in all emirates other than Abu Dhabi allows for an extra 20 km/h over the posted limit.”  “I interpreted the avalanche pictogram inside the loop diagram as meaning ‘natural causes’, not as defining it as a vicious, self-intensifying cycle.”  “Present if a certain software designer or collaborator is not aware of the intended meaning of a road/safety rule.”

Here are the steps:
- Describe the situation the image is trying to depict.
- Identify the key elements that help convey this information (signs, objects, text, etc.)
- Do any of the elements identified potentially have different ways of representation or meaning in other cultures or professional backgrounds.  Assume the readers come from different cultural backgrounds and varying professions and levels of technical expertise.
- If an element has a different meaning or way of representation which could potentially lead the reader to understand the image differently, then the image is ambiguous.
At the end of your response, EXPLICITLY mention if the defect has "no risk" in case it is not present, "high risk" if it is present and critical, and "low risk" if it is present but not critical.`,
    focus: `A focus ambiguity is a type of defect that can appear in an image used for AV requirements. This is how to identify if a focus ambiguity is present in an image or not.
Focus Ambiguity:
Variations in interpretation can occur due to collaborators referring to different parts of an image. Example: “I thought you were referring to the lower part of the drawing right now, not the upper part.”  “In a tailgating scenario with a vehicle in the left lane, the reference car can be the tailgating car indicating that tailgating is dangerous, or it can be the car in front indicating that the car must give way in the left lane.”

Here are the steps:
- Describe what situation the image is trying to depict.
- Identify any prominent or stand-out elements in the image (objects, people, signs, etc.)
- Analyze what each element is trying to communicate (taking each element as an individual context)
- Do any of the elements, when analyzed individually, lead to a different interpretation as compared to the intended interpretation of the entire image.
- If yes, then a focus ambiguity exists. At the end of your response, EXPLICITLY mention if the defect has "no risk" in case it is not present, "high risk" if it is present and critical, and "low risk" if it is present but not critical.`,
    scope: `A scope ambiguity is a type of defect that can appear in an image used for AV requirements. This is how to identify if a scope ambiguity is present in an image or not.
Scope Ambiguity:
Differences in interpretation can arise due to collaborators assuming the visual element serves a different purpose.  Example: “I thought this picture was only helping us to analyze the problem, not already document a final decision.” “In a road merging scenario, it could be unclear whether the hazard is due to the car in front or the car behind or both.”

Here are the steps:
- Describe the context of the image and explain what you think the purpose of the image is (to describe, to warn, to convince, etc.).
- Identify the key elements of the image that help achieve this purpose.
- Is it clear from a reader’s point of view that these elements are used for the identified purpose only.
- If there is a possibility that the reader could understand the image differently and assume a different purpose, then the image is ambiguous (e.g. does a warning image apply for all scenarios or just the situation shown, etc.) At the end of your response, EXPLICITLY mention if the defect has "no risk" in case it is not present, "high risk" if it is present and critical, and "low risk" if it is present but not critical.`,
    spatial: `Spatial incompleteness is a type of defect that can appear in an image used for AV requirements. This is how to identify if a spatial incompleteness is present in an image or not.
Spatial Incompleteness:
Refers to situations when a larger scope of the image is required to understand the complete picture. Example: “In lane changes, a wider view showing the road ahead is necessary to know if there is any car or obstruction close ahead in the lane to be changed to, in addition to a view of the road behind.”

Here are the steps:
- Describe what situation the image is trying to depict.
- List all necessary details that should be present in the image so that the reader understands the intended situation.
- Verify if the image shows all these necessary details.
- If there is some information missing, determine if it could have been shown in a larger or different perspective of the image (more view of the surrounding area, different angle or view of the picture, etc.)
- If the missing details could be shown in a different scope of the image, then the image is incomplete.
At the end of your response, EXPLICITLY mention if the defect has "no risk" in case it is not present, "high risk" if it is present and critical, and "low risk" if it is present but not critical. `,
    inconsistency: `A local inconsistency is a type of defect that can appear in an image used for AV requirements. This is how to identify if a local inconsistency is present in an image or not.
Local Inconsistency:
Multiple elements within the same image contradict each other or appear in a way that does not make logical sense. Example: “If a traffic light is malfunctioning and stuck on red and a police officer is signaling cars to go ahead.”

Here are the steps:
- Describe what situation the image is trying to depict.
- Identify the key elements in the image (objects, people, signs, etc.)and analyze what each element is trying to communicate.
- Given the context of the image, determine if two elements are communicating potentially conflicting information.
- If two elements portray conflicting information, then there is a local inconsistency.
- Identify each element’s relevance within the context.
- Determine if it actually makes sense for each element or group of elements to be simultaneously present in a situation like the image shows.
- If two elements appear in a way that does not make logical sense, then the image is inconsistent. At the end of your response, EXPLICITLY mention if the defect has "no risk" in case it is not present, "high risk" if it is present and critical, and "low risk" if it is present but not critical.`,
};
  removeExistingTooltips();
  const images = document.querySelectorAll("img");
  let i=0
  for (const img of images) {
        
        const ltooltip = createLoadingTooltip(i);
        // Add event listener for mouseenter
        img.addEventListener("mouseenter", (e) => {
         ltooltip.style.left = `${e.pageX + 15}px`;  // Tooltip stays 15px right of the mouse
         ltooltip.style.top = `${e.pageY + 15}px`;   // Tooltip stays 15px below the mouse
         ltooltip.style.display = "block"; 
     });
   
     // Update tooltip position when mouse moves
     img.addEventListener("mousemove", (e) => {
         ltooltip.style.left = `${e.pageX + 15}px`;
         ltooltip.style.top = `${e.pageY + 15}px`;
     });
       i=i+1;
       
  }
  i=0;
  for (const img of images) {
    
    const blob = await fetch(img.src).then(res => res.blob());
    const base64 = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(blob);
    });

    let results = [];
    for (const type of defectTypes) {
      const result=await callApiWithImage("AIzaSyCtpqSQLSYIqyVqGps2neMXOZLFz6pkPEU","You are an autonomous vehicle expert trained to find defects in visual requirements for autonomous vehicles, I will provide you with images that can be used for Autonomous Vehicle Requirements. Follow the steps above and conclude if a defect is present in the image or not. If there is no defect present, say it does not exist. To help, act as an autonomous vehicle system and what you would do if you received an image like this as part of a requirements document.",prompts[type],base64)
      results.push({name: type, content: result});
    }
    removeTooltip(i);
    const tooltip = createStyledTooltip(results);
      
     // Add event listener for mouseenter
     img.addEventListener("mouseenter", (e) => {
      tooltip.style.left = `${e.pageX + 15}px`;  // Tooltip stays 15px right of the mouse
      tooltip.style.top = `${e.pageY + 15}px`;   // Tooltip stays 15px below the mouse
      if (tooltip.style.display == "block"){
        tooltip.style.display = "none";
      }
      else{
      tooltip.style.display = "block";}
      
  });

  i=i+1;
}
document.documentElement.style.cursor = 'default';  // This targets the <html> element
chrome.runtime.sendMessage({ action: 'resetCursor' });
};
