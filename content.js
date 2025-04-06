function removeExistingTooltips() {
  const existingTooltips = document.querySelectorAll('.gemini-tooltip');
  existingTooltips.forEach(tooltip => tooltip.remove());
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

  // Store active tab index
  let activeTabIndex = 0;

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
      contentDiv.style.display = index === activeTabIndex ? "block" : "none"; // Only show the first tab content by default
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
  const prompts = {
    symbolic: "Identify symbolic, focus, or scope ambiguity in this image.",
    focus: "Detect any inconsistencies in the image.",
    background: "Is there spatial or logical incompleteness in this image?",
    indexical: "Is there spatial or logical incompleteness in this image?",
    scope: "Is there spatial or logical incompleteness in this image?",
    spatial: "Is there spatial or logical incompleteness in this image?",
    inconsistency: "Is there spatial or logical incompleteness in this image?",
  };
  removeExistingTooltips();
  const images = document.querySelectorAll("img");
  for (const img of images) {
    const blob = await fetch(img.src).then(res => res.blob());
    const base64 = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(blob);
    });

    let results = [];
    for (const type of defectTypes) {
      const result=await callApiWithImage("AIzaSyCtpqSQLSYIqyVqGps2neMXOZLFz6pkPEU","You are an autonomous vehicle expert trained to find defects in visual requirements for autonomous vehicles",prompts[type],base64)
      results.push({name: type, content: result});
    }
console.log(results)
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

  // Update tooltip position when mouse moves
  img.addEventListener("mousemove", (e) => {
      tooltip.style.left = `${e.pageX + 15}px`;
      tooltip.style.top = `${e.pageY + 15}px`;
  });

}
};
