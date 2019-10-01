var hitCounterElems = document.getElementsByClassName("hit_counter");
var hitCounterElemsArray = Array.from(hitCounterElems);
var editorVisits;

function getHitCounts() {
  hitCounterElemsArray.forEach((hitCounterElem) => {
    var projectName = hitCounterElem.classList[1].split("=")[1];  

    // 📣 Hey! Here's a thing you need to do to make the hit counter work for your own Glitch projects:
    // Change "https://hit-counter.glitch.me/" on the next line to your remixed hit-counter project's URL

    fetch("https://triptograph.glitch.me/hits?project_name=" + projectName)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.numAppVisits != editorVisits) {
        hitCounterElem.innerHTML = "";
        editorVisits = data.numAppVisits;
        hitCounterElem.innerHTML = editorVisits.toString();        
      }
    });
  });
}

getHitCounts();
// check for new hits every ten sections;
setInterval(getHitCounts, 10000);