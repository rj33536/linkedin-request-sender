require("chromedriver");
let swd = require("selenium-webdriver");
let { username, password } = require("./credentials.json");
const { Driver } = require("selenium-webdriver/chrome");
let browser = new swd.Builder();
let tab = browser.forBrowser("chrome").build();
let tabWillBeOpenedPromise = tab.get(
  "https://www.linkedin.com/login?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin"
);

let company = "Microsoft";
let maxPages = 2;
let maxRequests = 50;
let requestCount = 0;
let profilesUrls = [];
let myMessage = `
Hi Sir, I am Rohit Jain. I'm a final year undergrad at NSUT(East campus). Glad to connect with you.
`;

tabWillBeOpenedPromise
  .then(function () {
    let findTimeOut = tab.manage().setTimeouts({
      implicit: 1000000,
    });
    return findTimeOut;
  })
  .then(async function () {
    await login();
    for (let i = 1; i < maxPages; i++) {
      await tab.get(
        "https://www.linkedin.com/search/results/people/?facetNetwork=%5B%22S%22%2C%22O%22%5D&keywords=" +
          company +
          "&origin=FACETED_SEARCH&page=" +
          i
      );
      
      await tab.sleep(1000);
      await tab;
      let people = await tab.findElements(
        swd.By.css(".entity-result__title-text")
      );

      let count = 0;

      console.log(people.length);

      for (let index = 0; index < people.length; index++) {
        let element = people[index].findElement(
          swd.By.css("a")
        );
          debugger;
        let profileUrl = await (await element).getAttribute("href");
        if (count % 2 == 0) profilesUrls.push(profileUrl);
        count++;
      }
    }
    console.log(profilesUrls);

    for (let index = 0; index < profilesUrls.length; index++) {
      await sendConnection(profilesUrls[index]);
      await tab.sleep(1000);
      if (requestCount >= maxRequests) break;
    }

    return undefined;
  })
  .catch(function (err) {
    console.log(err);
  });

async function login() {
  return new Promise(async function (resolve, reject) {
    let inputUserBoxPromise = tab.findElement(swd.By.css("#username"));
    let inputPassBoxPromise = tab.findElement(swd.By.css("#password"));
    let pArr = await Promise.all([inputUserBoxPromise, inputPassBoxPromise]);

    let inputUserBox = pArr[0];
    let inputPassBox = pArr[1];
    let inputUserBoxWillBeFilledP = inputUserBox.sendKeys(username);
    let inputPassBoxWillBeFilledP = inputPassBox.sendKeys(password);

    let willBeFilledArr = await Promise.all([
      inputUserBoxWillBeFilledP,
      inputPassBoxWillBeFilledP,
    ]);
    let loginButtonPromise = tab.findElement(
      swd.By.css("button[data-litms-control-urn='login-submit']")
    );

    let loginButton = await loginButtonPromise;
    let loginButtonClicked = await loginButton.click();
    resolve();
  });
}

async function sendConnection(url) {
  return new Promise(async function (resolve, reject) {
    let getProfilePage = await tab.get(url);
    //
    let nameli = await tab.findElement(
      swd.By.css(".t-24.t-black.t-normal.break-words")
    );
    let name = await nameli.getText();
    let getConnectedP = tab.findElement(
      swd.By.css(
        ".pv-s-profile-actions--connect.artdeco-button.artdeco-button--primary"
      )
    );

    getConnectedP
      .then(function (connected) {
        console.log("connect select");
        let buttonClickedP = connected.click();
        buttonClickedP.then(async function () {
          //Add a note
          //name="message"
          //Done
          let addNoteP = (await tab).findElement(
            swd.By.css("button[aria-label='Add a note']")
          );
          addNoteP
            .then(async (addNote) => {
              await addNote.click();
              let messageBoxP = (await tab).findElement(
                swd.By.css("textarea[name='message']")
              );
              let messageBox = await messageBoxP;

              await messageBox.sendKeys("Hi " + name + ", " + myMessage);
              let doneP = (await tab).findElement(
                swd.By.css("button[aria-label='Send now']")
              );
              let done = await doneP;
              await done.click();
              await tab;
              requestCount++;
              resolve();
            })
            .catch((err) => {
              console.log(err);
              resolve();
            });
        });
      })
      .catch(function (err) {
        console.log("inside f" + err);
        resolve();
      });
  });
}
