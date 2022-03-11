// server.js
/* main.js */
const express = require("express");
const app = express();
var quoteUrl = process.env.URL_NETLIFY;
var jokeUrl = process.env.JOKE_URL_NETLIFY;
var funfactUrl = process.env.FUNFACT_URL_NETLIFY;
var adviceUrl = process.env.ADVICE_URL_NETLIFY;
const { Readable } = require("stream");

const puppeteer = require("puppeteer");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create a quotes
app.get("/upload", (req, res) => {
  let text = "";
  takeScreenshot(quoteUrl)
    .then((data) => {
      text = data.text;
      return uploadScreenshot(data.screenshot, text);
    })
    .then((result) => {
      result.text = text;
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
});

// Create a joke
app.get("/joke", (req, res) => {
  let text = "";
  takeScreenshot(jokeUrl)
    .then((data) => {
      text = data.text;
      return uploadScreenshot(data.screenshot, text);
    })
    .then((result) => {
      result.text = text;
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
});

// Create funfact
app.get("/funfact", (req, res) => {
  let text = "";
  takeScreenshot(funfactUrl)
    .then((data) => {
      text = data.text;
      return uploadScreenshot(data.screenshot, text);
    })
    .then((result) => {
      result.text = text;
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
});

// Create advice
app.get("/advice", (req, res) => {
  let text = "";
  takeScreenshot(adviceUrl)
    .then((data) => {
      text = data.text;
      return uploadScreenshot(data.screenshot, text);
    })
    .then((result) => {
      result.text = text;
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
});

app.get("/start-stream", (req, res) => {
  console.log("masuk")
  const { PuppeteerScreenRecorder } = require("puppeteer-screen-recorder");

  (async () => {
    try {
      const browser = await puppeteer.launch({
        defaultViewport: {
          width: 735,
          height: 735,
          isLandscape: true,
        },
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();
      const recorder = new PuppeteerScreenRecorder(page);
      
      const pipeStream = new Promise((resolve, reject) => {
        // create a write stream
        const writeStream = cloudinary.uploader.upload_stream((err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
      await recorder.startStream(pipeStream); // supports extension - mp4, avi, webm and mov
      await page.goto("https://google.com");

      await page.goto("https://www.npmjs.com/package/puppeteer-screen-recorder");
      await recorder.stop();
      await browser.close();

      res.send("hello")
    } catch (err) {
      console.log(err)
      res.status(500).json(err)
    }
  })();
});

// See https://bitsofco.de/using-a-headless-browser-to-capture-page-screenshots
async function takeScreenshot(address) {
  const browser = await puppeteer.launch({
    defaultViewport: {
      width: 735,
      height: 735,
      isLandscape: true,
    },
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.goto(address, { waitUntil: "networkidle2" });

  await page.waitForSelector("#logo", { visible: true });

  let text = "test";
  text = await page.evaluate(() => {
    const el = document.querySelector("h3");
    return el.textContent;
  });

  const screenshot = await page.screenshot({
    omitBackground: true,
    encoding: "binary",
  });

  await browser.close();

  return { screenshot, text };
}

function uploadScreenshot(screenshot, text) {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      context: { title: text ? text : "title text" },
    };
    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(screenshot);
  });
}

const bufferUpload = async (buffer) => {
  return new Promise((resolve, reject) => {
    const writeStream = cloudinary.uploader.upload_stream((err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
    const readStream = new Readable({
      read() {
        this.push(buffer);
        this.push(null);
      },
    });
    readStream.pipe(writeStream);
  });
};

// listen for requests :)
const listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
