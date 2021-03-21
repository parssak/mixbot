export const SectionType = {
    DROP: 1,
    REGULAR: 2,
    COMEDOWN: 3,
    BEGIN: 4,
    UNSURE: 5
}

export class Analyzer {
    constructor() {
        console.log("new analyzer created");
    }

    /**
     * Returns:
     * {
     *      songSections: All sections of the song, tagged with what they are
     *      bars: Bars estimated through the data, used for syncing
     *      startPos: Section the song should start
     * }
     */
    analyzeSong(songData) {
        console.log("analyzing data.");
        let analyzedBars = [];
        let sectionArray = songData.sections;
        let baselineLoudness = songData.track.loudness;
        let allBars = songData.bars;
        

        let songSections = [];
        // let currSection = 0;

        // song analysis variables
        // let numDrops = 0;
        // let mostConfidentDrop = 0;

        // let numComedowns = 0;
        // let mostConfidentComedown = 0;

        // get an array of when all bars start
        let barStartArray = []

        let bar = allBars[0].duration;
        let barConfidence = 0;
        allBars.forEach(e => {
            if (e.confidence > barConfidence) {
                bar = e.duration;
                barConfidence = e.confidence;
            }
        })
        let barlength32 = bar * 2;
        let songDuration = songData.track.duration;

        let num32Bar = ((songDuration) / barlength32);

        for (let a = 0; a <= num32Bar; a++) {
            barStartArray.push(((a) * barlength32));
        }

        let calibrationArray = [];

        let numCalibrationChunks = (songDuration) / bar;

        for (let c = 0; c <= numCalibrationChunks; c++) {
            calibrationArray.push(((c) * bar));
        }


        for (let b = 0; b < calibrationArray.length - 1; b++) {
            // let barColor = (b % 2 ? "rgba(255, 60, 54,0.05)" : "rgba(46, 255, 154,0.05)");
            let barRegion = {
                start: calibrationArray[b],
                end: calibrationArray[b + 1],
                // color: barColor,
                drag: false,
                resize: false,
                computed: {}
            };
            analyzedBars.push(barRegion); 
            // this.waveform.addRegion(barRegion);
        }

        sectionArray.forEach(e => {
            // currSection++;
            let sectionType = SectionType.REGULAR;
            let is32length = false;

            let comparisonLoudness = (e.loudness - baselineLoudness) / baselineLoudness;

            // IF BEGINNING OF SONG
            if (songSections.length === 0) {
                sectionType = SectionType.BEGIN;
            }

            // IF LOUD === DROP
            if (comparisonLoudness < 0) {
                sectionType = SectionType.DROP;
            }

            // IF LAST SONG WAS DROP AND DIFFERENTIAL OF THIS IS NEGATIVE === COMEDOWN
            let diff = 0;
            if (songSections.length > 0) {
                diff = songSections[songSections.length - 1].computed.comparisonLoudness - comparisonLoudness;
                if (songSections[songSections.length - 1].sectionType === SectionType.DROP) {
                    if (sectionType === SectionType.DROP) {
                        sectionType = SectionType.UNSURE;
                    } else {
                        sectionType = SectionType.COMEDOWN
                    }
                }
            }

            let beginpoint = e.start;
            let endpoint = e.start + e.duration;
            let closestEnd = this.closest(endpoint, barStartArray);
            let closestBegin = this.closest(beginpoint, barStartArray);
            let offsetBegin = closestBegin - beginpoint;
            let offsetEnd = closestEnd - endpoint;
            let acceptedConformEnd = false;
            let acceptedConformBegin = false;

            beginpoint = closestBegin;
            endpoint = closestEnd;


            let sizeComparison = ((endpoint - beginpoint) / barlength32).toPrecision(2); // checks if section is of calculated 32bar length
            if (sizeComparison % 1) {
                is32length = true;
            }

            let randomColor = 'rgba(162,254,231,0.3)';
            switch (sectionType) {
                case "":
                    break;
                case SectionType.BEGIN:
                    // toLoop = true;
                    randomColor = 'rgba(50,255,155,0.3)';
                    if (is32length) {
                        randomColor = 'rgba(100,255,55,0.3)';
                    }
                    break;
                case SectionType.DROP:
                    randomColor = 'rgba(237,61,155,0.3)';
                    if (is32length) {
                        randomColor = 'rgba(255,31,105,0.3)';
                    }
                    break;
                case SectionType.COMEDOWN:
                    randomColor = 'rgba(123,215,255,0.3)'
                    if (is32length) {
                        randomColor = 'rgba(50,150,255,0.3)'
                    }
                    break;
                case SectionType.UNSURE:
                    randomColor = 'rgba(34,1,255,0.2)'
                    if (is32length) {
                        randomColor = 'rgba(0,255,150,0.2)'
                    }
                    break;
                default:
                    break;
            }

            let goodForMix = false;
            if (sectionType !== SectionType.DROP) {
                if (comparisonLoudness > 0 && comparisonLoudness < 0.1) {
                    randomColor = 'rgba(218, 165, 32,0.3)';
                    goodForMix = true;
                } else if (sectionType === SectionType.BEGIN) {
                    randomColor = 'rgba(218, 165, 32,0.3)';
                    goodForMix = true;
                }
            }
            // ! THIS IS FOR UI PURPOSES REMOVE THIS WHEN TESTING
            randomColor = 'rgba(0, 0, 0, 0)';

            let analysisSection = {
                sectionType: sectionType,
                begin: beginpoint,
                endpoint: endpoint,
                computed: {
                    comparisonLoudness: comparisonLoudness,
                    differential: diff,
                    sectionConfidence: e.confidence,
                    conformedBegin: acceptedConformBegin,
                    conformedEnd: acceptedConformEnd,
                    oBegin: offsetBegin,
                    oEnd: offsetEnd
                },
                sizeComparison: sizeComparison,
                is32: is32length,
                sectionColor: randomColor,
                goodForMix: goodForMix
            }
            songSections.push(analysisSection);
        })

        let startingPos = 0; // TODO PASS THIS OUT

        if (songSections.length > 2) {
            // console.log("sec1:", songSections[0].sizeComparison, "sec2:", songSections[1].sizeComparison);
            // console.log("sec1:", songSections[0].is32, "sec2:", songSections[1].is32);
            if ((songSections[0].sizeComparison === 4) || (songSections[0].sizeComparison === 2 && songSections[1].sizeComparison === 2)) {
                    startingPos= 0
            } else if (songSections[0].sizeComparison === 2.0 && songSections[1].sizeComparison % 4 === 0) { // todo make this if songSections[1].sizeComparison is a multiple of 4
                // console.log("mult of 4?", songSections[1].sizeComparison % 4);
                startingPos = songSections[0].endpoint;  
            } 
        }

        let finalAnalysis = {
            songSections: songSections,
            bars: calibrationArray,
            startPos: startingPos,
            tempo: songData.track.tempo,
            loudness: baselineLoudness,
            songKey: songData.track.key
        }

        return finalAnalysis;
    }


    closest(needle, haystack) {
        let closeGrain = 100000000000000;
        let grainCloseness = 100000000000000;
        haystack.forEach(grain => {
            let thisCloseness = Math.abs(needle - grain)
            if (Math.abs(needle - grain) < grainCloseness) {
                grainCloseness = thisCloseness;
                closeGrain = grain;
            }
        })
        return closeGrain;
    }
}