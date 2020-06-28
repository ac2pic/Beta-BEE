export default function DjsonImports(mod) {

    DynamicJson.forRegExpUrl(/data\/animations\/class\/(.*).json/, async function(name) {
        const genericData = await fetch(`/${mod.baseDirectory}assets/data/animations/class/generic.json`).then(resp => resp.json());
        if (name === 'aiko') {
            genericData.namedSheets.walk.offY = 120;
        } else if (name === 'nathalie') {
            genericData.namedSheets.walk.offY = 240;
        }
        return genericData;
    });

    DynamicJson.forRegExpUrl(/data\/characters\/npc\/female([0-9])?.json/, async function(number) {
        return await fetch(`/${mod.baseDirectory}assets/data/characters/npc/female.json`).then(resp => resp.json());
    });


    /*function ajaxRequest(url) {
        return new Promise((resolve, reject) => {
            $.ajax({
                dataType: 'json',
                url,
                success: (data) => {
                    resolve(data)
                },
                error: (err) => {
                    reject(err)
                }
            })
        });
    }


    DynamicJson.forExactUrl('data/maps/emilie/face-test.json', async function() {
        const emptyMap = await fetch(`/${mod.baseDirectory}assets/data/maps/empty.json`)
            .then(resp => resp.json());
        const emilieChar = await ajaxRequest(`data/characters/main/civilian/emilie.json`);
        // change the player to emilie
        const events = [{
            "name": "civilian.emilie",
            "type": "SWITCH_PLAYER_CONFIG"
        }, {
            "side": "RIGHT",
            "order": 0,
            "clearSide": false,
            "type": "ADD_MSG_PERSON",
            "person": {
                "person": "main.civilian.emilie",
                "expression": "DEFAULT"
            }
        }, {
            "side": "LEFT",
            "order": 0,
            "clearSide": false,
            "type": "ADD_MSG_PERSON",
            "person": {
                "person": "main.emilie",
                "expression": "DEFAULT"
            }
        }];
        for (const expressionName in emilieChar.face.expressions) {
            const eventItem = {
                "message": {
                    "en_US": expressionName
                },
                "autoContinue": false,
                "type": "SHOW_MSG",
                "person": {
                    "person": "main.civilian.emilie",
                    "expression": expressionName
                }
            };
            events.push(eventItem);
            const eventItemCompare = {
                "message": {
                    "en_US": expressionName
                },
                "autoContinue": false,
                "type": "SHOW_MSG",
                "person": {
                    "person": "main.emilie",
                    "expression": expressionName
                }
            };
            events.push(eventItemCompare);
        }

        const entity = {
            "type": "EventTrigger",
            "x": 0,
            "y": 0,
            "level": 0,
            "settings": {
                "mapId": 17,
                "triggerType": "ALWAYS",
                "startCondition": "true",
                "endCondition": "false",
                "eventType": "CUTSCENE",
                "name": "Emilie Face Test",
                "event": events
            }
        };
        emptyMap.entities.push(entity);
        return emptyMap;
    });*/
}