export default function DjsonImports(mod) {

    DynamicJson.forRegExpUrl(/data\/animations\/class\/(.*).json/, async function(name) {
        const genericData = await fetch(`/${mod.baseDirectory}/assets/data/animations/generic.json`);
        if (name === 'aiko') {
            genericData.namedSheets.walk = 120;
        } else if (name === 'nathalie') {
            genericData.namedSheets.walk = 240;
        }
        return genericData;
    });

    // assets\data\characters\npc
    DynamicJson.forRegExpUrl(/data\/characters\/npc\/female([0-9])?.json/, async function(number) {
        return await fetch(`/${mod.baseDirectory}/assets/data/characters/npc/female.json`);
    });

}