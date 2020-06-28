DynamicJson.forExactUrl('data/characters/main/civilian/emilie.json', async function() {
    const emilie = await fetch(`/${mod.baseDirectory}assets/data/characters/main/civilian/emilie.json`)
        .then(resp => resp.json());

    const newFaces = {};

    parts[2] = newFaces;

    // isolated case
    newFaces.normNeutral = {
        srcX: 18,
        srcY: 40,
        width: 80,
        height: 56,
        destX: 16,
        destY: 36
    };

    // col 1
    const upFaces = [
        "upNeutral",
        "upShrug",
        "upTaunting",
        "upSweatySmile",
        "upAstonished",
        "upShocked",
        "upHappy",
        "upPain",
        "upScolding"
    ];

    let offX = 184;
    let offY = 40;
    for (let i = 0; i < upFaces.length; i++) {
        newFaces[upFaces[i]] = {
            "srcX": offX,
            "srcY": offY,
            "width": 80,
            "height": 56,
            "destX": 16,
            "destY": 36
        };
        // upScolding destX = 0
        offY += 56;
    }

    // col 2
    const awayFaces = [
        "awayNeutral",
        null,
        "awayEmbarrassed",
        "awayWatchOutBadass",
        "awayExhausted",
        "awayMoping",
        "awayCurious"
    ];

    offX = 280;
    offY = 40;
    for (let i = 0; i < awayFaces.length; i++) {
        const name = awayFaces[i];
        if (name) {
            newFaces[name] = {
                "srcX": offX,
                "srcY": offY,
                "width": 80,
                "height": 56,
                "destX": 16,
                "destY": 36
            }
        }

        offY += 56;
    }

    // col 3
    const col3 = [
        "upShout",
        null,
        "upPreCry",
        "upCry",
        "upPreSneeze"
    ];

    offX = 374;
    offY = 0;
    for (let i = 0; i < col3.length; i++) {
        const name = col3[i];
        if (name) {
            newFaces[name] = {
                "srcX": offX,
                "srcY": offY,
                "width": 80,
                "height": 56,
                "destX": 16,
                "destY": 36
            }
        }
        offY += 56;
    }

    // col 4
    const col4 = [
        "normSuspicious",
        "normDetermined",
        "normSmile",
        "normSad",
        "normDeadInside",
        "normAngry",
        "normBroken",
        "normScream",
        "normUncertain"
    ];

    offX = 470;
    offY = 0;
    for (let i = 0; i < col4.length; i++) {
        newFaces[col4[i]] = {
            "srcX": offX,
            "srcY": offY,
            "width": 80,
            "height": 56,
            "destX": 16,
            "destY": 36
        }
        offY += 56;
    }
    return emilie;
});