const fs = require('fs');
const frequencyToMinutes = {
    120: 0.5,
    60: 1,
    30: 2,
    20: 3,
    15: 4,
    12: 5,
    6: 10,
    4: 15,
    3: 20
};
const state = {
    timeSlots: []
};

function updateState() {
    fs.writeFile('data.json', JSON.stringify(state, null, 2), {
        flag: 'w+'
    }, error => {
        if(error) {
            console.error(error);
        }

        // console.log('file has been written successfully');
    })
}

class ScreenShot {
    path;
    capturedAt;
    constructor(capturedAt = new Date(), path = 'appData/invodesk/screen.png'){
        this.path = path;
        this.capturedAt = capturedAt;
    }
}

class ScreenshotService {
    timeoutId = null;
    intervalInMS = 0;

    constructor(intervalInMS) {
        this.intervalInMS = intervalInMS;
    }

    start() {
        this.run();   
    }

    stop() {
        if(this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    run() {
        const currentTimeSlot = state.timeSlots[state.timeSlots.length - 1];
        if(!currentTimeSlot) {
            throw new Error('There is no timeslot yet.');
        }

        let wait = 0;

        if(currentTimeSlot.screenshot) {
            wait = currentTimeSlot.end.getTime() - Date.now();

            console.log(new Date(), `We will wait for: secs: ${wait / 1000} ms: ${wait}`);
        }

        if (wait < 0) {
            wait = 0;
        }

        wait += 500;

        setTimeout(() => {
            console.log(new Date(), 'Wait is over, we are scheduling next screenshot');
            this.timeoutId = setTimeout(() => {
                state.timeSlots[state.timeSlots.length - 1].screenshot = new ScreenShot(new Date());
                console.log(new Date(), 'Screenshot taken');
                updateState();
                this.run();
            }, this.getRandomTime(state.timeSlots[state.timeSlots.length - 1]));
        }, wait);
    }

    getRandomTime(currentTimeSlot) {
        let start = Date.now();
        let end = currentTimeSlot.end.getTime();
        return Math.floor((Math.random() * (end - start)) + 1);
    }
}

class TimeSlot {
    constructor(start, end) {
        this.start = start;
        this.end = end;
        this.screenshot = null;
    }

    addScreenshot() {
        this.screenshot = new ScreenShot();
    }
}

class TimeSlotService {
    intervalInMS = 0;
    timeoutId = null;

    constructor(intervalInMS) {
        this.intervalInMS = intervalInMS;        
    }

    start() {
        this.run();
    }

    stop() {
        if(this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    run(now = new Date()) {
        const end = new Date(Math.ceil(now.getTime() / this.intervalInMS) * this.intervalInMS);

        if (!state.timeSlots.length || state.timeSlots[state.timeSlots.length - 1].end.getTime() !== end.getTime()) {
            const timeSlot = new TimeSlot(now, end);
            console.log(new Date(), 'New Timeslot has been created', timeSlot);
            state.timeSlots.push(timeSlot);
            updateState();
            this.timeoutId = setTimeout(() => {
                this.run();
            }, end.getTime() - now.getTime())
        }
    }
}

class TimeTrackingService {
    intervalInMS;
    timeSlotService;
    screenshotService;

    constructor(frequency) {
        const intervalInMinutes = frequencyToMinutes[frequency];

        if (!intervalInMinutes) {
            throw new Error('Given frequency is not valid.');
        }

        this.intervalInMS = intervalInMinutes * 60 * 1000;

        this.timeSlotService = new TimeSlotService(this.intervalInMS);
        this.screenshotService = new ScreenshotService(this.intervalInMS);
    }

    start() {
        this.timeSlotService.start();
        // this.screenshotService.start();
    }

    stop() {
        this.screenshotService.stop();
        this.timeSlotService.stop();
    }
}

const timeTrackingService = new TimeTrackingService(60);

timeTrackingService.start();