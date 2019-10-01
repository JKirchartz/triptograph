// server.js
// where your node app starts

// init project
var browserify = require("browserify-middleware");
const express = require("express");
const pnger = require("save-svg-as-png");
const jsdom = require("jsdom");
var get = require("request");
var cors = require("cors");
const app = express();
app.use(cors());

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

//provide browserified versions of all the files in the script directory
app.use("/js", browserify(__dirname + "/js"));

function fetchImages(resultType) {
  return function(req, res) {
    let type = req.query.type;
    let width = req.query.x;
    let height = req.query.y;
    let params = [
      "action=query",
      "generator=random",
      "grnnamespace=500",
      "grnlimit=500",
      "list=allimages",
      "aiprop=url|dimensions",
      "aimaxsize=200000",
      "ailimit=500",
      "prop=imageinfo|images",
      "iiprop=url",
      "imlimit=500",
      "pageids=500",
      "redirects=1",
      "format=json",
      "cachebuster=" + Math.random()
    ].join("&");
    get("https://commons.wikimedia.org/w/api.php?" + params, function(
      err,
      resp,
      body
    ) {
      if (!err && resp.statusCode == 200) {
        var data = JSON.parse(body);
        data = data.query.allimages.filter(function(i) {
          return ["jpg", "jpeg", "png", "bmp", "tiff", "gif"].includes(
            i.url.split(".").pop()
          );
        });
        if (resultType == "json") {
          res.setHeader("Content-type", "application/json");
          res.send(JSON.stringify(data));
          return;
        }
        var images = [];
        for (var i = 0; i < 5; i++) {
          images.push(
            data.splice(Math.floor(Math.random() * data.length), 1)[0]
          );
        }
        var output;
        var x = width ? width : images[0].width;
        var y = height ? height : images[0].height;
        var offset = Math.floor(Math.random() * x);
        var randOffset = Math.floor(Math.random() * offset);
        if (type && type == "small") {
          output = `<svg viewBox="0 0 ${x} ${y}" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"  xmlns:xlink="http://www.w3.org/1999/xlink">
<filter id="blend" x="0" y="0" width="100%" height="100%">
<!-- first overlayer -->
<feImage result="a" x="${offset}" xlink:href="${images[1].url}" />
<feImage result="b" x="${offset - images[2].width}"  xlink:href="${
            images[2].url
          }" />
<feBlend result="frame1" in="a" in2="b" mode="lighten"/>
<feBlend in="SourceGraphic" in2="frame1" mode="lighten"/>
</filter>
<image xlink:href="${images[0].url}" style="filter:url(#blend);" />
</svg>`;
        } else {
          output = `<svg viewBox="0 0 ${x} ${y}" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"  xmlns:xlink="http://www.w3.org/1999/xlink">
<filter id="blend" x="0" y="0" width="100%" height="100%">
<!-- first overlayer -->
<feImage result="a" x="${offset}" xlink:href="${images[1].url}" />
<feImage result="b" x="${offset - images[2].width}"  xlink:href="${
            images[2].url
          }" />
<feBlend result="frame1" in="a" in2="b" mode="lighten"/>
<!-- second overlayer -->
<feImage result="c" x="${randOffset}" xlink:href="${images[3].url}" />
<feImage result="d" x="${randOffset - images[4].width}"  xlink:href="${
            images[4].url
          }" />
<feBlend result="frame2" in="c" in2="d" mode="lighten"/>
<!-- apply results -->
<feBlend result="overlay" in="frame1" in2="frame2" mode="lighten"/>
<feBlend in="SourceGraphic" in2="overlay" mode="lighten"/>
</filter>
<image xlink:href="${images[0].url}" style="filter:url(#blend);" />
</svg>`;
        }
        if (resultType == "png") {
          pnger.svgAsPngUri(new jsdom(output), {}).then(function(output) {
            console.log(output);
            res.setHeader("Content-Type", "image/png");
            res.send(output);
          });
        }
        if (resultType == "img") {
          res.setHeader("Content-Type", "image/svg+xml");
          res.send(output);
        }
      }
    });
  };
}

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

var glitchApiUrl = "https://api.glitch.com";
var glitchAuthToken = process.env.GLITCH_AUTH_TOKEN;

app.get("/hits", function(request, res) {
  get(
    glitchApiUrl +
      "/projects/" +
      request.query.project_name +
      "?authorization=" +
      glitchAuthToken,
    function(err, response, body) {
      var data = JSON.parse(body);
      var glitchProjectDataToPublicize = {
        numAppVisits: data.numAppVisits
      };
      res.setHeader("Content-type", "application/json");
      res.send(glitchProjectDataToPublicize);
    }
  );
});

app.get("/image.svg", fetchImages("img"));
app.get("/image.png", fetchImages("png"));
app.get("/image.json", fetchImages("json"));

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
