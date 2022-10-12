const windowSizesForSSPerHour = {
    60: 1,
    30: 2,
    20: 3,
    15: 4,
    12: 5,
    6: 10,
    4: 15,
    3: 20
  };
  
  function roundToNearest(ssPerHour = 6, date = new Date()) {
    const minutes = windowSizesForSSPerHour[ssPerHour];
    const ms = minutes * 60 * 1000;
  
    return new Date(Math.ceil(date.getTime() / ms) * ms);
  }

  const nearest = roundToNearest();

  console.log(nearest);
  
  function windowEndsAt(ssPerHour = 6, date = new Date()) {
    const minutes = windowSizesForSSPerHour[ssPerHour];
    date = new Date(date.getTime() + (minutes * 60 * 1000));
  
    return roundToNearest(ssPerHour, date);
  }
  
  function windowEndsInMS(ssPerHour = 6, date = new Date()) {
    date = windowEndsAt(ssPerHour, date);
  
    return date.getTime() - new Date().getTime()
  }
  
  function getRandTimeInWindow(ssPerHour, date = new Date()) {
    // At least one minute Should be there
    const minutesGone = date.getMinutes() % windowSizesForSSPerHour[ssPerHour];
    const secondsGone = date.getSeconds() + (minutesGone * 60);
    const secondsRemains = (windowSizesForSSPerHour[ssPerHour] * 60) - secondsGone;
  
    // console.log(ssPerHour, date.getMinutes(), minutesGone, secondsGone, secondsRemains)
    return Math.floor((Math.random() * secondsRemains) + 1);
  }
  
  function getNextSSTime(ssPerHour = 6 /* Enum(12, 6, 4, 3) */, date = new Date()) {
    const randSeconds = getRandTimeInWindow(ssPerHour);
  
    return {dt: new Date(date.setSeconds(date.getSeconds() + randSeconds)), ms: randSeconds * 1000};
  }
  
  // =============================================
  
  function startTimer() {
    const startAt = new Date(); // Now
    const ssPerHour = 60; // Should come from backend config
  
    // When to take the screenshot for current window
    const nextSSAt = getNextSSTime(ssPerHour, startAt);
    setTimeout(takeScreenshot(ssPerHour, startAt), nextSSAt.ms);
    console.log(`=== Next screenshot in ${Math.floor(nextSSAt.ms/1000)} Secs ===`, new Date());
  }
  
  function takeScreenshot(ssPerHour, startAt) {
    return function () {
      // Logic to take screenshot
      console.log('=== Yup! Screenshot Taken! ===', new Date());
      // const ssFilePaths = ["/some/path/of/stored/screen1.png", "/some/path/of/stored/screen2.png"];
  
      // When to schedule the Next Screenshot
      const windowEndsIn = windowEndsInMS(ssPerHour, startAt);
      setTimeout(scheduleScreenshot(ssPerHour, startAt), windowEndsIn);
      console.log(`=== Window ending in ${Math.floor(windowEndsIn/1000)} Secs ===`, new Date());
  
      // Some Undone Code:
      // Time to upload screenshots to S3 bucket
      // Upload files to s3 if presigned URL available in localstorage
      // Otherwise, ask beckend to provide X number of presigned URLs via separate endpoint
      // Upload the data to backend from the time of last screenshot to this screenshot time-slot alongwith S3 File path
    }
  }
  
  function scheduleScreenshot (ssPerHour, startAt) {
    return function () {
      // When to take the screenshot for current window
      const nextSSAt = getNextSSTime(ssPerHour, startAt);
      setTimeout(takeScreenshot(ssPerHour, startAt), nextSSAt.ms);
      console.log(`=== Next screenshot in ${Math.floor(nextSSAt.ms/1000)} Secs ===`, new Date());
    }
  }
  
  // Just hitting the start button
  startTimer();
  
  // =============================================
  // Some examples to validat the logic
  // console.log('05 Min', getNextSSTime(12));
  // console.log('05 Min', getNextSSTime(12));
  // console.log('05 Min', getNextSSTime(12));
  // console.log('05 Min', getNextSSTime(12));
  // console.log('=========================\n');
  
  // console.log('10 Min', getNextSSTime(6));
  // console.log('10 Min', getNextSSTime(6));
  // console.log('10 Min', getNextSSTime(6));
  // console.log('10 Min', getNextSSTime(6));
  // console.log('=========================\n');
  
  // console.log('15 Min', getNextSSTime(4));
  // console.log('15 Min', getNextSSTime(4));
  // console.log('15 Min', getNextSSTime(4));
  // console.log('15 Min', getNextSSTime(4));
  // console.log('=========================\n');
  // console.log('20 Min', getNextSSTime(3));
  // console.log('20 Min', getNextSSTime(3));
  // console.log('20 Min', getNextSSTime(3));
  // console.log('20 Min', getNextSSTime(3));
  