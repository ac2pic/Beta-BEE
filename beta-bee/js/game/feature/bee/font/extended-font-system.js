ig.module("game.feature.font.extended-font-system").requires("game.feature.font.font-system").defines(function() {
	sc.FONT_COLORS.LEA = 5;
	sc.FONT_COLORS.EMILIE = 6;
	sc.FONT_COLORS.SERGEY = 7;
	const leaFont = new ig.Image("media/font/colors/hall-fetica-bold-lea.png", 16);
	const emilieFont = new ig.Image("media/font/colors/hall-fetica-bold-emilie.png", 16);
	const sergeyFont = new ig.Image("media/font/colors/hall-fetica-bold-sergey.png", 16);
	sc.fontsystem.font.pushColorSet(sc.FONT_COLORS.LEA, leaFont, "#adcdff");
	sc.fontsystem.font.pushColorSet(sc.FONT_COLORS.EMILIE, emilieFont, "#ffae57");
	sc.fontsystem.font.pushColorSet(sc.FONT_COLORS.SERGEY, sergeyFont, "#8fffc9");
});